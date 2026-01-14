import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MotivationQuotes from "../components/MotivationQuotes";
import WelcomeMessage from "../components/WelcomeMessage";
import CoordinationInfo from "../components/CoordinationInfo";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  
  const nomComplet = localStorage.getItem("NomComplet") || "";
  const agence = localStorage.getItem("Agence") || "";
  const role = localStorage.getItem("role") || "";

  // Détection responsive
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Formatage date/heure responsive
  const formattedDate = isMobile 
    ? currentTime.toLocaleDateString('fr-FR', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      })
    : currentTime.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Recherche rapide
  const handleQuickSearch = () => {
    navigate("/inventaire");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar role={role} />
      
      {/* Espace pour la navbar fixe */}
      <div className="h-16"></div>
      
      {/* CITATIONS DE MOTIVATION */}
      <div className={`${isMobile ? 'px-3' : 'px-6'}`}>
        <MotivationQuotes />
      </div>

      {/* EN-TÊTE PRINCIPAL - Responsive */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white shadow-lg"
      >
        <div className={`${isMobile ? 'px-4 py-4' : 'container mx-auto px-6 py-6'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Informations utilisateur */}
            <div className="flex-1 space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm`}>
                  <span className={isMobile ? 'text-lg' : 'text-xl'}>🏠</span>
                </div>
                <div>
                  <h1 className={`font-bold ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                    Tableau de Bord
                  </h1>
                  {isMobile && (
                    <p className="text-xs text-white/80 mt-1">
                      COORDINATION ABIDJAN NORD-COCODY
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={isMobile ? 'text-base' : 'text-xl'}>👋</span>
                  <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-white/90`}>
                    Bienvenue, <span className="font-semibold text-white">{nomComplet.split(' ')[0]}</span>
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'} bg-white/20 rounded-lg backdrop-blur-sm flex items-center gap-1`}>
                    <span>🏢</span> {agence}
                  </span>
                  <span className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'} bg-white/20 rounded-lg backdrop-blur-sm flex items-center gap-1`}>
                    <span>🎯</span> {role}
                  </span>
                  {!isMobile && (
                    <span className="text-sm px-3 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
                      COORDINATION ABIDJAN NORD-COCODY
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* DATE ET HEURE - Responsive */}
            <motion.div 
              className={`${isMobile ? 'w-full' : 'min-w-[200px]'} ${isMobile ? 'mt-4' : ''}`}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30">
                <div className="flex items-center justify-center gap-2 text-white/90 mb-1">
                  <span>📅</span>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                    {formattedDate}
                  </span>
                </div>
                <div className={`font-bold text-white font-mono ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  {formattedTime}
                </div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70 mt-1`}>
                  Mise à jour en temps réel
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* CONTENU PRINCIPAL */}
      <div className={`${isMobile ? 'p-3' : 'container mx-auto px-4 md:px-6 py-6 md:py-8'}`}>
        
        {/* RECHERCHE RAPIDE - Version mobile simplifiée */}
        {isMobile ? (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div 
              onClick={handleQuickSearch}
              className="bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-xl p-4 text-white shadow-lg relative overflow-hidden active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🔍</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Recherche Rapide</h3>
                    <p className="text-xs text-white/80">Appuyer pour lancer</p>
                  </div>
                </div>
                <span className="text-white/60">→</span>
              </div>
            </div>
          </motion.section>
        ) : (
          // Version desktop améliorée
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <Link to="/inventaire">
              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  y: -2,
                  boxShadow: "0 12px 40px rgba(0, 119, 182, 0.15)"
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-white rounded-2xl p-5 shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0077B6] to-[#00A8E8] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-200 transition-shadow duration-300">
                        <span className="text-white text-lg">🔍</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white group-hover:animate-ping"></div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#0077B6] transition-colors duration-300">
                        Recherche Avancée
                      </h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                        Accès direct à l'outil de recherche
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-gray-400 group-hover:text-[#0077B6] transform group-hover:translate-x-1 transition-all duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <div className="relative z-10 mt-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: "👤", label: "Nom" },
                      { icon: "📞", label: "Contact" },
                      { icon: "🏢", label: "Site" },
                      { icon: "🗺️", label: "Lieu" },
                      { icon: "🎂", label: "Date" },
                      { icon: "📦", label: "Rangement" }
                    ].map((field, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-xs text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-all duration-300"
                      >
                        <span className="text-xs">{field.icon}</span>
                        <span>{field.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    + de nombreux autres critères disponibles
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.section>
        )}

        {/* SECTION PRINCIPALE - 2 COLONNES */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* COLONNE GAUCHE - MESSAGE DE BIENVENUE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <WelcomeMessage />
          </motion.div>

          {/* COLONNE DROITE - INFORMATIONS COORDINATION */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CoordinationInfo />
          </motion.div>
        </motion.div>

        {/* SECTION RECHERCHE AVANCÉE - Version responsive */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`${isMobile ? 'mb-6' : 'max-w-5xl mx-auto mb-8'}`}
        >
          <div className={`bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-xl ${isMobile ? 'p-4' : 'rounded-2xl p-6 md:p-8'} text-white shadow-xl relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            
            <div className="flex flex-col items-center gap-4 md:gap-6 relative z-10">
              <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16 md:w-20 md:h-20'} bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm`}>
                <span className={isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'}>🔍</span>
              </div>
              
              <div className="text-center">
                <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} mb-2`}>
                  Recherche Avancée des Cartes
                </h2>
                <p className={`${isMobile ? 'text-xs' : 'text-base md:text-lg'} text-blue-100 mb-4 md:mb-6 max-w-2xl leading-relaxed`}>
                  Trouvez rapidement les cartes grâce à des critères multiples et précis.
                </p>
              </div>

              {/* GRILLE RESPONSIVE */}
              <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-4 gap-3 md:gap-4'} mb-4 md:mb-6 w-full max-w-3xl`}>
                {[
                  { icon: "👤", text: "Nom/Prénom" },
                  { icon: "📞", text: "Contact" },
                  { icon: "🏢", text: "Site Retrait" },
                  { icon: "🗺️", text: "Lieu Naissance" },
                  { icon: "🎂", text: "Date Naissance" },
                  { icon: "📦", text: "Rangement" },
                  { icon: "📊", text: "Filtres Avancés" },
                  { icon: "💾", text: "Export Excel" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: isMobile ? 1 : 1.05, y: isMobile ? 0 : -2 }}
                    className={`bg-white/10 rounded-lg ${isMobile ? 'p-2' : 'p-3 md:p-4'} text-center backdrop-blur-sm border border-white/20`}
                  >
                    <div className={`${isMobile ? 'text-xl mb-1' : 'text-2xl mb-2'}`}>{item.icon}</div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-white/90`}>{item.text}</div>
                  </motion.div>
                ))}
              </div>

              <Link to="/inventaire" className="w-full max-w-md">
                <motion.button
                  whileHover={{ scale: isMobile ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full bg-white text-[#0077B6] ${isMobile ? 'px-4 py-3 rounded-lg text-sm font-semibold' : 'px-6 py-4 rounded-xl font-bold text-lg md:text-xl'} hover:bg-gray-50 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 md:gap-4 border border-blue-200`}
                >
                  <span className={isMobile ? 'text-lg' : 'text-2xl'}>🚀</span>
                  {isMobile ? 'Recherche Avancée' : 'Accéder à la Recherche Avancée'}
                  <span className={isMobile ? 'text-lg' : 'text-2xl'}>→</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* INFORMATIONS DE CONTACT - Responsive */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`${isMobile ? 'mb-4' : 'max-w-4xl mx-auto'}`}
        >
          <div className={`bg-white/90 backdrop-blur-lg ${isMobile ? 'rounded-lg p-4' : 'rounded-2xl p-6'} shadow-lg border border-orange-100`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-lg flex items-center justify-center shadow`}>
                <span className="text-white text-lg">🏢</span>
              </div>
              <div>
                <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-base' : 'text-xl'}`}>
                  Coordination ABIDJAN NORD-COCODY
                </h3>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Votre partenaire de confiance
                </p>
              </div>
            </div>
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-3 gap-4'}`}>
              {[
                { 
                  icon: "📞", 
                  title: "07 76 73 51 15", 
                  subtitle: "Contact Direct",
                  color: "bg-orange-50 border-orange-200",
                  iconColor: "text-[#F77F00]"
                },
                { 
                  icon: "👤", 
                  title: "ÉliteMultiservices", 
                  subtitle: "Gestionnaire",
                  color: "bg-blue-50 border-blue-200", 
                  iconColor: "text-[#0077B6]"
                },
                { 
                  icon: "✅", 
                  title: "Système Opérationnel", 
                  subtitle: "Statut Plateforme",
                  color: "bg-green-50 border-green-200",
                  iconColor: "text-[#2E8B57]"
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: isMobile ? 1 : 1.02 }}
                  className={`${item.color} rounded-lg ${isMobile ? 'p-3' : 'p-4'} border text-center`}
                >
                  <div className={`${isMobile ? 'text-xl' : 'text-2xl'} mb-2 ${item.iconColor}`}>{item.icon}</div>
                  <div className={`font-semibold text-gray-800 ${isMobile ? 'text-sm' : 'text-lg'}`}>{item.title}</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 mt-1`}>{item.subtitle}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;