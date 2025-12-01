// src/services/cartesService.ts
import api from './api';

// ✅ TOUTES LES INTERFACES DÉFINIES ICI
export interface Carte {
  "LIEU D'ENROLEMENT"?: string;
  "SITE DE RETRAIT"?: string;
  RANGEMENT?: string;
  NOM: string;
  PRENOMS: string;
  "DATE DE NAISSANCE"?: string;
  "LIEU NAISSANCE"?: string;
  CONTACT?: string;
  DELIVRANCE?: string;
  "CONTACT DE RETRAIT"?: string;
  "DATE DE DELIVRANCE"?: string;
  ID?: number;
  
  [key: string]: any;
}

export interface StatistiquesGlobales {
  total: number;
  retires: number;
  restants: number;
}

export interface StatistiqueSite {
  site: string;
  total: number;
  retires: number;
  restants: number;
}

// ✅ Fonction pour obtenir les statistiques globales
export const getStatistiquesGlobales = async (): Promise<StatistiquesGlobales> => {
  try {
    const response = await api.get('/statistiques/globales');
    
    if (response.data) {
      return response.data;
    }

    throw new Error('Endpoint statistiques/globales non disponible');
  } catch (error) {
    console.error('Erreur dans getStatistiquesGlobales:', error);
    return {
      total: 0,
      retires: 0,
      restants: 0
    };
  }
};

// ✅ Fonction pour obtenir les statistiques par site
export const getStatistiquesParSite = async (): Promise<StatistiqueSite[]> => {
  try {
    const response = await api.get('/statistiques/sites');
    
    if (response.data) {
      return response.data;
    }

    throw new Error('Endpoint statistiques/sites non disponible');
  } catch (error) {
    console.error('Erreur dans getStatistiquesParSite:', error);
    return [];
  }
};

// ✅ Fonction pour forcer le refresh des statistiques
export const forceRefreshStatistiques = async (): Promise<void> => {
  try {
    console.log("🔄 Forçage du recalcul des statistiques...");
    
    const response = await api.post('/statistiques/refresh');
    
    if (response.status !== 200) {
      throw new Error(`Refresh failed: ${response.status}`);
    }

    console.log("✅ Synchronisation des statistiques déclenchée");
  } catch (error) {
    console.warn('⚠️ Refresh des statistiques échoué, continuation normale...', error);
  }
};

// ✅ Classe principale pour les opérations sur les cartes
class CartesService {
  // ✅ Rafraîchir les statistiques
  async refreshStatistiques(): Promise<{
    globales: StatistiquesGlobales;
    sites: StatistiqueSite[];
  }> {
    try {
      console.log("📊 Rafraîchissement des statistiques...");
      
      const [globales, sites] = await Promise.all([
        getStatistiquesGlobales(),
        getStatistiquesParSite()
      ]);
      
      console.log("✅ Statistiques rafraîchies:", {
        total: globales.total,
        retires: globales.retires,
        sites: sites.length
      });
      
      return { globales, sites };
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement des statistiques:', error);
      throw error;
    }
  }

  // ✅ Synchronisation forcée
  async forceRefreshAndGetStats(): Promise<{
    globales: StatistiquesGlobales;
    sites: StatistiqueSite[];
  }> {
    try {
      console.log("🔄 Début de la synchronisation forcée...");
      
      await forceRefreshStatistiques();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await this.refreshStatistiques();
      
      console.log("✅ Synchronisation forcée terminée");
      return result;
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation forcée:', error);
      return await this.refreshStatistiques();
    }
  }

  // ✅ Mettre à jour les cartes
  async updateCartes(cartes: Carte[]): Promise<void> {
    try {
      const role = localStorage.getItem("role") || "";
      
      const response = await api.put('/cartes/batch', { 
        cartes, 
        role 
      });

      return response.data;
    } catch (error) {
      console.error('Erreur dans updateCartes:', error);
      throw error;
    }
  }

  // ✅ Obtenir toutes les cartes
  async getCartes(): Promise<Carte[]> {
    try {
      const response = await api.get('/cartes');
      return response.data.cartes || [];
    } catch (error) {
      console.error('Erreur dans getCartes:', error);
      throw error;
    }
  }

  // ✅ Obtenir les cartes paginées
  async getCartesPaginated(page: number = 1, limit: number = 100): Promise<any> {
    try {
      const response = await api.get(`/cartes?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erreur dans getCartesPaginated:', error);
      throw error;
    }
  }

  // ✅ Rechercher des cartes
  async rechercherCartes(criteres: {
    nom?: string;
    prenom?: string;
    contact?: string;
    siteRetrait?: string;
    lieuNaissance?: string;
    dateNaissance?: string;
    rangement?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    cartes: Carte[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (criteres.nom) params.append('nom', criteres.nom);
      if (criteres.prenom) params.append('prenom', criteres.prenom);
      if (criteres.contact) params.append('contact', criteres.contact);
      if (criteres.siteRetrait) params.append('siteRetrait', criteres.siteRetrait);
      if (criteres.lieuNaissance) params.append('lieuNaissance', criteres.lieuNaissance);
      if (criteres.dateNaissance) params.append('dateNaissance', criteres.dateNaissance);
      if (criteres.rangement) params.append('rangement', criteres.rangement);
      if (criteres.page) params.append('page', criteres.page.toString());
      if (criteres.limit) params.append('limit', criteres.limit.toString());

      const response = await api.get(`/inventaire/recherche?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erreur dans rechercherCartes:', error);
      throw error;
    }
  }

  // ✅ Créer une carte
  async createCarte(carte: Carte): Promise<number> {
    try {
      const response = await api.post('/cartes', carte);
      return response.data.id;
    } catch (error) {
      console.error('Erreur dans createCarte:', error);
      throw error;
    }
  }

  // ✅ Supprimer une carte
  async deleteCarte(id: number): Promise<void> {
    try {
      const response = await api.delete(`/cartes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur dans deleteCarte:', error);
      throw error;
    }
  }

  // ✅ Obtenir les statistiques
  async getStatistiques(): Promise<{
    total: number;
    retires: number;
    disponibles: number;
    parSite: { [site: string]: number };
  }> {
    try {
      const response = await api.get('/cartes/statistiques/total');
      return response.data;
    } catch (error) {
      console.error('Erreur dans getStatistiques:', error);
      throw error;
    }
  }
}

// ✅ Export de l'instance unique du service
const cartesService = new CartesService();
export default cartesService;