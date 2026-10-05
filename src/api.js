// Configuración centralizada de la URL de la API del Backend SIG-ARROZ
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://sig-arroz-backend-production-0088.up.railway.app');
