import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guardián de navegación centralizado para protección de rutas según autenticación y roles (RBAC).
 * Cumple con HU-033 / CR-013 / RNF-06 (Control de acceso por rol en interfaz de usuario).
 * 
 * Intercepta los intentos de navegación por URL directa verificando:
 * 1. Estado de carga de la sesión (renderiza spinner).
 * 2. Existencia de token activo (Escenario 1: redirige a /login si no hay sesión).
 * 3. Verificación de rol en allowedRoles (Escenario 2: redirige al panel correspondiente si el rol es insuficiente).
 * 4. Renderizado fluido de children o Outlet ante acceso legítimo (Escenario 3).
 * 
 * @param {Object} props
 * @param {string[]} [props.allowedRoles=[]] - Roles autorizados ('ADMIN', 'PRODUCTOR', 'TECNICO').
 * @param {React.ReactNode} [props.children] - Componente hijo opcional si no se usa como Route Layout.
 */
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div data-testid="auth-loading" className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Escenario 1: Si no hay token de sesión, redirigir inmediatamente a Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Obtención resiliente del rol desde el contexto de usuario o localStorage
  const userRole = user?.rol || localStorage.getItem('rol');

  // Escenario 2: Si la ruta exige roles específicos y el rol del usuario no está autorizado
  if (allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
    // Redirección inteligente según el rol real del usuario a su panel correspondiente
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/fincas" replace />;
  }

  // Escenario 3: Acceso legítimo por rol correspondiente
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
