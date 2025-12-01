// src/services/utilisateursService.ts
import api from './api';

// ✅ Interfaces DÉFINIES ICI - PAS de duplication avec cartesService
export interface LoginData {
  NomUtilisateur: string;
  MotDePasse: string;
}

export interface Utilisateur {
  id: number;
  NomComplet: string;
  NomUtilisateur: string;
  Email: string;
  Agence: string;
  Role: "Administrateur" | "Superviseur" | "Chef d'équipe" | "Opérateur";
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  utilisateur: Utilisateur;
}

// ✅ Fonction pour se connecter
export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  try {
    console.log('🔐 Tentative de connexion...', { username: data.NomUtilisateur });
    
    // ✅ CORRIGÉ : /api/auth/login au lieu de /auth/login
    const response = await api.post('/api/auth/login', data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Identifiants incorrects');
    }
    
    return response.data;
    
  } catch (error: any) {
    console.error('💥 Erreur loginUser:', {
      message: error.message,
      response: error.response?.data
    });
    
    let userMessage = error.message;
    
    if (error.message.includes('network') || error.message.includes('Network')) {
      userMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
    } else if (error.response?.data?.message) {
      userMessage = error.response.data.message;
    } else if (error.response?.status === 401) {
      userMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
    }
    
    throw new Error(userMessage);
  }
};

// ✅ Fonction pour récupérer le profil
export const getProfil = async (): Promise<Utilisateur> => {
  try {
    const response = await api.get('/api/profil');
    return response.data.utilisateur || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération du profil");
  }
};

// ✅ Test de connexion API
export const testApiConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('🧪 Test de connexion API...');
    
    const response = await api.get('/api/health');
    
    return {
      success: true,
      message: '✅ Connexion API établie',
      details: response.data
    };
    
  } catch (error: any) {
    console.error('❌ Test de connexion échoué:', error);
    
    return {
      success: false,
      message: `❌ Impossible de se connecter à l'API: ${error.message}`,
      details: error.response?.data
    };
  }
};

// ✅ Pas d'export default ici, seulement des exports nommés