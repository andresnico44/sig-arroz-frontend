import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Petición real al backend de Django
      await axios.post(`${API_BASE_URL}/api/password_reset/`, {
        email: email
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al procesar tu solicitud. Verifica tu conexión o correo.');
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
        <Link to="/login" className="flex items-center text-xs text-gray-500 hover:text-rice-green mb-6 transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Volver al Login
        </Link>

        {submitted ? (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center text-center">
            <CheckCircle className="w-16 h-16 text-rice-emerald mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-rice-dark mb-2">¡Revisa tu correo!</h2>
            <p className="text-gray-500 text-sm">
              Si la cuenta existe, hemos enviado un enlace de recuperación a <br/>
              <span className="font-semibold text-rice-dark">{email}</span>
            </p>
          </motion.div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-rice-dark mb-2">Recuperar Clave</h2>
            <p className="text-gray-500 text-sm mb-6">
              Ingresa tu correo electrónico y te enviaremos las instrucciones y un enlace seguro para restablecer tu contraseña.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rice-emerald outline-none"
                    placeholder="usuario@ejemplo.com" required
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-rice-emerald text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-[#3d7a22] transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Enviando correo...
                  </>
                ) : 'Enviar Instrucciones'}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
