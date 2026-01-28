import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import api from '../service/api';

interface UserProfile {
  id: number;
  NomUtilisateur: string;
  NomComplet: string;
  Email: string;
  Agence: string;
  Role: string;
}

const Profil: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "";

  // ✅ Détection responsive
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('🔍 Récupération du profil...');
      
      // ✅ Vérifier d'abord si nous avons un token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token non trouvé');
      }
      
      // ✅ Vérifier si les données sont dans localStorage
      const storedNomComplet = localStorage.getItem('nomComplet') || localStorage.getItem('NomComplet');
      const storedAgence = localStorage.getItem('agence') || localStorage.getItem('Agence');
      const storedRole = localStorage.getItem('role');
      const storedEmail = localStorage.getItem('email') || localStorage.getItem('Email');
      const storedNomUtilisateur = localStorage.getItem('nomUtilisateur') || localStorage.getItem('NomUtilisateur');
      
      if (storedNomComplet && storedAgence && storedRole) {
        console.log('📦 Utilisation des données localStorage');
        setProfile({
          id: parseInt(localStorage.getItem('userId') || '0'),
          NomUtilisateur: storedNomUtilisateur || '',
          NomComplet: storedNomComplet,
          Email: storedEmail || '',
          Agence: storedAgence,
          Role: storedRole
        });
        setLoading(false);
        return;
      }
      
      // ✅ Sinon, faire l'appel API
      const response = await api.get('/api/profil');
      console.log('✅ Réponse profil API:', response.data);

      const userData = response.data;
      setProfile(userData);
      
      // ✅ Mettre à jour localStorage
      localStorage.setItem('NomComplet', userData.NomComplet);
      localStorage.setItem('nomComplet', userData.NomComplet);
      localStorage.setItem('Agence', userData.Agence);
      localStorage.setItem('agence', userData.Agence);
      localStorage.setItem('role', userData.Role);
      localStorage.setItem('Email', userData.Email);
      localStorage.setItem('email', userData.Email);
      localStorage.setItem('NomUtilisateur', userData.NomUtilisateur);
      localStorage.setItem('nomUtilisateur', userData.NomUtilisateur);
      
    } catch (err: any) {
      console.error('❌ Erreur fetchProfile:', err);
      
      // En cas d'erreur API, utiliser les données localStorage
      const storedNomComplet = localStorage.getItem('nomComplet') || localStorage.getItem('NomComplet');
      const storedAgence = localStorage.getItem('agence') || localStorage.getItem('Agence');
      const storedRole = localStorage.getItem('role');
      
      if (storedNomComplet && storedAgence && storedRole) {
        console.log('⚠️ API échouée, utilisation des données locales');
        setProfile({
          id: 0,
          NomUtilisateur: localStorage.getItem('nomUtilisateur') || '',
          NomComplet: storedNomComplet,
          Email: localStorage.getItem('email') || '',
          Agence: storedAgence,
          Role: storedRole
        });
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError('Erreur lors de la récupération du profil');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setChangingPassword(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/api/profil/password', {
        currentPassword,
        newPassword
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess('✅ Mot de passe modifié avec succès !');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error('Erreur lors du changement de mot de passe');
      }
    } catch (err: any) {
      console.error('❌ Erreur handleChangePassword:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setTimeout(() => navigate('/'), 2000);
      } else if (err.response?.data?.message) {
        setError(`❌ ${err.response.data.message}`);
      } else {
        setError(`❌ ${err.message || 'Erreur lors du changement de mot de passe'}`);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    // ✅ Nettoyer toutes les données de session
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("NomUtilisateur");
    localStorage.removeItem("nomUtilisateur");
    localStorage.removeItem("NomComplet");
    localStorage.removeItem("nomComplet");
    localStorage.removeItem("Agence");
    localStorage.removeItem("agence");
    localStorage.removeItem("Email");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    localStorage.removeItem("loginTime");
    
    setShowLogoutConfirm(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navbar role={role} />
        <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
          <div className={`${isMobile ? 'px-4' : 'container mx-auto px-6'}`}>
            <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold flex items-center gap-3`}>
              <span className="bg-white/20 p-2 rounded-xl">👤</span>
              Mon Profil
            </h1>
          </div>
        </div>
        <div className={`${isMobile ? 'px-4 py-8' : 'container mx-auto px-6 py-12'}`}>
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-8 md:p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium text-lg">Chargement du profil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar role={role} />
      
      {/* 🎯 EN-TÊTE AVEC STYLE ORANGE - Responsive */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
        <div className={`${isMobile ? 'px-4' : 'container mx-auto px-6'}`}>
          <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold flex items-center gap-3`}>
            <span className="bg-white/20 p-2 rounded-xl">👤</span>
            Mon Profil Utilisateur
          </h1>
          <p className={`text-white/90 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Gestion de votre compte et sécurité - COORDINATION ABIDJAN NORD-COCODY
          </p>
        </div>
      </div>

      <div className={`${isMobile ? 'px-3 py-4' : 'container mx-auto px-4 md:px-6 py-6'}`}>
        {/* 📱 MESSAGES D'ALERTE - Responsive */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-red-50 border border-red-200 text-red-700 ${isMobile ? 'px-3 py-2 rounded-lg' : 'px-4 py-3 rounded-2xl'} mb-4 md:mb-6 flex items-center gap-3`}
          >
            <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>⚠️</span>
            <span className="flex-1 text-sm">{error}</span>
            <button 
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ×
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-green-50 border border-green-200 text-green-700 ${isMobile ? 'px-3 py-2 rounded-lg' : 'px-4 py-3 rounded-2xl'} mb-4 md:mb-6 flex items-center gap-3`}
          >
            <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>✅</span>
            <span className="flex-1 text-sm">{success}</span>
            <button 
              onClick={() => setSuccess('')}
              className="text-green-500 hover:text-green-700 font-bold"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* 🎴 LAYOUT PRINCIPAL - Responsive */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-6">
          {/* 📋 COLONNE INFORMATIONS PERSONNELLES */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-4 md:p-6 h-full"
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm md:text-lg">📊</span>
                </div>
                <div>
                  <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-gray-800`}>Informations Personnelles</h2>
                  <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Détails de votre compte</p>
                </div>
              </div>
              
              {profile && (
                <div className="space-y-3 md:space-y-4">
                  {/* NOM D'UTILISATEUR */}
                  <div>
                    <label className={`block font-semibold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <span className="text-[#F77F00]">👤</span> Nom d'utilisateur
                    </label>
                    <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                      {profile.NomUtilisateur}
                    </div>
                  </div>

                  {/* NOM COMPLET */}
                  <div>
                    <label className={`block font-semibold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <span className="text-[#0077B6]">🏷️</span> Nom complet
                    </label>
                    <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                      {profile.NomComplet}
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className={`block font-semibold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <span className="text-[#2E8B57]">📧</span> Email
                    </label>
                    <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                      {profile.Email}
                    </div>
                  </div>

                  {/* AGENCE */}
                  <div>
                    <label className={`block font-semibold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <span className="text-[#F77F00]">🏢</span> Agence
                    </label>
                    <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                      {profile.Agence}
                    </div>
                  </div>

                  {/* RÔLE */}
                  <div>
                    <label className={`block font-semibold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <span className="text-[#0077B6]">🎯</span> Rôle
                    </label>
                    <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                      {profile.Role}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* 🔐 COLONNE SÉCURITÉ */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-4 md:p-6 h-full"
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm md:text-lg">🔒</span>
                </div>
                <div>
                  <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-gray-800`}>Sécurité du Compte</h2>
                  <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Gestion du mot de passe</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3 md:space-y-4">
                {/* MOT DE PASSE ACTUEL */}
                <div>
                  <label className={`block font-semibold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    <span className="text-[#F77F00]">🔑</span> Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 md:focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}
                    required
                    placeholder="Mot de passe actuel"
                  />
                </div>

                {/* NOUVEAU MOT DE PASSE */}
                <div>
                  <label className={`block font-semibold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    <span className="text-[#0077B6]">🆕</span> Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 md:focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}
                    required
                    placeholder="Minimum 6 caractères"
                  />
                  <p className="text-xs text-gray-500 mt-2">Le mot de passe doit contenir au moins 6 caractères</p>
                </div>

                {/* CONFIRMATION */}
                <div>
                  <label className={`block font-semibold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    <span className="text-[#2E8B57]">✅</span> Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 md:focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all duration-300 ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}
                    required
                    placeholder="Confirmez le mot de passe"
                  />
                </div>

                {/* BOUTON CHANGEMENT MOT DE PASSE */}
                <motion.button
                  type="submit"
                  disabled={changingPassword}
                  whileHover={{ scale: changingPassword ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white ${isMobile ? 'py-3 rounded-lg text-sm' : 'py-4 rounded-xl'} hover:from-[#e46f00] hover:to-[#FF8C00] disabled:opacity-50 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 md:gap-3 mt-3 md:mt-4`}
                >
                  {changingPassword ? (
                    <>
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className={isMobile ? 'text-xs' : ''}>Modification...</span>
                    </>
                  ) : (
                    <>
                      <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>🔄</span>
                      <span>Changer le mot de passe</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* BOUTON DÉCONNEXION */}
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-orange-100">
                <motion.button
                  onClick={handleLogoutClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full bg-gradient-to-r from-red-500 to-red-600 text-white ${isMobile ? 'py-3 rounded-lg text-sm' : 'py-4 rounded-xl'} hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 md:gap-3`}
                >
                  <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>🚪</span>
                  <span>Se déconnecter</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 📊 CARTE STATISTIQUES - Responsive */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-4 md:p-6 mb-4 md:mb-6"
          >
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-xl flex items-center justify-center">
                <span className="text-white text-sm md:text-lg">📈</span>
              </div>
              <div>
                <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-gray-800`}>Résumé du Profil</h2>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Aperçu de votre compte</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {/* CARTE UTILISATEUR */}
              <div className="bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs md:text-sm font-medium">Utilisateur</p>
                    <p className={`font-bold mt-1 ${isMobile ? 'text-base' : 'text-xl'}`}>
                      {isMobile && profile.NomUtilisateur.length > 10 
                        ? profile.NomUtilisateur.substring(0, 8) + '...' 
                        : profile.NomUtilisateur}
                    </p>
                  </div>
                  <div className={`${isMobile ? 'text-xl bg-white/20 p-2 rounded-lg' : 'text-2xl bg-white/20 p-3 rounded-xl'}`}>👤</div>
                </div>
              </div>

              {/* CARTE AGENCE */}
              <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs md:text-sm font-medium">Agence</p>
                    <p className={`font-bold mt-1 ${isMobile ? 'text-base' : 'text-xl'}`}>
                      {isMobile && profile.Agence.length > 10 
                        ? profile.Agence.substring(0, 8) + '...' 
                        : profile.Agence}
                    </p>
                  </div>
                  <div className={`${isMobile ? 'text-xl bg-white/20 p-2 rounded-lg' : 'text-2xl bg-white/20 p-3 rounded-xl'}`}>🏢</div>
                </div>
              </div>

              {/* CARTE RÔLE */}
              <div className="bg-gradient-to-r from-[#2E8B57] to-[#0077B6] text-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs md:text-sm font-medium">Rôle</p>
                    <p className={`font-bold mt-1 ${isMobile ? 'text-base' : 'text-xl'}`}>
                      {isMobile && profile.Role.length > 10 
                        ? profile.Role.substring(0, 8) + '...' 
                        : profile.Role}
                    </p>
                  </div>
                  <div className={`${isMobile ? 'text-xl bg-white/20 p-2 rounded-lg' : 'text-2xl bg-white/20 p-3 rounded-xl'}`}>🎯</div>
                </div>
              </div>
            </div>

            {/* INFORMATIONS COMPLÉMENTAIRES */}
            <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-blue-100">
                <p className={`text-gray-600 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>📧 Email de contact</p>
                <p className={`font-semibold text-gray-800 ${isMobile ? 'text-sm mt-1' : 'text-lg mt-1'}`}>
                  {isMobile && profile.Email.length > 20 
                    ? profile.Email.substring(0, 18) + '...' 
                    : profile.Email}
                </p>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-orange-100">
                <p className={`text-gray-600 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>🏷️ Nom complet</p>
                <p className={`font-semibold text-gray-800 ${isMobile ? 'text-sm mt-1' : 'text-lg mt-1'}`}>
                  {isMobile && profile.NomComplet.length > 20 
                    ? profile.NomComplet.substring(0, 18) + '...' 
                    : profile.NomComplet}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ℹ️ CARTE INFORMATIONS - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl md:rounded-2xl p-4 md:p-6"
        >
          <div className="flex items-start gap-3 md:gap-4">
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-sm md:text-lg">💡</span>
            </div>
            <div>
              <h3 className={`font-bold text-gray-800 mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}>Conseils de sécurité</h3>
              <ul className="text-gray-700 space-y-1 md:space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#F77F00] rounded-full mt-1 md:mt-1.5"></div>
                  <span className={`${isMobile ? 'text-xs' : ''}`}>Utilisez un mot de passe fort et unique</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#F77F00] rounded-full mt-1 md:mt-1.5"></div>
                  <span className={`${isMobile ? 'text-xs' : ''}`}>Changez régulièrement votre mot de passe</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#F77F00] rounded-full mt-1 md:mt-1.5"></div>
                  <span className={`${isMobile ? 'text-xs' : ''}`}>Ne partagez jamais vos identifiants</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#F77F00] rounded-full mt-1 md:mt-1.5"></div>
                  <span className={`${isMobile ? 'text-xs' : ''}`}>Déconnectez-vous après chaque session</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MODAL DE CONFIRMATION DE DÉCONNEXION - Responsive */}
      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`bg-white ${isMobile ? 'rounded-lg p-4' : 'rounded-2xl p-6'} shadow-2xl max-w-sm w-full mx-auto border border-orange-100`}
          >
            <div className="text-center">
              <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-r from-red-500 to-red-600 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4`}>
                <span className="text-white text-xl md:text-2xl">🚪</span>
              </div>
              
              <h3 className={`font-bold text-gray-800 mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Confirmer la déconnexion
              </h3>
              
              <p className={`text-gray-600 mb-4 md:mb-6 ${isMobile ? 'text-sm' : ''}`}>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>

              <div className={`flex gap-2 md:gap-3 justify-center ${isMobile ? 'flex-col' : ''}`}>
                <motion.button
                  onClick={cancelLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-gray-600 border border-gray-300 hover:bg-gray-50 transition-all duration-300 font-semibold ${isMobile ? 'py-2 rounded-lg text-sm' : 'px-6 py-3 rounded-xl'}`}
                >
                  Annuler
                </motion.button>
                <motion.button
                  onClick={confirmLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg ${isMobile ? 'py-2 rounded-lg text-sm mt-2' : 'px-6 py-3 rounded-xl'}`}
                >
                  Se déconnecter
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profil;