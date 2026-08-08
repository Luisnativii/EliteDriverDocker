// components/RootRedirect.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user || !user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  const redirectPath = user.routeRole === 'admin' ? '/admin' : '/customer';
  return <Navigate to={redirectPath} replace />;
};

export default RootRedirect;