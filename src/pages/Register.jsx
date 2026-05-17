import React, { useState } from 'react';
import { Leaf, Lock, Mail, User, Briefcase, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({
    nombre_completo: '', // Cambiado de username a nombre_completo (admite tildes, espacios, ñ)
    email: '',
    password: '',
    rol: 'PRODUCTOR'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Petición real de registro a Django
      await axios.post('http://localhost:8000/api/users/register/', formData);
      setSuccess(true);
      // Redirigir al login
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const errors = err.response.data;
        if (errors.email) {
          setError(`Correo: ${errors.email[0]}`);
        } else if (errors.nombre_completo) {
          setError(`Nombre completo: ${errors.nombre_completo[0]}`);
        } else {
          setError('Error al registrarse. Verifica los datos e intenta de nuevo.');
        }
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-premium p-8 relative z-10 border border-white/50 backdrop-blur-sm"
      >
        {success ? (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center text-center">
            <CheckCircle className="w-16 h-16 text-rice-emerald mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-rice-dark mb-2">¡Registro Exitoso!</h2>
            <p className="text-gray-500 text-sm">
              Tu cuenta ha sido creada exitosamente.<br/>
              Redirigiendo al inicio de sesión en unos instantes...
            </p>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 bg-rice-green rounded-xl flex items-center justify-center mb-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-rice-dark">Crear Cuenta</h1>
              <p className="text-sm text-gray-500 mt-1">Únete a la plataforma SIG-ARROZ</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rice-dark mb-1">Nombre y Apellidos</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rice-emerald outline-none"
                    placeholder="María Muñoz o Juan Ibáñez" required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rice-dark mb-1">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rice-emerald outline-none"
                    placeholder="correo@ejemplo.com" required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rice-dark mb-1">Rol en el Sistema</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                  </div>
                  <select 
                    value={formData.rol}
                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rice-emerald outline-none"
                  >
                    <option value="PRODUCTOR">Productor (Dueño/Gestor)</option>
                    <option value="TECNICO">Técnico Agrícola</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rice-dark mb-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rice-emerald outline-none"
                    placeholder="••••••••" required
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-rice-green text-white font-semibold py-3 rounded-xl mt-4 hover:bg-[#154224] transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Registrando...
                  </>
                ) : 'Registrarse'}
              </motion.button>
              
              <div className="text-center mt-4">
                <span className="text-xs text-gray-500">¿Ya tienes una cuenta? </span>
                <Link to="/login" className="text-xs text-rice-emerald font-bold hover:underline">Inicia Sesión</Link>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
