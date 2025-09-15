
import React from 'react';
import { NavLink } from 'react-router-dom';
import { CgmIcon, DashboardIcon, DietIcon, ExerciseIcon, JournalIcon, MoonIcon, SettingsIcon, SunIcon } from '../shared/Icons';
import { useAppContext } from '../../context/AppContext';

const navLinks = [
  { to: '/', text: 'Dashboard', icon: DashboardIcon },
  { to: '/diet', text: 'Diet Tracker', icon: DietIcon },
  { to: '/exercise', text: 'Exercise', icon: ExerciseIcon },
  { to: '/cgm', text: 'CGM Data', icon: CgmIcon },
  { to: '/journal', text: 'Journal', icon: JournalIcon },
  { to: '/settings', text: 'Settings', icon: SettingsIcon },
];

const NavItem: React.FC<{ to: string, text: string, icon: React.ElementType }> = ({ to, text, icon: Icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-primary-500 text-white shadow-lg'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`
    }
  >
    <Icon className="w-5 h-5 mr-3" />
    <span className="truncate">{text}</span>
  </NavLink>
);

const Sidebar: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const toggleTheme = () => {
        const newTheme = state.settings.theme === 'light' ? 'dark' : 'light';
        dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: newTheme } });
    };

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-xl flex flex-col p-4 transition-colors duration-300">
            <div className="flex items-center mb-8">
                <div className="bg-primary-500 rounded-full p-2 mr-3">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">DiaSync</h1>
            </div>
            <nav className="flex-1 space-y-2">
                {navLinks.map(link => (
                    <NavItem key={link.to} {...link} />
                ))}
            </nav>
            <div className="mt-auto">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                    {state.settings.theme === 'light' ? <MoonIcon className="w-5 h-5 mr-3"/> : <SunIcon className="w-5 h-5 mr-3" />}
                    <span>{state.settings.theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
