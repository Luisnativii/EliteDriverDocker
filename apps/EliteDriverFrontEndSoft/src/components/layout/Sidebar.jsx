import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { createContext, useState, useEffect } from "react";
import { dbRoleToMenu } from "../../utils/roleMapping";
import { useMemo } from "react";

import { 
  ChevronLeft, 
  Home, 
  Car, 
  Calendar, 
  Settings, 
  User, 
  LogOut,
  Users,
  Wrench,
  Clock,
  BookOpen,
  Crown,
  Sparkles
} from "lucide-react";

// Mapeo de roles a configuración
const roleConfig = {
  admin: { 
    title: "Panel Administrativo",
    subtitle: "EliteDrive Admin",
    accent: "from-gray-600 to-gray-700"
  },
  customer: { 
    title: "Portal Cliente",
    subtitle: "EliteDrive",
    accent: "from-gray-600 to-gray-700"
  }
};

// Mapeo de iconos
const iconMap = {
  Home,
  Car,
  Calendar,
  Settings,
  User,
  Users,
  Wrench,
  Clock,
  BookOpen,
  LogOut
};

const SidebarContext = createContext();

const Sidebar = ({ toggleSidebar, isMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const role = user?.routeRole || "customer"; // Este será "admin" o "customer"
  
  
    const menuRole = useMemo(() => {
    if (!user || !user.role) return 'GUEST';
    return dbRoleToMenu(user.role); // "ADMIN" o "USER"
  }, [user]);

  const menuOptions = {
    ADMIN: [
      { name: "Dashboard", path: "/admin", icon: "Home" },
      
      { name: "Gestión de Reservas", path: "/admin/reservation", icon: "Calendar" },
      { name: "Gestión de Vehículos", path: "/admin/vehicle", icon: "Car" },
      { name: "Mantenimiento", path: "/admin/maintenance", icon: "Wrench" },
    ],
    USER: [
      { name: "Inicio", path: "/customer", icon: "Home" },
      { name: "Vehículos", path: "/customer/vehicles", icon: "Car" },
      { name: "Mis Reservas", path: "/customer/my-reservations", icon: "BookOpen" },
    ],
  };

  const handleLinkClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  const isActivePath = (path) => {
    if (path === '/' || path === `/${role}`) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  // Si no hay usuario logueado, mostrar sidebar básico
if (!user || !user.isAuthenticated) {
  return (
    <aside className="h-full">
      <nav className="h-full flex flex-col bg-black backdrop-blur-md border-r border-white/20 shadow-2xl min-w-64 relative">
        {/* Header con logo y hamburger */}
        <div className="relative px-6 pt-8 pb-6 flex justify-between items-center">
          <div className="flex flex-col">
            <img
              src="/EliteDrive.svg"
              alt="Logo"
              className="h-12 w-auto invert"
            />
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl border-none hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-white/10"
            title={isMobile ? "Cerrar sidebar" : "Colapsar sidebar"}
          >
            <ChevronLeft size={20} className="text-slate-300" />
          </button>
        </div>

        {/* Navegación */}
        <ul className="flex-1 px-4 py-6 space-y-2">
          <li>
            <Link
              to="/"
              onClick={handleLinkClick}
              className={`
      group flex items-center gap-4 px-4 py-3.5 rounded-xl
      font-medium transition-all duration-300 relative overflow-hidden
      ${isActivePath('/') 
        ? 'bg-white/10 text-white shadow-lg transform scale-105'
        : 'text-slate-300 hover:bg-black/5 hover:text-white hover:translate-x-1'
      }
    `}
              >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Home className= {`relative z-10 ${isActivePath('/') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}  size={18} />
              <span className="text-sm relative z-10">Página Principal</span>
            </Link>
          </li>
          <li>
            <Link
              to="/customer/vehicles"
              onClick={handleLinkClick}
                className={`
      group flex items-center gap-4 px-4 py-3.5 rounded-xl
      font-medium transition-all duration-300 relative overflow-hidden
      ${isActivePath('/customer/vehicles') 
        ? 'bg-white/10 text-white shadow-lg transform scale-105'
        : 'text-slate-300 hover:bg-black/5 hover:text-white hover:translate-x-1'
      }
    `}
              >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Car className={`relative z-10 ${isActivePath('/customer/vehicles') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} size={18} />
              <span className="text-sm relative z-10">Vehículos</span>
            </Link>
          </li>
        </ul>

        {/* Footer con botón login/registro */}
        <div className="border-t border-white/20 p-6 text-center space-y-3">
          <Link
            to="/login"
            className="group w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-white hover:text-gray-100 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/20 backdrop-blur-sm"
          >
            <User size={16} />
            <span className="font-medium">Iniciar Sesión</span>
          </Link>
          <Link
            to="/register"
            className="group w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-white hover:text-gray-100 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/20 backdrop-blur-sm"
          >
            <Users size={16} />
            <span className="font-medium">Registrarse</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}


//Sidebar completo

  return (
    <aside className="h-full">
      <nav className="h-full flex flex-col bg-black border-r border-gray-700/50 shadow-2xl min-w-64 relative">
        
        {/* Header del Sidebar */}
        <div className="relative px-6 pt-8 pb-6 flex justify-between items-center">
          <div className="flex flex-col">
            <img
            src="/EliteDrive.svg"
            alt="Logo"
            className="h-12 w-auto invert"></img>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl border-none hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-white/10"
            title={isMobile ? "Cerrar sidebar" : "Colapsar sidebar"}
          >
            <ChevronLeft size={20} className="text-slate-300" />
          </button>
        </div>

        {/* Menú de navegación */}
        <SidebarContext.Provider value={{ open: true }}>
          <ul className="flex-1 px-4 py-6 space-y-2">
            {menuOptions[menuRole]?.map(({ name, path, icon }) => {
              const IconComponent = iconMap[icon];
              const isActive = isActivePath(path);
              
              return (
                <li key={path}>
                  <Link
                    to={path}
                    onClick={handleLinkClick}
                    className={`
                      group flex items-center gap-4 px-4 py-3.5 rounded-xl
                      font-medium transition-all duration-300 relative overflow-hidden
                      ${isActive 
                        ? `bg-gradient-to-r ${roleConfig[role].accent} text-white shadow-lg shadow-gray-500/25 transform scale-105` 
                        : 'text-slate-300 hover:bg-black/5 hover:text-white hover:transform hover:translate-x-1'
                      }
                    `}
                  >
                    {/* Efecto de brillo en hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    
                    {IconComponent && (
                      <div className={`relative z-10 ${isActive ? 'animate-pulse' : ''}`}>
                        <IconComponent 
                          size={20} 
                          className={`transition-colors duration-300 ${
                            isActive ? 'text-white drop-shadow-lg' : 'text-slate-400 group-hover:text-white'
                          }`} 
                        />
                      </div>
                    )}
                    <span className={`text-sm relative z-10 ${isActive ? 'font-semibold' : ''}`}>
                      {name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </SidebarContext.Provider>

        {/* Footer del usuario */}
        <div className="relative border-t border-slate-700/50 p-6">
          <div className="relative flex items-center gap-4 mb-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${roleConfig[role].accent} flex items-center justify-center shadow-lg`}>
                <User size={20} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-white truncate">
                  {user?.firstName || user?.name || "Usuario"}
                </h4>
              </div>
              <span className="text-xs text-slate-400 truncate block">
                {user?.email || "No disponible"}
              </span>
              <span className={`text-xs font-medium bg-gradient-to-r ${roleConfig[role].accent} bg-clip-text text-neutral-500`}>
                {menuRole === 'ADMIN' ? 'Administrador' : 'Cliente'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={logout} 
            className="group w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300 border border-red-500/20 hover:border-red-500/40 backdrop-blur-sm"
          >
            <LogOut size={16} className="group-hover:transform group-hover:translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;