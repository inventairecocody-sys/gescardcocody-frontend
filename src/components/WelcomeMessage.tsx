import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeMessageProps {
  isMobile?: boolean; // ✅ Ajouter cette interface
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ isMobile = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden ${
        isMobile ? 'shadow-md' : 'shadow-xl'
      }`}
    >
      {/* EN-TÊTE AVEC GRADIENT ORANGE - Responsive */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white p-4 md:p-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm`}>
            <span className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>👋</span>
          </div>
          <div>
            <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              Message de Bienvenue
            </h2>
            <p className={`text-orange-100 ${isMobile ? 'text-xs' : ''}`}>
              Nouvelle plateforme GESCARD
            </p>
          </div>
        </div>
      </div>

      {/* CONTENU - Responsive */}
      <div className="p-4 md:p-6">
        <div className="space-y-3 md:space-y-4 text-gray-800">
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} leading-relaxed`}>
            <strong className="text-[#F77F00]">Chers collaborateurs,</strong>
          </p>
          
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} leading-relaxed`}>
            J'ai le plaisir de vous annoncer la mise en place de notre nouveau logiciel Web de recherche rapide de cartes <strong>GESCARD</strong>. 
          </p>

          <div className="flex items-start gap-3 bg-blue-50 p-3 md:p-4 rounded-xl border border-blue-100">
            <span className="text-blue-600 text-lg md:text-xl mt-0.5 md:mt-1">🎯</span>
            <p className={`${isMobile ? 'text-sm' : 'text-lg'} leading-relaxed`}>
              Cette plateforme a été conçue pour <strong className="text-blueMain">faciliter et améliorer</strong> nos services de distribution, en permettant à chacun d'effectuer des recherches plus <strong className="text-blueMain">simples, plus rapides et plus efficaces</strong>.
            </p>
          </div>

          <p className={`${isMobile ? 'text-sm' : 'text-lg'} leading-relaxed`}>
            Cet outil est désormais accessible à tous les membres de la coordination et constitue une <strong className="text-[#F77F00]">étape importante</strong> dans la modernisation de notre travail au quotidien.
          </p>

          <div className="flex items-start gap-3 bg-green-50 p-3 md:p-4 rounded-xl border border-green-100">
            <span className="text-green-600 text-lg md:text-xl mt-0.5 md:mt-1">💪</span>
            <p className={`${isMobile ? 'text-sm' : 'text-lg'} leading-relaxed`}>
              Je vous encourage à l'utiliser pleinement afin d'<strong className="text-greenMain">optimiser nos performances</strong> et de <strong className="text-greenMain">mieux servir nos bénéficiaires</strong>.
            </p>
          </div>

          <p className={`${isMobile ? 'text-sm' : 'text-lg'} leading-relaxed`}>
            Bienvenue sur cette nouvelle plateforme, et merci pour votre engagement continu.
          </p>

          {/* CARTE OBJECTIFS - Responsive */}
          <div className={`bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-3 md:p-4 border border-orange-200 ${
            isMobile ? 'mt-3' : 'mt-4'
          }`}>
            <h4 className={`font-bold text-gray-800 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
              🎯 Nos objectifs avec GESCARD :
            </h4>
            <ul className={`space-y-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orangeMain rounded-full"></div>
                <span>Réduire le temps de recherche des cartes</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blueMain rounded-full"></div>
                <span>Améliorer la précision des informations</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-greenMain rounded-full"></div>
                <span>Faciliter la gestion quotidienne</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orangeMain rounded-full"></div>
                <span>Moderniser nos processus</span>
              </li>
            </ul>
          </div>

          {/* SIGNATURE - Responsive */}
          <div className="border-t border-gray-200 pt-4 md:pt-6 mt-4 md:mt-6">
            <div className={`${isMobile ? 'flex-col gap-4' : 'flex items-center justify-between'} ${isMobile ? '' : 'md:flex-row'}`}>
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-full flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-sm">RL</span>
                </div>
                <div>
                  <p className={`font-bold ${isMobile ? 'text-base' : 'text-lg'} text-[#F77F00]`}>
                    La Responsable
                  </p>
                  <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Coordination Abidjan Nord-Cocody
                  </p>
                </div>
              </div>
              
              <div className={`${isMobile ? 'text-center mt-3' : 'text-right'}`}>
                <p className={`text-gray-500 italic ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Innovation • Performance • Excellence
                </p>
                <div className="flex items-center justify-center md:justify-end gap-1 mt-1">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i}
                      className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-[#F77F00] rounded-full opacity-${i * 20 + 40}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION VALEURS - Responsive */}
          {!isMobile && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
                <div className="text-orangeMain text-sm font-semibold">🤝</div>
                <div className="text-xs text-gray-700 mt-1">Collaboration</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                <div className="text-blueMain text-sm font-semibold">⚡</div>
                <div className="text-xs text-gray-700 mt-1">Efficacité</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                <div className="text-greenMain text-sm font-semibold">🎯</div>
                <div className="text-xs text-gray-700 mt-1">Précision</div>
              </div>
            </div>
          )}

          {/* VERSION MOBILE SIMPLIFIÉE */}
          {isMobile && (
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="text-center">
                <div className="text-orangeMain text-sm">🤝</div>
                <div className="text-xs text-gray-600 mt-1">Collaboration</div>
              </div>
              <div className="text-center">
                <div className="text-blueMain text-sm">⚡</div>
                <div className="text-xs text-gray-600 mt-1">Efficacité</div>
              </div>
              <div className="text-center">
                <div className="text-greenMain text-sm">🎯</div>
                <div className="text-xs text-gray-600 mt-1">Précision</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* DÉCORATION */}
      <div className="absolute top-2 right-2 opacity-10">
        <span className="text-3xl">✨</span>
      </div>
    </motion.div>
  );
};

export default WelcomeMessage;