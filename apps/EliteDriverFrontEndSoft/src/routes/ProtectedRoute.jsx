import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Componente de ruta protegida que asegura que solo los usuarios autenticados 
 * y con el rol adecuado puedan acceder a ciertas rutas. Si el usuario no está 
 * autenticado o no tiene el rol necesario, será redirigido a otra página.
 *
 * @param {ReactNode} children - Los elementos que se renderizan si el usuario está autenticado y tiene el rol necesario.
 * @param {string} requiredRole - Rol necesario para acceder a la ruta. Puede ser "admin", "customer", etc.
 * @returns {ReactNode} Redirige o renderiza el contenido protegido según la autenticación y el rol.
 */

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();


  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si no hay usuario, redirigir a la pagina principal
  if (!user || !user.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si se requiere un rol específico, verificar
  if (requiredRole) {
    const userRouteRole = user.routeRole; // "admin" o "customer"

    
    if (userRouteRole !== requiredRole) {
      // Redirigir al dashboard correspondiente al rol del usuario
      return <Navigate to={`/${userRouteRole}`} replace />;
    }
  }

  // Si hay children, renderizar children, si no, renderizar Outlet para nested routes
  return children || <Outlet />;
};

export default ProtectedRoute;