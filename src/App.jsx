import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import Fincas from './pages/Fincas';
import Lotes from './pages/Lotes'; // <-- Importar Lotes
import LoteDetalle from './pages/LoteDetalle'; // <-- Importar LoteDetalle

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas y de Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPasswordConfirm />} />
        
        {/* Rutas Privadas y Dashboard (Sprint 2) */}
        <Route path="/" element={<Fincas />} />
        <Route path="/fincas/:fincaId/lotes" element={<Lotes />} />
        <Route path="/lotes/:loteId/gestion" element={<LoteDetalle />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;