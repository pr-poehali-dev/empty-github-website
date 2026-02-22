import React, { useState } from 'react';
import KineticChatBot from './KineticChatBot';

const GlobalChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <KineticChatBot
      isOpen={isOpen}
      onToggle={handleToggle}
    />
  );
};

export default GlobalChatBot;
