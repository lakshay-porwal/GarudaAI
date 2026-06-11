import React, { useState } from 'react';
import { Copy, Check, Sparkles, User } from 'lucide-react';
import ReactMarkdown from "react-markdown";

// Inline Formatter for Bold and Inline Code
const FormattedText = ({ content }) => {
  const paragraphs = content.split('\n');

  return (
    <div className="space-y-3">
      {paragraphs.map((para, pIdx) => {
        if (!para.trim() && pIdx > 0 && pIdx < paragraphs.length - 1) {
          return <div key={pIdx} className="h-2" />;
        }
        if (!para.trim()) return null;

        // Matches **bold text** and `inline code`
        const regex = /(\*\*.*?\*\*|`.*?`)/g;
        const parts = para.split(regex);

        return (
          <p key={pIdx} className="leading-relaxed text-zinc-300 text-[14px]">
            {parts.map((part, index) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={index} className="font-semibold text-zinc-50">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code key={index} className="px-1.5 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 text-[12px] font-mono font-medium">
                    {part.slice(1, -1)}
                  </code>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

const Message = ({ role, content, userName }) => {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);

  // Markdown block level parser (extracting code blocks from standard text)
  const parseBlocks = (text) => {
    if (!text) return [];
    const blocks = [];
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const textBefore = text.slice(lastIndex, match.index);
      if (textBefore) {
        blocks.push({ type: 'text', content: textBefore });
      }
      blocks.push({
        type: 'code',
        language: match[1] || 'javascript',
        content: match[2].trim(),
      });
      lastIndex = codeBlockRegex.lastIndex;
    }

    const textAfter = text.slice(lastIndex);
    if (textAfter) {
      blocks.push({ type: 'text', content: textAfter });
    }

    return blocks;
  };

  const blocks = parseBlocks(content);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (codeText, index) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  return (
    <div className={`w-full flex gap-4 p-4 md:p-6 transition-colors duration-200 ${isUser ? 'justify-end' : 'justify-start bg-zinc-950/10 border-b border-zinc-900/30'}`}>
      
      {/* Container sizing matches ChatGPT width limits */}
      <div className={`flex max-w-3xl w-full gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar with subtle glow for assistant */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border select-none transition-all duration-300 ${
          isUser 
            ? 'bg-zinc-850 border-zinc-700 text-zinc-300 shadow-inner' 
            : 'bg-gradient-to-br from-zinc-850 to-zinc-950 border-zinc-800 text-zinc-300 shadow-sm'
        }`}>
          {isUser ? (
            <span className="text-[11px] font-bold tracking-wider uppercase">{userName ? userName.charAt(0) : 'U'}</span>
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </div>

        {/* Message Content Area */}
        <div className="flex-1 space-y-1.5 min-w-0">
          
          {/* Subtle Name Header */}
          <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              {isUser ? (userName || 'You') : 'Garuda AI'}
            </span>
          </div>

          {/* Bubble wrapper */}
          <div className={`relative group transition-all duration-200 ${
            isUser 
              ? 'bg-zinc-900 border border-zinc-850 rounded-2xl rounded-tr-sm px-4.5 py-3 text-zinc-200 text-[14px] shadow-sm ml-auto max-w-[85%] md:max-w-[75%]' 
              : 'bg-transparent text-zinc-300 text-[14px] w-full'
          }`}>
            
            {/* Block parser outputs */}
            <div className="space-y-3.5">
              {blocks.map((block, index) => {
                if (block.type === 'text') {
                  return (
                    <div key={index} className="prose max-w-none">
                      <ReactMarkdown>
                        {block.content}
                      </ReactMarkdown>
                    </div>
                  );
                }

                // Premium Code Block design
                return (
                  <div key={index} className="rounded-xl border border-zinc-800/80 bg-zinc-950 overflow-hidden my-4 font-mono shadow-md">
                    {/* Header bar */}
                    <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/40 border-b border-zinc-900/80 text-[10px] text-zinc-400 font-sans font-semibold uppercase tracking-wider select-none">
                      <span>{block.language}</span>
                      
                      <button
                        onClick={() => handleCopyCode(block.content, index)}
                        className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors cursor-pointer focus:outline-hidden"
                      >
                        {copiedCodeIndex === index ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy code</span>
                          </>
                        )}
                      </button>
                    </div>
                    {/* Code Pre/Code elements */}
                    <pre className="p-4 overflow-x-auto text-[13px] text-zinc-350 leading-relaxed font-mono">
                      <code>{block.content}</code>
                    </pre>
                  </div>
                );
              })}
            </div>

            {/* Float-in utility buttons on hover */}
            {!isUser && (
              <div className="flex items-center justify-end gap-1.5 mt-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                <button
                  onClick={handleCopyMessage}
                  title="Copy full message"
                  className="p-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer focus:outline-hidden shadow-sm flex items-center justify-center"
                >
                  {copied ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold px-1">
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </span>
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
