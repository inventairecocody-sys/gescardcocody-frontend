import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { loginUser, testApiConnection } from "../service/utilisateursService";

interface LoginFormData {
  NomUtilisateur: string;
  MotDePasse: string;
}

// Types d'erreurs possibles
type LoginErrorType = 
  | 'identifiants_invalides'
  | 'utilisateur_introuvable'
  | 'erreur_serveur'
  | 'erreur_reseau'
  | 'erreur_validation'
  | 'compte_bloque'
  | '';

type ApiStatus = 'verification' | 'en_ligne' | 'hors_ligne' | 'erreur_cors';

interface ApiConnectionStatus {
  status: ApiStatus;
  message: string;
  details?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    NomUtilisateur: "",
    MotDePasse: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState<LoginErrorType>('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiConnectionStatus>({
    status: 'verification',
    message: 'Vérification de la connexion au serveur...'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Détection de l'appareil (mobile/desktop)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Test de connexion API au chargement
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const result = await testApiConnection();
        
        if (result.success) {
          setApiStatus({
            status: 'en_ligne',
            message: 'Connecté au serveur',
            details: result.details
          });
        } else {
          setApiStatus({
            status: 'hors_ligne',
            message: 'Serveur inaccessible',
            details: result.details
          });
        }
      } catch (error: any) {
        // Détecter les erreurs CORS spécifiques
        if (error.message?.includes('CORS') || error.message?.includes('Network')) {
          setApiStatus({
            status: 'erreur_cors',
            message: 'Erreur de configuration CORS',
            details: 'Le serveur bloque les requêtes depuis cette origine'
          });
        } else {
          setApiStatus({
            status: 'hors_ligne',
            message: 'Impossible de se connecter au serveur',
            details: error.message
          });
        }
      }
    };

    checkApiConnection();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (errorMessage) {
      setErrorMessage("");
      setErrorType('');
    }
  };

  const validateForm = (): { valide: boolean; erreur?: string; type?: LoginErrorType } => {
    const username = formData.NomUtilisateur.trim();
    const password = formData.MotDePasse;

    if (!username) {
      return {
        valide: false,
        erreur: "Le nom d'utilisateur est obligatoire",
        type: 'erreur_validation'
      };
    }

    if (!password) {
      return {
        valide: false,
        erreur: "Le mot de passe est obligatoire",
        type: 'erreur_validation'
      };
    }

    if (username.length < 3) {
      return {
        valide: false,
        erreur: "Le nom d'utilisateur doit contenir au moins 3 caractères",
        type: 'erreur_validation'
      };
    }

    if (password.length < 6) {
      return {
        valide: false,
        erreur: "Le mot de passe doit contenir au moins 6 caractères",
        type: 'erreur_validation'
      };
    }

    // Validation des caractères spéciaux (optionnel)
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(username)) {
      return {
        valide: false,
        erreur: "Le nom d'utilisateur contient des caractères non autorisés",
        type: 'erreur_validation'
      };
    }

    return { valide: true };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.valide) {
      setErrorMessage(validation.erreur!);
      setErrorType(validation.type!);
      return;
    }
    
    // Vérifier si trop de tentatives
    if (attemptCount >= 5) {
      setErrorMessage("Votre compte est temporairement bloqué. Réessayez dans 15 minutes.");
      setErrorType('compte_bloque');
      return;
    }
    
    // Vérifier si l'API est en ligne - SOLUTION SIMPLIFIÉE
    const isApiOnline = apiStatus.status === 'en_ligne';
    if (!isApiOnline) {
      setErrorMessage("Le serveur est actuellement inaccessible. Veuillez réessayer plus tard.");
      setErrorType('erreur_serveur');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    setErrorType('');

    try {
      const { token, utilisateur } = await loginUser(formData);
      
      // Stockage sécurisé des informations utilisateur
      const userData = {
        token,
        role: utilisateur.Role,
        nomUtilisateur: utilisateur.NomUtilisateur,
        nomComplet: utilisateur.NomComplet,
        agence: utilisateur.Agence,
        email: utilisateur.Email,
        userId: utilisateur.id.toString(),
        loginTime: new Date().toISOString()
      };

      // Stockage dans localStorage
      Object.entries(userData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      // Réinitialiser le compteur de tentatives après succès
      setAttemptCount(0);

      // Redirection avec un léger délai pour l'UX
      setTimeout(() => {
        navigate("/home");
      }, 300);
      
    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      
      // Gestion des erreurs détaillées
      let messageUtilisateur = "Erreur de connexion au serveur";
      let typeErreur: LoginErrorType = 'erreur_serveur';
      
      // Incrémenter le compteur de tentatives échouées
      const nouvellesTentatives = attemptCount + 1;
      setAttemptCount(nouvellesTentatives);
      
      if (err.response) {
        // Erreurs HTTP
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 401) {
          // Authentification échouée
          if (data.message?.toLowerCase().includes('utilisateur') || 
              data.message?.toLowerCase().includes('user') ||
              data.message?.toLowerCase().includes('not found')) {
            messageUtilisateur = "Nom d'utilisateur introuvable";
            typeErreur = 'utilisateur_introuvable';
          } else if (data.message?.toLowerCase().includes('password') ||
                    data.message?.toLowerCase().includes('mot de passe')) {
            messageUtilisateur = "Mot de passe incorrect";
            typeErreur = 'identifiants_invalides';
          } else {
            messageUtilisateur = "Identifiants invalides";
            typeErreur = 'identifiants_invalides';
          }
          
          // Avertissement après plusieurs tentatives
          if (nouvellesTentatives >= 3) {
            messageUtilisateur += `. Attention : ${5 - nouvellesTentatives} tentative(s) restante(s).`;
          }
        } else if (status === 403) {
          messageUtilisateur = "Accès refusé. Votre compte est désactivé ou bloqué.";
          typeErreur = 'compte_bloque';
        } else if (status === 404) {
          messageUtilisateur = "Service d'authentification indisponible";
          typeErreur = 'erreur_serveur';
        } else if (status === 429) {
          messageUtilisateur = "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
          typeErreur = 'compte_bloque';
        } else if (status === 500) {
          messageUtilisateur = "Erreur interne du serveur. Veuillez contacter l'administrateur.";
          typeErreur = 'erreur_serveur';
        } else if (status === 503) {
          messageUtilisateur = "Service temporairement indisponible pour maintenance.";
          typeErreur = 'erreur_serveur';
        } else {
          messageUtilisateur = data.message || `Erreur serveur (${status})`;
        }
      } else if (err.request) {
        // Pas de réponse du serveur
        messageUtilisateur = "Impossible de contacter le serveur. Vérifiez votre connexion internet.";
        typeErreur = 'erreur_reseau';
      } else if (err.message?.includes('CORS')) {
        messageUtilisateur = "Erreur de configuration du serveur. Veuillez contacter le support technique.";
        typeErreur = 'erreur_serveur';
      } else if (err.message?.includes('timeout')) {
        messageUtilisateur = "Délai d'attente dépassé. Le serveur met trop de temps à répondre.";
        typeErreur = 'erreur_reseau';
      } else if (err.message) {
        messageUtilisateur = err.message;
      }

      // Si erreur réseau et que l'API n'est pas en ligne
      if (typeErreur === 'erreur_reseau' && apiStatus.status !== 'en_ligne') {
        messageUtilisateur = `Serveur inaccessible. ${apiStatus.message}`;
      }

      setErrorMessage(messageUtilisateur);
      setErrorType(typeErreur);
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryConnection = async () => {
    setApiStatus({
      status: 'verification',
      message: 'Nouvelle tentative de connexion...'
    });
    
    try {
      const result = await testApiConnection();
      
      if (result.success) {
        setApiStatus({
          status: 'en_ligne',
          message: 'Connecté au serveur',
          details: result.details
        });
      } else {
        setApiStatus({
          status: 'hors_ligne',
          message: 'Serveur toujours inaccessible',
          details: result.details
        });
      }
    } catch (error: any) {
      setApiStatus({
        status: 'hors_ligne',
        message: 'Échec de la reconnexion',
        details: error.message
      });
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'utilisateur_introuvable':
        return '👤';
      case 'identifiants_invalides':
        return '🔒';
      case 'erreur_reseau':
        return '📡';
      case 'erreur_serveur':
        return '🖥️';
      case 'erreur_validation':
        return '⚠️';
      case 'compte_bloque':
        return '🚫';
      default:
        return '❌';
    }
  };

  const getErrorMessageStyle = () => {
    const baseClasses = "px-4 py-3 rounded-2xl text-sm font-medium";
    
    switch (errorType) {
      case 'utilisateur_introuvable':
        return `${baseClasses} bg-blue-50 border border-blue-200 text-blue-800`;
      case 'identifiants_invalides':
        return `${baseClasses} bg-red-50 border border-red-200 text-red-800`;
      case 'erreur_reseau':
        return `${baseClasses} bg-yellow-50 border border-yellow-200 text-yellow-800`;
      case 'erreur_serveur':
        return `${baseClasses} bg-orange-50 border border-orange-200 text-orange-800`;
      case 'erreur_validation':
        return `${baseClasses} bg-purple-50 border border-purple-200 text-purple-800`;
      case 'compte_bloque':
        return `${baseClasses} bg-gray-100 border border-gray-300 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-50 border border-gray-200 text-gray-800`;
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    alert("Pour réinitialiser votre mot de passe, veuillez contacter votre administrateur système.");
  };

  const getStatusColor = () => {
    switch (apiStatus.status) {
      case 'verification': return 'bg-yellow-100 text-yellow-800';
      case 'en_ligne': return 'bg-green-100 text-green-800';
      case 'erreur_cors': return 'bg-orange-100 text-orange-800';
      case 'hors_ligne': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (apiStatus.status) {
      case 'verification': return '🔄';
      case 'en_ligne': return '✅';
      case 'erreur_cors': return '⚠️';
      case 'hors_ligne': return '❌';
      default: return '❓';
    }
  };

  // Solution simple pour vérifier si le bouton doit être désactivé
  const isApiOnline = apiStatus.status === 'en_ligne';
  const isLoginDisabled = isLoading || !isApiOnline;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col ${isMobile ? 'text-sm' : ''}`}>
      {/* Barre de statut API - Responsive */}
      <div className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center flex items-center justify-between ${getStatusColor()}`}>
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="flex-shrink-0">{getStatusIcon()}</span>
          <span className={`truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {apiStatus.message}
          </span>
        </div>
        
        {apiStatus.status !== 'verification' && (
          <button 
            onClick={handleRetryConnection}
            className={`${isMobile ? 'text-xs px-2 py-1' : 'text-xs px-3 py-1'} rounded bg-white bg-opacity-50 hover:bg-opacity-100 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0`}
            aria-label="Rafraîchir la connexion"
          >
            Rafraîchir
          </button>
        )}
      </div>

      {/* Espace pour la barre de statut */}
      <div className="h-8"></div>

      {/* HEADER - Responsive */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 py-3">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative">
              <img 
                src="/logo-placeholder.jpeg" 
                alt="Logo GESCARD" 
                className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16 md:w-20 md:h-20'} object-contain drop-shadow-sm`}
                loading="eager"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 md:w-6 md:h-6 bg-[#F77F00] rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} font-bold text-gray-800 leading-tight`}>
                Gestion des Cartes
              </h1>
              <p className={`text-[#F77F00] ${isMobile ? 'text-xs' : 'text-sm md:text-base'} font-semibold truncate max-w-[200px] md:max-w-none`}>
                COORDINATION ABIDJAN NORD-COCODY
              </p>
            </div>
          </div>
          
          <div className={`${isMobile ? 'hidden' : 'flex'} items-center space-x-2 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white px-4 py-2 rounded-full shadow-lg`}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">GESCARD</span>
          </div>
        </div>
        
        <div className="flex h-2 w-full bg-gradient-to-r from-[#F77F00] via-[#2E8B57] to-[#0077B6]">
          <div className="h-full bg-white/40 animate-pulse w-1/3"></div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL - Responsive */}
      <main className="flex-1 flex items-center justify-center px-3 md:px-6 lg:px-8 py-4 md:py-8">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12'} items-center`}
          >
            {/* Zone gauche - Présentation */}
            <div className={`text-center ${isMobile ? '' : 'lg:text-left'} space-y-4 md:space-y-8`}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl border border-orange-100">
                  <img
                    src="/decorative-image.jpeg"
                    alt="Interface moderne EGC"
                    className={`w-full ${isMobile ? 'h-40' : 'h-48 md:h-64'} object-cover rounded-xl md:rounded-2xl shadow-lg transform hover:scale-[1.02] transition-transform duration-300 border-2 border-orange-200`}
                    loading="lazy"
                  />
                  
                  <div className="absolute -top-2 -right-2 w-4 h-4 md:w-6 md:h-6 bg-[#F77F00] rounded-full animate-bounce shadow-lg"></div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 md:w-8 md:h-8 bg-[#FF9E40] rounded-full opacity-80 shadow-lg"></div>
                  <div className="absolute top-4 -left-2 w-3 h-3 md:w-4 md:h-4 bg-[#FFB74D] rounded-full animate-pulse"></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-3 md:space-y-6"
              >
                <h2 className={`font-bold text-gray-900 leading-tight ${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl lg:text-5xl'}`}>
                  Bienvenue dans{" "}
                  <span className="bg-gradient-to-r from-[#F77F00] to-[#0077B6] bg-clip-text text-transparent">
                    GESCARD
                  </span>
                </h2>
                
                <p className={`text-gray-600 leading-relaxed max-w-2xl ${isMobile ? 'text-sm' : 'text-lg md:text-xl'}`}>
                  Votre solution <span className="font-semibold text-[#F77F00]">spécialisée</span> pour la gestion et la recherche rapide des cartes de la coordination.
                </p>

                <div className={`flex flex-wrap ${isMobile ? 'gap-2' : 'gap-3'} justify-center lg:justify-start`}>
                  {[
                    { icon: "🔍", text: "Recherche Rapide" },
                    { icon: "📊", text: "Gestion Centralisée" },
                    { icon: "🔄", text: "Mise à Jour Instantanée" },
                    { icon: "📈", text: "Statistiques Détaillées" }
                  ].map((feature, index) => (
                    <motion.span
                      key={feature.text}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`bg-white/80 backdrop-blur-sm border border-orange-200 ${isMobile ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'} rounded-full font-medium text-gray-700 shadow-sm`}
                    >
                      {feature.icon} {feature.text}
                    </motion.span>
                  ))}
                </div>

                {/* Section d'information de connexion */}
                {!isApiOnline && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl md:rounded-2xl p-3 md:p-6 border border-orange-200"
                  >
                    <h4 className="font-semibold text-[#F77F00] mb-2 md:mb-3 text-base md:text-lg flex items-center">
                      ⚠️ Information Connexion
                    </h4>
                    <div className={`text-gray-700 space-y-1 md:space-y-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <p><strong>Statut:</strong> {
                        apiStatus.status === 'verification' ? 'Vérification...' :
                        apiStatus.status === 'en_ligne' ? 'En ligne' :
                        apiStatus.status === 'hors_ligne' ? 'Hors ligne' :
                        'Erreur CORS'
                      }</p>
                      <p><strong>Serveur:</strong> {import.meta.env.VITE_API_URL || 'Non configuré'}</p>
                      <p><strong>Détails:</strong> {apiStatus.details || 'Aucun détail disponible'}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Zone droite - Formulaire */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <div className={`bg-white/90 backdrop-blur-lg ${isMobile ? 'rounded-xl p-4' : 'rounded-3xl p-6 md:p-8 lg:p-10'} shadow-xl md:shadow-2xl border border-orange-100`}>
                <div className="text-center mb-6 md:mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-r from-[#F77F00] to-[#FF9E40] ${isMobile ? 'rounded-xl' : 'rounded-2xl'} flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg`}
                  >
                    <span className={`${isMobile ? 'text-xl' : 'text-2xl'} text-white`}>🔐</span>
                  </motion.div>
                  <h3 className={`font-bold text-gray-900 mb-2 ${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
                    Accès Plateforme
                  </h3>
                  <p className={`text-[#F77F00] font-medium ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>
                    Gérez vos cartes en toute simplicité
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  {/* Champ Nom d'utilisateur */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label 
                      htmlFor="NomUtilisateur"
                      className={`block font-semibold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}
                    >
                      <span className="text-[#F77F00]">👤</span> Identifiant Coordination
                    </label>
                    <div className="relative">
                      <input
                        id="NomUtilisateur"
                        name="NomUtilisateur"
                        type="text"
                        value={formData.NomUtilisateur}
                        onChange={handleChange}
                        placeholder="Votre identifiant de coordination"
                        className={`w-full bg-gray-50 border border-gray-200 ${isMobile ? 'px-4 py-3 rounded-xl text-sm' : 'px-5 py-4 rounded-2xl'} focus:outline-none focus:ring-2 md:focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 text-gray-800 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={isLoading}
                        aria-invalid={errorType === 'utilisateur_introuvable'}
                        aria-describedby={errorType === 'utilisateur_introuvable' ? 'username-error' : undefined}
                        autoComplete="username"
                      />
                      <div className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2">
                        <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-[#F77F00] rounded-full animate-pulse`}></div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Champ Mot de passe */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <label 
                        htmlFor="MotDePasse"
                        className={`block font-semibold text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}
                      >
                        <span className="text-[#F77F00]">🔒</span> Mot de passe
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className={`text-[#F77F00] hover:text-[#e46f00] transition-colors ${isMobile ? 'text-xs' : 'text-xs md:text-sm'}`}
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="MotDePasse"
                        name="MotDePasse"
                        type={showPassword ? "text" : "password"}
                        value={formData.MotDePasse}
                        onChange={handleChange}
                        placeholder="Votre mot de passe sécurisé"
                        className={`w-full bg-gray-50 border border-gray-200 ${isMobile ? 'px-4 py-3 rounded-xl text-sm pr-10' : 'px-5 py-4 rounded-2xl pr-12'} focus:outline-none focus:ring-2 md:focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 text-gray-800 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={isLoading}
                        aria-invalid={errorType === 'identifiants_invalides'}
                        aria-describedby={errorType === 'identifiants_invalides' ? 'password-error' : undefined}
                        autoComplete="current-password"
                      />
                      <div className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="text-gray-400 hover:text-[#F77F00] transition-colors"
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                        <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-[#FF9E40] rounded-full animate-pulse`}></div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Message d'erreur */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={getErrorMessageStyle()}
                      role="alert"
                      aria-live="assertive"
                    >
                      <div className="flex items-start">
                        <span className={`${isMobile ? 'text-base mr-2' : 'text-lg mr-3'}`}>{getErrorIcon()}</span>
                        <div className="flex-1">
                          <strong className={`block mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {errorType === 'utilisateur_introuvable' && "Utilisateur introuvable"}
                            {errorType === 'identifiants_invalides' && "Authentification échouée"}
                            {errorType === 'erreur_reseau' && "Problème de connexion"}
                            {errorType === 'erreur_serveur' && "Erreur serveur"}
                            {errorType === 'erreur_validation' && "Validation requise"}
                            {errorType === 'compte_bloque' && "Compte bloqué"}
                            {!errorType && "Erreur de connexion"}
                          </strong>
                          <p className={`mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>{errorMessage}</p>
                          
                          {/* Conseils supplémentaires selon le type d'erreur */}
                          {errorType === 'utilisateur_introuvable' && (
                            <p className="mt-2 text-xs opacity-75">
                              Vérifiez votre nom d'utilisateur ou contactez l'administrateur.
                            </p>
                          )}
                          
                          {errorType === 'identifiants_invalides' && attemptCount >= 3 && (
                            <p className={`mt-2 ${isMobile ? 'text-xs' : 'text-xs'} font-semibold text-red-600`}>
                              ⚠️ {5 - attemptCount} tentative(s) restante(s) avant blocage temporaire
                            </p>
                          )}
                          
                          {errorType === 'compte_bloque' && (
                            <p className="mt-2 text-xs">
                              Contactez votre administrateur pour débloquer votre compte.
                            </p>
                          )}
                          
                          {errorType === 'erreur_reseau' && (
                            <div className="mt-2 space-y-1 text-xs">
                              <p>Vérifiez :</p>
                              <ul className="list-disc pl-4">
                                <li>Votre connexion internet</li>
                                <li>Que le serveur est en ligne</li>
                              </ul>
                            </div>
                          )}
                          
                          {(errorType === 'erreur_serveur' || errorMessage.includes('CORS')) && (
                            <p className="mt-2 text-xs">
                              Contactez le support technique pour résoudre ce problème.
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Bouton de soumission */}
                  <motion.button
                    type="submit"
                    disabled={isLoginDisabled}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: isLoginDisabled ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full font-bold ${isMobile ? 'py-3 rounded-xl text-sm' : 'py-4 rounded-2xl'} shadow-lg transition-all duration-300 flex items-center justify-center ${
                      isLoginDisabled
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white hover:shadow-xl hover:from-[#e46f00] hover:to-[#FF8C00] hover:shadow-orange-200'
                    }`}
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} border-2 border-white border-t-transparent rounded-full animate-spin mr-2`}></div>
                        <span>Connexion en cours...</span>
                      </>
                    ) : !isApiOnline ? (
                      <>
                        <span className="mr-2">🔴</span>
                        <span>Serveur indisponible</span>
                      </>
                    ) : (
                      <>
                        <span className="mr-2">📋</span>
                        <span>Se connecter</span>
                      </>
                    )}
                  </motion.button>

                  {/* Indicateur de tentatives */}
                  {attemptCount > 0 && (
                    <div className={`text-center ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                      Tentatives de connexion : {attemptCount} / 5
                    </div>
                  )}

                  {/* Message d'information */}
                  <div className={`text-center ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 pt-2`}>
                    <p>En cas de difficultés, contactez le support technique.</p>
                  </div>
                </form>

                {/* Information de débogage (seulement en développement) */}
                {import.meta.env.DEV && (
                  <div className={`mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 ${isMobile ? 'text-xs' : ''}`}>
                    <details className="text-gray-600">
                      <summary className="cursor-pointer font-medium">Informations de débogage</summary>
                      <div className={`mt-2 space-y-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                        <p><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL}</p>
                        <p><strong>Environnement:</strong> {import.meta.env.MODE}</p>
                        <p><strong>Appareil:</strong> {isMobile ? 'Mobile' : 'Desktop'} ({window.innerWidth}px)</p>
                        <p><strong>Status API:</strong> {apiStatus.status}</p>
                        <p><strong>Tentatives:</strong> {attemptCount}</p>
                        <p><strong>Erreur Type:</strong> {errorType || 'Aucune'}</p>
                      </div>
                    </details>
                  </div>
                )}
              </div>

              {/* Effets décoratifs */}
              {!isMobile && (
                <>
                  <div className="absolute -z-10 top-4 -right-4 w-28 h-28 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-3xl opacity-30 blur-xl"></div>
                  <div className="absolute -z-10 -bottom-4 -left-4 w-20 h-20 bg-[#FFB74D] rounded-3xl opacity-40 blur-lg"></div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* FOOTER - Responsive */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-orange-100 py-3 md:py-6">
        <div className="text-center">
          <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>
            © 2025 <span className="font-bold text-[#F77F00]">GestiondesCartes (GESCARD)</span> – 
            <span className="text-gray-500"> Solution de gestion des cartes</span>
          </p>
          <div className={`flex flex-wrap justify-center ${isMobile ? 'gap-x-2 gap-y-1 mt-1 text-xs' : 'gap-x-4 gap-y-1 mt-2 text-xs md:text-sm'}`}>
            <span className="text-[#F77F00]">Base de données: PostgreSQL</span>
            <span className="text-[#F77F00]">Backend: Node.js/Express</span>
            <span className="text-[#F77F00]">Frontend: React/TypeScript</span>
          </div>
          <div className={`${isMobile ? 'mt-1 text-xs' : 'mt-2 text-xs md:text-sm'} text-gray-500`}>
            Version 1.0.0 • Sécurisé par HTTPS • Optimisé pour mobile & desktop
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;