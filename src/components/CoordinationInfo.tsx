import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoordinationInfoProps {
  isMobile?: boolean;
}

const CoordinationInfo: React.FC<CoordinationInfoProps> = ({ isMobile = false }) => {
  const [infoIndex, setInfoIndex] = useState(0);
  
  const informations = [
    {
      icon: "🎉",
      type: "nouvelle-annee",
      urgency: "celebration",
      color: "from-purple-600 to-pink-500",
      badge: "✨ 2026",
      deadline: "Toute l'année 2026",
      content: (
        <div className="space-y-4">
          <p className="text-lg font-semibold text-gray-800">
            Chers Collègues et Collaborateurs de la Coordination Abidjan Nord-Cocody,
          </p>
          
          <div className="space-y-3">
            <p>
              C'est avec une immense joie et un profond sentiment de gratitude que nous vous souhaitons une <strong className="text-purple-600">EXCELLENTE et PROSPÈRE ANNÉE 2026</strong> ! 🎊
            </p>
            
            <p>
              Que cette nouvelle année soit pour vous et vos proches une année remplie de <strong className="text-purple-600">bonheur</strong>, de <strong className="text-purple-600">santé</strong>, de <strong className="text-purple-600">prospérité</strong> et de <strong className="text-purple-600">réussite</strong> dans tous vos projets.
            </p>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-400">
              <p className="text-gray-700">
                <span className="text-purple-600 font-semibold">Pour notre coordination</span>, que 2026 soit une année de <strong>grands succès</strong>, de <strong>collaboration fructueuse</strong> et d'<strong>objectifs atteints avec brio</strong>.
              </p>
            </div>
            
            <p>
              Ensemble, main dans la main, nous construirons une année exceptionnelle, marquée par <strong className="text-purple-600">l'excellence</strong>, <strong className="text-purple-600">l'innovation</strong> et le <strong className="text-purple-600">succès collectif</strong>.
            </p>
            
            <p>
              Je souhaite à chacun d'entre vous une croissance personnelle et professionnelle exceptionnelle. Que vos projets les plus chers se réalisent et que votre travail soit source de satisfaction et d'épanouissement.
            </p>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200 text-center">
              <p className="text-gray-800 font-medium">
                <span className="text-yellow-600 text-xl mr-2">✨</span>
                Bonne et Heureuse Année 2026 à tous !
                <span className="text-yellow-600 text-xl ml-2">✨</span>
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Avec toute ma considération et mes meilleurs vœux,
            </p>
            <p className="text-purple-600 font-semibold mt-1">
              La Responsable - Coordination Abidjan Nord-Cocody
            </p>
          </div>
        </div>
      )
    },
    {
      icon: "🚨",
      type: "distribution",
      urgency: "critical",
      color: "from-red-600 to-orange-500",
      badge: "🚨 URGENT",
      deadline: "DÉBUT IMMÉDIAT - LUNDI 17",
      content: (
        <div className="space-y-4">
          <p className="text-lg font-semibold text-gray-800">
            OPÉRATION SPÉCIALE DE DISTRIBUTION - URGENT
          </p>
          
          <div className="space-y-3">
            <p>
              <strong>ATTENTION :</strong> Nous informons TOUS les chefs d'équipe ainsi que l'ensemble des opérateurs de la Coordination Abidjan Nord Cocody que débutera CE LUNDI 17 l'opération spéciale de distribution de GRANDE AMPLEUR lancée par notre direction.
            </p>
            
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-gray-700">
                <span className="text-red-600 font-semibold">🚨 MOBILISATION TOTALE REQUISE :</span> Nous invitons CHACUN à se mobiliser INTÉGRALEMENT afin d'assurer la distribution du MAXIMUM de cartes.
              </p>
            </div>
            
            <p>
              Notre coordination <strong>DOIT</strong> figurer parmi les <strong>MEILLEURES</strong> de Côte d'Ivoire. Je compte sur votre <strong>ENGAGEMENT TOTAL</strong> et votre <strong>DÉTERMINATION ABSOLUE</strong> pour <strong>ATTEINDRE</strong> et <strong>DÉPASSER</strong> nos objectifs.
            </p>
          </div>
        </div>
      )
    },
    {
      icon: "ℹ️",
      type: "information",
      urgency: "normal",
      color: "from-[#0077B6] to-[#2E8B57]",
      badge: "📋 INFORMATION",
      deadline: "Permanent",
      content: (
        <div className="space-y-4">
          <p className="text-lg font-semibold text-gray-800">
            Informations Générales
          </p>
          
          <div className="space-y-3">
            <p>
              La Coordination Abidjan Nord Cocody reste engagée dans <strong>l'amélioration continue</strong> de nos services.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-700">
                N'hésitez pas à remonter toutes <strong>suggestions d'amélioration</strong> via les canaux dédiés. Votre feedback est <strong>essentiel</strong> pour notre progression collective.
              </p>
            </div>
            
            <p>
              Ensemble, continuons à fournir un <strong>service d'excellence</strong> à nos bénéficiaires.
            </p>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const infoTimer = setInterval(() => {
      setInfoIndex((prev) => (prev + 1) % informations.length);
    }, 30000);
    return () => clearInterval(infoTimer);
  }, [informations.length]);

  const currentInfo = informations[infoIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-2xl border overflow-hidden relative ${
        isMobile ? 'shadow-lg' : 'shadow-xl'
      } ${currentInfo.urgency === "celebration" 
        ? 'border-purple-200' 
        : currentInfo.urgency === "critical"
        ? 'border-red-200'
        : 'border-green-200'
      }`}
    >
      {/* BADGE DE NOUVELLE ANNÉE */}
      {currentInfo.type === "nouvelle-annee" && (
        <div className="absolute -top-2 -right-2 w-32 h-32 overflow-hidden z-10">
          <div className="absolute top-6 -right-8 w-40 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-2 text-center transform rotate-45 shadow-xl">
            ✨ 2026 ✨
          </div>
        </div>
      )}

      {/* EN-TÊTE */}
      <div className={`p-4 md:p-6 text-white ${
        currentInfo.urgency === "celebration"
          ? "bg-gradient-to-r from-purple-600 to-pink-500"
          : currentInfo.urgency === "critical"
          ? "bg-gradient-to-r from-red-600 to-orange-500"
          : "bg-gradient-to-r from-[#0077B6] to-[#2E8B57]"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} rounded-xl flex items-center justify-center backdrop-blur-sm bg-white/20`}>
              <span className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {currentInfo.icon}
              </span>
            </div>
            <div>
              <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                {currentInfo.type === "nouvelle-annee" 
                  ? "NOUVELLE ANNÉE 2026" 
                  : currentInfo.type === "distribution"
                  ? "ALERTE URGENTE"
                  : "INFORMATIONS"}
              </h2>
              <p className={`${isMobile ? 'text-xs' : ''} text-white/90`}>
                {currentInfo.type === "nouvelle-annee" 
                  ? "Meilleurs vœux pour une année exceptionnelle" 
                  : currentInfo.type === "distribution"
                  ? "Message de priorité maximale"
                  : "Messages importants de la direction"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'} rounded-lg bg-white/20`}>
              {infoIndex + 1}/{informations.length}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="p-4 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={infoIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* INDICATEUR DE DATE */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                <span className="text-gray-600">📅</span>
                <span className="text-sm font-medium text-gray-700">
                  {currentInfo.deadline}
                </span>
              </div>
            </div>

            {/* CONTENU DU MESSAGE */}
            <div className={`rounded-xl p-4 md:p-5 ${
              currentInfo.urgency === "celebration"
                ? 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
                : currentInfo.urgency === "critical"
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className={`text-gray-700 leading-relaxed ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                {currentInfo.content}
              </div>
            </div>

            {/* SIGNATURE */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-full flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">RL</span>
                </div>
                <div>
                  <p className={`font-semibold ${isMobile ? 'text-sm' : ''} text-gray-800`}>
                    La Responsable
                  </p>
                  <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Coordination Abidjan Nord-Cocody
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* BOUTONS DE NAVIGATION */}
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-center gap-3'} mt-6`}>
          {informations.map((info, index) => (
            <button
              key={index}
              onClick={() => setInfoIndex(index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                index === infoIndex
                  ? info.urgency === "celebration"
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : info.urgency === "critical"
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-[#0077B6] text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${isMobile ? 'w-full' : ''}`}
            >
              <span>{info.icon}</span>
              <span>
                {info.type === "nouvelle-annee" 
                  ? "Bonne Année" 
                  : info.type === "distribution"
                  ? "Urgent"
                  : "Info"}
              </span>
            </button>
          ))}
        </div>

        {/* INDICATEURS DE PAGE */}
        <div className="flex justify-center gap-2 mt-4">
          {informations.map((_, index) => (
            <button
              key={index}
              onClick={() => setInfoIndex(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                index === infoIndex 
                  ? informations[index].urgency === "celebration"
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125' 
                    : informations[index].urgency === "critical"
                    ? 'bg-red-500 scale-125'
                    : 'bg-[#0077B6] scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Afficher le message ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CoordinationInfo;