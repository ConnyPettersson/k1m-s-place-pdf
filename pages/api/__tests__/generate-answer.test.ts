import { createMocks } from 'node-mocks-http';
import handleGenerateAnswer from '../generate-answer';
import { scrapeURL } from '../../../services/scraper';
import openai from '../../../utils/openai';

// 1) Vi importerar 'createMocks' från 'node-mocks-http' 
//    för att kunna simulera HTTP-req/res i Jest (utan att starta en server).
// 2) 'handleGenerateAnswer' är vår API-route-funktion som vi vill testa.
// 3) 'scrapeURL' och 'openai' importeras för att vi senare ska kunna 
//    mocka bort dem.

jest.mock('../../../services/scraper', () => ({
  scrapeURL: jest.fn().mockResolvedValue('Mocked scraped data'),
}));
// 4) Här "mockar" vi scraping-funktionen 'scrapeURL' 
//    så att den automatiskt returnerar 'Mocked scraped data' 
//    (i stället för att göra riktiga nätverksanrop).

jest.mock('../../../utils/openai', () => {
  return {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Mocked AI response',
              },
            },
          ],
        }),
      },
    },
  };
});
// 5) Här "mockar" vi OpenAI-klienten. I stället för att 
//    anropa GPT på riktigt, returnerar den 'Mocked AI response'.
//    Genom jest.fn().mockResolvedValue(...) 
//    ser vi till att funktionen ger en "lyckad" promise.

describe('generate-answer API Route', () => {
  // 6) Vi grupperar våra testfall i en "describe"-block 
  //    med namnet "generate-answer API Route".

  it('should return 400 if prompt is missing', async () => {
    // 7) "it('should return 400...')": definierar ett testcase 
    //    som kollar vad som händer om prompten är tom.

    const { req, res } = createMocks({
      method: 'POST',
      body: { prompt: '' },
    });
    // 8) createMocks ger oss ett fejk-request och fejk-response-objekt, 
    //    "method: 'POST'", "body: { prompt: '' }" = en tom prompt.

    await handleGenerateAnswer(req as any, res as any);
    // 9) Vi anropar vår API-route med dessa fejkade objekt. 
    //    "as any" för att typescript inte ska klaga på typ.

    expect(res._getStatusCode()).toBe(400);
    // 10) Vi förväntar oss att statuskoden blir 400 (Bad Request).

    expect(JSON.parse(res._getData())).toEqual({
      text: 'Please send your prompt',
    });
    // 11) Kollar att body:n i svaret motsvarar 
    //    { text: 'Please send your prompt' }. 
    //    `_getData()` ger oss den JSON som skrevs ut.
  });

  it('should call scraper and OpenAI, then return AI response', async () => {
    // 12) Andra testfallet: om prompten finns, bör den 
    //    anropa scraping, anropa AI och svara med 200 + text.

    const { req, res } = createMocks({
      method: 'POST',
      body: { prompt: 'Hello AI' },
    });
    // 13) Vi skapar fejk-req/res igen, men nu med en "prompt".

    await handleGenerateAnswer(req as any, res as any);
    // 14) Anropar APIn med detta requestet. 
    //    Inuti kommer generate-answer att anropa 'scrapeURL' 
    //    (mockad) och sedan 'openai.chat.completions.create' 
    //    (också mockad).

    expect(scrapeURL).toHaveBeenCalled();
    // 15) Bekräfta att 'scrapeURL' anropats. 
    //    (Det visar att koden faktiskt försöker skrapa data.)

    expect(openai.chat.completions.create).toHaveBeenCalled();
    // 16) Bekräfta att openai-klienten anropats.

    const responseData = JSON.parse(res._getData());
    // 17) Plockar ut JSON som API:t skickade i svaret.

    expect(res._getStatusCode()).toBe(200);
    // 18) Vi förväntar oss en 200 (OK).

    expect(responseData.text).toMatch('Mocked AI response');
    // 19) Och vi letar efter strängen 'Mocked AI response' i texten. 
    //    (Det är exakt den mock-texten vi definierade.)
  });
});
// 20) Båda testfallen tillsammans bekräftar att om prompt saknas => 400, 
//    om prompt finns => scraping + AI anrop + 200-svar med mockad text.

