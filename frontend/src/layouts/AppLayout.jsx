import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ThemeContext } from '../context/ThemeContext';

const BACKGROUNDS = {
  '/': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80',
  '/red-team': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80',
  '/blue-team': 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1920&q=80',
  '/security-tool': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
  '/reports': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80',
  '/history': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
  '/profile': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1920&q=80',
  '/settings': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80',
  '/admin': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80',
};

const LIGHT_BACKGROUND = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80';

export default function AppLayout({ children }) {
  const location = useLocation();
  const { theme } = useContext(ThemeContext);
  const bgUrl = theme === 'light' ? LIGHT_BACKGROUND : (BACKGROUNDS[location.pathname] || BACKGROUNDS['/']);

  return (
    <div className="relative min-h-screen flex flex-col text-slate-200 dark:text-slate-100 overflow-x-hidden font-sans">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-700 ease-in-out transform scale-105"
        style={{
          backgroundImage: `url(${bgUrl})`,
          filter: theme === 'dark' ? 'blur(12px) brightness(0.18)' : 'blur(12px) brightness(0.92)',
        }}
      />
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-45 dark:opacity-30">
        <div className="absolute top-[10%] left-[20%] w-[35rem] h-[35rem] rounded-full bg-purple-600/30 blur-[120px] animate-drift-1" />
        <div className="absolute bottom-[15%] right-[15%] w-[40rem] h-[40rem] rounded-full bg-cyan-600/20 blur-[130px] animate-drift-2" />
      </div>

      <div className="relative z-10 flex flex-col w-full min-h-screen">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
