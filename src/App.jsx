import React from 'react';
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
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas y de Autenticación */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPasswordConfirm />} />
        
        {/* Rutas Privadas y Dashboard */}
        <Route path="/fincas" element={<Fincas />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/fincas/:fincaId/lotes" element={<Lotes />} />
        <Route path="/lotes/:loteId/gestion" element={<LoteDetalle />} />
        <Route path="/lotes/:loteId/ciclos/:cicloId/gestion" element={<CicloDetalle />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;