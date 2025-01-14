import openai from '../openai';

// 1) Vi importerar openai-klienten från '../openai'.
//    I detta test MOCKAR vi inte openai, 
//    så funktionen kan göra riktiga anrop till GPT (om du har en giltig nyckel).

describe('OpenAI Client', () => {
  // 2) "describe" block döpt till "OpenAI Client" 
  //    för att gruppera relaterade test.

  it('should respond with a message from OpenAI', async () => {
    // 3) Ett testfall: 
    //    "should respond with a message from OpenAI"

    const testPrompt = 'Hello, OpenAI!';
    // 4) Skapar en "prompt" som vi vill skicka till GPT.

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: testPrompt }],
      temperature: 0.5,
    });
    // 5) Här kallar vi openai-klienten på riktigt (om vi inte mockar). 
    //    "chat.completions.create" med vår prompt + standardinställningar.

    expect(response.choices[0].message?.content).toBeTruthy();
    // 6) Vi förväntar oss att "choices[0].message.content" inte är 
    //    tomt eller undefined. 
    //    Alltså att vi fick ett faktiskt svar från GPT.
  });
});
// 7) Detta test kallas ibland "live integration test" eftersom vi 
//    kontaktar den riktiga OpenAI-tjänsten. 
//    Om vi inte har en korrekt API-nyckel, 
//    eller om nätverksproblem uppstår, kan testet fallera.
//    Det är inte ett klassiskt enhetstest, men bekräftar 
//    att openai.ts + nyckel är rätt konfigurerad.
