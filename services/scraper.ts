//  Axios Bibliotek för HTTP-anrop och cheerio för HTML-parsing
import axios from 'axios';
// load: Funktion från 'cheerio' för att parsa HTML (jQuery-lik syntax)
import { load } from 'cheerio';
 // iconv-lite: Hanterar textkodning (ex. utf-8) för binära data
import iconv from 'iconv-lite';
import { urls as importedUrls } from './urls';

//logiken för webbscraping, parsar sidinnehåll (scraping), returnerar texten som string

// Definierar en interface för domainRules som är en dictionary
interface DomainRules {
  [key: string]: string[];
  // ↑ TypeScript-syntax: "Ett objekt vars keys är strängar och vars values är string-arrayer."
}

// Skapar ett objekt domainRules med "tillåtna/icke-tillåtna stigar"
const domainRules: DomainRules = {
  'bris.se': [
    '/for-barn-och-unga/forum/',
    '/for-barn-och-unga/mitt-konto',
    '/for-barn-och-unga/meddelanden',
    '/for-barn-och-unga/chatt',
    '/for-barn-och-unga/logga-in',
    '/for-barn-och-unga/logga-ut',
    '/natt-pa-bris',
    '/globalassets/',
    '/api/chat/isopen',
    '/api/chat/isfull',
    '/api/chat/kurator',
    '/api/misc/info',
  ],
  'friends.se': ['/wp/wp-admin/'],
  'rodakorset.se': [
    '/episerver/CMS/',
    '/util/',
    '/*?timeline=*',
    '/test/*',
    '/installningar/*',
    '/checkout/*',
  ],
  '1177.se': ['/episerver/', '/util/', '/modules/', '/error/'],
  'saffle.se': [
    '/imagedescription.action2',
    '/checkoutimages.action2',
    '/mybookmarks/addbookmark.action2',
    '/mybookmarks/removebookmark.action2',
    '/*.html.printable',
    '/*?contactPage=*',
    '/*?contactUserId=*',
    '/*?sv.state=*',
    '/*?state=keepAlive',
    '/*&state=keepAlive',
    '/*?profiling=*',
    '/*.pdf?properties=*',
    '/*?addToCart=true',
    '/*;jsessionid=*',
  ],
};

// Definierar funktionen scrapeURL som tar en enskild URL och returnerar texten (string)
export const scrapeURL = async (url: string): Promise<string> => {
  
  try {
    // Skapa ett URL-objekt av strängen. 
    //     T.ex. new URL('https://www.bris.se/forum') ger oss .hostname, .pathname, .search...
    const urlObj = new URL(url);
    const disallowedPaths = domainRules[urlObj.hostname.replace('www.', '')] || [];
//Om det inte finns någon post för domänen i domainRules eller om den är null/undefined, faller koden tillbaka till en tom array ([]).

    if (
       // Kolla om denna URL matchar någon "disallowed" path i domainRules
    //     some(...) = returnerar true om minst en path matchar. 
      disallowedPaths.some(
      (path) => url.includes(path) && !path.startsWith('!'),
    )
  ) {
    console.error(`Access to the URL ${url} is disallowed by robots.txt`);
    // throwar fel => vi avbryter scraping om url:en är förbjuden
    throw new Error('Access to the URL is disallowed by robots.txt');
  } 


    //gör en HTTP GET-begäran med axios till den webbadress som skickats in för att hämta HTML
      //     responseType = 'arraybuffer' -> vi får binär data, 
    //     men kan sedan decoda text via iconv-lite. 
    //     maxRedirects, timeout = extra inställningar.
    const response = await axios.get(url, {
      responseType: 'arraybuffer', // För att kunna behandla binära data korrekt
      maxRedirects: 5, // Om servern svarar med en 301 eller 302 (ompekning) upp till fem gånger i rad, så följer Axios länken vidare varje gång. Om det sker fler än 5 ompekningar (redirects) i följd, kastar Axios normalt en error och avbryter anropet.
      timeout: 30000, //30 sekunder
    });

    // Decode binär data -> UTF-8 text med iconv-lite
    //     "Buffer.from(response.data)" -> skapar en Node.js Buffer. 
    //     iconv.decode(...) -> omvandlar buffern till en sträng i 'utf-8'. 
      const decodedContent = iconv.decode(Buffer.from(response.data), 'utf-8');
      console.log('Raw HTML data:', decodedContent);
  
      // Cheerio laddar in HTML-strängen "load(decodedContent)" => Cheerio parse: 
    //     Vi får en "$" som om det vore jQuery. 
      const $ = load(decodedContent);
  
        // Skapa en variabel 'content' och fyll med text beroende på domän. Här sker själva söket i url:erna som kommer från url.ts
    //     Varför? För att t.ex. "bris.se" kanske vi bara vill parsa "div.specific-class-for-bris" etc. Man ska välja rätt CSS-selektor för att parsa. Här är bara en grund. Mer riktad mot olika <section> behövs
    // div.specific-class-for-bris, .another-class är bara exempelnamn. Hämtar just nu från alla p-element från alla url:er
    let content = '';
    if (url.includes('bris.se')) {
      content = $('div.specific-class-for-bris, .another-class, p').text();
    } else if (url.includes('friends.se')) {
      content = $('div.specific-class-for-friends, .another-class, p').text();
    } else if (url.includes('1177.se')) {
      content = $('div.specific-class-for-1177, .another-class, p').text();
    } else if (url.includes('saffle.se')) {
      content = $('div.specific-class-for-saffle, .another-class, p').text();
    }
    // Om ingen if-sats matchar, content förblir tom.

    // Logga de första 200 tecknen i content
    console.log(`Scraped content from ${url}:`, content.slice(0, 200));

    // Trimma whitespace och returnera. 
    return content.trim();
  
  } catch (error) {
    //  Om något gick fel
    if (axios.isAxiosError(error)) {
      //  -> axios-specifika fel
      if (error.response) {
        console.error(`HTTP error! Status: ${error.response.status}`);
      } else if (error.request) {
        console.error(`No response received from ${url}. Request was made.`);
      } else {
        console.error(`Error setting up the request: ${error.message}`);
      }
      if (error.code === 'ERR_FR_TOO_MANY_REDIRECTS') {
        console.error(`Too many redirects when trying to access ${url}`);
      }
    } else {
      // Kanske ett generellt JS-fel
      console.error(`Error scraping URL: ${url}`, error);
    }
    // -> Skicka vidare felet uppåt
    throw error;
  }
};



//skapa en lista "urls"


// IIFE (Immediately Invoked Function Expression) 
//    som loopar över alla url i "urls" och anropar scrapeURL.
//    Bara ett "direktkörande" av kod för test/utveckling.

// ↑ Denna del körs direkt när filen laddas (om du anropar filen).
//   => Den loopar över 'urls' och skriver ut "Content from ..." i konsolen.
//   => Bra test / dev-läge.