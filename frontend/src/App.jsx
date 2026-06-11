import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Auth from './pages/Auth';
import Chat from './pages/Chat';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default Route - Auth Page */}
          <Route path="/" element={<Auth />} />

          {/* Protected Chat Route */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>

                <ChatProvider>
                  <MainLayout>
                    <Chat />
                  </MainLayout>
                </ChatProvider>
              </ProtectedRoute>
            }
          />

          {/* Redirect any other path to Auth Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
