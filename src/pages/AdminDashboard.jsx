import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Tractor, Leaf, TrendingUp, Lock, Mail, Phone, 
  ShieldAlert, CheckCircle2, Trash2, Edit3, PlusCircle, 
  LogOut, MapPin, Activity, UserPlus, ChevronRight, Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const loggedInUser = localStorage.getItem('username') || 'Administrador';

  // Estados locales
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'users', 'fincas'
  const [metrics, setMetrics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [fincasList, setFincasList] = useState([]);
  const [productoresList, setProductoresList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modales
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null para nuevo, objeto para editar
  const [formData, setFormData] = useState({
    nombre_completo_input: '',
    email: '',
    rol: 'PRODUCTOR',
    telefono: '',
    password: '',
    is_active: true
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Cargar datos al montar
  useEffect(() => {
    // Seguridad: verificar si es admin
    const rol = localStorage.getItem('rol');
    if (!token || rol !== 'ADMIN') {
      navigate('/login');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Consultas en paralelo
      const [resMetrics, resUsers, resFincas, resProductores] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/metrics/`, { headers }),
        axios.get(`${API_BASE_URL}/api/users-gestion/`, { headers }),
        axios.get(`${API_BASE_URL}/api/fincas/`, { headers }),
        axios.get(`${API_BASE_URL}/api/productores/`, { headers })
      ]);

      setMetrics(resMetrics.data);
      setUsersList(resUsers.data);
      setFincasList(resFincas.data);
      setProductoresList(resProductores.data);
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor backend de Django.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Abrir modal para crear usuario
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      nombre_completo_input: '',
      email: '',
      rol: 'PRODUCTOR',
      telefono: '',
      password: '',
      is_active: true
    });
    setModalError('');
    setShowUserModal(true);
  };

  // Abrir modal para editar usuario
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      nombre_completo_input: user.nombre_completo || '',
      email: user.email || '',
      rol: user.rol || 'PRODUCTOR',
      telefono: user.telefono || '',
      password: '', // Contraseña en blanco a menos que se quiera cambiar
      is_active: user.is_active
    });
    setModalError('');
    setShowUserModal(true);
  };

  // Enviar formulario (crear/editar)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      if (editingUser) {
        // Actualizar
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // No actualizar si está vacía
        
        await axios.put(`${API_BASE_URL}/api/users-gestion/${editingUser.id}/`, payload, { headers });
        setSuccessMsg('Usuario actualizado con éxito.');
      } else {
        // Crear
        await axios.post(`${API_BASE_URL}/api/users-gestion/`, formData, { headers });
        setSuccessMsg('Usuario registrado con éxito.');
      }

      setShowUserModal(false);
      fetchData(); // Recargar datos
      
      // Auto-ocultar notificación de éxito
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const errors = err.response.data;
        if (errors.email) {
          setModalError(`Correo: ${errors.email[0]}`);
        } else if (errors.error) {
          setModalError(errors.error);
        } else {
          setModalError('Verifica los datos del formulario.');
        }
      } else {
        setModalError('No se pudo conectar con el servidor.');
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId) => {
    const userToDelete = usersList.find(u => u.id === userId);
    if (!userToDelete) return;

    if (userToDelete.email === localStorage.getItem('username') || userToDelete.rol === 'ADMIN') {
      alert('Por motivos de seguridad, no puedes eliminar otros administradores desde aquí.');
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar el usuario "${userToDelete.nombre_completo}"?`)) {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`${API_BASE_URL}/api/users-gestion/${userId}/`, { headers });
        setSuccessMsg('Usuario eliminado con éxito.');
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err) {
        console.error(err);
        alert('No se pudo eliminar el usuario.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9F6] via-[#FAFDFB] to-[#F0F5F2] text-gray-800 flex relative font-sans">
      
      {/* 1. Sidebar Panel Izquierdo en Tono Claro */}
      <aside className="w-80 bg-white border-r border-emerald-100 p-6 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#1E5631] to-[#4C9A2A] rounded-xl flex items-center justify-center shadow-md">
              <Tractor className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-[#0D1A12] flex items-center gap-1.5">
                SIG-ARROZ
              </span>
              <p className="text-2xs text-[#b8952b] font-bold uppercase tracking-wider">Módulo Administrativo</p>
            </div>
          </div>

          {/* Menú de Navegación de Pestañas */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'summary' 
                  ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 shadow-sm' 
                  : 'text-gray-500 hover:text-[#0D1A12] hover:bg-[#0D1A12]/5'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              Métricas y Resumen
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'users' 
                  ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 shadow-sm' 
                  : 'text-gray-500 hover:text-[#0D1A12] hover:bg-[#0D1A12]/5'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              Gestión de Usuarios
            </button>

            <button
              onClick={() => setActiveTab('fincas')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'fincas' 
                  ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 shadow-sm' 
                  : 'text-gray-500 hover:text-[#0D1A12] hover:bg-[#0D1A12]/5'
              }`}
            >
              <Tractor className="w-4 h-4 text-emerald-600" />
              Fincas y Productores
            </button>
          </nav>
        </div>

        {/* Cierre de Sesión */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </aside>

      {/* 2. Cuerpo Principal de Contenido */}
      <main className="flex-1 p-8 overflow-y-auto max-w-[calc(100vw-320px)]">
        
        {/* Header Superior del Dashboard */}
        <header className="flex justify-between items-center mb-8 pb-6 border-b border-emerald-100">
          <div>
            <h1 className="text-2xl font-black text-[#0D1A12]">Panel de Control General</h1>
            <p className="text-xs text-gray-500 font-semibold mt-1">SIG-ARROZ V3.0 • Sistema de Gestión Académica e Industrial</p>
          </div>
          <div className="flex items-center gap-4 bg-white border border-emerald-100 rounded-2xl px-5 py-3 shadow-sm">
            <div className="text-right">
              <p className="text-sm font-black text-[#0D1A12]">{loggedInUser}</p>
              <p className="text-2xs text-[#b8952b] font-extrabold uppercase tracking-wider">Super Administrador</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#b8952b] font-black text-lg">
              A
            </div>
          </div>
        </header>

        {/* Notificación de Éxito Flotante */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-2 shadow-md animate-pulse"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pantalla de Carga Principal */}
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
            <Loader className="w-12 h-12 text-emerald-600 animate-spin" />
            <p className="text-sm text-gray-500 font-bold">Obteniendo base de datos del servidor Django...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-center space-y-4 max-w-xl mx-auto mt-12 shadow-sm">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-red-700">Error de Sincronización</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{error}</p>
            <button onClick={fetchData} className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-md">
              Reintentar Conexión
            </button>
          </div>
        ) : (
          <div>
            
            {/* ==================== PESTAÑA 1: SUMMARY ==================== */}
            {activeTab === 'summary' && metrics && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* 4 KPI Cards Principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Card 1: Usuarios */}
                  <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Usuarios Totales</p>
                      <p className="text-3xl font-black text-[#0D1A12] mt-2">{metrics.total_usuarios}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Card 2: Fincas */}
                  <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Fincas Registradas</p>
                      <p className="text-3xl font-black text-[#0D1A12] mt-2">{metrics.total_fincas}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <Tractor className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Card 3: Lotes */}
                  <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Lotes Mapeados</p>
                      <p className="text-3xl font-black text-[#0D1A12] mt-2">{metrics.total_lotes}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-550 bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                      <Leaf className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Card 4: Ciclos Activos */}
                  <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ciclos Activos</p>
                      <p className="text-3xl font-black text-[#b8952b] mt-2">{metrics.ciclos_activos}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#b8952b]">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Gráficos / Tarjetas de distribución */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Distribución por Roles */}
                  <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-[#0D1A12]">Distribución de Usuarios por Rol</h3>
                      <p className="text-xs text-gray-500 mt-1">Conteo y proporción de cuentas registradas en el software</p>
                    </div>

                    <div className="space-y-4">
                      {/* Productores */}
                      <div>
                        <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-emerald-700">Productores (Dueños de finca)</span>
                          <span className="text-gray-800">{metrics.roles.PRODUCTOR} / {metrics.total_usuarios}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${(metrics.roles.PRODUCTOR / metrics.total_usuarios) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Técnicos */}
                      <div>
                        <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-blue-700">Técnicos Agrícolas</span>
                          <span className="text-gray-800">{metrics.roles.TECNICO} / {metrics.total_usuarios}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${(metrics.roles.TECNICO / metrics.total_usuarios) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Administradores */}
                      <div>
                        <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-amber-600">Administradores</span>
                          <span className="text-gray-800">{metrics.roles.ADMIN} / {metrics.total_usuarios}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${(metrics.roles.ADMIN / metrics.total_usuarios) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resumen Académico del Sistema */}
                  <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-[#0D1A12]">Auditoría e Integridad SIG-ARROZ</h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        Como **Administrador General**, posees los privilegios máximos en el backend de Django. Estás visualizando métricas unificadas y globales del sistema que los roles de Productor y Técnico tienen restringidas por el control de acceso basado en roles (RBAC).
                      </p>
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#b8952b] font-semibold leading-relaxed">
                        ⚠️ **Nota de Seguridad:** Cualquier cambio o eliminación de usuarios impactará directamente en cascada con sus fincas, lotes, análisis de suelo y billeteras de costos en la base de datos relacional.
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setActiveTab('users')}
                      className="w-full mt-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-emerald-200 shadow-sm"
                    >
                      Ir a Gestionar Usuarios
                      <ChevronRight className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==================== PESTAÑA 2: GESTIÓN DE USUARIOS ==================== */}
            {activeTab === 'users' && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Barra de Acciones */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-[#0D1A12]">Directorio General de Usuarios</h3>
                    <p className="text-xs text-gray-500 font-bold mt-1">Cuentas activas en la plataforma y sus respectivos roles asignados</p>
                  </div>

                  <button
                    onClick={handleOpenCreateModal}
                    className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-[#4C9A2A] hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Agregar Nuevo Usuario
                  </button>
                </div>

                {/* Tabla de Usuarios en Tono Claro */}
                <div className="bg-white border border-emerald-100 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-emerald-100 bg-[#FAFDFB] text-2xs font-extrabold text-gray-500 uppercase tracking-wider">
                          <th className="py-4 px-6">ID</th>
                          <th className="py-4 px-6">Nombre Completo</th>
                          <th className="py-4 px-6">Correo Electrónico</th>
                          <th className="py-4 px-6">Rol en el Sistema</th>
                          <th className="py-4 px-6">Teléfono</th>
                          <th className="py-4 px-6">Estado</th>
                          <th className="py-4 px-6 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50 text-xs sm:text-sm font-medium">
                        {usersList.map((user) => (
                          <tr key={user.id} className="hover:bg-emerald-50/20 transition-colors">
                            <td className="py-4 px-6 text-gray-400 font-bold">#{user.id}</td>
                            <td className="py-4 px-6 font-bold text-gray-900">{user.nombre_completo}</td>
                            <td className="py-4 px-6 text-gray-600">{user.email}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-1 rounded-full text-3xs font-black uppercase border tracking-wider ${
                                user.rol === 'ADMIN' 
                                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                  : user.rol === 'PRODUCTOR'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250 border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {user.rol}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-500">{user.telefono || 'Sin registrar'}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${
                                user.is_active 
                                  ? 'bg-emerald-50 text-emerald-700' 
                                  : 'bg-red-50 text-red-700'
                              }`}>
                                {user.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right space-x-2">
                              <button
                                onClick={() => handleOpenEditModal(user)}
                                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-all"
                                title="Editar Usuario"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.rol === 'ADMIN'}
                                className={`p-2 rounded-lg transition-all border ${
                                  user.rol === 'ADMIN'
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                                }`}
                                title="Eliminar Usuario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==================== PESTAÑA 3: FINCAS Y PRODUCTORES ==================== */}
            {activeTab === 'fincas' && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-black text-[#0D1A12]">Mapa de Fincas y Propietarios</h3>
                  <p className="text-xs text-gray-500 font-bold mt-1">Fincas registradas en la base de datos general y su productor asignado</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {fincasList.map((finca) => (
                    <div key={finca.id} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                          <Tractor className="w-5 h-5" />
                        </div>
                        <span className="text-3xs font-extrabold text-[#b8952b] px-2.5 py-1 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20 uppercase tracking-wider">
                          {finca.area_total_ha} Ha
                        </span>
                      </div>

                      <div>
                        <h4 className="font-black text-gray-900 text-base">{finca.nombre}</h4>
                        <p className="text-xs text-gray-500 font-bold flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          {finca.ubicacion_municipio}, {finca.ubicacion_departamento}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-emerald-50 space-y-1">
                        <p className="text-3xs font-extrabold text-gray-400 uppercase tracking-wider">Productor Asignado</p>
                        <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {finca.productor_nombre}
                        </p>
                      </div>
                    </div>
                  ))}

                  {fincasList.length === 0 && (
                    <div className="col-span-3 text-center py-12 bg-white border border-emerald-100 rounded-3xl text-gray-400 font-bold text-sm shadow-sm">
                      No hay fincas registradas en la base de datos.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        )}
      </main>

      {/* ==================== MODAL DE USUARIO (CREAR/EDITAR) ==================== */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Claro con Desenfoque */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[#0D1A12]/40 backdrop-blur-sm"
              onClick={() => setShowUserModal(false)}
            ></motion.div>

            {/* Contenedor del Formulario Claro */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-md bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 z-10"
            >
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1">Completa los datos de la cuenta</p>
              </div>

              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs font-bold animate-shake">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4 text-gray-800">
                {/* Nombre completo */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-extrabold text-gray-500 uppercase tracking-wider">Nombre y Apellidos</label>
                  <input 
                    type="text" 
                    value={formData.nombre_completo_input}
                    onChange={(e) => setFormData({...formData, nombre_completo_input: e.target.value})}
                    placeholder="Ej. Juan de Dios Ibáñez"
                    className="w-full bg-[#F8FAF9] border border-gray-250 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-all font-semibold text-gray-900"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-extrabold text-gray-500 uppercase tracking-wider">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-[#F8FAF9] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-all font-semibold text-gray-900"
                    required
                  />
                </div>

                {/* Rol y Teléfono */}
                <div className="grid grid-cols-2 gap-4 text-gray-800">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-extrabold text-gray-500 uppercase tracking-wider">Rol</label>
                    <select 
                      value={formData.rol}
                      onChange={(e) => setFormData({...formData, rol: e.target.value})}
                      className="w-full bg-[#F8FAF9] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-all font-semibold text-gray-900"
                    >
                      <option value="ADMIN">Administrador</option>
                      <option value="PRODUCTOR">Productor</option>
                      <option value="TECNICO">Técnico</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-2xs font-extrabold text-gray-500 uppercase tracking-wider">Teléfono</label>
                    <input 
                      type="text" 
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      placeholder="3101234567"
                      className="w-full bg-[#F8FAF9] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-all font-semibold text-gray-900"
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-extrabold text-gray-500 uppercase tracking-wider">
                    {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                  </label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={editingUser ? '••••••••' : 'Mínimo 6 caracteres'}
                    className="w-full bg-[#F8FAF9] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-all font-semibold text-gray-900"
                    required={!editingUser}
                  />
                </div>

                {/* Estado Activo */}
                {editingUser && (
                  <div className="flex items-center gap-3 pt-2">
                    <input 
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <label htmlFor="is_active" className="text-xs font-bold text-gray-600 cursor-pointer select-none">
                      Esta cuenta de usuario se encuentra activa
                    </label>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-bold transition-all border border-gray-200"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={modalLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-[#4C9A2A] hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {modalLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Procesando...
                      </>
                    ) : editingUser ? 'Guardar Cambios' : 'Registrar'}
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
