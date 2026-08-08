// hooks/useLayout.js
import { useState, useEffect } from 'react';

export const useLayout = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Set sidebar to closed by default on mobile (solo en la primera carga)
      if (mobile && showSidebar) {
        setShowSidebar(false);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []); // Dependencias vacías para evitar loops

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  return {
    showSidebar,
    isMobile,
    toggleSidebar
  };
};