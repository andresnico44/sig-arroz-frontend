import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Maximize, Plus, Tractor, LogOut, Loader, ArrowLeft, 
  Layers, Compass, Droplet, Activity, X, Pencil, Trash2, Search, Filter, TrendingUp 
} from 'lucide-react';
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

  // Estado para el modal de edición de lote
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLote, setEditingLote] = useState({
    id: '',
    nombre: '',
    area_hectareas: '',
    tipo_suelo: 'FRANCO',
    sistema_produccion: 'RIEGO',
    latitud: '',
    longitud: '',
    estado: 'ACTIVO'
  });

  // GPS Loading indicators (WOW factor)
  const [gpsLoadingCreate, setGpsLoadingCreate] = useState(false);
  const [gpsLoadingEdit, setGpsLoadingEdit] = useState(false);

  // Filtros Avanzados
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('ALL'); // 'ALL', 'SMALL', 'MEDIUM', 'LARGE'
  const [soilFilter, setSoilFilter] = useState('ALL'); // 'ALL', 'FRANCO', 'ARCILLOSO', 'ARENOSO'
  const [prodFilter, setProdFilter] = useState('ALL'); // 'ALL', 'RIEGO', 'SECANO'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'ACTIVO', 'PREPARACION', 'EN_CICLO', 'COSECHADO', 'DESCANSO'

  const username = localStorage.getItem('username');
  const rol = localStorage.getItem('rol');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
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
    
    // Validación cruzada local
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

  const handleOpenEditLoteModal = (lote) => {
    setEditingLote({
      id: lote.id,
      nombre: lote.nombre,
      area_hectareas: lote.area_hectareas,
      tipo_suelo: lote.tipo_suelo,
      sistema_produccion: lote.sistema_produccion,
      latitud: lote.latitud || '',
      longitud: lote.longitud || '',
      estado: lote.estado
    });
    setIsEditModalOpen(true);
  };

  const handleEditLote = async (e) => {
    e.preventDefault();
    setValidationError('');

    const areaInput = parseFloat(editingLote.area_hectareas);
    const loteOriginal = lotes.find(l => l.id === editingLote.id);
    const areaOriginal = loteOriginal ? parseFloat(loteOriginal.area_hectareas) : 0;
    const maxAreaPermitida = areaDisponible + areaOriginal;

    if (areaInput > maxAreaPermitida) {
      setValidationError(
        `No puedes actualizar el lote. El área ingresada (${areaInput} ha) supera el límite máximo disponible para este lote (${maxAreaPermitida.toFixed(2)} ha).`
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        finca: parseInt(fincaId),
        nombre: editingLote.nombre,
        area_hectareas: areaInput,
        tipo_suelo: editingLote.tipo_suelo,
        sistema_produccion: editingLote.sistema_produccion,
        latitud: editingLote.latitud ? parseFloat(editingLote.latitud) : null,
        longitud: editingLote.longitud ? parseFloat(editingLote.longitud) : null,
        estado: editingLote.estado
      };

      const response = await axios.put(`${API_BASE_URL}/api/lotes/${editingLote.id}/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLotes(lotes.map(l => l.id === editingLote.id ? response.data : l));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error al editar lote:", err.response?.data);
      if (err.response?.data?.area_hectareas) {
        setValidationError(err.response.data.area_hectareas[0]);
      } else {
        setValidationError('Ocurrió un error al actualizar el lote en el servidor.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLote = async (lote) => {
    const confirmacion = window.confirm(`⚠️ ADVERTENCIA DE ELIMINACIÓN DE LOTE:
¿Estás completamente seguro de que deseas eliminar el lote "${lote.nombre}"?

Esta acción eliminará de forma permanente este lote y TODOS sus análisis de suelo y ciclos de cultivo asociados de forma irreversible. Esta acción no se puede deshacer.`);

    if (!confirmacion) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/lotes/${lote.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLotes(lotes.filter(l => l.id !== lote.id));
    } catch (err) {
      console.error("Error al eliminar lote:", err.response?.data);
      alert('Error al intentar eliminar el lote. Verifica tus permisos de red.');
    }
  };

  // Geolocalización Nativa para Lotes
  const capturarGPS = (isEdit = false) => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    
    if (isEdit) {
      setGpsLoadingEdit(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEditingLote(prev => ({
            ...prev,
            latitud: position.coords.latitude.toFixed(6),
            longitud: position.coords.longitude.toFixed(6)
          }));
          setGpsLoadingEdit(false);
        },
        (err) => {
          console.error(err);
          setGpsLoadingEdit(false);
          alert("No se pudo obtener la geolocalización. Otorga permisos de ubicación.");
        }
      );
    } else {
      setGpsLoadingCreate(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNuevoLote(prev => ({
            ...prev,
            latitud: position.coords.latitude.toFixed(6),
            longitud: position.coords.longitude.toFixed(6)
          }));
          setGpsLoadingCreate(false);
        },
        (err) => {
          console.error(err);
          setGpsLoadingCreate(false);
          alert("No se pudo obtener la geolocalización. Otorga permisos de ubicación.");
        }
      );
    }
  };

  // Mapear etiquetas de estado a colores premium en Tono Claro
  const getEstadoBadge = (estado) => {
    const estilos = {
      'ACTIVO': 'bg-emerald-50 text-emerald-700 border border-emerald-250 border-emerald-200',
      'PREPARACION': 'bg-amber-50 text-amber-700 border border-amber-200',
      'EN_CICLO': 'bg-blue-50 text-blue-700 border border-blue-200',
      'COSECHADO': 'bg-purple-50 text-purple-700 border border-purple-200',
      'DESCANSO': 'bg-gray-100 text-gray-700 border border-gray-300'
    };
    return estilos[estado] || 'bg-gray-50 text-gray-600';
  };

  // Lógica de filtrado reactivo de lotes
  const filteredLotes = lotes.filter(lote => {
    // 1. Texto (Nombre)
    const textMatch = lote.nombre.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Tamaño Hectáreas
    const area = parseFloat(lote.area_hectareas || 0);
    let sizeMatch = true;
    if (sizeFilter === 'SMALL') sizeMatch = area < 2;
    else if (sizeFilter === 'MEDIUM') sizeMatch = area >= 2 && area <= 5;
    else if (sizeFilter === 'LARGE') sizeMatch = area > 5;

    // 3. Tipo Suelo
    const soilMatch = soilFilter === 'ALL' || lote.tipo_suelo === soilFilter;

    // 4. Sistema Producción
    const prodMatch = prodFilter === 'ALL' || lote.sistema_produccion === prodFilter;

    // 5. Estado
    const statusMatch = statusFilter === 'ALL' || lote.estado === statusFilter;

    return textMatch && sizeMatch && soilMatch && prodMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9F6] via-[#FAFDFB] to-[#F0F5F2] text-gray-800 font-sans pb-12">
      {/* Top Navbar */}
      <nav className="backdrop-blur-md bg-[#FAFDFB]/85 border-b border-emerald-100/80 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/fincas')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-[#1E5631] to-[#4C9A2A] rounded-xl flex items-center justify-center shadow-md">
              <Tractor className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">SIG-ARROZ</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/historial-produccion', { state: { fincaId } })}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Ver Historial de Rendimientos"
            >
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>Rendimientos</span>
            </button>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-gray-800">{username}</p>
              <p className="text-2xs font-extrabold text-[#b8952b] uppercase tracking-wider">{rol}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Botón de regreso */}
        <button 
          onClick={() => navigate('/fincas')}
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-700 font-bold transition-all group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Volver a Fincas
        </button>

        {/* Finca Info Card */}
        {finca && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/10 rounded-bl-full -mr-4 -mt-4"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">Propiedad Seleccionada</span>
                <h1 className="text-3xl font-black text-gray-900 mt-3 tracking-tight">{finca.nombre}</h1>
                <p className="text-gray-500 font-medium mt-1.5 flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {finca.ubicacion_municipio}, {finca.ubicacion_departamento}
                </p>
              </div>

              {/* Hectares Progress bar (WOW Factor) */}
              <div className="w-full md:w-80 bg-[#F8FAF9] p-4 rounded-2xl border border-emerald-100/40">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-2">
                  <span>Área Asignada a Lotes</span>
                  <span className="text-emerald-700 font-extrabold">{areaAsignadaLotes.toFixed(1)} / {areaTotalFinca} Ha</span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${porcentajeAsignado}%` }}
                  />
                </div>
                <p className="text-2xs text-gray-400 font-bold mt-2 text-right uppercase tracking-wider">
                  {areaDisponible.toFixed(1)} Hectáreas Libres
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Barra de Búsqueda y Filtros Avanzados para Lotes */}
        <section className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-emerald-50">
            <Filter className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-black text-gray-900">Búsqueda y Filtros de Lotes</h3>
              <p className="text-2xs text-gray-500 font-bold">Filtra y clasifica tus lotes en tiempo real según características y tamaño de hectáreas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Buscador por Nombre */}
            <div className="md:col-span-3 relative">
              <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar lote por nombre..."
                className="w-full pl-11 pr-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl text-xs focus:border-emerald-500 focus:outline-none transition-all font-semibold text-gray-900"
              />
            </div>

            {/* Filtro Hectáreas */}
            <div className="md:col-span-3 flex items-center gap-2">
              <span className="text-2xs font-bold text-gray-500 shrink-0 uppercase tracking-wider">Hectáreas:</span>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="w-full px-3 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl text-2xs font-bold text-gray-700 cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Cualquier tamaño</option>
                <option value="SMALL">Pequeños (&lt; 2 Ha)</option>
                <option value="MEDIUM">Medianos (2 - 5 Ha)</option>
                <option value="LARGE">Grandes (&gt; 5 Ha)</option>
              </select>
            </div>

            {/* Tipo Suelo */}
            <div className="md:col-span-2 flex items-center gap-2">
              <span className="text-2xs font-bold text-gray-500 shrink-0 uppercase tracking-wider">Suelo:</span>
              <select
                value={soilFilter}
                onChange={(e) => setSoilFilter(e.target.value)}
                className="w-full px-2 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl text-2xs font-bold text-gray-700 cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Todos</option>
                <option value="FRANCO">Franco</option>
                <option value="ARCILLOSO">Arcilloso</option>
                <option value="ARENOSO">Arenoso</option>
              </select>
            </div>

            {/* Sistema Producción */}
            <div className="md:col-span-2 flex items-center gap-2">
              <span className="text-2xs font-bold text-gray-500 shrink-0 uppercase tracking-wider">Cultivo:</span>
              <select
                value={prodFilter}
                onChange={(e) => setProdFilter(e.target.value)}
                className="w-full px-2 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl text-2xs font-bold text-gray-700 cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Todos</option>
                <option value="RIEGO">Riego</option>
                <option value="SECANO">Secano</option>
              </select>
            </div>

            {/* Estado */}
            <div className="md:col-span-2 flex items-center gap-2">
              <span className="text-2xs font-bold text-gray-500 shrink-0 uppercase tracking-wider">Estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl text-2xs font-bold text-gray-700 cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Todos</option>
                <option value="ACTIVO">Disponible</option>
                <option value="PREPARACION">En Preparación</option>
                <option value="EN_CICLO">En Ciclo</option>
                <option value="COSECHADO">Cosechado</option>
                <option value="DESCANSO">En Descanso</option>
              </select>
            </div>
          </div>
        </section>

        {/* Header grid */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-950 tracking-tight">Lotes del Cultivo</h2>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              Visualizando {filteredLotes.length} de {lotes.length} lotes mapeados en esta finca
            </p>
          </div>
          
          {rol !== 'TECNICO' && finca && areaDisponible > 0.1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-[#4C9A2A] hover:from-emerald-500 hover:to-emerald-400 text-white px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Añadir Lote
            </motion.button>
          )}
        </div>

        {/* Grid / Listado */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-emerald-100 rounded-3xl">
            <Loader className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
            <p className="text-sm text-gray-500 font-bold">Cargando los lotes de la finca...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center font-bold text-sm">
            {error}
          </div>
        ) : filteredLotes.length === 0 ? (
          <div className="bg-white border border-emerald-100 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-lg font-black text-gray-950 mb-1">No se encontraron lotes</h3>
            <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto font-medium">
              Prueba modificando los filtros o agregando un nuevo lote a la finca arrocera.
            </p>
            {rol !== 'TECNICO' && lotes.length === 0 && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-emerald-700 font-black hover:text-emerald-800 hover:underline transition-all"
              >
                + Registrar mi primer lote
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLotes.map((lote) => (
              <motion.div
                key={lote.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/lotes/${lote.id}/gestion`, { state: { lote, finca } })}
                className="bg-white border border-emerald-100/60 rounded-3xl p-6 shadow-sm hover:shadow-md relative overflow-hidden group cursor-pointer transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-emerald-700 transition-colors pr-2">
                    {lote.nombre}
                  </h3>
                  <span className={`text-3xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${getEstadoBadge(lote.estado)}`}>
                    {lote.estado === 'ACTIVO' ? 'DISPONIBLE' : lote.estado === 'PREPARACION' ? 'EN PREPARACION' : lote.estado}
                  </span>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-emerald-50">
                    <span className="text-gray-500 font-bold flex items-center gap-1.5"><Maximize className="w-4 h-4 text-emerald-600" /> Área</span>
                    <span className="font-extrabold text-[#b8952b]">{lote.area_hectareas} Ha</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-emerald-50">
                    <span className="text-gray-500 font-bold flex items-center gap-1.5"><Layers className="w-4 h-4 text-emerald-600" /> Tipo Suelo</span>
                    <span className="font-bold text-gray-800 capitalize">{lote.tipo_suelo.toLowerCase()}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-emerald-50">
                    <span className="text-gray-500 font-bold flex items-center gap-1.5"><Droplet className="w-4 h-4 text-emerald-600" /> Producción</span>
                    <span className="font-bold text-gray-800 capitalize">{lote.sistema_produccion.toLowerCase()}</span>
                  </div>

                  {lote.latitud && lote.longitud ? (
                    <div className="flex items-center justify-between text-xs py-1.5">
                      <span className="text-gray-500 font-bold flex items-center gap-1.5"><Compass className="w-4 h-4 text-emerald-600" /> Ubicación GPS</span>
                      <span className="font-extrabold text-emerald-700">{Number(lote.latitud).toFixed(4)}, {Number(lote.longitud).toFixed(4)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs py-1.5">
                      <span className="text-gray-500 font-bold flex items-center gap-1.5"><Compass className="w-4 h-4 text-emerald-600" /> Ubicación GPS</span>
                      <span className="text-gray-400 text-xs font-semibold italic">Sin coordenadas</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-emerald-50 flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-700 group-hover:text-emerald-800 group-hover:underline cursor-pointer">Ver Ciclos de Cultivo →</span>
                  
                  {rol !== 'TECNICO' && (
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditLoteModal(lote);
                        }}
                        className="p-2 bg-[#FAFDFB] border border-emerald-100 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                        title="Editar Lote"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLote(lote);
                        }}
                        className="p-2 bg-[#FAFDFB] border border-emerald-100 text-gray-500 hover:text-red-650 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                        title="Eliminar Lote"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
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
              className="absolute inset-0 bg-[#0D1A12]/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-emerald-100"
            >
              <div className="px-6 py-5 border-b border-emerald-50 flex justify-between items-center bg-[#FAFDFB]">
                <h3 className="text-lg font-black text-gray-900">Registrar Nuevo Lote</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {validationError && (
                <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold">
                  {validationError}
                </div>
              )}

              <form onSubmit={handleCreateLote} className="p-6 space-y-4 text-gray-800">
                <div>
                  <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Nombre del Lote</label>
                  <input 
                    type="text" required
                    value={nuevoLote.nombre}
                    onChange={(e) => setNuevoLote({...nuevoLote, nombre: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900"
                    placeholder="Ej: Lote Norte A-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Área (Hectáreas)</label>
                    <input 
                      type="number" step="0.01" min="0.1" required
                      value={nuevoLote.area_hectareas}
                      onChange={(e) => setNuevoLote({...nuevoLote, area_hectareas: e.target.value})}
                      className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                      placeholder="Ej: 5.2"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Estado Inicial</label>
                    <select
                      value={nuevoLote.estado}
                      onChange={(e) => setNuevoLote({...nuevoLote, estado: e.target.value})}
                      className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-700 cursor-pointer"
                    >
                      <option value="ACTIVO">Disponible</option>
                      <option value="PREPARACION">En Preparación</option>
                      <option value="DESCANSO">En Descanso</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Tipo de Suelo</label>
                    <select
                      value={nuevoLote.tipo_suelo}
                      onChange={(e) => setNuevoLote({...nuevoLote, tipo_suelo: e.target.value})}
                      className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-700 cursor-pointer"
                    >
                      <option value="FRANCO">Franco</option>
                      <option value="ARCILLOSO">Arcilloso</option>
                      <option value="ARENOSO">Arenoso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Sistema de Producción</label>
                    <select
                      value={nuevoLote.sistema_produccion}
                      onChange={(e) => setNuevoLote({...nuevoLote, sistema_produccion: e.target.value})}
                      className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-700 cursor-pointer"
                    >
                      <option value="RIEGO">Riego</option>
                      <option value="SECANO">Secano</option>
                    </select>
                  </div>
                </div>

                {/* Captura de GPS Nativo */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => capturarGPS(false)}
                    className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Compass className={`w-4.5 h-4.5 text-emerald-600 ${gpsLoadingCreate ? 'animate-spin' : ''}`} />
                    {gpsLoadingCreate ? 'Accediendo a satélites GPS...' : 'Capturar Coordenadas GPS del Teléfono'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Latitud GPS</label>
                    <input 
                      type="number" step="0.000001"
                      value={nuevoLote.latitud}
                      onChange={(e) => setNuevoLote({...nuevoLote, latitud: e.target.value})}
                      className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                      placeholder="Ej: 4.123456"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Longitud GPS</label>
                    <input 
                      type="number" step="0.000001"
                      value={nuevoLote.longitud}
                      onChange={(e) => setNuevoLote({...nuevoLote, longitud: e.target.value})}
                      className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                      placeholder="Ej: -74.987654"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3 pt-4 border-t border-emerald-50">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 text-gray-600 font-bold bg-[#F8FAF9] border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 px-4 py-3 text-white font-bold bg-gradient-to-r from-emerald-600 to-[#4C9A2A] hover:from-emerald-500 hover:to-emerald-400 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                  >
                    {saving ? <><Loader className="w-5 h-5 animate-spin" /> Guardando</> : 'Registrar Lote'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Editar Lote */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0D1A12]/40 backdrop-blur-sm"
              onClick={() => setIsEditModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-emerald-100"
            >
              <div className="px-6 py-5 border-b border-emerald-50 flex justify-between items-center bg-[#FAFDFB]">
                <h3 className="text-lg font-black text-gray-900">Editar Lote</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {validationError && (
                <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold">
                  {validationError}
                </div>
              )}

              <form onSubmit={handleEditLote} className="p-6 space-y-4 text-gray-800">
                <div>
                  <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Nombre del Lote</label>
                  <input 
                    type="text" required
                    value={editingLote.nombre}
                    onChange={(e) => setEditingLote({...editingLote, nombre: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Área (Hectáreas)</label>
                    <input 
                      type="number" step="0.01" min="0.1" required
                      value={editingLote.area_hectareas}
                      onChange={(e) => setEditingLote({...editingLote, area_hectareas: e.target.value})}
                      className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Estado</label>
                    <select
                      value={editingLote.estado}
                      onChange={(e) => setEditingLote({...editingLote, estado: e.target.value})}
                      className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-700 cursor-pointer"
                    >
                      <option value="ACTIVO">Disponible</option>
                      <option value="PREPARACION">En Preparación</option>
                      <option value="EN_CICLO">En Ciclo</option>
                      <option value="COSECHADO">Cosechado</option>
                      <option value="DESCANSO">En Descanso</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Tipo de Suelo</label>
                    <select
                      value={editingLote.tipo_suelo}
                      onChange={(e) => setEditingLote({...editingLote, tipo_suelo: e.target.value})}
                      className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-700 cursor-pointer"
                    >
                      <option value="FRANCO">Franco</option>
                      <option value="ARCILLOSO">Arcilloso</option>
                      <option value="ARENOSO">Arenoso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Sistema de Producción</label>
                    <select
                      value={editingLote.sistema_produccion}
                      onChange={(e) => setEditingLote({...editingLote, sistema_produccion: e.target.value})}
                      className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-700 cursor-pointer"
                    >
                      <option value="RIEGO">Riego</option>
                      <option value="SECANO">Secano</option>
                    </select>
                  </div>
                </div>

                {/* Captura de GPS Nativo en Edición */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => capturarGPS(true)}
                    className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Compass className={`w-4.5 h-4.5 text-emerald-600 ${gpsLoadingEdit ? 'animate-spin' : ''}`} />
                    {gpsLoadingEdit ? 'Accediendo a satélites GPS...' : 'Actualizar Coordenadas GPS del Teléfono'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Latitud GPS</label>
                    <input 
                      type="number" step="0.000001"
                      value={editingLote.latitud}
                      onChange={(e) => setEditingLote({...editingLote, latitud: e.target.value})}
                      className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Longitud GPS</label>
                    <input 
                      type="number" step="0.000001"
                      value={editingLote.longitud}
                      onChange={(e) => setEditingLote({...editingLote, longitud: e.target.value})}
                      className="w-full px-4 py-3 bg-[#F8FAF9] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3 pt-4 border-t border-emerald-50">
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-3 text-gray-600 font-bold bg-[#F8FAF9] border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 px-4 py-3 text-white font-bold bg-gradient-to-r from-emerald-600 to-[#4C9A2A] hover:from-emerald-500 hover:to-emerald-400 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                  >
                    {saving ? <><Loader className="w-5 h-5 animate-spin" /> Guardando</> : 'Guardar Cambios'}
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
