'use client';

import React from 'react';
import Image from 'next/image';
import { assets } from '@/src/app/assets/assets';

const Header = () => {
  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-black">
      <div className="flex items-center justify-between px-6 py-4 text-antiquewhite">
        <p className="text-2xl font-bold text-white">StarknetAgent</p>
        <Image
          src={assets.kasar}
          alt="Kasar logo"
          width={40}
          height={40}
          className="rounded-full"
        />
      </div>
    </header>
  );
};

export default Header;
