import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Maximize, Plus, Tractor, LogOut, Loader, ArrowLeft, Layers, Compass, Droplet, Activity, X } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

export default function Lotes() {
  const { fincaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [lotes, setLotes] = useState([]);
  const [finca, setFinca] = useState(location.state?.finca || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el modal de nuevo lote
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [nuevoLote, setNuevoLote] = useState({
    nombre: '',
    area_hectareas: '',
    tipo_suelo: 'FRANCO',
    sistema_produccion: 'RIEGO',
    latitud: '',
    longitud: '',
    estado: 'ACTIVO'
  });

  const username = localStorage.getItem('username');
  const rol = localStorage.getItem('rol');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Si no tenemos la información de la finca en el estado de navegación (ej: refrescar página)
    if (!finca) {
      fetchFincaDetails();
    } else {
      fetchLotes();
    }
  }, [fincaId, token]);

  const fetchFincaDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fincas/${fincaId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFinca(response.data);
      fetchLotes();
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la información de la finca.');
      setLoading(false);
    }
  };

  const fetchLotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/lotes/?finca_id=${fincaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLotes(response.data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los lotes de esta finca.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Calcular áreas asignadas
  const areaTotalFinca = finca ? parseFloat(finca.area_total_ha) : 0;
  const areaAsignadaLotes = lotes.reduce((sum, lote) => sum + parseFloat(lote.area_hectareas), 0);
  const areaDisponible = Math.max(0, areaTotalFinca - areaAsignadaLotes);
  const porcentajeAsignado = Math.min(100, (areaAsignadaLotes / areaTotalFinca) * 100);

  const handleCreateLote = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    const areaInput = parseFloat(nuevoLote.area_hectareas);
    
    // Validación cruzada local (WOW UX)
    if (areaInput > areaDisponible) {
      setValidationError(
        `No puedes registrar este lote. El área ingresada (${areaInput} ha) supera el área restante disponible en la finca (${areaDisponible.toFixed(2)} ha).`
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        finca: parseInt(fincaId),
        nombre: nuevoLote.nombre,
        area_hectareas: areaInput,
        tipo_suelo: nuevoLote.tipo_suelo,
        sistema_produccion: nuevoLote.sistema_produccion,
        latitud: nuevoLote.latitud ? parseFloat(nuevoLote.latitud) : null,
        longitud: nuevoLote.longitud ? parseFloat(nuevoLote.longitud) : null,
        estado: nuevoLote.estado
      };

      const response = await axios.post(`${API_BASE_URL}/api/lotes/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLotes([response.data, ...lotes]);
      setIsModalOpen(false);
      setNuevoLote({
        nombre: '',
        area_hectareas: '',
        tipo_suelo: 'FRANCO',
        sistema_produccion: 'RIEGO',
        latitud: '',
        longitud: '',
        estado: 'ACTIVO'
      });
    } catch (err) {
      console.error(err);
      if (err.response?.data?.area_hectareas) {
        setValidationError(err.response.data.area_hectareas[0]);
      } else {
        setValidationError('Ocurrió un error al registrar el lote en el servidor.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Mapear etiquetas de estado a colores premium
  const getEstadoBadge = (estado) => {
    const estilos = {
      'ACTIVO': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      'PREPARACION': 'bg-amber-50 text-amber-700 border border-amber-200',
      'EN_CICLO': 'bg-blue-50 text-blue-700 border border-blue-200',
      'COSECHADO': 'bg-purple-50 text-purple-700 border border-purple-200',
      'DESCANSO': 'bg-gray-100 text-gray-700 border border-gray-300'
    };
    return estilos[estado] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
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
        {/* Botón de regreso */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-rice-green font-bold mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Volver a Fincas
        </button>

        {finca && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rice-green/5 rounded-bl-full -mr-4 -mt-4"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <span className="text-xs font-bold text-rice-emerald uppercase tracking-widest bg-rice-emerald/10 px-3 py-1 rounded-full">Finca Actual</span>
                <h1 className="text-3xl font-extrabold text-gray-900 mt-2 tracking-tight">{finca.nombre}</h1>
                <p className="text-gray-500 font-medium mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {finca.ubicacion_municipio}, {finca.ubicacion_departamento}
                </p>
              </div>

              {/* Hectares Progress bar (WOW Factor) */}
              <div className="w-full md:w-80 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-2">
                  <span>Área Asignada</span>
                  <span className="text-rice-green">{areaAsignadaLotes.toFixed(1)} / {areaTotalFinca} ha</span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-rice-green h-full rounded-full transition-all duration-500" 
                    style={{ width: `${porcentajeAsignado}%` }}
                  />
                </div>
                <p className="text-xxs text-gray-400 font-bold mt-2 text-right uppercase">
                  {areaDisponible.toFixed(1)} Hectáreas Libres
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Lotes del Cultivo</h2>
            <p className="text-gray-500 font-medium">Planifica y gestiona las subdivisiones de la finca</p>
          </div>
          
          {rol !== 'TECNICO' && finca && areaDisponible > 0.1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-rice-green text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-rice-green/30 hover:bg-[#154224] transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Añadir Lote
            </motion.button>
          )}
        </div>

        {/* Handling States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-10 h-10 text-rice-green animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Cargando los lotes de la finca...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : lotes.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Esta finca no posee lotes todavía</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Debes registrar al menos un lote para poder planificar análisis de suelo y ciclos de siembra de arroz.
            </p>
            {rol !== 'TECNICO' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-rice-green font-bold hover:text-[#154224] transition-colors"
              >
                + Registrar mi primer lote
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lotes.map((lote) => (
              <motion.div
                key={lote.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                onClick={() => navigate(`/lotes/${lote.id}/gestion`, { state: { lote, finca } })}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group cursor-pointer transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-rice-green transition-colors pr-2">
                    {lote.nombre}
                  </h3>
                  <span className={`text-xxs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${getEstadoBadge(lote.estado)}`}>
                    {lote.estado === 'ACTIVO' ? 'DISPONIBLE' : lote.estado === 'PREPARACION' ? 'EN PREPARACION' : lote.estado}
                  </span>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                    <span className="text-gray-500 font-semibold flex items-center gap-1.5"><Maximize className="w-4 h-4 text-gray-400" /> Área</span>
                    <span className="font-bold text-gray-900">{lote.area_hectareas} ha</span>
                  </div>

                  <div className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                    <span className="text-gray-500 font-semibold flex items-center gap-1.5"><Layers className="w-4 h-4 text-gray-400" /> Tipo Suelo</span>
                    <span className="font-bold text-gray-900 capitalize">{lote.tipo_suelo.toLowerCase()}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                    <span className="text-gray-500 font-semibold flex items-center gap-1.5"><Droplet className="w-4 h-4 text-gray-400" /> Producción</span>
                    <span className="font-bold text-gray-900 capitalize">{lote.sistema_produccion.toLowerCase()}</span>
                  </div>

                  {lote.latitud && lote.longitud ? (
                    <div className="flex items-center justify-between text-sm py-1">
                      <span className="text-gray-500 font-semibold flex items-center gap-1.5"><Compass className="w-4 h-4 text-gray-400" /> Ubicación GPS</span>
                      <span className="font-semibold text-rice-emerald text-xs">{Number(lote.latitud).toFixed(4)}, {Number(lote.longitud).toFixed(4)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-sm py-1">
                      <span className="text-gray-500 font-semibold flex items-center gap-1.5"><Compass className="w-4 h-4 text-gray-400" /> Ubicación GPS</span>
                      <span className="text-gray-400 text-xs font-medium italic">Sin coordenadas</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-rice-green group-hover:underline cursor-pointer">Ver Ciclos de Cultivo →</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Crear Lote */}
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
                <h3 className="text-xl font-bold text-gray-900">Registrar Nuevo Lote</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {validationError && (
                <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {validationError}
                </div>
              )}

              <form onSubmit={handleCreateLote} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Lote</label>
                  <input 
                    type="text" required
                    value={nuevoLote.nombre}
                    onChange={(e) => setNuevoLote({...nuevoLote, nombre: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald focus:border-transparent outline-none transition-all font-medium text-gray-900"
                    placeholder="Ej: Lote Norte A-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Área (Hectáreas)</label>
                    <input 
                      type="number" step="0.01" min="0.1" required
                      value={nuevoLote.area_hectareas}
                      onChange={(e) => setNuevoLote({...nuevoLote, area_hectareas: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none transition-all font-medium text-gray-900"
                      placeholder="Ej: 5.2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Estado Inicial</label>
                    <select
                      value={nuevoLote.estado}
                      onChange={(e) => setNuevoLote({...nuevoLote, estado: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none transition-all font-bold text-gray-700"
                    >
                      <option value="ACTIVO">Disponible</option>
                      <option value="PREPARACION">En Preparación</option>
                      <option value="DESCANSO">En Descanso</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Suelo</label>
                    <select
                      value={nuevoLote.tipo_suelo}
                      onChange={(e) => setNuevoLote({...nuevoLote, tipo_suelo: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none transition-all font-bold text-gray-700"
                    >
                      <option value="FRANCO">Franco</option>
                      <option value="ARCILLOSO">Arcilloso</option>
                      <option value="ARENOSO">Arenoso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Sistema de Producción</label>
                    <select
                      value={nuevoLote.sistema_produccion}
                      onChange={(e) => setNuevoLote({...nuevoLote, sistema_produccion: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none transition-all font-bold text-gray-700"
                    >
                      <option value="RIEGO">Riego</option>
                      <option value="SECANO">Secano</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Latitud GPS (Opcional)</label>
                    <input 
                      type="number" step="0.000001"
                      value={nuevoLote.latitud}
                      onChange={(e) => setNuevoLote({...nuevoLote, latitud: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none transition-all font-medium text-gray-900"
                      placeholder="Ej: 4.123456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Longitud GPS (Opcional)</label>
                    <input 
                      type="number" step="0.000001"
                      value={nuevoLote.longitud}
                      onChange={(e) => setNuevoLote({...nuevoLote, longitud: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none transition-all font-medium text-gray-900"
                      placeholder="Ej: -74.987654"
                    />
                  </div>
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
                    {saving ? <><Loader className="w-5 h-5 animate-spin" /> Guardando</> : 'Registrar Lote'}
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
