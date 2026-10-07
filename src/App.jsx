import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import Fincas from './pages/Fincas';
import Lotes from './pages/Lotes';
import LoteDetalle from './pages/LoteDetalle';
import CicloDetalle from './pages/CicloDetalle';

function App() {
  return (
<<<<<<< Updated upstream
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas y de Autenticación */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPasswordConfirm />} />
        
        {/* Rutas Privadas y Dashboard (Sprint 2) */}
        <Route path="/fincas" element={<Fincas />} />
        <Route path="/fincas/:fincaId/lotes" element={<Lotes />} />
        <Route path="/lotes/:loteId/gestion" element={<LoteDetalle />} />
        <Route path="/lotes/:loteId/ciclos/:cicloId/gestion" element={<CicloDetalle />} />
      </Routes>
    </BrowserRouter>
=======
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPasswordConfirm />} />

          {/* Rutas Protegidas Exclusivas para ADMINISTRADOR */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
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
>>>>>>> Stashed changes
  );
}

export default App;