'use client';
import React, { useState } from 'react';
import './Sidebar.css';
import assets from '@/src/lib/assets';
import Image from 'next/image';

const Sidebar: React.FC = () => {
  const [extended, setExtended] = useState(false);

  return (
    <div className="sidebar">
      <div className="top">
        <div className="menu" onClick={() => setExtended(!extended)}>
          <Image src={assets.menu} alt="menu" />
        </div>
        <div className="new-chat">
          <Image src={assets.plus} alt="new chat" />
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended ? (
          <>
            <div className="recent">
              <p className="recent-title">Recent</p>
              <div className="recent-entry">
                <Image src={assets.message} alt="message" />
                <p>What's is Starknet-Agent</p>
              </div>
            </div>
          </>
        ) : null}
      </div>
      <div className="bottom">
        <div className="bottom-item recent-entry">
          <Image src={assets.question} alt="help" />
          {extended ? <p>Help</p> : null}
        </div>
        <div className="bottom-item recent-entry">
          <Image src={assets.hardrive} alt="storage" />
          {extended ? <p>Storage</p> : null}
        </div>
        <div className="bottom-item recent-entry">
          <Image src={assets.cog} alt="settings" />
          {extended ? <p>Settings</p> : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
