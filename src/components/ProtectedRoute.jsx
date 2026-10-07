import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Si no hay token de sesión, redirigir a Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta exige roles específicos y el rol del usuario no está en la lista permitida
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.rol)) {
    // Redirección inteligente según el rol real del usuario
    if (user.rol === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/fincas" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
