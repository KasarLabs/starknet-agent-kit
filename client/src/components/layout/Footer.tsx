import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BsTelegram, BsTwitter, BsGithub } from "react-icons/bs";

const Footer = () => {
  return (
    <footer className="w-full bg-neutral-900 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Column 1 - KasarLabs Logo and Terms */}
          <div className="flex flex-col space-y-4">
            <div className="w-[125px] sm:w-[140px]">
              <div className="relative w-full h-10">
                <Image
                  src="https://github.com/KasarLabs/brand/blob/main/kasar/logo/KasarWhiteLogo.png?raw=true"
                  fill
                  alt="kasarlabs"
                  className="dark:invert object-contain"
                />
              </div>
            </div>
            <div className="text-neutral-400 text-sm flex flex-wrap gap-2">
              <a
                href="https://pay.kasar.io/pages/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white cursor-pointer transition-colors"
              >
                Terms
              </a>
              <span className="hidden sm:inline">•</span>
              <a
                href="https://pay.kasar.io/pages/general-conditions-of-sale"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white cursor-pointer transition-colors"
              >
                Conditions
              </a>
              <span className="hidden sm:inline">•</span>
              <a
                href="https://pay.kasar.io/pages/legal-information"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white cursor-pointer transition-colors"
              >
                Legal
              </a>
            </div>
          </div>

          {/* Column 2 - Resources */}
          <div className="sm:mt-0">
            <h3 className="text-white font-semibold mb-3 md:mb-4 text-base md:text-lg">
              Resources
            </h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <a
                  href="https://www.starknet.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white text-sm md:text-base transition-colors"
                >
                  Starknet
                </a>
              </li>
              <li>
                <a
                  href="https://docs.starknet.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white text-sm md:text-base transition-colors"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 - Contact Us */}
          <div className="sm:mt-0">
            <h3 className="text-white font-semibold mb-3 md:mb-4 text-base md:text-lg">
              Contact us
            </h3>
            <div className="flex space-x-4 md:space-x-6">
              <Link
                href="https://twitter.com/kasarlabs"
                target="_blank"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <BsTwitter className="w-6 h-6 sm:w-7 sm:h-7" />
              </Link>
              <Link
                href="https://t.me/+jZZuOamlUM5lNWNk"
                target="_blank"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <BsTelegram className="w-6 h-6 sm:w-7 sm:h-7" />
              </Link>
              <Link
                href="https://github.com/kasarlabs"
                target="_blank"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <BsGithub className="w-6 h-6 sm:w-7 sm:h-7" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 md:mt-8 md:pt-8 border-t border-neutral-800">
          <p className="text-center text-neutral-400 text-xs md:text-sm">
            © {new Date().getFullYear()} KasarLabs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
