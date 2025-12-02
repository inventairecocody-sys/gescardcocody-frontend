import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ✅ Configuration de l'API
const getBaseURL = (): string => {
  // En production sur Netlify
  if (import.meta.env.PROD) {
    return 'https://gescardcocodybackend.onrender.com';
  }
  
  // En développement local
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

const BASE_URL: string = getBaseURL();

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
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error: any) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

// ✅ Intercepteur de réponses
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error: any) => {
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

// ✅ Interfaces pour les réponses API
interface ImportStats {
  imported: number;
  updated: number;
  skipped: number;
  totalProcessed: number;
  duplicates?: number;
  errors?: number;
}

interface SitesResponse {
  sites: string[];
}

interface CountResponse {
  count: number;
}

// ✅ NOUVELLES FONCTIONS D'IMPORT/EXPORT INTELLIGENT
export const importExportApi = {
  // Import intelligent (NOUVEAU)
  importSmartSync: (formData: FormData): Promise<AxiosResponse<{ stats: ImportStats }>> => 
    api.post('/api/import-export/import/smart-sync', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Récupérer les sites disponibles
  getSites: (): Promise<AxiosResponse<SitesResponse>> => api.get('/api/import-export/sites'),
  
  // Export streaming (pour gros volumes)
  exportStream: (): Promise<AxiosResponse<Blob>> => api.get('/api/import-export/export/stream', {
    responseType: 'blob'
  }),
  
  // Export filtré
  exportFiltered: (filters: any): Promise<AxiosResponse<Blob>> => 
    api.post('/api/import-export/export/filtered', { filters }, {
      responseType: 'blob'
    }),
  
  // Récupérer le nombre total
  getTotalCount: (): Promise<AxiosResponse<CountResponse>> => api.get('/api/cartes/count'),
  
  // Statistiques d'import
  getImportStats: (): Promise<AxiosResponse<ImportStats>> => api.get('/api/import-export/stats'),
  
  // Template Excel
  downloadTemplate: (): Promise<AxiosResponse<Blob>> => 
    api.get('/api/import-export/template', { responseType: 'blob' }),
};

// ✅ Export par défaut
export default api;