import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MotivationQuotesProps {
  isMobile?: boolean; // ✅ Ajouter cette interface
}

const MotivationQuotes: React.FC<MotivationQuotesProps> = ({ isMobile = false }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const quotes = [
    { text: "« Ensemble, allons plus loin. »", emoji: "🚀" },
    { text: "« Chaque carte distribuée rapproche notre objectif. »", emoji: "🎴" },
    { text: "« Votre engagement fait la différence. »", emoji: "⭐" },
    { text: "« Restons concentrés, restons efficaces. »", emoji: "🎯" },
    { text: "« Une équime soudée réussit toujours. »", emoji: "🤝" },
    { text: "« Le professionnalisme est notre force. »", emoji: "💼" },
    { text: "« Aujourd'hui, faisons mieux qu'hier. »", emoji: "📈" },
    { text: "« Petit effort, grand résultat. »", emoji: "💪" },
    { text: "« L'excellence est un choix quotidien. »", emoji: "🏆" },
    { text: "« Chaque détail compte pour la réussite. »", emoji: "🔍" }
  ];

  useEffect(() => {
    if (isPaused) return;
    
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8000); // 8 secondes par citation
    
    return () => clearInterval(quoteTimer);
  }, [quotes.length, isPaused]);

  const handlePrevious = () => {
    setQuoteIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 15000); // Reprendre après 15s
  };

  const handleNext = () => {
    setQuoteIndex((prev) => (prev + 1) % quotes.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 15000); // Reprendre après 15s
  };

  return (
    <div className={`bg-gradient-to-r from-[#2E8B57] to-[#0077B6] text-white ${
      isMobile ? 'py-2' : 'py-3'
    }`}>
      <div className={`${isMobile ? 'px-3' : 'container mx-auto px-6'}`}>
        <div className="flex items-center justify-between gap-3">
          {/* Bouton précédent - visible seulement sur desktop */}
          {!isMobile && (
            <motion.button
              onClick={handlePrevious}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Citation précédente"
              title="Citation précédente"
            >
              <span className="text-lg">◀</span>
            </motion.button>
          )}

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="flex flex-col items-center gap-2">
                  {/* Indicateur de progression */}
                  <div className="flex items-center justify-center gap-1">
                    {quotes.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          index === quoteIndex 
                            ? 'bg-white w-4' 
                            : 'bg-white/40 w-1'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center gap-3">
                    <span className={`${isMobile ? 'text-lg' : 'text-xl'} animate-pulse`}>
                      {quotes[quoteIndex].emoji}
                    </span>
                    <p className={`font-medium italic ${
                      isMobile 
                        ? 'text-sm md:text-base' 
                        : 'text-base md:text-lg'
                    }`}>
                      {quotes[quoteIndex].text}
                    </p>
                    <span className={`${isMobile ? 'text-lg' : 'text-xl'} animate-pulse`}>
                      {quotes[quoteIndex].emoji}
                    </span>
                  </div>
                  
                  {/* Indicateur de numéro */}
                  {!isMobile && (
                    <div className="text-xs text-white/70">
                      {quoteIndex + 1} / {quotes.length}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bouton suivant - visible seulement sur desktop */}
          {!isMobile && (
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Citation suivante"
              title="Citation suivante"
            >
              <span className="text-lg">▶</span>
            </motion.button>
          )}
        </div>
        
        {/* Boutons de navigation mobile */}
        {isMobile && (
          <div className="flex items-center justify-center gap-4 mt-2">
            <motion.button
              onClick={handlePrevious}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded-full bg-white/20"
              aria-label="Précédent"
            >
              <span className="text-base">◀</span>
            </motion.button>
            
            <div className="text-xs text-white/70">
              {quoteIndex + 1} / {quotes.length}
            </div>
            
            <motion.button
              onClick={handleNext}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded-full bg-white/20"
              aria-label="Suivant"
            >
              <span className="text-base">▶</span>
            </motion.button>
          </div>
        )}
        
        {/* Instructions */}
        {!isMobile && (
          <div className="text-xs text-white/60 text-center mt-2">
            💡 Les citations changent automatiquement. Cliquez pour naviguer.
          </div>
        )}
      </div>
      
      {/* Élément décoratif */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-20">
        <span className="text-2xl">✨</span>
      </div>
    </div>
  );
};

export default MotivationQuotes;