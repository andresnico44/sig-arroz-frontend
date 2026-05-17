import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Maximize, Plus, Tractor, LogOut, Loader, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

export default function Fincas() {
  const [fincas, setFincas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el modal de nueva finca
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nuevaFinca, setNuevaFinca] = useState({
    nombre: '',
    ubicacion_departamento: '',
    ubicacion_municipio: '',
    area_total_ha: ''
  });

  const navigate = useNavigate();
  
  // Obtener datos del usuario logueado
  const username = localStorage.getItem('username');
  const rol = localStorage.getItem('rol');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchFincas();
  }, [navigate, token]);

  const fetchFincas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/fincas/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFincas(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError('No se pudieron cargar las fincas. Intenta de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleCreateFinca = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/fincas/`, {
        ...nuevaFinca,
        area_total_ha: parseFloat(nuevaFinca.area_total_ha)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Añadir la nueva finca a la lista actual de forma reactiva (sin recargar)
      setFincas([response.data, ...fincas]);
      setIsModalOpen(false);
      setNuevaFinca({ nombre: '', ubicacion_departamento: '', ubicacion_municipio: '', area_total_ha: '' });
    } catch (err) {
      console.error("Error al crear finca:", err.response?.data);
      alert('Error al crear la finca. Revisa que el área sea mayor a 0 e intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-rice-green rounded-xl flex items-center justify-center shadow-md">
                <Tractor className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-rice-dark tracking-tight">SIG-ARROZ</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-rice-dark">{username}</p>
                <p className="text-xs font-semibold text-rice-emerald uppercase tracking-wider">{rol}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Fincas</h1>
            <p className="text-gray-500 mt-1 font-medium">Gestiona tus parcelas y tierras arroceras</p>
          </div>
          
          {rol !== 'TECNICO' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-rice-green text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-rice-green/30 hover:bg-[#154224] transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Añadir Finca
            </motion.button>
          )}
        </div>

        {/* Handling States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-10 h-10 text-rice-green animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Cargando tus fincas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : fincas.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No tienes fincas registradas</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Empieza registrando tu primera finca arrocera para poder gestionar sus lotes y ciclos productivos.
            </p>
            {rol !== 'TECNICO' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-rice-green font-bold hover:text-[#154224] transition-colors"
              >
                + Registrar mi primera finca
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fincas.map((finca) => (
              <motion.div
                key={finca.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm cursor-pointer transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rice-emerald/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 pr-8">{finca.nombre}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                      <MapPin className="w-4 h-4 text-rice-emerald" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Ubicación</p>
                      <p className="text-sm font-medium text-gray-900">{finca.ubicacion_municipio}, {finca.ubicacion_departamento}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                      <Maximize className="w-4 h-4 text-rice-emerald" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Área Total</p>
                      <p className="text-sm font-medium text-gray-900">{finca.area_total_ha} Hectáreas</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-rice-green group-hover:underline">Gestionar Lotes →</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Crear Finca */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">Registrar Nueva Finca</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateFinca} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Finca</label>
                  <input 
                    type="text" required
                    value={nuevaFinca.nombre}
                    onChange={(e) => setNuevaFinca({...nuevaFinca, nombre: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald focus:border-transparent outline-none transition-all font-medium text-gray-900"
                    placeholder="Ej: Hacienda El Progreso"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Departamento</label>
                    <input 
                      type="text" required
                      value={nuevaFinca.ubicacion_departamento}
                      onChange={(e) => setNuevaFinca({...nuevaFinca, ubicacion_departamento: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none transition-all font-medium text-gray-900"
                      placeholder="Ej: Tolima"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Municipio</label>
                    <input 
                      type="text" required
                      value={nuevaFinca.ubicacion_municipio}
                      onChange={(e) => setNuevaFinca({...nuevaFinca, ubicacion_municipio: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none transition-all font-medium text-gray-900"
                      placeholder="Ej: El Espinal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Área Total (Hectáreas)</label>
                  <input 
                    type="number" step="0.01" min="0.1" required
                    value={nuevaFinca.area_total_ha}
                    onChange={(e) => setNuevaFinca({...nuevaFinca, area_total_ha: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none transition-all font-medium text-gray-900"
                    placeholder="0.00"
                  />
                </div>

                <div className="mt-8 flex gap-3 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 px-4 py-3 text-white font-bold bg-rice-green hover:bg-[#154224] rounded-xl shadow-lg shadow-rice-green/30 transition-all flex justify-center items-center gap-2"
                  >
                    {saving ? <><Loader className="w-5 h-5 animate-spin" /> Guardando</> : 'Registrar Finca'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
