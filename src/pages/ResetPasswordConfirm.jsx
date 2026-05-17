import React, { useState } from 'react';
import { Lock, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

export default function ResetPasswordConfirm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Capturamos el token real de la URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      // Conectar con el endpoint real del backend en Django
      await axios.post(`${API_BASE_URL}/api/password_reset/confirm/`, {
        token: token,
        password: password
      });
      setSubmitted(true);
      // Redirigir al login en 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rice-light flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rice-emerald rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-premium p-8 relative z-10 border border-white/50 backdrop-blur-sm"
      >
        {submitted ? (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center text-center">
            <CheckCircle className="w-16 h-16 text-rice-emerald mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-rice-dark mb-2">¡Contraseña Cambiada!</h2>
            <p className="text-gray-500 text-sm">
              Tu contraseña ha sido restablecida con éxito.<br/>
              Serás redirigido al Login en un momento...
            </p>
          </motion.div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-rice-dark mb-2">Nueva Contraseña</h2>
            <p className="text-gray-500 text-sm mb-6">
              Ingresa y confirma tu nueva contraseña de acceso para SIG-ARROZ.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rice-dark mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rice-emerald outline-none"
                    placeholder="••••••••" required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rice-dark mb-1">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rice-emerald outline-none"
                    placeholder="••••••••" required
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-rice-green text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-[#154224] transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Actualizando...
                  </>
                ) : 'Guardar Nueva Contraseña'}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
