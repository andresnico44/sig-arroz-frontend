import axios from 'axios';

const API = axios.create({
    // Lee automáticamente la URL de Railway en producción o localhost en desarrollo
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000' 
});

export default API;