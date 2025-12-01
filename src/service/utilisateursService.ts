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

// ✅ Fonction pour se connecter - CORRIGÉE
export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  try {
    console.log('🔐 Tentative de connexion...', { username: data.NomUtilisateur });
    
    const response = await api.post('/api/auth/login', data);
    
    console.log('✅ Réponse API login:', response.data);
    
    // ✅ VOTRE BACKEND RETOURNE : { message, token, utilisateur }
    // PAS DE "success: true/false" dans la réponse du backend
    
    // Vérifier si nous avons un token (indicateur de succès)
    if (!response.data.token) {
      // Si pas de token, vérifier s'il y a un message d'erreur
      if (response.data.message && !response.data.message.includes('réussie')) {
        throw new Error(response.data.message);
      }
      throw new Error('Identifiants incorrects - aucun token reçu');
    }
    
    // ✅ Retourner au format attendu par le frontend
    return {
      success: true,
      message: response.data.message || 'Connexion réussie',
      token: response.data.token,
      utilisateur: response.data.utilisateur
    };
    
  } catch (error: any) {
    console.error('💥 Erreur loginUser:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    let userMessage = error.message;
    
    // Gestion spécifique des erreurs réseau
    if (error.message.includes('network') || error.message.includes('Network')) {
      userMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
    } 
    // Gestion des erreurs de réponse API
    else if (error.response?.data?.message) {
      userMessage = error.response.data.message;
    } 
    // Gestion des erreurs HTTP
    else if (error.response?.status === 401) {
      userMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
    } else if (error.response?.status === 404) {
      userMessage = 'Service d\'authentification indisponible';
    } else if (error.response?.status === 500) {
      userMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
    }
    
    // ✅ Retourner au format attendu même en cas d'erreur
    return {
      success: false,
      message: userMessage,
      token: '',
      utilisateur: {
        id: 0,
        NomComplet: '',
        NomUtilisateur: '',
        Email: '',
        Agence: '',
        Role: "Opérateur"
      }
    };
  }
};

// ✅ Fonction pour récupérer le profil - CORRIGÉE
export const getProfil = async (): Promise<Utilisateur> => {
  try {
    const response = await api.get('/api/profil');
    
    // Votre backend retourne directement l'objet utilisateur
    if (response.data && response.data.NomUtilisateur) {
      return response.data;
    }
    
    // Ou parfois il est encapsulé dans une propriété "utilisateur"
    if (response.data.utilisateur) {
      return response.data.utilisateur;
    }
    
    throw new Error("Format de réponse invalide");
    
  } catch (error: any) {
    console.error('❌ Erreur getProfil:', error);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération du profil");
  }
};

// ✅ Test de connexion API - CORRIGÉ
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
    
    let errorMessage = `❌ Impossible de se connecter à l'API`;
    
    if (error.response?.status) {
      errorMessage += ` (HTTP ${error.response.status})`;
    }
    
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    return {
      success: false,
      message: errorMessage,
      details: error.response?.data
    };
  }
};

// ✅ Fonction pour changer le mot de passe - NOUVELLE
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    console.log('🔐 Changement de mot de passe...');
    
    const response = await api.put('/api/profil/password', {
      currentPassword,
      newPassword
    });
    
    return {
      success: true,
      message: response.data.message || '✅ Mot de passe modifié avec succès'
    };
    
  } catch (error: any) {
    console.error('❌ Erreur changePassword:', error);
    
    let userMessage = 'Erreur lors du changement de mot de passe';
    
    if (error.response?.data?.message) {
      userMessage = error.response.data.message;
    } else if (error.response?.status === 401) {
      userMessage = 'Mot de passe actuel incorrect';
    } else if (error.response?.status === 400) {
      userMessage = 'Le nouveau mot de passe ne respecte pas les critères de sécurité';
    }
    
    return {
      success: false,
      message: `❌ ${userMessage}`
    };
  }
};

// ✅ Fonction pour vérifier la validité du token - NOUVELLE
export const verifyToken = async (): Promise<{
  valid: boolean;
  user?: Utilisateur;
  message?: string;
}> => {
  try {
    // On peut simplement tenter de récupérer le profil
    const user = await getProfil();
    
    return {
      valid: true,
      user: user,
      message: '✅ Token valide'
    };
    
  } catch (error: any) {
    console.error('❌ Erreur verifyToken:', error);
    
    return {
      valid: false,
      message: '❌ Token invalide ou expiré'
    };
  }
};

// ✅ Pas d'export default ici, seulement des exports nommés