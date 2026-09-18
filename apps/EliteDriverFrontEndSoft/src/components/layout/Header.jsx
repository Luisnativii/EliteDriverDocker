import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ toggleSidebar, showSidebar, menuOpen }) => {

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-30
      bg-black/20 backdrop-blur-md border-b border-white/10
      h-20 flex-shrink-0 transition-all duration-300 ease-in-out
      ${showSidebar ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'}
    `}>
      <div className="h-full px-4 sm:px-6 flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Menu toggle and logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              if (!showSidebar) toggleSidebar();
            }}
            className={`
              min-h-11 min-w-11 flex items-center justify-center rounded-xl bg-transparent hover:bg-white/10
              transition-all duration-200 
              hover:scale-105 active:scale-95
              ${showSidebar ? 'hidden' : 'block'}
            `}
            aria-label="Abrir menú de navegación"
            aria-expanded={menuOpen}
            aria-controls="app-navigation"
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
