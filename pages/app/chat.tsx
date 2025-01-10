'use client'
import React, { useState, useRef, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import Image from 'next/image';

/**
 * Message-objektet representerar ett meddelande i chatten,
 * med text och vem meddelandet kommer ifrån ('user' eller 'ai').
 */
interface Message {
  text: string;
  from: 'user' | 'ai';
}

export default function Chat() {
  
  //Array-destructuring [ ].
  //useState<Message[]> säger: “en state-variabel som är en array av Message.”([]) är initialvärdet: en tom array.
  //messages håller en lista av meddelanden av typ Message[]
  const [messages, setMessages] = useState<Message[]>([]);

  //1. prompt är det användaren skriver för att skicka till AI
  const [prompt, setPrompt] = useState<string>('');

  // loading visar om vi för närvarande väntar på svar från API:t.
  const [loading, setLoading] = useState<boolean>(false);

  // error håller ett felmeddelande om något går fel under API-anrop
  const [error, setError] = useState<string>('');

   /**
   * menuOpen och showInfo är booleans som styr om hamburgermenyn
   * och informationsrutan ska visas eller inte.
   */
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

   /**
   * useRef<HTMLTextAreaElement>(null) skapar en referens till
   * ett <textarea>-element. Kan användas för att justera höjd,
   * fokusera elementet, etc.
   */
  const textareaRef = useRef<HTMLTextAreaElement>(null);

    /**
   * chatContainerRef skulle kunna hålla referens till t.ex. 
   * en behållare (div) för chatten.
   */
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  /**
   * getResponse anropas när man skickar formuläret i chatten.
   * event: React.FormEvent<HTMLFormElement> är en TypeScript-typ som säger
   * att vi hanterar ett submit-event från ett <form>.
   * event.preventDefault() hindrar sidan från att laddas om på submit.
   */
  const getResponse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');


    /**
     * Vi lägger till ett nytt meddelande (från användaren) i messages.
     * setMessages((prevMessages) => [...prevMessages, { text: prompt, from: 'user' }])
     * => "prevMessages" är gamla listan, och vi skapar en ny genom
     * att sprida prevMessages och lägga till nytt objekt sist.
     */
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: prompt, from: 'user' },
    ]);

 
    try {
        // 2. Skickar prompt genom att anropa vårt Next.js-API /api/generate-answer med POST (body som JSON)
      const res = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({prompt}),
      });

       // Om responsen inte är OK, hämta texten för mer info och kasta ett Error.
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || 'Error fetching response');
      }

      // 7. Tar emot AI-svaret (JSON-svaret från API:t generate-answer)
      // från res.status(200).json({ text: finalResponse });
            const data = await res.json();
      
      
      // 8. Visar svaret i UI
      setMessages((prevMessages) => [
        ...prevMessages,
       // Spara det i messages med from: 'ai'.
        { text: data.text, from: 'ai' }
      ]);

      // 9. Rensa prompten med setPrompt
      setPrompt('');

    } catch (error: any) {
      console.error('Error fetching response:', error);
      setError('Ett fel inträffade när svaret skulle hämtas');
    } finally {
      setLoading(false);
    }
  };

    /**
   * useEffect körs varje gång messages ändras.
   *  Justerar höjden på textarea dynamiskt.
   *  Skrollar ned till senaste meddelandet i chatten (om det finns).
   */
  useEffect(() => {
    if (textareaRef.current) {
      // Ställ om höjden dynamiskt till ”inherit”,
      // sen sätt höjden till scrollHeight så att den växer med innehållet.
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

//Varje gång messages ändras, vill du autoscrolla längst ner. Och du vill justera <textarea>-höjd efter innehållet.

    // Skrolla till senaste meddelandet när messages uppdateras.
    const lastMessageElement = document.querySelector('.message:last-child');
    if (lastMessageElement) {
      lastMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    //[messages] = dependencies. Endast kör när messages uppdateras
  }, [messages]);
  

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full justify-center min-h-screen bg-white">
      <header className="absolute max-w-2xl mx-auto w-full top-0 left-0 right-0 flex items-center justify-between p-4">
        <button onClick={toggleMenu} className="text-3xl">
          {menuOpen ? <IoMdClose /> : <FaBars />}
        </button>
        <Image
          className="mt-2"
          src="/images/KimLogo.png"
          alt="K1M avatar1"
          width={120}
          height={120}
        />
        <div className="relative">
          <button onClick={toggleInfo} className="info-button">
            <Image
              src="/images/circle-info-solid.svg"
              alt="Info"
              width={44}
              height={44}
            />
          </button>
          {showInfo && (
            <div className="info absolute top-full right-5 mt-[-13px] bg-white border-2 border-green-300 shadow-lg p-3 rounded rounded-tl-lg rounded-tr-3xl rounded-bl-lg rounded-br-none w-36 h-30">
              <p>Detta är en AI-baserad föräldrarådgivare</p>
            </div>
          )}
        </div>
      </header>
      {menuOpen && (
        <div className="menu max-w-2xl mx-auto absolute top-16 bg-white text-black border-r-2 border-b-2 border-green-500 w-[200px]">
          <ul className="list-none p-4">
            <li className="p-2 hover:bg-green-300 border-b border-gray-200 last:border-b-0">
              Fråga K1M
            </li>
            <li className="p-2 hover:bg-green-300 border-b border-gray-200 last:border-b-0">
              Tipsbanken
            </li>
            <li className="p-2 hover:bg-green-300 border-b border-gray-200 last:border-b-0">
              Hjälp / Stöd
            </li>
          </ul>
        </div>
      )}

        {/* Översta behållaren (div) för chattens vy:
      - "w-full" = 100% bredd
      - "p-4" = padding 1rem runt om
      - "max-h-[70vh]" = maximal höjd 70% av viewport-höjden
      - "overflow-y-auto" = scrolla vertikalt om innehållet blir för stort
   */}
      <div className="chat-container w-full p-4 max-h-[70vh] overflow-y-auto">
        <div

        
          ref={chatContainerRef}
          className="chat-container w-full p-4 max-h-[70vh] overflow-y-auto"
          /* Andra div som också har klasser för styling. 
        "ref={chatContainerRef}" kopplar en 'ref' till detta element,
        så vi programmatiskt kan få åtkomst i React (t.ex. för autoscroll).
    */
        >
          {messages.map((msg, index) => (
          // Loopar igenom alla meddelanden i "messages"-arrayen.
      // Varje 'msg' representerar ett meddelande med text + from: 'user' | 'ai'.
      // "key={index}" är Reacts sätt att hålla koll på list-element. Inte optimalt i riktiga appar, men duger ofta i exempel.
         <div
              key={index}
              className={`message ${msg.from === 'ai' ? 'ai-message' : 'user-message'}`}
                 /* Baserat på om avsändaren är 'ai' eller 'user' sätter vi en CSS-klass. 
            Kan styra t.ex. bakgrundsfärg eller alignment. 
        */
            >
              {msg.from === 'ai' && (
                 // Om meddelandet är från 'ai', visa en avatar-bild (Image-komponent från next/image).
                <Image
                  src="/images/Kim4.png"
                  alt="AI Avatar"
                  width={40}
                  height={40}
                  className="ai-avatar"
                />
              )}
              <div
                className="message-text"
                style={{ paddingLeft: msg.from === 'ai' ? '20px' : '10px' }}
                dangerouslySetInnerHTML={{ __html: msg.text }}
                /* "dangerouslySetInnerHTML" sätter HTML-innehåll direkt. 
              Var försiktig med user-generated content (risk för XSS). 
              Här används det för att bevara radbrytningar/HTML från AI-svaret.
              "style" sätter lite extra padding om avsändaren är 'ai'.
          */
              ></div>
            </div>
          ))}
        </div>
      </div>
      {loading && (
        // Om "loading" är true, visar vi en "loading-dots"‐sektion
  // med en liten bild (avatar) + 3 prickar (span).
        <div className="loading-dots flex items-center justify-center mb-4 ml-4">
          <Image
            src="/images/Kim4.png"
            alt="Loading"
            className="w-6 h-6 mr-2"
            width={44}
            height={44}
          />
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
      <form onSubmit={getResponse} className="w-full px-4">
         {/* Form-element som anropar funktionen "getResponse" när man trycker submit.
      "w-full px-4" = 100% bredd + padding på X-axeln (vänster/höger).
  */}
        <textarea
          ref={textareaRef}
          className="w-full p-2 border-2 border-green-500 rounded-lg focus:border-green-600 focus:ring focus:ring-green-500 focus:ring-opacity-50"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Skriv här"
          style={{ overflowY: 'hidden', minHeight: '50px' }}
          onKeyDown={(e) => {
            // När man trycker Enter i textarea, och inte håller inne Shift,
      // ska vi förhindra radbrytning och i stället trigga getResponse.
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              getResponse(e as unknown as React.FormEvent<HTMLFormElement>);
            }
          }}
        />

          {/* 
    ref={textareaRef} = kopplar ref för att manipulera t.ex. höjd på textarea (auto-resize)
    value={prompt} = tar in state-värdet "prompt"
    onChange... = uppdaterar "prompt" vid varje tangenttryck
    placeholder="Skriv här" = text synlig när man inte skrivit något
  */}


        <input type="submit" className="hidden" />
          {/* Dold submit-knapp ifall man vill trigga submit via Enter eller 
      av tillgänglighetsskäl (t.ex. skärmläsare).
  */}
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
    /* 
  Om "error" inte är tom sträng, visar vi ett rött felmeddelande.
*/

  );
}
