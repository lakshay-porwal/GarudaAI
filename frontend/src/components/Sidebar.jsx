import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { MessageSquare, LogOut, Trash2, Plus, Sparkles } from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { 
    sessions, 
    activeSessionId, 
    switchSession, 
    deleteSession, 
    createSession 
  } = useChat();

  const handleNewChat = async () => {
    await createSession();
    if (onClose) onClose();
  };

  const handleSelectSession = (id) => {
    switchSession(id);
    if (onClose) onClose();
  };

  const handleDeleteSession = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteSession(id);
    }
  };

  // Group sessions by date helper
  const groupSessions = (sessionsList) => {
    const today = [];
    const yesterday = [];
    const lastWeek = [];
    const older = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOfLastWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;

    sessionsList.forEach(session => {
      const date = new Date(session.createdAt || new Date()).getTime();
      if (date >= startOfToday) {
        today.push(session);
      } else if (date >= startOfYesterday) {
        yesterday.push(session);
      } else if (date >= startOfLastWeek) {
        lastWeek.push(session);
      } else {
        older.push(session);
      }
    });

    return { today, yesterday, lastWeek, older };
  };

  const grouped = groupSessions(sessions);

  const renderSessionItem = (session) => {
    const isActive = session.id === activeSessionId;
    return (
      <div
        key={session.id}
        onClick={() => handleSelectSession(session.id)}
        className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all-custom duration-200 cursor-pointer select-none border border-transparent ${
          isActive 
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100' 
            : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
        }`}
      >
        {/* Left active line indicator */}
        {isActive && (
          <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r bg-zinc-200" />
        )}

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <MessageSquare className={`w-4 h-4 shrink-0 transition-colors duration-200 ${isActive ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
          <span className="truncate pr-4">{session.title}</span>
        </div>
        
        {/* Inline Clear/Delete Button - visible on hover for desktop, always on mobile */}
        <button
          onClick={(e) => handleDeleteSession(e, session.id)}
          title="Delete chat"
          className="md:opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer focus:outline-hidden"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-bg-sidebar select-none text-zinc-300">
      
      {/* Header / Logo */}
      <div className="p-4 border-b border-border-dark flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center font-display font-black text-md text-zinc-100">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 to-zinc-400">G</span>
          </div>
          <span className="font-display font-bold text-md text-zinc-100 tracking-tight">Garuda AI</span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3.5 border-b border-border-dark/60">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700/80 rounded-xl text-xs font-semibold text-zinc-200 hover:text-zinc-100 transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.98] focus:outline-hidden"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History Section */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-xs text-zinc-600 font-medium">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-4">
            {/* Today's chats */}
            {grouped.today.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                  Today
                </div>
                {grouped.today.map(renderSessionItem)}
              </div>
            )}

            {/* Yesterday's chats */}
            {grouped.yesterday.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                  Yesterday
                </div>
                {grouped.yesterday.map(renderSessionItem)}
              </div>
            )}

            {/* Previous 7 Days */}
            {grouped.lastWeek.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                  Previous 7 Days
                </div>
                {grouped.lastWeek.map(renderSessionItem)}
              </div>
            )}

            {/* Older chats */}
            {grouped.older.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                  Older
                </div>
                {grouped.older.map(renderSessionItem)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Section & Logout */}
      <div className="mt-auto border-t border-border-dark p-4 bg-bg-sidebar/85 backdrop-blur-sm">
        
        {/* User profile detail */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 font-bold uppercase select-none text-xs shadow-inner">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-200 truncate">
              {user?.name || 'Garuda AI User'}
            </div>
            <div className="text-[10px] text-zinc-500 truncate mt-0.5">
              {user?.emailID || ''}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border-dark hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-medium transition-colors cursor-pointer focus:outline-hidden"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>

      </div>

    </div>
  );
};

export default Sidebar;
