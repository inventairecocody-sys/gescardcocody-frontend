import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  role?: string;
}

const Navbar: React.FC<NavbarProps> = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userRole, setUserRole] = useState("Operateur");
  
  // ✅ Détection responsive améliorée
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      // Breakpoints précis
      if (width < 640) setIsMobile(true); // xs
      else if (width < 768) setIsMobile(true); // sm
      else if (width < 1024) setIsMobile(false); // md
      else setIsMobile(false); // lg et +
    };
    
    // Détection du scroll pour l'effet de transparence
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);
    
    // ✅ Récupération du rôle utilisateur avec fallback
    const storedRole = role || 
                      localStorage.getItem("role") || 
                      localStorage.getItem("Role") || 
                      "Operateur";
    setUserRole(storedRole);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [role]);

  // ✅ Gestion du clic sur Accueil
  const handleAccueilClick = (e: React.MouseEvent) => {
    if (location.pathname === "/home" || location.pathname === "/dashboard") {
      e.preventDefault();
      window.location.reload();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActiveLink = (path: string) => {
    if (path === "/home") {
      return location.pathname === "/home" || location.pathname === "/dashboard";
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    // ✅ Nettoyage complet du localStorage
    const itemsToRemove = [
      "token", "role", "Role", 
      "NomUtilisateur", "nomUtilisateur",
      "NomComplet", "nomComplet",
      "Agence", "agence",
      "Email", "email",
      "userId", "loginTime"
    ];
    
    itemsToRemove.forEach(item => localStorage.removeItem(item));
    
    // ✅ Redirection vers la page de connexion
    navigate("/");
  };

  // ✅ CONFIGURATION DES ACCÈS PAR RÔLE
  const canAccessDashboard = ["Administrateur", "Superviseur"].includes(userRole);
  const canAccessProfil = true; // Tous les rôles ont accès au profil

  // ✅ Navigation items
  const navItems = [
    {
      path: "/home",
      label: "Accueil",
      icon: "🏠",
      color: "from-orangeMain to-orangeSecondary",
      hoverColor: "hover:bg-orange-50 hover:text-orangeMain",
      accessible: true,
      onClick: handleAccueilClick
    },
    {
      path: "/inventaire",
      label: "Recherche",
      icon: "🔍",
      color: "from-blueMain to-greenMain",
      hoverColor: "hover:bg-blue-50 hover:text-blueMain",
      accessible: true
    },
    {
      path: "/dashboard",
      label: "Tableau de Bord",
      icon: "📊",
      color: "from-greenMain to-blueMain",
      hoverColor: "hover:bg-green-50 hover:text-greenMain",
      accessible: canAccessDashboard
    },
    {
      path: "/profil",
      label: "Profil",
      icon: "👤",
      color: "from-orangeMain to-blueMain",
      hoverColor: "hover:bg-orange-50 hover:text-orangeMain",
      accessible: canAccessProfil
    }
  ];

  // ✅ Récupérer le prénom pour l'affichage
  const getFirstName = () => {
    const nomComplet = localStorage.getItem("nomComplet") || localStorage.getItem("NomComplet") || "";
    return nomComplet.split(' ')[0] || "Utilisateur";
  };

  // ✅ Classes dynamiques pour la navbar
  const navbarClasses = `
    fixed top-0 left-0 right-0 z-50 
    transition-all duration-300 ease-in-out
    ${isScrolled 
      ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100' 
      : 'bg-white/90 backdrop-blur-md border-b border-gray-100'
    }
  `;

  return (
    <>
      <nav className={navbarClasses}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo et titre - Responsive amélioré */}
            <div className="flex items-center flex-shrink-0 gap-2 md:gap-3">
              {/* Logo */}
              <div className="relative">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-orangeMain to-blueMain rounded-lg md:rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-sm md:text-base">🎴</span>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-greenMain rounded-full border border-white animate-pulse"></div>
              </div>
              
              {/* Titre */}
              <div className="text-left">
                <span className={`font-bold bg-gradient-to-r from-orangeMain to-blueMain bg-clip-text text-transparent ${
                  isMobile ? 'text-sm' : 'text-base md:text-lg lg:text-xl'
                }`}>
                  {isMobile ? 'GESCARD' : 'Gestion des Cartes'}
                </span>
                <span className={`text-gray-500 ${
                  isMobile ? 'hidden' : 'block text-xs md:text-sm truncate max-w-[200px] lg:max-w-none'
                }`}>
                  ABIDJAN NORD-COCODY • ÉliteMultiservices
                </span>
              </div>
            </div>

            {/* Indicateur de rôle - Desktop seulement */}
            {!isMobile && (
              <div className="hidden md:flex items-center mx-3 lg:mx-4 px-3 py-1 bg-gradient-to-r from-orangeMain/10 to-blueMain/10 rounded-full border border-orangeMain/20">
                <span className="text-xs font-semibold text-orangeMain">
                  {userRole}
                </span>
              </div>
            )}

            {/* Menu de navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-3 flex-1 justify-center">
              {navItems.filter(item => item.accessible).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={item.onClick}
                  className={`relative px-3 lg:px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm lg:text-base ${
                    isActiveLink(item.path)
                      ? `text-white bg-gradient-to-r ${item.color} shadow-lg`
                      : `text-gray-700 ${item.hoverColor}`
                  }`}
                >
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {isActiveLink(item.path) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-white rounded-full"
                    />
                  )}
                </Link>
              ))}
              
              {/* Bouton Déconnexion - Desktop */}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold shadow hover:shadow-lg transition-all duration-300 ml-1 lg:ml-2"
                title="Déconnexion"
                aria-label="Déconnexion"
              >
                <span className="flex items-center gap-2">
                  <span>🚪</span>
                  <span>Déconnexion</span>
                </span>
              </motion.button>
            </div>

            {/* Menu Burger et info mobile */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Indicateur de rôle - Mobile */}
              <div className="px-2 py-1 bg-gradient-to-r from-orangeMain/10 to-blueMain/10 rounded-full border border-orangeMain/20">
                <span className="text-xs font-semibold text-orangeMain">
                  {userRole.length > 8 ? userRole.substring(0, 6) + '...' : userRole}
                </span>
              </div>
              
              {/* Bouton déconnexion mobile */}
              <motion.button
                onClick={handleLogout}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow"
                title="Déconnexion"
                aria-label="Déconnexion"
              >
                <span className="text-base">🚪</span>
              </motion.button>
              
              {/* Menu burger */}
              <motion.button
                onClick={toggleMenu}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-xl shadow-lg ${
                  isMenuOpen 
                    ? 'bg-gradient-to-r from-orangeMain to-orangeSecondary text-white' 
                    : 'bg-gradient-to-r from-blueMain to-greenMain text-white'
                }`}
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMenuOpen}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  {isMenuOpen ? '✕' : '☰'}
                </div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* OVERLAY FONCÉ POUR LE MENU MOBILE */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Menu Mobile - CORRECTION : FOND SOLIDE */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="md:hidden bg-white shadow-2xl border-t border-gray-200 absolute top-full left-0 right-0 overflow-hidden z-50"
              style={{ maxHeight: "calc(100vh - 56px)" }}
              aria-label="Menu de navigation mobile"
            >
              <div className="py-2 px-2 space-y-1 max-h-[70vh] overflow-y-auto">
                {navItems.filter(item => item.accessible).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(e) => {
                      if (item.onClick) item.onClick(e);
                      setIsMenuOpen(false);
                    }}
                    className={`block px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                      isActiveLink(item.path)
                        ? `text-white bg-gradient-to-r ${item.color} shadow-lg`
                        : `text-gray-700 bg-gray-50 hover:bg-gray-100`
                    }`}
                    aria-current={isActiveLink(item.path) ? "page" : undefined}
                  >
                    <span className="flex items-center justify-between">
                      <span className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      {isActiveLink(item.path) && (
                        <motion.div
                          layoutId="mobile-navbar-indicator"
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </span>
                  </Link>
                ))}
                
                {/* ✅ Informations utilisateur améliorées */}
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl">
                    <div className="text-xs text-gray-600 mb-1">
                      Connecté en tant que
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-orangeMain">
                        {userRole}
                      </div>
                      <div className="text-xs text-blueMain font-medium">
                        {getFirstName()}
                      </div>
                    </div>
                    
                    {/* ✅ Informations supplémentaires */}
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/90 rounded-lg p-2 text-center">
                        <div className="text-gray-500">Agence</div>
                        <div className="font-medium text-gray-800 truncate">
                          {localStorage.getItem("agence")?.substring(0, 12) || "Non spécifiée"}
                        </div>
                      </div>
                      <div className="bg-white/90 rounded-lg p-2 text-center">
                        <div className="text-gray-500">Statut</div>
                        <div className="font-medium text-greenMain">En ligne</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* ✅ Actions rapides */}
                <div className="px-4 py-2">
                  <div className="text-xs text-gray-500 mb-2">Actions rapides</div>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      onClick={() => {
                        navigate("/profil");
                        setIsMenuOpen(false);
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-blueMain/10 to-greenMain/10 border border-blueMain/20 rounded-lg p-3 text-center hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-blueMain text-sm font-medium">👤 Profil</div>
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        navigate("/inventaire");
                        setIsMenuOpen(false);
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-orangeMain/10 to-blueMain/10 border border-orangeMain/20 rounded-lg p-3 text-center hover:bg-orange-50 transition-colors"
                    >
                      <div className="text-orangeMain text-sm font-medium">🔍 Recherche</div>
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* ✅ Pied de menu mobile amélioré */}
              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <div className="text-center space-y-1">
                  <div className="text-xs text-gray-600 font-medium">COORDINATION ABIDJAN NORD-COCODY</div>
                  <div className="text-xs text-gray-500">ÉliteMultiservices</div>
                  <div className="text-xs text-orangeMain font-semibold">📞 07 76 73 51 15</div>
                  <div className="text-xs text-gray-400 mt-1">GESCARD v1.0.0</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* ✅ Espace pour la navbar fixe avec hauteur dynamique */}
      <div className={`${isMobile ? 'h-14' : 'h-16'}`}></div>
    </>
  );
};

export default Navbar;