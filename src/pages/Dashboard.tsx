import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import cartesService from "../service/CartesService";
import type { StatistiquesGlobales, StatistiqueSite } from "../service/CartesService";

const Dashboard: React.FC = () => {
  const [statistiquesGlobales, setStatistiquesGlobales] = useState<StatistiquesGlobales>({
    total: 0,
    retires: 0,
    restants: 0
  });
  
  const [statistiquesSites, setStatistiquesSites] = useState<StatistiqueSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [refreshCount, setRefreshCount] = useState(0);
  
  const role = localStorage.getItem("role") || "";
  const token = localStorage.getItem("token") || "";

  // Détection responsive
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Détection connexion internet
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const CarteStatistique: React.FC<{
    titre: string;
    valeur: number;
    sousTitre: string;
    couleur: 'orange' | 'bleu' | 'vert';
    delai: number;
  }> = ({ titre, valeur, sousTitre, couleur, delai }) => {
    const gradients = {
      orange: 'from-[#F77F00] to-[#FF9E40]',
      bleu: 'from-[#0077B6] to-[#2E8B57]',
      vert: 'from-[#2E8B57] to-[#0077B6]'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: delai }}
        whileHover={!isMobile ? { scale: 1.03, y: -5 } : {}}
        className={`relative overflow-hidden backdrop-blur-lg border-2 ${
          couleur === 'orange' ? 'border-orange-300' : 
          couleur === 'bleu' ? 'border-blue-300' : 
          'border-green-300'
        } rounded-xl ${isMobile ? 'p-4' : 'rounded-2xl p-6'} shadow-lg bg-gradient-to-br ${
          gradients[couleur]
        } transition-all duration-300`}
      >
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-white/10 to-white/5 z-1"></div>
        <div className="relative z-2">
          <h3 className={`text-white font-semibold mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
            {titre}
          </h3>
          <div className={`font-bold text-white mb-1 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
            {valeur.toLocaleString()}
          </div>
          <p className={`text-white/90 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {sousTitre}
          </p>
        </div>
      </motion.div>
    );
  };

  const CarteSite: React.FC<{ data: StatistiqueSite; index: number }> = ({ data, index }) => {
    const pourcentage = data.total > 0 ? Math.round((data.retires / data.total) * 100) : 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.08 }}
        whileHover={!isMobile ? { scale: 1.02, y: -3 } : {}}
        className={`bg-white/95 backdrop-blur-lg border-2 border-orange-200 rounded-xl ${
          isMobile ? 'p-4' : 'p-6'
        } shadow-md hover:shadow-lg transition-all duration-300`}
      >
        <h3 
          className={`text-[#F77F00] font-bold mb-3 truncate border-b-2 border-orange-100 pb-2 ${
            isMobile ? 'text-base' : 'text-lg'
          }`}
          title={data.site}
        >
          {data.site}
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-blue-50 rounded-lg p-2 md:p-3">
            <span className={`text-gray-700 font-medium ${isMobile ? 'text-sm' : ''}`}>
              Total des cartes
            </span>
            <span className={`text-[#0077B6] font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>
              {data.total.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center bg-green-50 rounded-lg p-2 md:p-3">
            <span className={`text-gray-700 font-medium ${isMobile ? 'text-sm' : ''}`}>
              Cartes retirées
            </span>
            <span className={`text-[#2E8B57] font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>
              {data.retires.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center bg-orange-50 rounded-lg p-2 md:p-3">
            <span className={`text-gray-700 font-medium ${isMobile ? 'text-sm' : ''}`}>
              Cartes restantes
            </span>
            <span className={`text-[#F77F00] font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>
              {data.restants.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-gray-600 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Progression
            </span>
            <span className={`font-bold text-[#F77F00] ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {pourcentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pourcentage}%` }}
              transition={{ duration: 0.8, delay: index * 0.08 + 0.3 }}
              className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] h-2 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const fetchStatistiques = useCallback(async (force: boolean = false) => {
    if (!isOnline && !force) {
      setError("Vous êtes hors ligne. Impossible de rafraîchir les données.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      if (!token) {
        throw new Error('Token non trouvé');
      }

      console.log('🔄 Chargement des statistiques...');
      
      const { globales, sites } = force 
        ? await cartesService.forceRefreshAndGetStats()
        : await cartesService.refreshStatistiques();
      
      setStatistiquesGlobales(globales);
      setStatistiquesSites(sites);
      setLastUpdate(new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }));
      setRefreshCount(prev => prev + 1);
      
      if (force) {
        localStorage.removeItem('forceStatsRefresh');
      }
      
    } catch (err: any) {
      console.error("❌ Erreur chargement statistiques:", err);
      setError(err.message || "Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  }, [token, isOnline]);

  // 🔄 CHARGEMENT INITIAL
  useEffect(() => {
    fetchStatistiques();
  }, [fetchStatistiques]);

  // 🔄 SYNCHRONISATION AUTOMATIQUE TOUTES LES 5 MINUTES
  useEffect(() => {
    const interval = setInterval(() => fetchStatistiques(), 300000);
    return () => clearInterval(interval);
  }, [fetchStatistiques]);

  // 🔄 ÉCOUTEUR D'ÉVÉNEMENTS
  useEffect(() => {
    const handleRefreshEvent = (event: any) => {
      const force = event.detail?.force || localStorage.getItem('forceStatsRefresh') === 'true';
      fetchStatistiques(force);
    };

    window.addEventListener('dashboardRefreshNeeded', handleRefreshEvent);
    
    return () => {
      window.removeEventListener('dashboardRefreshNeeded', handleRefreshEvent);
    };
  }, [fetchStatistiques]);

  // 🔄 BROADCAST CHANNEL
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('dashboard_updates');
      
      channel.onmessage = (event) => {
        if (event.data.type === 'data_updated') {
          const force = event.data.forceRefresh || false;
          fetchStatistiques(force);
        }
      };
      
      return () => channel.close();
    }
  }, [fetchStatistiques]);

  const totalCartesSites = statistiquesSites.reduce((sum, site) => sum + site.total, 0);
  const isDataConsistent = totalCartesSites === statistiquesGlobales.total;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Navbar role={role} />
      
      {/* Notification hors ligne */}
      {!isOnline && (
        <div className="bg-yellow-100 text-yellow-800 py-2 px-4 text-center text-sm font-medium">
          ⚠️ Mode hors ligne - Données en cache
        </div>
      )}

      {/* Header principal */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 py-3 md:py-4 shadow-sm">
        <div className={`${isMobile ? 'px-4' : 'container mx-auto px-6'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`${
                isMobile ? 'w-10 h-10' : 'w-12 h-12'
              } bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-lg md:rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold">📊</span>
              </div>
              <div>
                <h1 className={`font-bold text-gray-900 ${
                  isMobile ? 'text-lg' : 'text-xl md:text-2xl'
                }`}>
                  Tableau de Bord
                </h1>
                <p className={`text-gray-600 ${
                  isMobile ? 'text-xs' : 'text-sm'
                } ${isMobile ? 'hidden' : ''}`}>
                  COORDINATION ABIDJAN NORD-COCODY
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              {!isMobile && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium text-sm">
                    Données en temps réel
                  </span>
                </div>
              )}
              
              {!isMobile && lastUpdate && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Dernière mise à jour</div>
                  <div className="text-sm font-bold text-[#F77F00]">{lastUpdate}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`${isMobile ? 'p-3' : 'p-4 md:p-6'} min-h-screen`}>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            ⚠️ {error}
          </motion.div>
        )}

        {loading ? (
          <div className={`bg-white/80 backdrop-blur-lg rounded-xl border-2 border-orange-200 ${
            isMobile ? 'p-6' : 'p-8'
          } shadow-lg text-center`}>
            <div className="flex flex-col items-center gap-4">
              <div className={`${
                isMobile ? 'w-12 h-12' : 'w-16 h-16'
              } border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin`}></div>
              <div>
                <p className={`text-gray-900 font-bold ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}>
                  Chargement des statistiques
                </p>
                <p className={`text-gray-600 mt-1 ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  Calcul en cours...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {/* Section Statistiques Globales */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white/80 backdrop-blur-lg rounded-xl md:rounded-2xl border-2 border-orange-200 ${
                isMobile ? 'p-4' : 'p-6'
              } shadow-lg`}
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className={`${
                  isMobile ? 'w-8 h-8' : 'w-10 h-10'
                } bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-lg flex items-center justify-center shadow-md`}>
                  <span className="text-white">🌍</span>
                </div>
                <div>
                  <h2 className={`font-bold text-gray-900 ${
                    isMobile ? 'text-lg' : 'text-xl md:text-2xl'
                  }`}>
                    Statistique Globale
                  </h2>
                  <p className={`text-gray-600 ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>
                    Vue d'ensemble de toutes les cartes distribuées
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <CarteStatistique
                  titre="Total des Cartes"
                  valeur={statistiquesGlobales.total}
                  sousTitre={isMobile ? "Cartes totales" : "Nombre total de cartes distribuées"}
                  couleur="orange"
                  delai={0.1}
                />
                
                <CarteStatistique
                  titre="Cartes Retirées"
                  valeur={statistiquesGlobales.retires}
                  sousTitre={isMobile ? "Retrait effectué" : "Cartes avec délivrance complétée"}
                  couleur="bleu"
                  delai={0.2}
                />
                
                <CarteStatistique
                  titre="Cartes Restantes"
                  valeur={statistiquesGlobales.restants}
                  sousTitre={isMobile ? "Disponibles" : "Cartes disponibles au retrait"}
                  couleur="vert"
                  delai={0.3}
                />
              </div>

              {isDataConsistent && !isMobile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ✅ Données cohérentes : Total global = Somme des sites
                </motion.div>
              )}
            </motion.section>

            {/* Section Statistiques par Site */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`bg-white/80 backdrop-blur-lg rounded-xl md:rounded-2xl border-2 border-blue-200 ${
                isMobile ? 'p-4' : 'p-6'
              } shadow-lg`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className={`${
                    isMobile ? 'w-8 h-8' : 'w-10 h-10'
                  } bg-gradient-to-br from-[#0077B6] to-[#2E8B57] rounded-lg flex items-center justify-center shadow-md`}>
                    <span className="text-white">🏢</span>
                  </div>
                  <div>
                    <h2 className={`font-bold text-gray-900 ${
                      isMobile ? 'text-lg' : 'text-xl md:text-2xl'
                    }`}>
                      Statistiques par Site
                    </h2>
                    <p className={`text-gray-600 ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      {statistiquesSites.length} {statistiquesSites.length === 1 ? 'site actif' : 'sites actifs'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-3">
                  {isMobile && lastUpdate && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Mise à jour</div>
                      <div className="text-sm font-bold text-[#F77F00]">{lastUpdate}</div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => fetchStatistiques(true)}
                    className={`bg-gradient-to-br from-[#F77F00] to-[#FF9E40] text-white rounded-lg hover:shadow-lg font-medium transition duration-200 flex items-center gap-2 shadow-md ${
                      isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'
                    }`}
                  >
                    <span>🔄</span>
                    {isMobile ? 'Actualiser' : 'Rafraîchir'}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {statistiquesSites.length > 0 ? (
                  <div className={`grid gap-4 ${
                    isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  }`}>
                    {statistiquesSites.map((site, index) => (
                      <CarteSite
                        key={site.site}
                        data={site}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-center ${
                      isMobile ? 'py-8' : 'py-12'
                    } bg-orange-50/50 backdrop-blur-sm rounded-xl border-2 border-orange-200`}
                  >
                    <div className={`${
                      isMobile ? 'w-16 h-16' : 'w-20 h-20'
                    } bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner`}>
                      <span className="text-2xl md:text-3xl">🏢</span>
                    </div>
                    <p className={`text-gray-600 mb-2 font-medium ${
                      isMobile ? 'text-base' : 'text-lg'
                    }`}>
                      Aucun site de retrait trouvé
                    </p>
                    <p className={`text-gray-500 ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      Les données apparaîtront ici une fois disponibles
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Bouton flottant de rafraîchissement mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-20 right-4 z-40"
              >
                <button
                  onClick={() => fetchStatistiques(true)}
                  className="bg-gradient-to-br from-[#F77F00] to-[#FF9E40] text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 flex items-center justify-center"
                  title="Rafraîchir"
                >
                  <span className="text-lg">🔄</span>
                </button>
              </motion.div>
            )}

            {/* Stats footer pour desktop */}
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="fixed bottom-6 right-6 flex flex-col items-end gap-3"
              >
                <div className="bg-white/90 backdrop-blur-lg border-2 border-green-200 rounded-xl px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-600">Synchronisation</div>
                      <div className="text-sm font-bold text-green-600">Toutes les 5 min</div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => fetchStatistiques(true)}
                  className="bg-gradient-to-br from-[#F77F00] to-[#FF9E40] text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
                  title="Rafraîchir maintenant"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </motion.div>
            )}

            {/* Information de bas de page mobile */}
            {isMobile && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Données mises à jour : {lastUpdate}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Rafraîchissements : {refreshCount} • {statistiquesSites.length} sites
                  </div>
                  {!isOnline && (
                    <div className="text-xs text-yellow-600">
                      ⚠️ Mode hors ligne - Données limitées
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;