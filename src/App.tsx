import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { RoleSelection } from './pages/RoleSelection';
import { SetupView } from './pages/SetupView';
import { TrackerView } from './pages/TrackerView';
import { MonitorView } from './pages/MonitorView';
import { User } from './types';

import { PWAInstallPrompt } from './components/PWAInstallPrompt';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('familyTrackerUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user', e);
      }
    }
  }, []);

  const handleUserSetup = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('familyTrackerUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('familyTrackerUser');
  };

  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
          <Routes>
            <Route path="/" element={<RoleSelection />} />
            <Route path="/role" element={<RoleSelection />} />
            <Route
              path="/setup"
              element={<SetupView onComplete={handleUserSetup} />}
            />
            <Route
              path="/tracker"
              element={
                currentUser ? (
                  <TrackerView user={currentUser} onLogout={handleLogout} />
                ) : (
                  <TrackerView
                    user={{
                      id: 'user-pilot',
                      name: 'Traveler',
                      role: 'tracker',
                      familyId: 'FAM-DEMO',
                      avatarIcon: 'Car',
                      avatarBg: 'from-indigo-500 to-sky-500',
                    }}
                    onLogout={handleLogout}
                  />
                )
              }
            />
            <Route
              path="/monitor"
              element={
                currentUser ? (
                  <MonitorView user={currentUser} onLogout={handleLogout} />
                ) : (
                  <MonitorView
                    user={{
                      id: 'user-monitor',
                      name: 'Mission Control',
                      role: 'monitor',
                      familyId: 'DEMO-777',
                      avatarIcon: 'Shield',
                      avatarBg: 'from-indigo-600 to-sky-500',
                    }}
                    onLogout={handleLogout}
                  />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Floating PWA Installation Prompt */}
          <PWAInstallPrompt />
        </div>
      </Router>
    </SocketProvider>
  );
};

export default App;
