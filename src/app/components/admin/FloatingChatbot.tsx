import { useState } from 'react';
import { ChatbotPanel } from './ChatbotPanel';

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return null;
  }

  return <ChatbotPanel isFloating={true} onClose={() => setIsOpen(false)} />;
}

export function ChatbotToggle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && <ChatbotPanel isFloating={true} onClose={() => setIsOpen(false)} />}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#1E88E5] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#1976D2] transition-all hover:scale-110 z-50 group"
          aria-label="Ouvrir le chatbot"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#43A047] rounded-full animate-pulse" />
        </button>
      )}
    </>
  );
}
