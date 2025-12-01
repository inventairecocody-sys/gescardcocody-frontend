// src/services/api.ts
import axios from 'axios';

// ✅ Configuration de l'API
const getBaseURL = () => {
  // En production sur Netlify
  if (import.meta.env.PROD) {
    return 'https://gescardcocodybackend.onrender.com';
  }
  
  // En développement local
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

const BASE_URL = getBaseURL();

console.log('🔧 [API Config] Base URL:', BASE_URL);

// ✅ Création de l'instance axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ✅ Intercepteur de requêtes (ajoute automatiquement le token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

// ✅ Intercepteur de réponses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Erreur API:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      localStorage.clear();
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

// ✅ Export par défaut
export default api;