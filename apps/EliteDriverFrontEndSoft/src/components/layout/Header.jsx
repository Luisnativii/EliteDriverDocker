import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Menu, Bell, Search } from 'lucide-react';

const Header = ({ toggleSidebar, showSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-50
      bg-black/20 backdrop-blur-md border-b border-white/10
      h-20 flex-shrink-0 transition-all duration-300 ease-in-out
      ${showSidebar ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'}
    `}>
      <div className="h-full p-0 flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Menu toggle and logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              if (!showSidebar) toggleSidebar();
            }}
            className={`
              p-1 rounded-xl bg-transparent hover:bg-white/10 
              transition-all duration-200 
              hover:scale-105 active:scale-95
              ${showSidebar ? 'hidden' : 'block'}
            `}
            title="Mostrar sidebar"
          >
            <Menu size={20} className="text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <img
              src="/EliteDrive.svg"
              alt="Logo"
              className="h-12 w-auto brightness-0 invert"
            />
            
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;