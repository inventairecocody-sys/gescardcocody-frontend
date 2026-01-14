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
  const [userRole, setUserRole] = useState("Operateur");
  
  // Détection responsive
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Récupération du rôle utilisateur
    const storedRole = role || localStorage.getItem("role") || "Operateur";
    setUserRole(storedRole);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [role]);

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
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ✅ CONFIGURATION DES ACCÈS PAR RÔLE
  const canAccessDashboard = ["Administrateur", "Superviseur"].includes(userRole);
  const canAccessProfil = true; // Tous les rôles ont accès au profil

  // Navigation items
  const navItems = [
    {
      path: "/home",
      label: "Accueil",
      icon: "🏠",
      color: "from-[#F77F00] to-[#FF9E40]",
      hoverColor: "hover:bg-orange-50 hover:text-[#F77F00]",
      accessible: true,
      onClick: handleAccueilClick
    },
    {
      path: "/inventaire",
      label: "Recherche",
      icon: "🔍",
      color: "from-[#0077B6] to-[#2E8B57]",
      hoverColor: "hover:bg-blue-50 hover:text-[#0077B6]",
      accessible: true
    },
    {
      path: "/dashboard",
      label: "Tableau de Bord",
      icon: "📊",
      color: "from-[#2E8B57] to-[#0077B6]",
      hoverColor: "hover:bg-green-50 hover:text-[#2E8B57]",
      accessible: canAccessDashboard
    },
    {
      path: "/profil",
      label: "Profil",
      icon: "👤",
      color: "from-[#F77F00] to-[#0077B6]",
      hoverColor: "hover:bg-orange-50 hover:text-[#F77F00]",
      accessible: canAccessProfil
    }
  ];

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo et titre - Responsive */}
            <div className="flex items-center flex-shrink-0">
              <div className="text-left">
                <span className={`font-bold bg-gradient-to-r from-[#F77F00] to-[#0077B6] bg-clip-text text-transparent ${
                  isMobile ? 'text-sm' : 'text-lg md:text-xl'
                }`}>
                  {isMobile ? 'GESCARD' : 'Gestion des Cartes'}
                </span>
                <span className={`block text-gray-500 ${
                  isMobile ? 'text-xs' : 'text-xs md:text-sm'
                } ${isMobile ? 'hidden' : ''}`}>
                  ABIDJAN NORD-COCODY • ÉliteMultiservices
                </span>
              </div>
            </div>

            {/* Indicateur de rôle - Desktop seulement */}
            {!isMobile && (
              <div className="hidden md:flex items-center mx-4 px-3 py-1 bg-gradient-to-r from-[#F77F00]/10 to-[#0077B6]/10 rounded-full border border-[#F77F00]/20">
                <span className="text-xs font-semibold text-[#F77F00]">
                  {userRole}
                </span>
              </div>
            )}

            {/* Menu de navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-1 justify-center">
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
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-white rounded-full"
                    />
                  )}
                </Link>
              ))}
              
              {/* Bouton Déconnexion - Desktop */}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold shadow hover:shadow-lg transition-all duration-300 ml-2"
                title="Déconnexion"
              >
                <span className="flex items-center gap-2">
                  <span>🚪</span>
                  {!isMobile && <span>Déconnexion</span>}
                </span>
              </motion.button>
            </div>

            {/* Menu Burger et info mobile */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Indicateur de rôle - Mobile */}
              <div className="px-2 py-1 bg-gradient-to-r from-[#F77F00]/10 to-[#0077B6]/10 rounded-full border border-[#F77F00]/20">
                <span className="text-xs font-semibold text-[#F77F00]">
                  {userRole}
                </span>
              </div>
              
              {/* Bouton déconnexion mobile */}
              <motion.button
                onClick={handleLogout}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow"
                title="Déconnexion"
              >
                <span>🚪</span>
              </motion.button>
              
              {/* Menu burger */}
              <motion.button
                onClick={toggleMenu}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-xl shadow-lg ${
                  isMenuOpen 
                    ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white' 
                    : 'bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white'
                }`}
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  {isMenuOpen ? '✕' : '☰'}
                </div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="md:hidden bg-white/98 backdrop-blur-lg shadow-2xl border-t border-gray-200 absolute top-full left-0 right-0 overflow-hidden"
              style={{ maxHeight: "calc(100vh - 56px)" }}
            >
              <div className="py-3 px-2 space-y-1 max-h-[70vh] overflow-y-auto">
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
                        : `text-gray-700 ${item.hoverColor}`
                    }`}
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
                
                {/* Séparateur */}
                <div className="border-t border-gray-200 my-2"></div>
                
                {/* Information utilisateur */}
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-600 mb-1">
                    Connecté en tant que
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-[#F77F00]">
                      {userRole}
                    </div>
                    <div className="text-xs text-gray-500">
                      {localStorage.getItem("NomComplet")?.split(' ')[0] || "Utilisateur"}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Pied de menu mobile */}
              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <div className="text-center text-xs text-gray-500">
                  <div>ABIDJAN NORD-COCODY</div>
                  <div className="mt-1">ÉliteMultiservices • 07 76 73 51 15</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Espace pour la navbar fixe */}
      <div className={`${isMobile ? 'h-14' : 'h-16'}`}></div>
    </>
  );
};

export default Navbar;