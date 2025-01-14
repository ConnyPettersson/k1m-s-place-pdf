import type { NextApiRequest, NextApiResponse } from 'next';
import openai from '../../utils/openai';
import dotenv from 'dotenv';
import { urls as importedUrls } from '../../services/urls';
import { scrapeURL } from '../../services/scraper';

dotenv.config();

type ResponseData = {
  text: string;
  //Förväntas vara ett objekt med en "text" -egenskap av typen "string"
  };

interface GenerateNextApiRequest extends NextApiRequest {
  body: {
    prompt: string;
  };
   // res är en NextApiResponse som förväntas skicka JSON 
  // med formatet { text: string } (enligt ResponseData)
}

// samlar in url:er från url.ts för att loopa igenom i steg 5
const urls = importedUrls;

export default async function handler(
  req: GenerateNextApiRequest,
  res: NextApiResponse<ResponseData>,
  //när man gör res.status(200).json(...) ska ett objekt skickas som 
  //matchar typen ResponseData
) {

  // 3.Tar emot prompt från chat.tsx
  const { prompt } = req.body;
  console.log('Received prompt:', prompt);

  if (!prompt || prompt === '') {
     // Kontroll av prompt: Skicka en felrespons om prompt saknas eller är tom.
    return res.status(400).json({ text: 'Please send your prompt' });
  }

  try {
    // 4. Variabel som samlar ihop all text från de olika URL:erna
    let additionalInfo = '';

   // 5. Skrapa innehåll från alla URL:er i "urls" -listan (en i taget).
// Loopar igenom varje url i urls.ts, anropar scrapeURL (i scraper.ts),
// och lägger resultatet i additionalInfo.
    for (const url of urls) {
      try {
        const content = await scrapeURL(url);
        // Lägg till resultatet i additionalInfo, separerat med newline.
        additionalInfo += content + '\n';
        // Logga de första 200 tecknen för att visa att skrapningen fungerade.
        console.log(`Scraped content from ${url}:`, content.slice(0, 200));
      } catch (error) {
        // Om skrapningen för en specifik URL misslyckas, logga felet men fortsätt. Detta är en den inre catch error
        console.error(`Failed to scrape content from ${url}`);
      }
    }

    const structuredPrompt = `
    Du är en AI-assistent för föräldrar som söker råd om olika problem. Din uppgift är att använda information från BRIS, 1177, Friends och som vägledare för vårdnadshavare i Säffle kommun för att ge specifika och empatiska råd som är relevanta för den situation användaren beskriver. Undvik generiska eller automatiserade svar; fokusera istället på att ge faktabaserade och stödjande svar. Tipsa inte om resurser från BRIS, 1177, och Friends direkt utan fokusera på samtalet med föräldern.

    ### Inledande Frågor
    1. **Öppna Frågor**: Starta med öppna frågor som uppmuntrar användaren att dela mer om sin situation.
       - "Hur kan jag hjälpa dig idag?"
       - "Kan du berätta lite mer om vad som händer?"

    2. **Empatiska Frågor**: Visa empati och förståelse för användarens känslor.
       - "Det låter som en svår situation. Hur mår du just nu?"
       - "Jag är ledsen att höra att du går igenom detta. Vill du prata om det?"

    ### Fördjupade Frågor
    1. **Följdfrågor**: Baserat på användarens svar, ställ följdfrågor för att få mer insikt.
       - "Kan du ge ett exempel på när du känner så här?"
       - "Vad tror du har orsakat dessa känslor?"

    2. **Specifika Frågor**: Fokusera på specifika aspekter av användarens problem.
       - "Hur påverkar detta ditt dagliga liv?"
       - "Finns det specifika situationer eller personer som gör att du känner dig sämre?"

    ### Uppmuntrande Frågor
    1. **Stödjande Frågor**: Uppmuntra användaren att tänka på lösningar eller strategier som kan hjälpa.
       - "Vad brukar hjälpa dig att må bättre när du känner så här?"
       - "Finns det någon du kan prata med om detta, som en vän eller familjemedlem?"

    2. **Utforskande Frågor**: Hjälp användaren att utforska sina känslor och tankar djupare.
       - "Hur tror du att situationen skulle förändras om du gjorde [specifik åtgärd]?"
       - "Vad är det första steget du skulle kunna ta för att börja må bättre?"

    ### Avslutande Frågor och Sammanfattning
    1. **Sammanfatta och Bekräfta**: Sammanfatta vad användaren har sagt och bekräfta deras känslor.
       - "Så om jag förstår dig rätt, du känner [känsla] på grund av [situation]. Stämmer det?"
       - "Det låter som att detta verkligen påverkar dig. Finns det något mer du vill lägga till?"

    2. **Erbjuda Ytterligare Hjälp**: Fråga om användaren vill ha ytterligare hjälp eller resurser.
       - "Skulle du vilja ha några tips eller resurser som kan hjälpa dig med detta?"
       - "Finns det något specifikt du skulle vilja prata om eller ha råd kring?"

    ### Exempel på en Dialog
    Användare: "Jag känner mig väldigt stressad över skolan just nu."
    - "Jag förstår, skolan kan vara väldigt stressande ibland. Kan du berätta mer om vad som gör dig stressad just nu?"
    - "Det låter tufft. Hur länge har du känt dig så här stressad?"
    - "Finns det specifika ämnen eller uppgifter som är extra svåra för dig?"
    - "Vad brukar du göra för att hantera stressen när det blir för mycket?"
    - "Har du pratat med dina lärare eller föräldrar om hur du känner?"
    - "Tack för att du delar med dig. Vill du att jag ger några tips på hur du kan hantera stressen?"

    Kom ihåg att undvika generiska eller automatiserade svar om du inte är säker på användarens behov. Fokusera på att ge faktabaserade och stödjande råd.
    Additional Information:
    ${additionalInfo.substring(0, 2000)}

    ${prompt}
    `;
    // Skicka en förfrågan till OpenAI:s chat.completions‐endpoint
    // "await" innebär att vi väntar på svaret innan koden går vidare
    // metoden chat.completions.create är från deras Node.js-bibliotek för att skapa en chattkomplettering
    const aiResult = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      // "messages" är en array av meddelanden som formar vår "konversation" med modellen.
      // Här skickar vi bara ett "user"-meddelande som innehåller "structuredPrompt".
      messages: [{ role: 'user', content: structuredPrompt }],
      temperature: 0.9, // Styr hur kreativ/tillfällig AI:n är i sina svar. Skala 0 -2 där 0 förutsägbar och 2 är oförutsägbar
      max_tokens: 2048, // Max antal tokens (ord-liknande enheter) i svaret.
      frequency_penalty: 0.5, // Försök minska upprepningar. Skala -2 till +2, ju högre värde ju mindre upprepningar.
      presence_penalty: 0, // Påverkar hur mycket nya ämnen uppmuntras.
    }); 
    // Bara logg för att se att anropet görs
    console.log('Fetching AI response...');


    // Hämta svaret från modellen.
    // "aiResult.choices[0].message?.content" är själva texten.
    // Om det är tomt/undefined använder vi fallback: "Sorry, there was a problem!"
    //aiResult innehåller en choices-array. Du tar första choice ([0]) → dess message?.content.
    //? (optional chaining) kollar att message inte är undefined.
    //Om ingenting finns, sätt default-sträng: 'Sorry, there was a problem!'.
    const rawResponse = 
    aiResult.choices[0].message?.content || 'Sorry, there was a problem!';

    // Rensa svaret från vissa tecken med regex: ta bort text inom ** **,
    // och ta bort upprepade ':' eller ';'.
    // Trim() tar bort mellanslag i början/slutet.
    const cleanedResponse = rawResponse
    .replace(/\*\*.*?\*\*/g, '')
    .replace(/[:;]+/g, '')
    .trim();
    // Logga AI:ns orensade svar för felsökning
    console.log('Raw AI response:', rawResponse);

    // Förbereder ett prefix och byter '\n' mot '<br>' för HTML‐radbrytning.
    // "responsePrefix" är en text som dyker upp före själva AI‐svaret.
    const responsePrefix = 'AI-genererat svar:<br>';
    const finalResponse =
    responsePrefix + cleanedResponse.replace(/\n/g, '<br>');
    // Logga det slutliga svaret som kommer skickas tillbaka till klienten
    console.log('Final AI response sent to client:', finalResponse);

    // 6. Skicka tillbaka 200 OK och en JSON med egenskapen "text", 
    // vilket matchar vårt typade ResponseData = { text: string }.
    res.status(200).json({ text: finalResponse });
  } catch (error) {
    // Om något oväntat händer i try-blocket
    console.error('Error fetching AI respsonse:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      // Kolla om "error" är en instans av Error‐objekt för att få fram felmeddelandet.
      errorMessage = error.message;
    }

    // Skicka tillbaka 500 (Internt serverfel) om något gick fel
    // och inkludera felmeddelandet i "text"‐strängen.
    res.status(500).json({
      text: `Sorry, there was a problem fetching the response. Error: 
      ${errorMessage}`,
    });
  }
  
}
