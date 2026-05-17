// Configuración dinámica de la URL de la API del Backend SIG-ARROZ
export const API_BASE_URL = 
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000' // Entorno Local de Desarrollo
    : 'https://sig-arroz-backend-production.up.railway.app'; // Servidor de Producción en Railway