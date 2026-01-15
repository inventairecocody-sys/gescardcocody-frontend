import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ✅ INTERFACE ÉTENDUE POUR LES MÉTADONNÉES
interface ExtendedInternalAxiosRequestConfig<D = any> 
  extends InternalAxiosRequestConfig<D> {
  metadata?: {
    startTime: number;
    endTime?: number;
    duration?: number;
    requestType?: string;
    [key: string]: any;
  };
}

// ✅ DÉTECTION DE L'ENVIRONNEMENT
const getBaseURL = (): string => {
  // En production sur Netlify
  if (import.meta.env.PROD) {
    return 'https://gescardcocodybackend.onrender.com';
  }
  
  // En développement local
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

const BASE_URL: string = getBaseURL();
const isProduction = import.meta.env.PROD;

console.log('🔧 [API Config] Base URL:', BASE_URL);
console.log('🌍 Environnement:', isProduction ? 'Production' : 'Développement');

// ✅ CONFIGURATION AXIOS OPTIMISÉE POUR RENDER
const getAxiosConfig = () => {
  const isRenderBackend = BASE_URL.includes('render.com');
  
  if (isRenderBackend && isProduction) {
    // ⚠️ CONFIGURATION POUR RENDER GRATUIT
    console.log('⚙️ Configuration API optimisée pour Render gratuit');
    return {
      baseURL: BASE_URL,
      timeout: 180000, // 3 minutes (augmenté pour les imports)
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Environment': 'render-free',
      },
      maxContentLength: 50 * 1024 * 1024, // 50MB max
      maxBodyLength: 50 * 1024 * 1024, // 50MB max
      withCredentials: true,
    };
  }
  
  // Configuration normale
  return {
    baseURL: BASE_URL,
    timeout: 30000, // 30 secondes
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true,
  };
};

// ✅ Création de l'instance axios
const api = axios.create(getAxiosConfig());

// ✅ INTERCEPTEUR DE REQUÊTES AVEC TIMEOUTS ADAPTATIFS
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Convertir en type étendu
    const extendedConfig = config as ExtendedInternalAxiosRequestConfig;
    
    const token = localStorage.getItem('token');
    
    if (token) {
      extendedConfig.headers.Authorization = `Bearer ${token}`;
    }
    
    // 🎯 AJOUTER LES MÉTADONNÉES
    extendedConfig.metadata = {
      startTime: Date.now(),
      requestType: 'standard'
    };
    
    // 🎯 TIMEOUTS SPÉCIFIQUES PAR TYPE DE REQUÊTE
    const isImportRoute = extendedConfig.url?.includes('/import-export/import') || 
                         extendedConfig.url?.includes('/bulk-import');
    const isExportRoute = extendedConfig.url?.includes('/export');
    const isStreamRoute = extendedConfig.url?.includes('/stream');
    
    if (isImportRoute) {
      // 🚀 IMPORT : timeout de 5 minutes pour Render gratuit
      extendedConfig.timeout = 300000; // 5 minutes
      extendedConfig.headers['X-Request-Type'] = 'import';
      extendedConfig.metadata.requestType = 'import';
      console.log(`🚀 IMPORT ${extendedConfig.method?.toUpperCase()} ${extendedConfig.url} - Timeout: 5min`);
    } 
    else if (isExportRoute && isStreamRoute) {
      // 📤 EXPORT STREAMING : timeout de 4 minutes
      extendedConfig.timeout = 240000; // 4 minutes
      extendedConfig.headers['X-Request-Type'] = 'export-stream';
      extendedConfig.metadata.requestType = 'export-stream';
      console.log(`📤 EXPORT STREAM ${extendedConfig.method?.toUpperCase()} ${extendedConfig.url} - Timeout: 4min`);
    }
    else if (isExportRoute) {
      // 📄 EXPORT NORMAL : timeout de 2 minutes
      extendedConfig.timeout = 120000; // 2 minutes
      extendedConfig.headers['X-Request-Type'] = 'export';
      extendedConfig.metadata.requestType = 'export';
      console.log(`📄 EXPORT ${extendedConfig.method?.toUpperCase()} ${extendedConfig.url} - Timeout: 2min`);
    }
    else {
      // 📱 REQUÊTES NORMALES : timeout standard
      console.log(`📱 ${extendedConfig.method?.toUpperCase()} ${extendedConfig.url}`);
    }
    
    // Ajouter un ID de requête pour le tracking
    extendedConfig.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return extendedConfig;
  },
  (error: any) => {
    console.error('❌ Erreur pré-requête:', error.message);
    return Promise.reject(error);
  }
);

// ✅ INTERCEPTEUR DE RÉPONSES AVEC GESTION D'ERREURS AMÉLIORÉE
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Convertir en type étendu
    const extendedConfig = response.config as ExtendedInternalAxiosRequestConfig;
    const requestId = extendedConfig.headers?.['X-Request-ID'] as string;
    
    // ✅ CALCULER LA DURÉE
    let duration = 0;
    if (extendedConfig.metadata?.startTime) {
      const endTime = Date.now();
      extendedConfig.metadata.endTime = endTime;
      extendedConfig.metadata.duration = endTime - extendedConfig.metadata.startTime;
      duration = extendedConfig.metadata.duration;
    }
    
    const requestType = extendedConfig.metadata?.requestType || 'standard';
    console.log(`✅ ${response.status} ${requestType.toUpperCase()} ${response.config.url} (${duration}ms) - ID: ${requestId}`);
    
    return response;
  },
  (error: any) => {
    const extendedConfig = error.config as ExtendedInternalAxiosRequestConfig | undefined;
    const requestId = extendedConfig?.headers?.['X-Request-ID'] as string;
    const url = extendedConfig?.url || 'unknown';
    const method = extendedConfig?.method?.toUpperCase() || 'UNKNOWN';
    const requestType = extendedConfig?.metadata?.requestType || 'standard';
    
    // Calculer la durée même en cas d'erreur
    let duration = 0;
    if (extendedConfig?.metadata?.startTime) {
      const endTime = Date.now();
      extendedConfig.metadata.endTime = endTime;
      extendedConfig.metadata.duration = endTime - extendedConfig.metadata.startTime;
      duration = extendedConfig.metadata.duration;
    }
    
    // 🕒 GESTION SPÉCIFIQUE DES TIMEOUTS
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error(`⏰ TIMEOUT ${requestType.toUpperCase()} ${method} ${url} (${duration}ms) - ID: ${requestId}`);
      
      // Message d'erreur adapté selon le type de requête
      let userMessage = 'Le serveur a mis trop de temps à répondre.';
      
      if (url.includes('/import')) {
        userMessage = 'L\'import prend trop de temps. Essayez de :\n' +
                     '1. Diviser votre fichier en plusieurs parties\n' +
                     '2. Utiliser l\'import massif asynchrone\n' +
                     '3. Réduire le nombre de lignes à moins de 5000';
      } else if (url.includes('/export')) {
        userMessage = 'L\'export prend trop de temps. Essayez de :\n' +
                     '1. Utiliser l\'export streaming\n' +
                     '2. Exporter avec des filtres (site/date)\n' +
                     '3. Diviser votre export en plusieurs parties';
      }
      
      return Promise.reject({
        ...error,
        message: userMessage,
        isTimeout: true,
        requestId,
        duration,
        requestType
      });
    }
    
    // 💾 GESTION DES ERREURS MÉMOIRE
    if (error.message?.includes('memory') || error.message?.includes('heap')) {
      console.error(`💾 OUT OF MEMORY ${requestType.toUpperCase()} ${method} ${url} (${duration}ms) - ID: ${requestId}`);
      
      return Promise.reject({
        ...error,
        message: 'Mémoire insuffisante. Essayez de :\n' +
                '1. Diviser votre fichier en parties plus petites\n' +
                '2. Utiliser l\'export streaming pour les gros exports\n' +
                '3. Réduire la taille des données',
        isMemoryError: true,
        requestId,
        duration,
        requestType
      });
    }
    
    // 🔌 GESTION DES ERREURS DE CONNEXION
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.error(`🔌 NETWORK ERROR ${requestType.toUpperCase()} ${method} ${url} (${duration}ms) - ID: ${requestId}`);
      
      return Promise.reject({
        ...error,
        message: 'Problème de connexion. Vérifiez :\n' +
                '1. Votre connexion internet\n' +
                '2. Que le serveur backend est accessible\n' +
                '3. Les paramètres CORS',
        isNetworkError: true,
        requestId,
        duration,
        requestType
      });
    }
    
    // 🔐 GESTION DES ERREURS 401 (NON AUTORISÉ)
    if (error.response?.status === 401) {
      console.warn(`🔐 UNAUTHORIZED ${requestType.toUpperCase()} ${method} ${url} (${duration}ms) - ID: ${requestId}`);
      
      // Nettoyer le localStorage uniquement pour les erreurs d'authentification
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Rediriger vers la page de login si on n'y est pas déjà
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
      
      return Promise.reject({
        ...error,
        message: 'Session expirée. Veuillez vous reconnecter.',
        isUnauthorized: true,
        requestId,
        duration,
        requestType
      });
    }
    
    // 📊 LOG DÉTAILLÉ POUR LE DÉBOGAGE
    console.error('❌ Erreur API:', {
      method,
      requestType,
      url,
      status: error.response?.status,
      message: error.message,
      duration,
      requestId,
      metadata: extendedConfig?.metadata
    });
    
    // Message utilisateur générique mais informatif
    const status = error.response?.status;
    let userMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
    
    if (status === 429) {
      userMessage = 'Trop de requêtes. Veuillez patienter quelques minutes.';
    } else if (status === 403) {
      userMessage = 'Accès interdit. Vous n\'avez pas les permissions nécessaires.';
    } else if (status === 404) {
      userMessage = 'Ressource non trouvée.';
    } else if (status >= 500) {
      userMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    
    return Promise.reject({
      ...error,
      message: userMessage,
      requestId,
      duration,
      requestType
    });
  }
);

// ✅ INTERFACES POUR LES RÉPONSES API
interface ImportStats {
  imported: number;
  updated: number;
  skipped: number;
  totalProcessed: number;
  duplicates?: number;
  errors?: number;
  duration?: string;
  importBatchID?: string;
  successRate?: number;
}

interface SitesResponse {
  sites: string[];
  count: number;
  success: boolean;
}

interface CountResponse {
  count: number;
  success: boolean;
}

interface BulkImportResponse {
  success: boolean;
  message: string;
  importId: string;
  statusUrl: string;
  cancelUrl: string;
  estimatedTime: string;
  user: string;
  timestamp: string;
}

interface BulkImportStatus {
  import: {
    id: string;
    fileName: string;
    status: string;
    progress: number;
    processedRows: number;
    totalRows: number;
    startTime: string;
    duration: number;
    stats?: any;
    error?: string;
  };
  success: boolean;
}

// ✅ NOUVELLES FONCTIONS D'IMPORT/EXPORT OPTIMISÉES
export const importExportApi = {
  // ==================== IMPORT ====================
  
  // Import standard (pour fichiers < 1000 lignes)
  importStandard: (formData: FormData): Promise<AxiosResponse<{ stats: ImportStats, importBatchID: string }>> => {
    let fileSize = 0;
    const fileEntry = formData.get('file');
    
    // Vérification de type sécurisée
    if (fileEntry && fileEntry instanceof File) {
      fileSize = fileEntry.size;
    }
    
    return api.post('/api/import-export/import', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'X-File-Size': fileSize.toString()
      },
      timeout: 300000 // 5 minutes pour import
    });
  },
  
  // Import intelligent (smart sync)
  importSmartSync: (formData: FormData): Promise<AxiosResponse<{ stats: ImportStats }>> => {
    let fileSize = 0;
    const fileEntry = formData.get('file');
    
    if (fileEntry && fileEntry instanceof File) {
      fileSize = fileEntry.size;
    }
    
    return api.post('/api/import-export/import/smart-sync', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'X-File-Size': fileSize.toString()
      },
      timeout: 300000 // 5 minutes
    });
  },
  
  // Import massif asynchrone (pour fichiers > 5000 lignes)
  startBulkImport: (formData: FormData): Promise<AxiosResponse<BulkImportResponse>> => {
    let fileSize = 0;
    const fileEntry = formData.get('file');
    
    if (fileEntry && fileEntry instanceof File) {
      fileSize = fileEntry.size;
    }
    
    return api.post('/api/import-export/bulk-import', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'X-File-Size': fileSize.toString(),
        'X-Import-Type': 'bulk'
      },
      timeout: 60000 // Réponse rapide dans les 60s
    });
  },
  
  // Suivi d'un import massif
  getBulkImportStatus: (importId: string): Promise<AxiosResponse<BulkImportStatus>> =>
    api.get(`/api/import-export/bulk-import/status/${importId}`, {
      timeout: 10000 // 10 secondes pour le statut
    }),
  
  // Annulation d'un import massif
  cancelBulkImport: (importId: string): Promise<AxiosResponse<{ success: boolean }>> =>
    api.post(`/api/import-export/bulk-import/cancel/${importId}`, {}, {
      timeout: 10000
    }),
  
  // Liste des imports actifs
  getActiveImports: (): Promise<AxiosResponse<{ imports: any[] }>> =>
    api.get('/api/import-export/bulk-import/active', {
      timeout: 10000
    }),
  
  // ==================== EXPORT ====================
  
  // Export streaming optimisé (RECOMMANDÉ)
  exportStream: (): Promise<AxiosResponse<Blob>> => 
    api.get('/api/import-export/export/stream', {
      responseType: 'blob',
      timeout: 240000, // 4 minutes
      headers: {
        'X-Response-Type': 'blob'
      },
      onDownloadProgress: (progressEvent) => {
        const percentComplete = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`📥 Export streaming: ${percentComplete}%`);
      }
    }),
  
  // Export standard (redirigé vers streaming sur Render)
  exportStandard: (): Promise<AxiosResponse<Blob>> => 
    api.get('/api/import-export/export', {
      responseType: 'blob',
      timeout: 180000, // 3 minutes
      onDownloadProgress: (progressEvent) => {
        const percentComplete = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`📥 Export: ${percentComplete}%`);
      }
    }),
  
  // Export optimisé (paginé pour très gros volumes)
  exportOptimized: (): Promise<AxiosResponse<Blob>> => 
    api.get('/api/import-export/export/optimized', {
      responseType: 'blob',
      timeout: 240000, // 4 minutes
      onDownloadProgress: (progressEvent) => {
        const percentComplete = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`📥 Export optimisé: ${percentComplete}%`);
      }
    }),
  
  // Export filtré
  exportFiltered: (filters: any): Promise<AxiosResponse<Blob>> => 
    api.post('/api/import-export/export/filtered', { filters }, {
      responseType: 'blob',
      timeout: 180000, // 3 minutes
      onDownloadProgress: (progressEvent) => {
        const percentComplete = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`📥 Export filtré: ${percentComplete}%`);
      }
    }),
  
  // Export des résultats de recherche
  exportSearchResults: (params: any): Promise<AxiosResponse<Blob>> => 
    api.get('/api/import-export/export-resultats', {
      params,
      responseType: 'blob',
      timeout: 180000, // 3 minutes
      onDownloadProgress: (progressEvent) => {
        const percentComplete = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`📥 Export recherche: ${percentComplete}%`);
      }
    }),
  
  // ==================== UTILITAIRES ====================
  
  // Récupérer les sites disponibles
  getSites: (): Promise<AxiosResponse<SitesResponse>> => 
    api.get('/api/import-export/sites', {
      timeout: 10000 // 10 secondes
    }),
  
  // Récupérer le nombre total de cartes
  getTotalCount: (): Promise<AxiosResponse<CountResponse>> => 
    api.get('/api/cartes/count', {
      timeout: 10000
    }),
  
  // Statistiques d'import
  getImportStats: (): Promise<AxiosResponse<ImportStats>> => 
    api.get('/api/import-export/stats', {
      timeout: 10000
    }),
  
  // Template Excel
  downloadTemplate: (): Promise<AxiosResponse<Blob>> => 
    api.get('/api/import-export/template', { 
      responseType: 'blob',
      timeout: 30000, // 30 secondes
      onDownloadProgress: (progressEvent) => {
        const percentComplete = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`📥 Template: ${percentComplete}%`);
      }
    }),
  
  // Diagnostic du service
  getDiagnostic: (): Promise<AxiosResponse<any>> => 
    api.get('/api/import-export/diagnostic', {
      timeout: 15000 // 15 secondes
    }),
  
  // Test upload
  testUpload: (formData: FormData): Promise<AxiosResponse<any>> => {
    let fileSize = 0;
    const fileEntry = formData.get('file');
    
    if (fileEntry && fileEntry instanceof File) {
      fileSize = fileEntry.size;
    }
    
    return api.post('/api/import-export/test-upload', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'X-File-Size': fileSize.toString()
      },
      timeout: 30000
    });
  },
};

// ✅ FONCTIONS UTILES POUR LES IMPORTS/EXPORTS
export const fileHelper = {
  // Estimer le temps d'import basé sur la taille du fichier
  estimateImportTime: (fileSize: number): string => {
    // Estimation : ~100 lignes par MB, ~50 lignes/sec sur Render gratuit
    const estimatedRows = Math.ceil(fileSize / 10000); // Approximation
    const seconds = Math.ceil(estimatedRows / 50);
    
    if (seconds < 60) return `${seconds} secondes`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
    return `${Math.ceil(seconds / 3600)} heures`;
  },
  
  // Vérifier si le fichier est trop gros pour l'import direct
  shouldUseBulkImport: (file: File): boolean => {
    const maxDirectImportSize = 5 * 1024 * 1024; // 5MB
    const estimatedRows = file.size / 1000; // Approximation
    
    return file.size > maxDirectImportSize || estimatedRows > 5000;
  },
  
  // Formater la taille du fichier
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  // Télécharger un blob comme fichier
  downloadBlob: (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  
  // Ajout : Formater la durée en format lisible
  formatDuration: (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

// ✅ Export par défaut
export default api;