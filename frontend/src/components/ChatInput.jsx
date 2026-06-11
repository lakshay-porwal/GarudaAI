import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, CornerDownLeft } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const ChatInput = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);
  const { activeSessionId } = useChat();

  // Focus textarea when session changes or generating completes
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [activeSessionId, disabled]);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to recalculate scrollHeight
    textarea.style.height = 'auto';
    // Set to scrollHeight (capped by max-height in CSS/Tailwind)
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [value]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
    
    // Reset height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    // If Enter is pressed without Shift, submit the form
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2 bg-gradient-to-t from-bg-base via-bg-base/90 to-transparent relative z-10"
    >
      <div className="relative flex items-end bg-bg-input border border-border-dark focus-within:border-border-focus rounded-2xl p-2.5 transition-all duration-200 shadow-lg">
        
        {/* Multiline textarea */}
        <textarea
          ref={textareaRef}
          rows="1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Garuda AI is thinking...' : 'Message Garuda AI...'}
          disabled={disabled}
          className="flex-1 bg-transparent border-0 resize-none text-[14px] text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:ring-0 max-h-[200px] py-1.5 px-3 min-h-[24px] leading-relaxed disabled:opacity-50"
        />

        {/* Send Button */}
        <div className="flex items-center gap-2 px-1 select-none">
          <span className="hidden sm:flex items-center gap-1 text-[10px] text-zinc-600 font-medium mr-1.5">
            <span>Enter to send</span>
            <CornerDownLeft className="w-2.5 h-2.5" />
          </span>
          
          <button
            type="submit"
            disabled={!value.trim() || disabled}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              value.trim() && !disabled
                ? 'bg-zinc-200 hover:bg-zinc-100 text-zinc-950 scale-100'
                : 'bg-zinc-900 text-zinc-700 opacity-60 pointer-events-none'
            } cursor-pointer focus:outline-hidden active:scale-95`}
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </form>
  );
};

export default ChatInput;
