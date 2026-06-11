import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import WelcomeScreen from '../components/WelcomeScreen';
import Message from '../components/Message';
import ChatInput from '../components/ChatInput';
import { Sparkles } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const { 
    messages, 
    generating, 
    sendMessage, 
    createSession, 
    clearMessages 
  } = useChat();
  
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + N for New Chat
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createSession();
      }
      // Alt + C for Clear Chat
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (window.confirm('Are you sure you want to clear the current conversation?')) {
          clearMessages();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createSession, clearMessages]);

  // Scroll to bottom when messages or loading state changes
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, generating]);

  // Initial scroll to bottom when chat is loaded/cleared
  useEffect(() => {
    scrollToBottom('auto');
  }, [messages.length === 0]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Scrollable conversation box */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto min-h-0 bg-bg-base"
      >
        {messages.length === 0 ? (
          <WelcomeScreen onSelectPrompt={sendMessage} />
        ) : (
          <div className="w-full flex flex-col">
            {messages.map((msg, index) => (
              <Message
                key={index}
                role={msg.role}
                content={msg.content}
                userName={user?.name}
              />
            ))}
            
            {/* Thinking Indicator / Skeletons */}
            {generating && (
              <div className="w-full flex gap-4 p-4 md:p-6 bg-zinc-950/10 border-b border-zinc-900/30">
                <div className="flex max-w-3xl w-full gap-4 mx-auto">
                  {/* Avatar with subtle glow */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-gradient-to-br from-zinc-800 to-zinc-950 border-zinc-800 text-zinc-400 shadow-sm animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  {/* Message Bubble */}
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Garuda AI</span>
                    </div>
                    
                    <div className="text-zinc-300 text-[14px] w-full space-y-4">
                      {/* Typing indicator dots */}
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-typing-dot"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-typing-dot"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-typing-dot"></span>
                      </div>
                      
                      {/* Premium Shimmer skeletons */}
                      <div className="w-full max-w-2xl space-y-2.5 mt-2 select-none pr-8">
                        <div className="h-3.5 rounded-lg shimmer-loader w-full opacity-65"></div>
                        <div className="h-3.5 rounded-lg shimmer-loader w-[92%] opacity-65"></div>
                        <div className="h-3.5 rounded-lg shimmer-loader w-[78%] opacity-65"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-8 shrink-0" />
          </div>
        )}
      </div>

      {/* Input container fixed at bottom */}
      <div className="shrink-0 bg-bg-base border-t border-zinc-950/40 shadow-inner">
        <ChatInput onSend={sendMessage} disabled={generating} />
      </div>
    </div>
  );
};

export default Chat;
