import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas y de Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPasswordConfirm />} />
        
        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Las futuras rutas privadas de Fincas, Lotes y Ciclos irán aquí protegidas por rol */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;