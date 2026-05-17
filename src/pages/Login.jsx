import React, { useState } from 'react';
import { Leaf, Lock, Mail, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

export default function Login() {
  const [email, setEmail] = useState(''); // El input del correo electrónico
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // DRF SimpleJWT espera 'username' y 'password'.
      // Como guardamos el email como username en la DB, enviamos el 'email' en el campo 'username'.
      const response = await axios.post(`${API_BASE_URL}/api/token/`, {
        username: email,
        password: password
      });

      const { access, refresh } = response.data;

      // Decodificar el JWT nativamente para extraer el Rol y el Nombre Completo
      const payload = JSON.parse(atob(access.split('.')[1]));

      // Guardar datos de sesión
      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('username', payload.username); // Aquí vendrá el Nombre Completo real
      localStorage.setItem('rol', payload.rol);

      console.log('Login exitoso. Usuario:', payload.username, '| Rol:', payload.rol);

      // Redirigir según corresponda (futuro Dashboard)
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      } else {
        setError('No se pudo conectar con el servidor backend de Django.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rice-light flex items-center justify-center p-4 relative overflow-hidden">
      {/* Formas decorativas */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rice-emerald rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rice-green rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-3xl shadow-premium p-8 relative z-10 border border-white/50 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-rice-green rounded-2xl flex items-center justify-center mb-4 shadow-lg transform rotate-3">
            <Leaf className="w-8 h-8 text-white transform -rotate-3" />
          </div>
          <h1 className="text-3xl font-bold text-rice-dark tracking-tight">SIG-ARROZ</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Gestión inteligente de cultivos</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-rice-dark mb-2">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-rice-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rice-emerald focus:border-transparent transition-all duration-200"
                placeholder="usuario@correo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-rice-dark mb-2">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-rice-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rice-emerald focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-sm text-rice-emerald font-semibold hover:text-rice-green transition-colors hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-rice-green text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:bg-[#154224] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rice-green transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Iniciando Sesión...
              </>
            ) : 'Iniciar Sesión'}
          </motion.button>

          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500 font-medium">¿No tienes una cuenta? </span>
            <Link to="/register" className="text-sm text-rice-emerald font-bold hover:text-rice-green transition-colors hover:underline">
              Regístrate
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
