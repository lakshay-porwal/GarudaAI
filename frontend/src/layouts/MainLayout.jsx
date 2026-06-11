import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base text-zinc-100 font-sans">
      {/* Desktop Sidebar (visible on md+) */}
      <div className="hidden md:block w-[260px] shrink-0 border-r border-border-dark bg-bg-sidebar">
        <Sidebar 
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Mobile Sidebar (overlay drawer on mobile) */}
      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
        {/* Sliding sidebar container */}
        <div className={`absolute top-0 bottom-0 left-0 w-[280px] bg-bg-sidebar border-r border-border-dark transition-transform duration-300 ease-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar 
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile top navigation header (hidden on desktop) */}
        <header className="flex md:hidden items-center justify-between px-4 py-2.5 border-b border-border-dark bg-bg-base/80 backdrop-blur-md sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="text-sm font-display font-bold tracking-tight text-zinc-200 flex items-center gap-1.5 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Garuda AI
          </div>
          
          <div className="w-8"></div> {/* Spacer for aligning center title */}
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 flex flex-col min-h-0 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
