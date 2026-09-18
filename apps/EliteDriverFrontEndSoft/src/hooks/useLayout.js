// hooks/useLayout.js
import { useState, useEffect } from 'react';

export const useLayout = () => {
  const [showSidebar, setShowSidebar] = useState(() => window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // Check if screen is mobile on mount and when window resizes
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const checkIfMobile = () => {
      setIsMobile(query.matches);
      setShowSidebar(!query.matches);
    };
    query.addEventListener('change', checkIfMobile);
    checkIfMobile();
    return () => query.removeEventListener('change', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  return {
    showSidebar,
    isMobile,
    toggleSidebar
  };
};
