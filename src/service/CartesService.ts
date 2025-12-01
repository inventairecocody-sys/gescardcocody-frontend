// src/services/cartesService.ts
import api from './api';

// ✅ INTERFACE COMPLÈTE POUR LES CARTES - COMPATIBLE AVEC LES DEUX FORMATS
export interface Carte {
  // Identifiants (les deux formats)
  ID?: number;
  id?: number;
  
  // Colonnes en majuscules (format SQL Server)
  NOM?: string;
  PRENOMS?: string;
  CONTACT?: string;
  RANGEMENT?: string;
  DELIVRANCE?: string;
  
  // Colonnes en minuscules (format PostgreSQL)
  nom?: string;
  prenoms?: string;
  contact?: string;
  rangement?: string;
  delivrance?: string;
  
  // Colonnes avec espaces (communes aux deux formats)
  "LIEU D'ENROLEMENT"?: string;
  "SITE DE RETRAIT"?: string;
  "DATE DE NAISSANCE"?: string;
  "LIEU NAISSANCE"?: string;
  "CONTACT DE RETRAIT"?: string;
  "DATE DE DELIVRANCE"?: string;
  
  // Propriété d'affichage combinée
  nomComplet?: string;
  
  // Index signature pour TypeScript
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

// ✅ FONCTION DE NORMALISATION DES DONNÉES
export const normaliserCarte = (carte: any): Carte => {
  if (!carte || typeof carte !== 'object') {
    return {} as Carte;
  }
  
  const carteNormalisee: Carte = {
    // Identifiants
    ID: carte.ID || carte.id || undefined,
    id: carte.id || carte.ID || undefined,
    
    // Colonnes en majuscules
    NOM: carte.NOM || carte.nom || '',
    PRENOMS: carte.PRENOMS || carte.prenoms || '',
    CONTACT: carte.CONTACT || carte.contact || '',
    RANGEMENT: carte.RANGEMENT || carte.rangement || '',
    DELIVRANCE: carte.DELIVRANCE || carte.delivrance || '',
    
    // Colonnes en minuscules
    nom: carte.nom || carte.NOM || '',
    prenoms: carte.prenoms || carte.PRENOMS || '',
    contact: carte.contact || carte.CONTACT || '',
    rangement: carte.rangement || carte.RANGEMENT || '',
    delivrance: carte.delivrance || carte.DELIVRANCE || '',
    
    // Colonnes avec espaces
    "LIEU D'ENROLEMENT": carte["LIEU D'ENROLEMENT"] || '',
    "SITE DE RETRAIT": carte["SITE DE RETRAIT"] || '',
    "DATE DE NAISSANCE": carte["DATE DE NAISSANCE"] || '',
    "LIEU NAISSANCE": carte["LIEU NAISSANCE"] || '',
    "CONTACT DE RETRAIT": carte["CONTACT DE RETRAIT"] || '',
    "DATE DE DELIVRANCE": carte["DATE DE DELIVRANCE"] || '',
    
    // Propriété calculée
    nomComplet: `${carte.NOM || carte.nom || ''} ${carte.PRENOMS || carte.prenoms || ''}`.trim(),
  };
  
  // Copie toutes les autres propriétés
  for (const key in carte) {
    if (!(key in carteNormalisee)) {
      carteNormalisee[key] = carte[key];
    }
  }
  
  return carteNormalisee;
};

// ✅ Fonction pour normaliser un tableau de cartes
export const normaliserCartes = (cartes: any[]): Carte[] => {
  if (!Array.isArray(cartes)) {
    return [];
  }
  
  return cartes.map(normaliserCarte);
};

// ✅ Fonction pour obtenir les statistiques globales
export const getStatistiquesGlobales = async (): Promise<StatistiquesGlobales> => {
  try {
    const response = await api.get('/api/statistiques/globales');
    
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
    const response = await api.get('/api/statistiques/sites');
    
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
    
    const response = await api.post('/api/statistiques/refresh');
    
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
      
      // ✅ Normaliser les cartes avant envoi
      const cartesPourEnvoi = cartes.map(carte => ({
        ID: carte.ID || carte.id,
        "LIEU D'ENROLEMENT": carte["LIEU D'ENROLEMENT"] || '',
        "SITE DE RETRAIT": carte["SITE DE RETRAIT"] || '',
        RANGEMENT: carte.RANGEMENT || carte.rangement || '',
        NOM: carte.NOM || carte.nom || '',
        PRENOMS: carte.PRENOMS || carte.prenoms || '',
        "DATE DE NAISSANCE": carte["DATE DE NAISSANCE"] || '',
        "LIEU NAISSANCE": carte["LIEU NAISSANCE"] || '',
        CONTACT: carte.CONTACT || carte.contact || '',
        DELIVRANCE: carte.DELIVRANCE || carte.delivrance || '',
        "CONTACT DE RETRAIT": carte["CONTACT DE RETRAIT"] || '',
        "DATE DE DELIVRANCE": carte["DATE DE DELIVRANCE"] || ''
      }));

      const response = await api.put('/api/cartes/batch', { 
        cartes: cartesPourEnvoi, 
        role 
      });

      return response.data;
    } catch (error) {
      console.error('Erreur dans updateCartes:', error);
      throw error;
    }
  }

  // ✅ Obtenir toutes les cartes (avec normalisation)
  async getCartes(): Promise<Carte[]> {
    try {
      const response = await api.get('/api/cartes');
      const cartesBrutes = response.data.cartes || [];
      console.log(`📥 ${cartesBrutes.length} cartes brutes reçues`);
      return normaliserCartes(cartesBrutes);
    } catch (error) {
      console.error('Erreur dans getCartes:', error);
      throw error;
    }
  }

  // ✅ Obtenir les cartes paginées (avec normalisation)
  async getCartesPaginated(page: number = 1, limit: number = 100): Promise<any> {
    try {
      const response = await api.get(`/api/cartes?page=${page}&limit=${limit}`);
      const data = response.data;
      
      if (data.cartes) {
        data.cartes = normaliserCartes(data.cartes);
        console.log(`📄 Page ${page}: ${data.cartes.length} cartes normalisées`);
      }
      
      return data;
    } catch (error) {
      console.error('Erreur dans getCartesPaginated:', error);
      throw error;
    }
  }

  // ✅ Rechercher des cartes (avec normalisation)
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

      const response = await api.get(`/api/inventaire/recherche?${params}`);
      
      const result = response.data;
      
      if (result.cartes) {
        result.cartes = normaliserCartes(result.cartes);
        console.log(`🔍 Recherche: ${result.cartes.length} résultats normalisés`);
      }
      
      return result;
    } catch (error) {
      console.error('Erreur dans rechercherCartes:', error);
      throw error;
    }
  }

  // ✅ Créer une carte
  async createCarte(carte: Carte): Promise<number> {
    try {
      // ✅ Normaliser la carte avant envoi
      const carteNormalisee = normaliserCarte(carte);
      const cartePourEnvoi = {
        "LIEU D'ENROLEMENT": carteNormalisee["LIEU D'ENROLEMENT"] || '',
        "SITE DE RETRAIT": carteNormalisee["SITE DE RETRAIT"] || '',
        RANGEMENT: carteNormalisee.RANGEMENT || carteNormalisee.rangement || '',
        NOM: carteNormalisee.NOM || carteNormalisee.nom || '',
        PRENOMS: carteNormalisee.PRENOMS || carteNormalisee.prenoms || '',
        "DATE DE NAISSANCE": carteNormalisee["DATE DE NAISSANCE"] || '',
        "LIEU NAISSANCE": carteNormalisee["LIEU NAISSANCE"] || '',
        CONTACT: carteNormalisee.CONTACT || carteNormalisee.contact || '',
        DELIVRANCE: carteNormalisee.DELIVRANCE || carteNormalisee.delivrance || '',
        "CONTACT DE RETRAIT": carteNormalisee["CONTACT DE RETRAIT"] || '',
        "DATE DE DELIVRANCE": carteNormalisee["DATE DE DELIVRANCE"] || ''
      };

      const response = await api.post('/api/cartes', cartePourEnvoi);
      return response.data.id;
    } catch (error) {
      console.error('Erreur dans createCarte:', error);
      throw error;
    }
  }

  // ✅ Supprimer une carte
  async deleteCarte(id: number): Promise<void> {
    try {
      const response = await api.delete(`/api/cartes/${id}`);
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
      const response = await api.get('/api/cartes/statistiques/total');
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