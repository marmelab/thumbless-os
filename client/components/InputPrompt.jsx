import React, { useState } from 'react';

export default function InputPrompt({ isSessionActive }) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Hide the prompt after 10 seconds
  React.useEffect(() => {
    if (isSessionActive) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isSessionActive]);
  
  if (!isSessionActive || !isVisible) return null;
  
  return (
    <div className="input-prompt-container">
      <div className="input-prompt-speech">
        <p className="input-prompt-text">Ask me about any topic!</p>
      </div>
    </div>
  );
}
