import api from './api';

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
  message: string;
  token: string;
  utilisateur: Utilisateur;
}

// Fonction pour se connecter
export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur lors de la connexion");
  }
};

// Fonction pour récupérer le profil
export const getProfil = async (): Promise<Utilisateur> => {
  try {
    const response = await api.get('/profil');
    return response.data.utilisateur || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération du profil");
  }
};

// Test de connexion API
export const testApiConnection = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    console.error('❌ Test de connexion API échoué:', error);
    return false;
  }
};

export default api;