import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Maximize, Plus, Tractor, LogOut, Loader, Search, X, 
  Pencil, Trash2, Sprout, TrendingUp, Layers, HelpCircle, Filter, 
  Sliders, ChevronDown, Calendar, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

export default function Fincas() {
  const [fincas, setFincas] = useState([]);
  const [productores, setProductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el modal de nueva finca
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nuevaFinca, setNuevaFinca] = useState({
    nombre: '',
    ubicacion_departamento: '',
    ubicacion_municipio: '',
    area_total_ha: '',
    productor_id: ''
  });

  // Estado para el modal de edición de finca
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFinca, setEditingFinca] = useState({
    id: '',
    nombre: '',
    ubicacion_departamento: '',
    ubicacion_municipio: '',
    area_total_ha: '',
    productor_id: ''
  });

  // Filtros Avanzados
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('ALL'); // 'ALL', 'SMALL', 'MEDIUM', 'LARGE'
  const [selectedDept, setSelectedDept] = useState('ALL'); // 'ALL' o valor único del dpto.

  const navigate = useNavigate();
  
  // Obtener datos del usuario logueado
  const username = localStorage.getItem('username');
  const rol = localStorage.getItem('rol');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (rol === 'ADMIN') {
      navigate('/admin-dashboard');
    } else {
      fetchFincas();
      if (rol === 'ADMIN') {
        fetchProductores();
      }
    }
  }, [navigate, token, rol]);

  const fetchProductores = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/productores/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductores(response.data);
      if (response.data.length > 0) {
        setNuevaFinca(prev => ({ ...prev, productor_id: response.data[0].id }));
      }
    } catch (error) {
      console.error("Error cargando productores", error);
    }
  };

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
      const payload = {
        nombre: nuevaFinca.nombre,
        ubicacion_departamento: nuevaFinca.ubicacion_departamento,
        ubicacion_municipio: nuevaFinca.ubicacion_municipio,
        area_total_ha: parseFloat(nuevaFinca.area_total_ha)
      };

      if (rol === 'ADMIN' && nuevaFinca.productor_id) {
        payload.productor_id = parseInt(nuevaFinca.productor_id);
      }

      const response = await axios.post(`${API_BASE_URL}/api/fincas/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFincas([response.data, ...fincas]);
      setIsModalOpen(false);
      setNuevaFinca({ nombre: '', ubicacion_departamento: '', ubicacion_municipio: '', area_total_ha: '', productor_id: '' });
    } catch (err) {
      console.error("Error al crear finca:", err.response?.data);
      const backendError = err.response?.data ? JSON.stringify(err.response.data) : '';
      alert(`Error al crear la finca. ${backendError || 'Revisa que el área sea mayor a 0 e intenta nuevamente.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditModal = (finca) => {
    setEditingFinca({
      id: finca.id,
      nombre: finca.nombre,
      ubicacion_departamento: finca.ubicacion_departamento,
      ubicacion_municipio: finca.ubicacion_municipio,
      area_total_ha: finca.area_total_ha,
      productor_id: finca.productor || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditFinca = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nombre: editingFinca.nombre,
        ubicacion_departamento: editingFinca.ubicacion_departamento,
        ubicacion_municipio: editingFinca.ubicacion_municipio,
        area_total_ha: parseFloat(editingFinca.area_total_ha)
      };

      if (rol === 'ADMIN' && editingFinca.productor_id) {
        payload.productor_id = parseInt(editingFinca.productor_id);
      }

      const response = await axios.put(`${API_BASE_URL}/api/fincas/${editingFinca.id}/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFincas(fincas.map(f => f.id === editingFinca.id ? response.data : f));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error al editar finca:", err.response?.data);
      const backendError = err.response?.data ? JSON.stringify(err.response.data) : '';
      alert(`Error al actualizar la finca. ${backendError || 'Revisa que el área sea mayor a 0 e intenta nuevamente.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFinca = async (finca) => {
    const confirmacion = window.confirm(`⚠️ ADVERTENCIA DE SEGURIDAD EXTREMA:
¿Estás completamente seguro de que deseas eliminar la finca "${finca.nombre}"?

Esta acción eliminará permanentemente la finca y TODOS sus lotes, análisis de suelo y ciclos de cultivo asociados de forma irreversible. Esta acción no se puede deshacer.`);

    if (!confirmacion) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/fincas/${finca.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFincas(fincas.filter(f => f.id !== finca.id));
    } catch (err) {
      console.error("Error al eliminar finca:", err.response?.data);
      alert('Error al intentar eliminar la finca. Verifica tus permisos de red.');
    }
  };

  // Cálculos dinámicos del Dashboard del Productor
  const totalFincasCount = fincas.length;
  const totalAreaHa = fincas.reduce((sum, f) => sum + parseFloat(f.area_total_ha || 0), 0);
  const averageAreaHa = totalFincasCount > 0 ? (totalAreaHa / totalFincasCount).toFixed(1) : 0;
  
  // Extraer departamentos únicos de las fincas para el filtro desplegable
  const uniqueDepartments = Array.from(new Set(fincas.map(f => f.ubicacion_departamento).filter(Boolean)));

  // Lógica de filtrado dinámico
  const filteredFincas = fincas.filter(finca => {
    // 1. Filtro por término de búsqueda (nombre, municipio, depto)
    const textMatch = 
      finca.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finca.ubicacion_municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finca.ubicacion_departamento.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Filtro por tamaño de hectáreas
    const area = parseFloat(finca.area_total_ha || 0);
    let sizeMatch = true;
    if (sizeFilter === 'SMALL') sizeMatch = area < 5;
    else if (sizeFilter === 'MEDIUM') sizeMatch = area >= 5 && area <= 20;
    else if (sizeFilter === 'LARGE') sizeMatch = area > 20;

    // 3. Filtro por Departamento
    const deptMatch = selectedDept === 'ALL' || finca.ubicacion_departamento === selectedDept;

    return textMatch && sizeMatch && deptMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E2F0E6] via-[#FAFDFB] to-[#D5EDDB] text-gray-800 font-sans selection:bg-emerald-600 selection:text-white relative pb-20 overflow-hidden">
      
      {/* 2. Orbes de Luz de Fondo (Estilo Agrícola/Landing Page) */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-[#4C9A2A]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#1E5631]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. Navbar Sticky con Efecto de Cristal */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#FAFDFB]/90 border-b border-emerald-100/90 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#1E5631] to-[#4C9A2A] rounded-xl flex items-center justify-center shadow-md">
              <Tractor className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#0D1A12] flex items-center gap-1.5">
              SIG-ARROZ
              <span className="text-xs font-bold text-[#D4AF37] px-2 py-0.5 rounded-md bg-[#D4AF37]/15 border border-[#D4AF37]/35 shadow-sm">
                V3.0
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/historial-produccion')}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Ver Historial de Rendimientos"
            >
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>Rendimientos</span>
            </button>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-gray-900">{username || 'Productor'}</p>
              <p className="text-2xs font-extrabold text-[#D4AF37] uppercase tracking-wider bg-[#1E5631] px-2 py-0.5 rounded shadow-sm">Rol: {rol}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-gray-600 hover:text-red-650 hover:bg-red-50 rounded-xl transition-all border border-gray-150 hover:border-red-200 shadow-sm bg-white"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Cuerpo Principal de Contenido */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        
        {/* Banner de Bienvenida Premium Súper-Vibrante (Inspirado en la Landing) */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#1E5631] via-[#2A6C40] to-[#4C9A2A] text-white border-b-4 border-[#D4AF37] rounded-3xl p-8 shadow-xl relative overflow-hidden"
        >
          {/* Capa de textura abstracta */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4 max-w-3xl">
            <span className="text-2xs font-black text-[#D4AF37] uppercase tracking-widest bg-white/10 border border-white/20 px-3 py-1 rounded-full">
              🌾 Panel General de Control
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none mt-2 drop-shadow-md">
              ¡Bienvenido al Campo, {username ? username.split('@')[0] : 'Productor'}!
            </h1>
            <p className="text-sm sm:text-base text-emerald-50 font-semibold leading-relaxed drop-shadow-sm">
              Monitorea el área de explotación arrocera, administra tus parcelas, analiza variedades de semilla y controla el rendimiento. ¡Es un gran día para optimizar la cosecha!
            </p>
            <div className="flex items-center gap-2 pt-2 text-2xs text-[#D4AF37] font-extrabold uppercase">
              <Calendar className="w-4 h-4" />
              <span>SIG-ARROZ Plataforma de Agricultura Inteligente</span>
            </div>
          </div>
        </motion.div>

        {/* 2. Tarjetas KPI Globales del Productor (Con Colores y Estilo Landing) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* KPI 1: Fincas */}
          <div className="bg-white border-l-4 border-emerald-600 border border-emerald-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs text-gray-500 font-bold uppercase tracking-wider">Fincas Propias</p>
                <p className="text-3xl font-black text-gray-900 mt-2">{totalFincasCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
                <Tractor className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 text-2xs text-emerald-700 font-bold bg-emerald-50/50 p-1.5 rounded text-center">
              Gestionar tierras activas
            </div>
          </div>

          {/* KPI 2: Área Controlada */}
          <div className="bg-white border-l-4 border-blue-600 border border-blue-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs text-gray-500 font-bold uppercase tracking-wider">Área de Cultivo</p>
                <p className="text-3xl font-black text-blue-800 mt-2">{totalAreaHa.toFixed(1)} <span className="text-xs font-bold text-gray-400">Ha</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-sm">
                <Maximize className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 text-2xs text-blue-700 font-bold bg-blue-50/50 p-1.5 rounded text-center">
              Superficie de explotación total
            </div>
          </div>

          {/* KPI 3: Área Promedio */}
          <div className="bg-white border-l-4 border-[#D4AF37] border border-amber-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs text-gray-500 font-bold uppercase tracking-wider">Promedio Finca</p>
                <p className="text-3xl font-black text-[#b8952b] mt-2">{averageAreaHa} <span className="text-xs font-bold text-gray-400">Ha</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#b8952b] shadow-sm">
                <Layers className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 text-2xs text-amber-700 font-bold bg-amber-50/50 p-1.5 rounded text-center">
              Eficiencia de distribución
            </div>
          </div>

          {/* KPI 4: Variedades Sembradas */}
          <div className="bg-white border-l-4 border-green-600 border border-green-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs text-gray-500 font-bold uppercase tracking-wider">Variedad Semilla</p>
                <div className="flex gap-1.5 mt-2.5">
                  <span className="text-2xs font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded shadow-sm">F-68</span>
                  <span className="text-2xs font-extrabold bg-[#D4AF37] text-white px-2 py-0.5 rounded shadow-sm">F-2000</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-700 shadow-sm">
                <Sprout className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 text-2xs text-green-700 font-bold bg-green-50/50 p-1.5 rounded text-center">
              Variedades de alto rendimiento
            </div>
          </div>
        </div>

        {/* 3. Panel de Búsqueda y Filtros Avanzados (Súper Estilizado) */}
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl p-6 shadow-md space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-emerald-100">
            <Filter className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-base font-black text-gray-900">Búsqueda y Filtros de Parcelas</h3>
              <p className="text-2xs text-gray-500 font-bold">Filtra tus fincas de manera reactiva por tamaño y ubicación georeferenciada</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Buscador de texto */}
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por finca, municipio o depto..."
                className="w-full pl-11 pr-4 py-3 bg-[#FAFDFB] border border-emerald-100 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-gray-900"
              />
            </div>

            {/* Selector por Tamaño Hectáreas */}
            <div className="md:col-span-4 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 shrink-0 uppercase tracking-wider">Área:</span>
              <div className="flex w-full bg-[#FAFDFB] border border-emerald-100 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setSizeFilter('ALL')}
                  className={`flex-1 py-1.5 rounded-lg text-2xs font-black transition-all ${
                    sizeFilter === 'ALL' ? 'bg-gradient-to-r from-[#1E5631] to-[#4C9A2A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setSizeFilter('SMALL')}
                  className={`flex-1 py-1.5 rounded-lg text-2xs font-black transition-all ${
                    sizeFilter === 'SMALL' ? 'bg-gradient-to-r from-[#1E5631] to-[#4C9A2A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                  title="Fincas con menos de 5 Hectáreas"
                >
                  &lt; 5 Ha
                </button>
                <button
                  onClick={() => setSizeFilter('MEDIUM')}
                  className={`flex-1 py-1.5 rounded-lg text-2xs font-black transition-all ${
                    sizeFilter === 'MEDIUM' ? 'bg-gradient-to-r from-[#1E5631] to-[#4C9A2A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                  title="Fincas entre 5 y 20 Hectáreas"
                >
                  5-20 Ha
                </button>
                <button
                  onClick={() => setSizeFilter('LARGE')}
                  className={`flex-1 py-1.5 rounded-lg text-2xs font-black transition-all ${
                    sizeFilter === 'LARGE' ? 'bg-gradient-to-r from-[#1E5631] to-[#4C9A2A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                  title="Fincas de más de 20 Hectáreas"
                >
                  &gt; 20 Ha
                </button>
              </div>
            </div>

            {/* Selector de Departamento */}
            <div className="md:col-span-3 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 shrink-0 uppercase tracking-wider">Depto:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAFDFB] border border-emerald-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">Todos los Departamentos</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Botón de Limpiar filtros */}
            <div className="md:col-span-1 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSizeFilter('ALL');
                  setSelectedDept('ALL');
                }}
                className="p-3 bg-gray-50 border border-gray-200 hover:bg-gray-150 text-gray-500 rounded-xl transition-all w-full flex items-center justify-center shadow-sm"
                title="Restablecer filtros"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* 4. Título de Sección y Acción Añadir Finca */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-950 tracking-tight">Fincas Registradas</h2>
            <p className="text-xs text-gray-500 font-bold mt-1">
              Visualizando {filteredFincas.length} de {totalFincasCount} fincas en total
            </p>
          </div>
          
          {rol !== 'TECNICO' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-[#1E5631] via-[#2D7D46] to-[#4C9A2A] hover:opacity-95 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-700/20 transition-all flex items-center gap-2 border-b-2 border-emerald-900"
            >
              <Plus className="w-5 h-5" />
              Registrar Finca
            </motion.button>
          )}
        </div>

        {/* Handling States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-emerald-100 rounded-3xl shadow-sm">
            <Loader className="w-10 h-10 text-emerald-700 animate-spin mb-4" />
            <p className="text-sm text-gray-500 font-bold">Obteniendo tus fincas del servidor...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center font-bold text-sm">
            {error}
          </div>
        ) : filteredFincas.length === 0 ? (
          <div className="bg-white border border-emerald-100 rounded-3xl p-12 text-center shadow-md">
            <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MapPin className="w-10 h-10 text-emerald-700" />
            </div>
            <h3 className="text-lg font-black text-gray-950 mb-1">No se encontraron fincas</h3>
            <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto font-medium">
              Prueba modificando los filtros de hectáreas, departamento o el texto ingresado en el buscador.
            </p>
            {rol !== 'TECNICO' && fincas.length === 0 && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-[#1E5631] font-black hover:underline transition-all"
              >
                + Registrar mi primera finca
              </button>
            )}
          </div>
        ) : (
          /* Grid de Fincas en Tono Claro PREMIUM ULTRA-VIBRANTE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFincas.map((finca) => (
              <motion.div
                key={finca.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/fincas/${finca.id}/lotes`, { state: { finca } })}
                className="bg-white border border-emerald-100 rounded-3xl shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
              >
                
                {/* Cabecera de la Tarjeta en Degradado Vibrante (Wow Factor) */}
                <div className="bg-gradient-to-r from-[#1E5631] via-[#2E7D32] to-[#4C9A2A] text-white px-6 py-4 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none"></div>
                  
                  <div className="flex items-center gap-2 relative z-10">
                    <Tractor className="w-4 h-4 text-[#D4AF37]" />
                    <h3 className="text-base font-black tracking-tight drop-shadow-sm pr-6 truncate">
                      {finca.nombre}
                    </h3>
                  </div>

                  {/* Acciones flotantes integradas */}
                  {rol !== 'TECNICO' && (
                    <div className="flex gap-1.5 relative z-20 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(finca);
                        }}
                        className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all"
                        title="Editar Finca"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#D4AF37]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFinca(finca);
                        }}
                        className="p-1.5 bg-white/10 hover:bg-red-500/20 border border-white/20 text-white rounded-lg transition-all"
                        title="Eliminar Finca"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-200" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Cuerpo de la Finca */}
                <div className="p-6 space-y-4 flex-1">
                  
                  {/* Municipio / Dpto */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl shrink-0 text-emerald-700 shadow-sm">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-3xs text-gray-400 font-extrabold uppercase tracking-wider leading-none">Ubicación del Terreno</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 mt-1">{finca.ubicacion_municipio}, {finca.ubicacion_departamento}</p>
                    </div>
                  </div>
                  
                  {/* Área Hectáreas */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl shrink-0 text-[#b8952b] shadow-sm">
                      <Maximize className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-3xs text-gray-400 font-extrabold uppercase tracking-wider leading-none">Área de Explotación</p>
                      <p className="text-xs sm:text-sm font-black text-[#1E5631] mt-1">
                        {finca.area_total_ha} <span className="text-2xs font-extrabold text-gray-500">Hectáreas</span>
                      </p>
                    </div>
                  </div>

                  {/* Propietario / Productor asignado */}
                  <div className="pt-3 border-t border-emerald-50 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-750 text-emerald-700 text-xs font-black shadow-sm shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-3xs text-gray-400 font-extrabold uppercase tracking-wider leading-none">Encargado del Campo</p>
                      <p className="text-xs font-extrabold text-gray-700 mt-1">{finca.productor_nombre || 'Productor Asignado'}</p>
                    </div>
                  </div>
                </div>

                {/* Pie de Tarjeta - Botón Sólido de Acción (Wow Factor) */}
                <div className="px-6 pb-6 pt-2">
                  <button className="w-full py-3 bg-gradient-to-r from-[#1E5631] to-[#4C9A2A] hover:from-[#154224] hover:to-[#3e8223] text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border-b-2 border-emerald-900/60">
                    <Sprout className="w-4 h-4 text-[#D4AF37]" />
                    Gestionar Lotes y Cultivos →
                  </button>
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
              className="absolute inset-0 bg-[#0D1A12]/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-emerald-100"
            >
              <div className="px-6 py-5 border-b border-emerald-50 flex justify-between items-center bg-gradient-to-r from-[#1E5631] to-[#2D7D46] text-white">
                <h3 className="text-base font-black">Registrar Nueva Finca</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateFinca} className="p-6 space-y-4 text-gray-800 bg-[#FAFDFB]">
                <div>
                  <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Nombre de la Finca</label>
                  <input 
                    type="text" required
                    value={nuevaFinca.nombre}
                    onChange={(e) => setNuevaFinca({...nuevaFinca, nombre: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                    placeholder="Ej: Hacienda El Progreso"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Departamento</label>
                    <input 
                      type="text" required
                      value={nuevaFinca.ubicacion_departamento}
                      onChange={(e) => setNuevaFinca({...nuevaFinca, ubicacion_departamento: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                      placeholder="Ej: Tolima"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Municipio</label>
                    <input 
                      type="text" required
                      value={nuevaFinca.ubicacion_municipio}
                      onChange={(e) => setNuevaFinca({...nuevaFinca, ubicacion_municipio: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                      placeholder="Ej: El Espinal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Área Total (Hectáreas)</label>
                  <input 
                    type="number" step="0.01" min="0.1" required
                    value={nuevaFinca.area_total_ha}
                    onChange={(e) => setNuevaFinca({...nuevaFinca, area_total_ha: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                    placeholder="0.00"
                  />
                </div>

                {rol === 'ADMIN' && (
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                      Asignar al Productor Propietario <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={nuevaFinca.productor_id}
                      onChange={(e) => setNuevaFinca({...nuevaFinca, productor_id: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900 cursor-pointer"
                    >
                      <option value="" disabled>Seleccione un Productor</option>
                      {productores.map(prod => (
                        <option key={prod.id} value={prod.id}>
                          {prod.first_name} {prod.last_name} ({prod.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mt-8 flex gap-3 pt-4 border-t border-emerald-50">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 text-gray-600 font-bold bg-white border border-gray-250 border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 px-4 py-3 text-white font-bold bg-gradient-to-r from-[#1E5631] to-[#4C9A2A] hover:opacity-95 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                  >
                    {saving ? <><Loader className="w-5 h-5 animate-spin" /> Guardando</> : 'Registrar Finca'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Editar Finca */}
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
              <div className="px-6 py-5 border-b border-emerald-50 flex justify-between items-center bg-gradient-to-r from-[#1E5631] to-[#2D7D46] text-white">
                <h3 className="text-base font-black">Editar Finca</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditFinca} className="p-6 space-y-4 text-gray-800 bg-[#FAFDFB]">
                <div>
                  <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Nombre de la Finca</label>
                  <input 
                    type="text" required
                    value={editingFinca.nombre}
                    onChange={(e) => setEditingFinca({...editingFinca, nombre: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Departamento</label>
                    <input 
                      type="text" required
                      value={editingFinca.ubicacion_departamento}
                      onChange={(e) => setEditingFinca({...editingFinca, ubicacion_departamento: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Municipio</label>
                    <input 
                      type="text" required
                      value={editingFinca.ubicacion_municipio}
                      onChange={(e) => setEditingFinca({...editingFinca, ubicacion_municipio: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">Área Total (Hectáreas)</label>
                  <input 
                    type="number" step="0.01" min="0.1" required
                    value={editingFinca.area_total_ha}
                    onChange={(e) => setEditingFinca({...editingFinca, area_total_ha: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900"
                  />
                </div>

                {rol === 'ADMIN' && (
                  <div>
                    <label className="block text-2xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                      Asignar al Productor Propietario <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={editingFinca.productor_id}
                      onChange={(e) => setEditingFinca({...editingFinca, productor_id: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-semibold text-gray-900 cursor-pointer"
                    >
                      <option value="" disabled>Seleccione un Productor</option>
                      {productores.map(prod => (
                        <option key={prod.id} value={prod.id}>
                          {prod.first_name} {prod.last_name} ({prod.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mt-8 flex gap-3 pt-4 border-t border-emerald-50">
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-3 text-gray-600 font-bold bg-white border border-gray-250 border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 px-4 py-3 text-white font-bold bg-gradient-to-r from-[#1E5631] to-[#4C9A2A] hover:opacity-95 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
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
