import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import TableCartesExcel from "../components/TableCartesExcel";
import ImportModal from "../components/ImportModal";
import cartesService from "../service/CartesService";
import api from "../service/api";
import SiteDropdown from "../components/SiteDropdown";
import type { Carte } from "../service/CartesService";

interface CriteresRecherche {
  nom: string;
  prenom: string;
  contact: string;
  siteRetrait: string;
  lieuNaissance: string;
  dateNaissance: string;
  rangement: string;
}

// Interface pour la progression d'export
interface ExportProgress {
  percentage: number;
  loaded: number;
  total: number;
  speed: string;
  estimatedTime: string;
}

const Inventaire: React.FC = () => {
  const [resultats, setResultats] = useState<Carte[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [hasModifications, setHasModifications] = useState(false);
  const [totalResultats, setTotalResultats] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<'standard' | 'smart'>('standard');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    percentage: 0,
    loaded: 0,
    total: 0,
    speed: '0 KB/s',
    estimatedTime: ''
  });
  
  // ✅ ÉTAT DES CRITÈRES DE RECHERCHE
  const [criteres, setCriteres] = useState<CriteresRecherche>({
    nom: "",
    prenom: "",
    contact: "",
    siteRetrait: "",
    lieuNaissance: "",
    dateNaissance: "",
    rangement: ""
  });

  const role = localStorage.getItem("role") || "";
  const exportStartTimeRef = useRef<number>(0);

  // ✅ CONFIGURATION DES PERMISSIONS PAR RÔLE
  const getPermissionsByRole = () => {
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes("administrateur")) {
      return {
        canModifyData: true,
        canImport: true,
        canExport: true,
        canExportAll: true,
        canSmartSync: true
      };
    } else if (roleLower.includes("superviseur")) {
      return {
        canModifyData: true,
        canImport: true,
        canExport: true,
        canExportAll: true,
        canSmartSync: true
      };
    } else if (roleLower.includes("chef d'équipe") || roleLower.includes("chef d'equipe")) {
      return {
        canModifyData: false,
        canImport: false,
        canExport: true,
        canExportAll: false,
        canSmartSync: false
      };
    } else if (roleLower.includes("opérateur") || roleLower.includes("operateur")) {
      return {
        canModifyData: false,
        canImport: false,
        canExport: true,
        canExportAll: false,
        canSmartSync: false
      };
    } else {
      return {
        canModifyData: false,
        canImport: false,
        canExport: false,
        canExportAll: false,
        canSmartSync: false
      };
    }
  };

  const permissions = getPermissionsByRole();

  // ✅ FONCTION DE VÉRIFICATION DU TOKEN
  const checkToken = (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expirée. Veuillez vous reconnecter.');
      window.location.href = '/login';
      return false;
    }
    return true;
  };

  // 📢 FONCTION DE NOTIFICATION AMÉLIORÉE
  const notifyDashboardRefreshEnhanced = async () => {
    if (!checkToken()) return;
    
    console.log('📢 Notification avancée du Dashboard...');
    
    try {
      await cartesService.forceRefreshAndGetStats();
      console.log('✅ Statistiques recalculées avec succès');
    } catch (error: any) {
      console.warn('⚠️ Recalcul des statistiques échoué, continuation...');
    }
    
    const refreshEvent = new CustomEvent('dashboardRefreshNeeded', {
      detail: { 
        force: true, 
        timestamp: Date.now(),
        source: 'inventaire'
      }
    });
    window.dispatchEvent(refreshEvent);
    
    localStorage.setItem('lastDataUpdate', Date.now().toString());
    localStorage.setItem('forceStatsRefresh', 'true');
    
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('dashboard_updates');
        channel.postMessage({ 
          type: 'data_updated', 
          timestamp: Date.now(),
          forceRefresh: true,
          source: 'inventaire'
        });
        setTimeout(() => channel.close(), 1000);
      } catch (e) {
        console.log('BroadcastChannel non supporté');
      }
    }
    
    console.log('✅ Notification du Dashboard terminée');
  };

  // 🔍 RECHERCHE MULTICRITÈRES AVEC PAGINATION
  const handleRecherche = async (page: number = 1) => {
    if (!checkToken()) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(criteres).forEach(([key, value]) => {
        if (value && value.toString().trim()) params.append(key, value.toString().trim());
      });
      
      params.append('page', page.toString());
      params.append('limit', '50');

      const response = await api.get(`/api/inventaire/recherche?${params}`);

      const data = response.data;
      setResultats(data.cartes);
      setTotalResultats(data.total);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setHasModifications(false);
      
    } catch (error: any) {
      console.error("❌ Erreur recherche:", error);
      
      if (error.response?.status === 403 || error.response?.status === 401) {
        alert('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
        return;
      }
      
      if (error.response?.data?.error) {
        alert(`Erreur lors de la recherche: ${error.response.data.error || 'Erreur serveur'}`);
      } else {
        alert("Erreur de connexion au serveur");
      }
    } finally {
      setLoading(false);
    }
  };

  // 💾 FONCTION DE SAUVEGARDE CORRIGÉE
  const handleSaveModifications = async () => {
    if (!checkToken()) return;
    
    try {
      console.log('💾 Début de la sauvegarde des modifications...');
      
      // Compter les cartes modifiées
      const cartesAvecDelivrance = resultats.filter(carte => 
        carte.DELIVRANCE && carte.DELIVRANCE.toString().trim() !== ''
      );
      console.log('📊 Cartes avec DELIVRANCE:', cartesAvecDelivrance.length);
      
      // ✅ FILTRER LES CARTES AVEC IDs VALIDES
      const cartesValides = resultats.filter(carte => {
        const id = carte.ID;
        
        if (id === null || id === undefined) {
          console.warn('⚠️ Carte ignorée (ID null/undefined):', { nom: carte.NOM });
          return false;
        }
        
        const idString = id.toString();
        const idNumber = Number(id);
        
        const idValide = idString !== '' &&
                        idString !== 'batch' && 
                        idString !== 'null' && 
                        idString !== 'undefined' && 
                        !isNaN(idNumber) && 
                        idNumber > 0;
        
        if (!idValide) {
          console.warn('⚠️ Carte ignorée (ID invalide):', { id: carte.ID, nom: carte.NOM });
        }
        return idValide;
      });
      
      console.log(`📋 Cartes à sauvegarder: ${cartesValides.length}/${resultats.length}`);
      
      if (cartesValides.length === 0) {
        alert('❌ Aucune carte valide à sauvegarder.');
        return;
      }
      
      // ✅ SAUVEGARDER SEULEMENT LES CARTES VALIDES
      await cartesService.updateCartes(cartesValides);
      setHasModifications(false);
      
      // 🚨 FORCER LA SYNCHRONISATION AVEC LE DASHBOARD
      await notifyDashboardRefreshEnhanced();
      
      // ⏰ Attendre un peu pour que tout se synchronise
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`✅ ${cartesValides.length} modification(s) enregistrée(s) avec succès !`);
      
      console.log('💾 Sauvegarde terminée avec succès');
      
    } catch (error: any) {
      console.error("❌ Erreur sauvegarde:", error);
      if (error.message.includes('403') || error.message.includes('401')) {
        alert('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
      } else {
        alert("❌ Erreur lors de l'enregistrement");
      }
    }
  };

  // 📤 IMPORT DEPUIS LE MODAL - ACTIVÉ
  const handleImportFromModal = async (file: File) => {
    if (!checkToken()) return;
    
    setImportLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Détecter le format du fichier
      const isCSV = file.name.toLowerCase().endsWith('.csv');
      const isExcel = /\.(xlsx|xls)$/i.test(file.name);
      
      let endpoint = '/api/import-export/import';
      
      if (isCSV) {
        endpoint = '/api/import-export/import/csv';
        console.log('📄 Import CSV détecté');
      } else if (isExcel && importMode === 'smart') {
        endpoint = '/api/import-export/import/smart-sync';
        console.log('🔄 Import intelligent Excel détecté');
      }
      // Sinon, utiliser l'import Excel standard
      
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-File-Type': isCSV ? 'csv' : 'excel'
        }
      });
      
      if (response.data.success) {
        const stats = response.data.stats || {};
        let successMessage = `✅ Import ${importMode === 'smart' ? 'intelligent' : 'standard'} réussi !\n`;
        successMessage += `📊 Statistiques:\n`;
        successMessage += `• ${stats.imported || 0} cartes importées\n`;
        successMessage += `• ${stats.updated || 0} cartes mises à jour\n`;
        successMessage += `• ${stats.duplicates || 0} doublons ignorés\n`;
        successMessage += `• ${stats.errors || 0} erreurs`;
        
        if (response.data.recommendation) {
          successMessage += `\n\n💡 ${response.data.recommendation}`;
        }
        
        alert(successMessage);
        
        // Recharger les résultats si recherche active
        if (resultats.length > 0) {
          handleRecherche(currentPage);
        }
        
        // Notifier le dashboard
        await notifyDashboardRefreshEnhanced();
        
        // Fermer le modal
        setShowImportModal(false);
      }
      
    } catch (error: any) {
      console.error('❌ Erreur import:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur inconnue';
      alert(`❌ Erreur lors de l'import: ${errorMessage}`);
    } finally {
      setImportLoading(false);
    }
  };

  // 📥 EXPORT OPTIMISÉ AVEC PROGRESSION CORRIGÉE
  const handleExport = async (format: 'csv' | 'excel' = exportFormat) => {
    if (!checkToken() || !permissions.canExport) return;
    
    // ⚠️ Vérification de la taille estimée pour les gros fichiers
    const estimatedSizeKB = format === 'csv' 
      ? totalResultats * 0.5 // ~0.5KB par ligne CSV
      : totalResultats * 2;   // ~2KB par ligne Excel
    
    if (estimatedSizeKB > 10 * 1024) { // > 10MB
      const confirm = window.confirm(
        `⚠️ Attention: Fichier volumineux estimé (${(estimatedSizeKB / 1024).toFixed(1)} MB)\n\n` +
        `Avec ${totalResultats} cartes, l'export ${format.toUpperCase()} pourrait prendre du temps.\n\n` +
        `✅ CSV est recommandé pour les gros exports (plus rapide et plus stable)\n` +
        `❌ Excel peut être lent ou échouer sur des gros fichiers\n\n` +
        `Voulez-vous quand même continuer avec ${format.toUpperCase()}?`
      );
      
      if (!confirm) return;
    }
    
    setExportLoading(true);
    setShowProgressModal(true);
    exportStartTimeRef.current = Date.now();
    
    // Réinitialiser la progression
    setExportProgress({
      percentage: 0,
      loaded: 0,
      total: 0,
      speed: '0 KB/s',
      estimatedTime: 'Calcul...'
    });
    
    try {
      // Vérifier si des critères sont actifs
      const hasActiveFilters = Object.values(criteres).some(value => 
        value && value.toString().trim() !== ''
      );
      
      // Construire les paramètres de recherche
      const params = new URLSearchParams();
      let queryParams = '';
      
      if (hasActiveFilters && resultats.length > 0) {
        Object.entries(criteres).forEach(([key, value]) => {
          if (value && value.toString().trim()) {
            params.append(key, value.toString().trim());
          }
        });
        queryParams = `?${params.toString()}`;
      }
      
      // Déterminer l'endpoint et le nom de fichier
      let endpoint: string;
      let filename: string;
      const timestamp = new Date().toISOString().split('T')[0];
      const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      
      if (format === 'csv') {
        // Export CSV
        endpoint = '/api/import-export/export/csv';
        if (hasActiveFilters && resultats.length > 0) {
          filename = `resultats-recherche-${timestamp}_${time}.csv`;
        } else {
          filename = `toutes-les-cartes-${timestamp}_${time}.csv`;
        }
      } else {
        // Export Excel
        endpoint = '/api/import-export/export';
        if (hasActiveFilters && resultats.length > 0) {
          filename = `resultats-recherche-${timestamp}_${time}.xlsx`;
        } else {
          filename = `toutes-les-cartes-${timestamp}_${time}.xlsx`;
        }
      }
      
      // Ajouter les paramètres de recherche si disponibles
      if (queryParams) {
        endpoint += queryParams;
      }
      
      console.log(`📤 Export ${format.toUpperCase()} via: ${endpoint}`);
      
      const response = await api.get(endpoint, {
        responseType: 'blob',
        timeout: 120000, // 2 minutes timeout
        onDownloadProgress: (progressEvent) => {
          const now = Date.now();
          const elapsed = (now - exportStartTimeRef.current) / 1000; // secondes
          const loadedKB = progressEvent.loaded / 1024;
          
          // Calculer la vitesse (KB/s)
          let speed = '0 KB/s';
          if (elapsed > 0) {
            const speedKBps = loadedKB / elapsed;
            speed = `${speedKBps.toFixed(1)} KB/s`;
          }
          
          // ✅ CORRECTION : Calcul sécurisé du pourcentage
          let percentCompleted = 0;
          
          if (progressEvent.total && progressEvent.total > 0) {
            // Si on a une taille totale valide
            percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          } else {
            // Estimation basée sur la taille typique pour le format
            const estimatedTotal = format === 'csv' ? 
              Math.max(50 * 1024, totalResultats * 0.5 * 1024) : // ~0.5KB par ligne CSV
              Math.max(200 * 1024, totalResultats * 2 * 1024);   // ~2KB par ligne Excel
            
            percentCompleted = Math.min(99, Math.round((progressEvent.loaded * 100) / estimatedTotal));
          }
          
          // Limiter à 0-100%
          const safePercent = Math.min(100, Math.max(0, percentCompleted));
          
          // Calculer le temps estimé restant
          let estimatedTime = '';
          if (safePercent > 0 && safePercent < 100) {
            const estimatedTotalTime = (elapsed * 100) / safePercent;
            const remainingTime = estimatedTotalTime - elapsed;
            
            if (remainingTime < 60) {
              estimatedTime = `${Math.ceil(remainingTime)}s`;
            } else if (remainingTime < 3600) {
              estimatedTime = `${Math.ceil(remainingTime / 60)}min`;
            } else {
              estimatedTime = `${Math.ceil(remainingTime / 3600)}h`;
            }
          }
          
          setExportProgress({
            percentage: safePercent,
            loaded: progressEvent.loaded,
            total: progressEvent.total || 0,
            speed,
            estimatedTime
          });
          
          // Log de progression (seulement aux points importants)
          if (safePercent % 10 === 0 || safePercent === 100 || safePercent === 0) {
            console.log(`Export ${format.toUpperCase()}: ${safePercent}% (${loadedKB.toFixed(1)}KB, ${speed})`);
          }
        }
      });
      
      // ✅ VALIDATION RENFORCÉE DU FICHIER
      const blob = response.data;
      
      // 1. Vérifier la taille minimale
      const minSize = format === 'csv' ? 100 : 500; // CSV doit faire au moins 100 octets, Excel 500
      if (blob.size < minSize) {
        // Essayer de lire le contenu pour voir si c'est une erreur
        const errorText = await blob.text();
        console.error('Contenu du fichier suspect:', errorText.substring(0, 500));
        
        // Vérifier si c'est du JSON (erreur API)
        if (errorText.trim().startsWith('{') || errorText.trim().startsWith('[')) {
          try {
            const jsonError = JSON.parse(errorText);
            throw new Error(`Erreur serveur: ${jsonError.error || jsonError.message || 'Erreur inconnue'}`);
          } catch (e) {
            // Pas du JSON, continuer
          }
        }
        
        if (blob.size < 50) {
          throw new Error(`Fichier ${format} corrompu (seulement ${blob.size} octets). Le serveur semble avoir retourné une erreur.`);
        }
      }
      
      // 2. Vérifier le type MIME (tolérant)
      const contentType = response.headers['content-type'];
      if (contentType) {
        const isExpectedType = format === 'csv' 
          ? contentType.includes('text/csv') || contentType.includes('application/octet-stream') || contentType.includes('text/plain')
          : contentType.includes('spreadsheet') || contentType.includes('application/octet-stream') || contentType.includes('application/vnd.openxmlformats');
        
        if (!isExpectedType) {
          console.warn(`Type MIME inattendu: ${contentType} (attendu: ${format})`);
        }
      }
      
      // 3. Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      // Message de succès
      const count = resultats.length > 0 ? resultats.length : totalResultats;
      const fileSizeMB = (blob.size / 1024 / 1024).toFixed(2);
      let successMessage = `✅ Export ${format.toUpperCase()} réussi !\n`;
      successMessage += `📁 ${filename}\n`;
      successMessage += `📊 Taille: ${fileSizeMB} MB\n`;
      
      if (count > 0) {
        successMessage += `📈 ${count} carte${count > 1 ? 's' : ''} exportée${count > 1 ? 's' : ''}\n`;
      }
      
      // Recommandations
      const duration = (Date.now() - exportStartTimeRef.current) / 1000;
      if (duration > 30 && format === 'excel') {
        successMessage += `\n⏱️ Durée: ${Math.round(duration)} secondes\n`;
        successMessage += `💡 Astuce: Le CSV est 5x plus rapide pour les prochains exports`;
      }
      
      alert(successMessage);
      
    } catch (error: any) {
      console.error(`❌ Erreur export ${format}:`, error);
      
      let errorMessage = '';
      if (error.code === 'ECONNABORTED') {
        errorMessage = `⏱️ Délai d'attente dépassé (2 minutes).\n\n`;
        errorMessage += `Le serveur met trop de temps à générer le fichier.\n`;
        errorMessage += `💡 Essayez :\n`;
        errorMessage += `• Réduire le nombre de cartes (utilisez des filtres)\n`;
        errorMessage += `• Utiliser le format CSV (bouton vert, 10x plus rapide)\n`;
        errorMessage += `• Exporter par sites spécifiques\n`;
        errorMessage += `• Diviser l'export en plusieurs parties\n`;
      } else if (error.message?.includes('corrompu') || error.message?.includes('trop petit')) {
        errorMessage = `❌ Fichier corrompu ou vide.\n\n`;
        errorMessage += `Le serveur n'a pas généré un fichier valide.\n`;
        errorMessage += `Causes possibles :\n`;
        errorMessage += `• Problème de mémoire serveur (Render gratuit)\n`;
        errorMessage += `• Trop de données à exporter\n`;
        errorMessage += `• Erreur interne du serveur\n\n`;
        errorMessage += `💡 Solutions :\n`;
        errorMessage += `1. Utilisez CSV au lieu d'Excel\n`;
        errorMessage += `2. Réduisez le nombre de cartes\n`;
        errorMessage += `3. Exportez par sites\n`;
        errorMessage += `4. Contactez l'admin si le problème persiste`;
      } else if (error.response?.status === 413) {
        errorMessage = `📦 Fichier trop volumineux.\n\n`;
        errorMessage += `Le serveur refuse de traiter un fichier de cette taille.\n`;
        errorMessage += `💡 Divisez votre export en plusieurs parties.`;
      } else if (error.response?.status === 429) {
        errorMessage = `🚫 Trop de requêtes.\n\n`;
        errorMessage += `Vous avez dépassé la limite de requêtes.\n`;
        errorMessage += `💡 Attendez 15 minutes avant de réessayer.`;
      } else if (error.response?.status === 500) {
        errorMessage = `⚙️ Erreur serveur 500.\n\n`;
        errorMessage += `Le serveur a rencontré une erreur interne.\n`;
        errorMessage += `💡 Réessayez dans quelques minutes ou contactez l'administrateur.`;
      } else if (error.response?.status === 502 || error.response?.status === 503 || error.response?.status === 504) {
        errorMessage = `🌐 Serveur indisponible.\n\n`;
        errorMessage += `Le serveur ne répond pas (erreur ${error.response?.status}).\n`;
        errorMessage += `💡 Le serveur Render gratuit peut être en veille. Réessayez dans 30 secondes.`;
      } else {
        errorMessage = error.message || 'Erreur inconnue lors de l\'export';
      }
      
      // Ajouter une suggestion CSV pour les erreurs Excel
      if (format === 'excel' && !errorMessage.includes('CSV')) {
        errorMessage += `\n\n💡 Essayez avec le format CSV (bouton vert) qui est plus stable sur Render gratuit.`;
      }
      
      alert(`❌ Échec de l'export ${format.toUpperCase()}:\n\n${errorMessage}`);
      
    } finally {
      setExportLoading(false);
      setShowProgressModal(false);
    }
  };

  // 📥 TÉLÉCHARGER LE TEMPLATE
  const handleDownloadTemplate = async (format: 'csv' | 'excel') => {
    if (!checkToken()) return;
    
    try {
      if (format === 'csv') {
        // Créer le template CSV directement
        const csvTemplate = `LIEU D'ENROLEMENT,SITE DE RETRAIT,RANGEMENT,NOM,PRENOMS,DATE DE NAISSANCE,LIEU NAISSANCE,CONTACT,DELIVRANCE,CONTACT DE RETRAIT,DATE DE DELIVRANCE
Abidjan Plateau,Yopougon,A1-001,KOUAME,Jean,2001-07-12,Abidjan,01234567,OUI,07654321,2024-11-20
Cocody Centre,2 Plateaux,B2-001,TRAORE,Amina,2015-01-25,Abidjan,09876543,OUI,01234567,2024-11-21
Treichville,Cocody,C3-001,DIALLO,Fatou,1990-03-15,Bouaké,05566778,NON,,2024-11-22`;
        
        const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-import-cartes.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Template Excel via API
        const response = await api.get('/api/import-export/template', {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-import-cartes.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      
      alert(`✅ Template ${format.toUpperCase()} téléchargé !`);
    } catch (error: any) {
      console.error('❌ Erreur téléchargement template:', error);
      alert('❌ Erreur lors du téléchargement du template');
    }
  };

  // 🧪 TEST DE CONNEXION D'EXPORT
  const testExportConnection = async () => {
    try {
      // Tester avec seulement 5 cartes
      const testParams = new URLSearchParams({
        limit: '5',
        test: 'true'
      });
      
      const response = await api.get(`/api/import-export/export/csv?${testParams}`, {
        responseType: 'blob',
        timeout: 10000
      });
      
      const blob = response.data;
      console.log('✅ Test export réussi:', {
        size: blob.size,
        type: blob.type,
        headers: response.headers
      });
      
      if (blob.size < 100) {
        const text = await blob.text();
        console.log('Contenu du test:', text);
        if (text.includes('error') || text.includes('Error')) {
          throw new Error('Le serveur a retourné une erreur: ' + text.substring(0, 100));
        }
      }
      
      alert(`✅ Test export réussi!\nTaille: ${(blob.size / 1024).toFixed(1)}KB\nType: ${blob.type}`);
      return true;
      
    } catch (error: any) {
      console.error('❌ Test export échoué:', error);
      alert(`❌ Test export échoué:\n${error.message}\n\nVérifiez que le serveur backend est bien démarré.`);
      return false;
    }
  };

  const handleUpdateResultats = (nouvellesCartes: Carte[]) => {
    console.log('🔄 Mise à jour des résultats:', nouvellesCartes.length, 'cartes');
    
    // Debug: compter les cartes avec DELIVRANCE
    const cartesAvecDelivrance = nouvellesCartes.filter(carte => 
      carte.DELIVRANCE && carte.DELIVRANCE.toString().trim() !== ''
    );
    console.log('📝 Cartes avec DELIVRANCE:', cartesAvecDelivrance.length);
    
    setResultats(nouvellesCartes);
    setHasModifications(true);
  };

  // 🗑️ RÉINITIALISER LES CRITÈRES
  const handleReset = () => {
    setCriteres({
      nom: "",
      prenom: "",
      contact: "",
      siteRetrait: "",
      lieuNaissance: "",
      dateNaissance: "",
      rangement: ""
    });
    setResultats([]);
    setTotalResultats(0);
    setCurrentPage(1);
    setTotalPages(1);
  };

  // ✅ CHANGEMENT DE PAGE
  const handlePageChange = (newPage: number) => {
    if (hasModifications) {
      const confirmChange = window.confirm(
        "Vous avez des modifications non sauvegardées. Voulez-vous continuer sans sauvegarder ?"
      );
      if (!confirmChange) return;
    }
    handleRecherche(newPage);
  };

  // 🔄 CHANGER LE FORMAT D'EXPORT
  const handleExportFormatChange = (format: 'csv' | 'excel') => {
    setExportFormat(format);
    alert(`Format d'export changé : ${format.toUpperCase()}\n\n` +
          (format === 'csv' 
            ? '✅ CSV recommandé : Rapide, léger, stable sur Render gratuit'
            : '⚠️ Excel : Plus lent, plus lourd, peut échouer sur les gros fichiers'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role={role} />
      
      {/* 🎯 EN-TÊTE PROFESSIONNEL */}
      <div className="bg-white border-b border-gray-200 py-6 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F77F00] rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🔍</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Recherche Avancée des Cartes
              </h1>
              <p className="text-gray-600 mt-1">
                COORDINATION ABIDJAN NORD-COCODY • Rôle: {role}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* 🎛️ CARTE DES CRITÈRES DE RECHERCHE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F77F00] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎯</span>
              </div>
              Critères de Recherche
            </h2>
            
            {/* Indicateur de format d'export */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${exportFormat === 'csv' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                Export: {exportFormat.toUpperCase()}
              </span>
              <button
                onClick={() => handleExportFormatChange(exportFormat === 'csv' ? 'excel' : 'csv')}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                title="Changer le format d'export"
              >
                🔄
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* NOM */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#F77F00]">👤</span> Nom
              </label>
              <input
                type="text"
                value={criteres.nom}
                onChange={(e) => setCriteres({...criteres, nom: e.target.value})}
                placeholder="Rechercher par nom..."
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F77F00] focus:border-[#F77F00] transition-all duration-200"
              />
            </div>

            {/* PRÉNOM */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#0077B6]">👥</span> Prénom
              </label>
              <input
                type="text"
                value={criteres.prenom}
                onChange={(e) => setCriteres({...criteres, prenom: e.target.value})}
                placeholder="Rechercher par prénom..."
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-[#0077B6] transition-all duration-200"
              />
            </div>

            {/* CONTACT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#2E8B57]">📞</span> Contact
              </label>
              <input
                type="text"
                value={criteres.contact}
                onChange={(e) => setCriteres({...criteres, contact: e.target.value})}
                placeholder="Numéro de téléphone..."
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E8B57] focus:border-[#2E8B57] transition-all duration-200"
              />
            </div>

            {/* SITE DE RETRAIT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#F77F00]">🏢</span> Site de Retrait
              </label>
              <SiteDropdown
                multiple={false}
                selectedSites={criteres.siteRetrait}
                onChange={(value) => setCriteres({...criteres, siteRetrait: value as string})}
                placeholder="Sélectionner un site..."
              />
            </div>

            {/* LIEU DE NAISSANCE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#0077B6]">🗺️</span> Lieu de Naissance
              </label>
              <input
                type="text"
                value={criteres.lieuNaissance}
                onChange={(e) => setCriteres({...criteres, lieuNaissance: e.target.value})}
                placeholder="Ville, région..."
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-[#0077B6] transition-all duration-200"
              />
            </div>

            {/* DATE DE NAISSANCE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#2E8B57]">🎂</span> Date de Naissance
              </label>
              <input
                type="date"
                value={criteres.dateNaissance}
                onChange={(e) => setCriteres({...criteres, dateNaissance: e.target.value})}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E8B57] focus:border-[#2E8B57] transition-all duration-200"
              />
            </div>

            {/* RANGEMENT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-[#F77F00]">📦</span> Numéro de Rangement
              </label>
              <input
                type="text"
                value={criteres.rangement}
                onChange={(e) => setCriteres({...criteres, rangement: e.target.value})}
                placeholder="N° de rangement..."
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F77F00] focus:border-[#F77F00] transition-all duration-200"
              />
            </div>

            {/* BOUTON RECHERCHE */}
            <div className="flex items-end">
              <motion.button
                onClick={() => handleRecherche(1)}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 bg-[#F77F00] text-white rounded-lg hover:bg-[#e46f00] disabled:opacity-50 font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Recherche...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Lancer la Recherche
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* BOUTONS ACTION - IMPORT/EXPORT */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 font-medium"
              >
                <span>🗑️</span>
                Réinitialiser
              </motion.button>
              
              {/* Bouton test (debug) */}
              <motion.button
                onClick={testExportConnection}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 font-medium text-sm"
                title="Tester la connexion d'export"
              >
                <span>🧪</span>
                Test Export
              </motion.button>
            </div>
            
            {/* BOUTONS D'IMPORT/EXPORT */}
            <div className="flex flex-wrap gap-3">
              {/* BOUTON IMPORT */}
              {permissions.canImport && (
                <motion.button
                  onClick={() => setShowImportModal(true)}
                  disabled={importLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2.5 bg-[#0077B6] text-white rounded-lg hover:bg-[#005a8c] disabled:opacity-50 transition-all duration-200 flex items-center gap-2 font-medium"
                >
                  {importLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Import...
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      Importer
                    </>
                  )}
                </motion.button>
              )}
              
              {/* BOUTON EXPORT CSV */}
              {permissions.canExport && (
                <motion.button
                  onClick={() => handleExport('csv')}
                  disabled={exportLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium ${
                    exportFormat === 'csv' 
                      ? 'bg-[#2E8B57] text-white hover:bg-[#1e6b47]' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Exporter au format CSV (optimisé pour la performance)"
                >
                  {exportLoading && exportFormat === 'csv' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      CSV...
                    </>
                  ) : (
                    <>
                      <span>📄</span>
                      CSV
                      {exportFormat === 'csv' && <span className="text-xs">✓</span>}
                    </>
                  )}
                </motion.button>
              )}
              
              {/* BOUTON EXPORT EXCEL */}
              {permissions.canExport && (
                <motion.button
                  onClick={() => handleExport('excel')}
                  disabled={exportLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium ${
                    exportFormat === 'excel' 
                      ? 'bg-[#F77F00] text-white hover:bg-[#e46f00]' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Exporter au format Excel (compatibilité)"
                >
                  {exportLoading && exportFormat === 'excel' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Excel...
                    </>
                  ) : (
                    <>
                      <span>📊</span>
                      Excel
                      {exportFormat === 'excel' && <span className="text-xs">✓</span>}
                    </>
                  )}
                </motion.button>
              )}
              
              {/* BOUTON TEMPLATES */}
              {permissions.canImport && (
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2.5 text-[#0077B6] bg-white border border-[#0077B6] rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    <span>📋</span>
                    Templates
                    <span className="text-xs">▼</span>
                  </motion.button>
                  
                  {/* Menu déroulant des templates */}
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button
                      onClick={() => handleDownloadTemplate('csv')}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                    >
                      <span>📄</span>
                      <div>
                        <p className="font-medium text-gray-900">Template CSV</p>
                        <p className="text-xs text-gray-500">Format optimisé</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDownloadTemplate('excel')}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span>📊</span>
                      <div>
                        <p className="font-medium text-gray-900">Template Excel</p>
                        <p className="text-xs text-gray-500">Format compatible</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 📊 RÉSULTATS ET BOUTONS D'EXPORT */}
        {resultats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#F77F00] rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                  Résultats de la Recherche
                </h2>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-semibold text-[#0077B6]">
                    {totalResultats.toLocaleString()} carte{totalResultats > 1 ? 's' : ''} trouvée{totalResultats > 1 ? 's' : ''}
                  </p>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* BOUTONS D'EXPORT RAPIDES */}
              <div className="flex flex-wrap gap-2">
                {permissions.canExport && (
                  <>
                    <motion.button
                      onClick={() => handleExport('csv')}
                      disabled={exportLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-[#2E8B57] text-white rounded-lg hover:bg-[#1e6b47] disabled:opacity-50 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                      title="Exporter au format CSV (optimisé pour la performance)"
                    >
                      <span>📄</span>
                      CSV ({resultats.length})
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleExport('excel')}
                      disabled={exportLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-[#F77F00] text-white rounded-lg hover:bg-[#e46f00] disabled:opacity-50 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                      title="Exporter au format Excel"
                    >
                      <span>📊</span>
                      Excel ({resultats.length})
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* ✅ COMPARATEUR DE FORMATS */}
            {totalResultats > 500 && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-blue-600 text-lg">💡</span>
                  <h3 className="font-bold text-blue-800">Conseil d'export</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600">✅</span>
                      <span className="font-semibold text-green-700">CSV (Recommandé)</span>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500 text-xs">⚡</span>
                        <span>10x plus rapide</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500 text-xs">💾</span>
                        <span>80% moins de mémoire</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500 text-xs">📈</span>
                        <span>Supporte 5000+ lignes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500 text-xs">✅</span>
                        <span>Stable sur Render gratuit</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-orange-600">⚠️</span>
                      <span className="font-semibold text-orange-700">Excel (Compatibilité)</span>
                    </div>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="text-orange-500 text-xs">🐌</span>
                        <span>Plus lent (surtout gros fichiers)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-orange-500 text-xs">📊</span>
                        <span>Plus de mémoire utilisée</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-orange-500 text-xs">⚠️</span>
                        <span>Peut échouer sur Render gratuit</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-orange-500 text-xs">💡</span>
                        <span>Pour fichiers &lt;1000 lignes</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* ✅ PAGINATION */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-300">
                <motion.button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  whileHover={{ scale: currentPage <= 1 ? 1 : 1.05 }}
                  className="w-8 h-8 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 transition duration-200 flex items-center justify-center font-bold"
                >
                  ←
                </motion.button>
                
                <span className="px-3 py-1 bg-white border border-gray-300 rounded font-semibold text-gray-700 text-sm">
                  Page {currentPage} / {totalPages}
                </span>
                
                <motion.button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  whileHover={{ scale: currentPage >= totalPages ? 1 : 1.05 }}
                  className="w-8 h-8 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 transition duration-200 flex items-center justify-center font-bold"
                >
                  →
                </motion.button>
              </div>
              
              {/* AFFICHAGE DU RÔLE ET PERMISSIONS */}
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {permissions.canModifyData ? '✏️ Mode édition' : '👀 Mode consultation'}
                {permissions.canImport && ' • 📤 Import'}
                {permissions.canExport && ' • 📥 Export'}
              </div>
            </div>

            {/* TABLEAU DES RÉSULTATS */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <TableCartesExcel 
                cartes={resultats}
                role={role}
                onUpdateCartes={handleUpdateResultats}
                canEdit={permissions.canModifyData}
              />
            </div>

            {/* BOUTON SAUVEGARDER */}
            {hasModifications && permissions.canModifyData && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex justify-end"
              >
                <motion.button
                  onClick={handleSaveModifications}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 bg-[#F77F00] text-white rounded-lg hover:bg-[#e46f00] font-semibold transition-all duration-200 shadow-sm flex items-center gap-2"
                >
                  <span>💾</span>
                  Enregistrer les modifications
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 🎯 MESSAGE AUCUN RÉSULTAT */}
        {resultats.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Aucune carte trouvée
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Utilisez les critères de recherche ci-dessus pour trouver des cartes spécifiques.
              {totalResultats > 0 && ` (${totalResultats} cartes au total dans la base)`}
            </p>
            
            {/* BOUTONS D'IMPORT/EXPORT QUAND AUCUN RÉSULTAT */}
            {(permissions.canImport || permissions.canExport) && (
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {permissions.canImport && (
                  <motion.button
                    onClick={() => setShowImportModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#005a8c] transition-all duration-200 flex items-center gap-2"
                  >
                    <span>📤</span>
                    Importer des cartes
                  </motion.button>
                )}
                
                {permissions.canExport && totalResultats > 0 && (
                  <>
                    <motion.button
                      onClick={() => handleExport('csv')}
                      disabled={exportLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-[#2E8B57] text-white rounded-lg hover:bg-[#1e6b47] disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                      title="Exporter toutes les cartes en CSV"
                    >
                      {exportLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Export...
                        </>
                      ) : (
                        <>
                          <span>📄</span>
                          Exporter CSV ({totalResultats})
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleExport('excel')}
                      disabled={exportLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-[#F77F00] text-white rounded-lg hover:bg-[#e46f00] disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                      title="Exporter toutes les cartes en Excel"
                    >
                      {exportLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Export...
                        </>
                      ) : (
                        <>
                          <span>📊</span>
                          Exporter Excel ({totalResultats})
                        </>
                      )}
                    </motion.button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* 📱 LOADING */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-3 border-[#F77F00] border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-gray-900 font-semibold">Recherche en cours...</p>
                <p className="text-gray-500 text-sm mt-1">Veuillez patienter</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ✅ MODAL D'IMPORT - AVEC SUPPORT CSV */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportMode('standard');
        }}
        onFileSelect={handleImportFromModal}
        isImporting={importLoading}
        mode={importMode}
        onModeChange={setImportMode}
      />

      {/* 📊 MODAL DE PROGRESSION D'EXPORT */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#F77F00] rounded-lg flex items-center justify-center">
                  <span className="text-white">📤</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Export en cours...
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {exportFormat === 'csv' ? 'Génération du fichier CSV' : 'Génération du fichier Excel'}
                  </p>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-700 mb-1">
                  <span>Progression</span>
                  <span>{exportProgress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <motion.div 
                    className="bg-[#F77F00] h-2.5 rounded-full transition-all duration-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${exportProgress.percentage}%` }}
                  ></motion.div>
                </div>
              </div>
              
              {/* Informations de progression */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-500 mb-1">Vitesse</div>
                  <div className="font-semibold">{exportProgress.speed}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-500 mb-1">Temps restant</div>
                  <div className="font-semibold">{exportProgress.estimatedTime || 'Calcul...'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-500 mb-1">Téléchargé</div>
                  <div className="font-semibold">{(exportProgress.loaded / 1024).toFixed(1)} KB</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-500 mb-1">Format</div>
                  <div className="font-semibold">{exportFormat.toUpperCase()}</div>
                </div>
              </div>
              
              {/* Conseils */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-blue-800 text-sm">
                  <span>💡</span>
                  <span>
                    {exportFormat === 'csv' 
                      ? 'Le CSV est optimisé pour Render gratuit (rapide et stable)'
                      : 'Excel est plus lent, utilisez CSV pour les gros fichiers'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowProgressModal(false);
                    // Note: On ne peut pas vraiment annuler une requête fetch en cours facilement
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Fermer (l'export continue)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Inventaire;