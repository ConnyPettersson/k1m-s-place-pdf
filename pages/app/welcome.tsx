import { useState } from 'react';
import Image from 'next/image';
import { FaBars } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { useRouter } from 'next/router';

export default function welcomePage() {
  const [showInfo, setShowInfo] = useState(false);
  const [menuOpen, setMenuOpen ] = useState(false);
  const router = useRouter();

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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
              alt="info"
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
        <div className="menu max-w-2xl mx-auto absolute top-16
        bg-white text-black border-r-2 border-b-2 border-green-500 w-[200px]">
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Image
          src="/images/Kim2.png"
          alt="K1M avatar1"
          width={288}
          height={384}
        />
        <button className="visible-border bg-white text-black border-2 p-2 rounded hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        onClick={() => router.push('/app/chat')}
        >
          Börja chatta
        </button>
        <button className="visible-border bg-white text-black border-2 p-2 rounded hover:bg-green-100 mt-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        onClick={() => router.push('/app/login')}
        >
          Logga in
        </button>
      </div>
     
    </div>
  );
}