import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // 1. Fetch sessions list from backend
  const fetchSessions = async () => {
    if (!user) {
      setSessions([]);
      setActiveSessionId(null);
      return;
    }
    try {
      const response = await api.get('/get-sessions');
      const data = response.data || [];
      const formatted = data.map(session => ({
        id: session._id,
        title: session.title,
        createdAt: session.createdAt
      }));
      setSessions(formatted);
      
      // Auto-select active session or default to the newest session
      const savedActiveId = localStorage.getItem(`garuda_active_session_${user._id}`);
      if (savedActiveId && savedActiveId !== 'undefined' && savedActiveId !== 'null' && formatted.some(s => s.id === savedActiveId)) {
        setActiveSessionId(savedActiveId);
      } else if (formatted.length > 0) {
        setActiveSessionId(formatted[0].id);
      } else {
        setActiveSessionId(null);
      }
    } catch (error) {
      console.error('Failed to fetch sessions from server:', error);
      setSessions([]);
      setActiveSessionId(null);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  // 2. Fetch messages dynamically from the backend for the active session
  useEffect(() => {
    const fetchActiveMessages = async () => {
      if (!user || !activeSessionId || activeSessionId === 'undefined' || activeSessionId === 'null') {
        setMessages([]);
        return;
      }
      
      // Skip if local fallback session (not yet saved to DB)
      if (activeSessionId.startsWith('local_')) {
        setMessages([]);
        return;
      }

      setLoadingMessages(true);
      try {
        const response = await api.get('/get-chats', {
          params: {
            userId: user._id,
            chatId: activeSessionId
          }
        });
        const data = response.data || [];
        // Map database chats (which are objects with role/content) to simple pairs
        const formatted = data.map(chat => ({
          role: chat.role,
          content: chat.content
        }));
        setMessages(formatted);
      } catch (error) {
        console.error('Failed to load active messages:', error);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchActiveMessages();
  }, [activeSessionId, user]);

  // 3. Persist only the active session ID inside localStorage for current browser convenience
  useEffect(() => {
    if (user) {
      if (activeSessionId) {
        localStorage.setItem(`garuda_active_session_${user._id}`, activeSessionId);
      } else {
        localStorage.removeItem(`garuda_active_session_${user._id}`);
      }
    }
  }, [activeSessionId, user]);

  const createSession = async () => {
    if (!user) return null;
    try {
      // Create session on MongoDB server
      const response = await api.post('/create-chat', { userId: user._id });
      const chatId = response.data?.chatId;
      if (!chatId) throw new Error("No chatId returned from server");

      const newSession = {
        id: chatId,
        title: 'New Chat',
        createdAt: new Date().toISOString()
      };

      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(chatId);
      setMessages([]);
      return chatId;
    } catch (error) {
      console.error("Failed to create chat session on backend, falling back to local session:", error);
      const fallbackId = 'local_' + Date.now();
      const newSession = {
        id: fallbackId,
        title: 'New Chat',
        createdAt: new Date().toISOString()
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(fallbackId);
      setMessages([]);
      return fallbackId;
    }
  };

  const switchSession = (sessionId) => {
    setActiveSessionId(sessionId);
  };

  const deleteSession = (sessionId) => {
    // Local filtering since backend does not expose a DELETE API
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (activeSessionId === sessionId) {
        if (filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        } else {
          setActiveSessionId(null);
        }
      }
      return filtered;
    });
  };

  const sendMessage = async (promptText) => {
    if (!promptText.trim() || generating) return;

    let currentSessionId = activeSessionId;

    if (!currentSessionId) {
      currentSessionId = await createSession();
      if (!currentSessionId) return;
    }

    const userMessage = { role: 'user', content: promptText };

    // Optimistically update active messages
    setMessages(prev => [...prev, userMessage]);

    // Optimistically update session title in sidebar
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId && s.title === 'New Chat') {
        const titleUpdate = promptText.length > 28 ? promptText.slice(0, 28) + '...' : promptText;
        return { ...s, title: titleUpdate };
      }
      return s;
    }));
    
    setGenerating(true);

    try {
      const body = { userPrompt: promptText };
      if (currentSessionId && !currentSessionId.startsWith('local_')) {
        body.chatId = currentSessionId;
      }
      
      const response = await api.post('/chat', body);
      const aiReply = response.data || '';
      
      const assistantMessage = { role: 'assistant', content: aiReply };

      setMessages(prev => [...prev, assistantMessage]);

      // Refresh session list to load actual database-saved session titles
      fetchSessions();
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = { 
        role: 'assistant', 
        content: `**Error:** Failed to reach the AI server. Details: ${error.response?.data?.message || error.message || 'Check connection'}.` 
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setGenerating(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      generating,
      loadingMessages,
      sessions,
      activeSessionId,
      createSession,
      switchSession,
      deleteSession,
      sendMessage,
      clearMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
