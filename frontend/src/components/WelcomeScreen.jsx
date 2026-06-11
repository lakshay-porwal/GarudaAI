import React from 'react';
import { MessageSquare, Code, Lightbulb, HelpCircle } from 'lucide-react';

const WelcomeScreen = ({ onSelectPrompt }) => {
  const examplePrompts = [
    {
      text: 'Explain quantum computing in simple terms',
      icon: HelpCircle,
      description: 'Break down a complex theoretical concept',
    },
    {
      text: 'Write a responsive CSS grid layout template',
      icon: Code,
      description: 'Get clean, ready-to-use frontend styles',
    },
    {
      text: 'Brainstorm brand names for a creative agency',
      icon: Lightbulb,
      description: 'Generate catchy naming ideas',
    },
    {
      text: 'Draft an email requesting project feedback',
      icon: MessageSquare,
      description: 'Compose a professional message',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto text-center select-none py-12">
      {/* Brand Icon with subtle glowing pulse */}
      <div className="relative group mb-6">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-600 to-zinc-800 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-500"></div>
        <div className="relative w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-center shadow-xl">
          <span className="font-display font-black text-3xl bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 to-zinc-400 tracking-tighter">G</span>
        </div>
      </div>

      {/* Greeting with Gradient text */}
      <h2 className="text-3.5xl font-display font-bold tracking-tight m-0 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-zinc-50 via-zinc-200 to-zinc-400">
        How can I help you today?
      </h2>
      <p className="text-zinc-500 text-sm max-w-md mb-10 leading-relaxed font-medium">
        Ask Garuda AI any question. We can write code, analyze data, brainstorm ideas, or just chat.
      </p>

      {/* Suggestion Cards with glassmorphic style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
        {examplePrompts.map((prompt, index) => {
          const Icon = prompt.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectPrompt(prompt.text)}
              className="group text-left p-4.5 rounded-2xl bg-zinc-900/20 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700/60 hover:bg-zinc-900/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all-custom duration-300 cursor-pointer focus:outline-hidden"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-900 group-hover:border-zinc-800 transition-all duration-300 shadow-inner">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors truncate">
                    {prompt.text}
                  </h4>
                  <p className="text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors mt-0.5 leading-normal">
                    {prompt.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WelcomeScreen;
