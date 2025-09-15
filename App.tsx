
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import DietTracker from './pages/DietTracker';
import Exercise from './pages/Exercise';
import CGMData from './pages/CGMData';
import Journal from './pages/Journal';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const { state } = useAppContext();

  useEffect(() => {
    const root = window.document.documentElement;
    if (state.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.settings.theme]);

  return (
    <HashRouter>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <div className="container mx-auto px-6 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/diet" element={<DietTracker />} />
                <Route path="/exercise" element={<Exercise />} />
                <Route path="/cgm" element={<CGMData />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
