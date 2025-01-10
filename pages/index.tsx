'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Home() {

  const [showInfo, setShowInfo] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [isKeyValid, setIsKeyValid] = useState(true);
  const router = useRouter();

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const handleLicenseChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setLicenseKey(event.target.value);
  };

  const handleFormSubmit = (
    event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      if (licenseKey === '1234') {
        setIsKeyValid(true);
        router.push('/app/welcome');
      } else {
        setIsKeyValid(false);
      }
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <header className="max-w-2xl mx-auto w-full absolute top-0 left-0 right-0 flex items-center justify-between p-4">
        <Image
          src="/images/Kim4logo.png"
          alt="K1M avatar1"
          width={200}
          height={200}
        />
        <div className="relative">
          <button onClick={toggleInfo}>
            <Image
              src="/images/circle-info-solid.svg"
              alt="info"
              width={44}
              height={44}
            />
          </button>
          {showInfo && (
            <div className="absolute top-full right-5 mt-[-13px] bg-white border-2 border-green-300 shadow-lg p-3 rounded-tl-lg rounded-tr-3xl rounded-bl-lg rounded-br-none w-36 h-30">
              <p>Detta är en AI-baserad föräldrarådgivare</p>
            </div>
          )}
        </div>
      </header>
     <form onSubmit={handleFormSubmit} className="flex flex-col items-center">
          <div className="mb-0">
          <Image
            src="/images/kim1.png"
            alt="Character"
            width={288}
            height={384}
          />
          </div>
          <div className="text-center">
            <input
              type="text"
              value={licenseKey}
              onChange={handleLicenseChange}
              autoFocus
              className={`h-6 p-2 border-2 ${isKeyValid ? 'border-green-500' : 'border-red-500'} rounded`}
            />
            {!isKeyValid && <p className="text-red-500">Ogiltig licensnyckel</p>}
          </div>
     </form>
    </div>
  );
}