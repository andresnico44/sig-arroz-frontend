import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import Fincas from './pages/Fincas';
import Lotes from './pages/Lotes';
import LoteDetalle from './pages/LoteDetalle';
import CicloDetalle from './pages/CicloDetalle';
import AdminDashboard from './pages/AdminDashboard';
import HistorialProduccion from './pages/HistorialProduccion';

/**
 * Enrutador principal de SIG-ARROZ con control centralizado de acceso (RBAC).
 * Implementa la especificación HU-033 / CR-013 para protección de vistas según rol.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPasswordConfirm />} />
          
          {/* Rutas Protegidas Exclusivas para ADMINISTRADOR (HU-033 / CR-013) */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/usuarios" element={<AdminDashboard />} />
          </Route>

          {/* Rutas Protegidas Generales (ADMIN, PRODUCTOR, TECNICO) */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PRODUCTOR', 'TECNICO']} />}>
            <Route path="/fincas" element={<Fincas />} />
            <Route path="/fincas/:fincaId/lotes" element={<Lotes />} />
            <Route path="/lotes/:loteId/gestion" element={<LoteDetalle />} />
            <Route path="/lotes/:loteId/ciclos/:cicloId/gestion" element={<CicloDetalle />} />
            <Route path="/historial-produccion" element={<HistorialProduccion />} />
          </Route>

          {/* Fallback para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
