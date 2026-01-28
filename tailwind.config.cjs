/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ✅ Couleurs principales de l'application
        orangeMain: "#F77F00",
        orangeSecondary: "#FF9E40",
        orangeLight: "#FFB74D",
        orangeDark: "#e46f00",
        
        greenMain: "#2E8B57",
        greenSecondary: "#00A8E8",
        greenLight: "#4CAF50",
        greenDark: "#1B5E20",
        
        blueMain: "#0077B6",
        blueSecondary: "#2E8B57", // Note: C'est vert mais utilisé comme bleu secondaire dans votre code
        blueLight: "#00A8E8",
        blueDark: "#005B8C",
        
        // ✅ Palette de gris améliorée
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        
        // ✅ Couleurs d'état
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      
      // ✅ Animations personnalisées
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      
      // ✅ Keyframes pour les animations
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // ✅ Breakpoints personnalisés pour le responsive
      screens: {
        'xs': '475px',    // Extra small
        'sm': '640px',    // Small
        'md': '768px',    // Medium
        'lg': '1024px',   // Large
        'xl': '1280px',   // Extra large
        '2xl': '1536px',  // 2X large
        '3xl': '1920px',  // 3X large (pour grands écrans)
      },
      
      // ✅ Espacement personnalisé
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // ✅ Bordures personnalisées
      borderWidth: {
        '3': '3px',
        '6': '6px',
        '10': '10px',
      },
      
      // ✅ Bordures arrondies personnalisées
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      
      // ✅ Opacité personnalisée
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '65': '0.65',
        '85': '0.85',
      },
      
      // ✅ Shadows améliorées
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 20px -3px rgba(0, 0, 0, 0.1), 0 12px 25px -2px rgba(0, 0, 0, 0.06)',
        'hard': '0 10px 40px -5px rgba(0, 0, 0, 0.15), 0 20px 50px -2px rgba(0, 0, 0, 0.08)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-hard': 'inset 0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'orange-glow': '0 0 20px rgba(247, 127, 0, 0.3)',
        'blue-glow': '0 0 20px rgba(0, 119, 182, 0.3)',
        'green-glow': '0 0 20px rgba(46, 139, 87, 0.3)',
      },
      
      // ✅ Gradients personnalisés
      backgroundImage: {
        'gradient-orange': 'linear-gradient(to right, #F77F00, #FF9E40)',
        'gradient-blue': 'linear-gradient(to right, #0077B6, #2E8B57)',
        'gradient-green': 'linear-gradient(to right, #2E8B57, #0077B6)',
        'gradient-diagonal': 'linear-gradient(45deg, #F77F00, #FF9E40, #0077B6, #2E8B57)',
        'gradient-radial': 'radial-gradient(circle, #F77F00, #FF9E40, #0077B6)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      },
      
      // ✅ Typographie améliorée
      fontSize: {
        'xxs': '0.625rem',   // 10px
        '2xs': '0.6875rem',  // 11px
        '3xs': '0.75rem',    // 12px (déjà existant)
        '4xs': '0.8125rem',  // 13px
      },
      
      lineHeight: {
        'tight': '1.1',
        'snug': '1.25',
        'normal': '1.5',
        'relaxed': '1.75',
        'loose': '2',
      },
      
      // ✅ Z-index personnalisés
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      // ✅ Transition personnalisée
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'transform': 'transform',
        'all': 'all',
      },
      
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
      
      // ✅ Backdrop-blur personnalisé
      backdropBlur: {
        'xs': '2px',
      },
      
      // ✅ Min/Max dimensions
      minWidth: {
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
        '48': '12rem',
      },
      
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      
      minHeight: {
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
        '48': '12rem',
      },
      
      maxHeight: {
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
      },
      
      // ✅ Grid templates
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      
      gridColumn: {
        'span-13': 'span 13 / span 13',
        'span-14': 'span 14 / span 14',
        'span-15': 'span 15 / span 15',
        'span-16': 'span 16 / span 16',
        'span-17': 'span 17 / span 17',
        'span-18': 'span 18 / span 18',
        'span-19': 'span 19 / span 19',
        'span-20': 'span 20 / span 20',
        'span-21': 'span 21 / span 21',
        'span-22': 'span 22 / span 22',
        'span-23': 'span 23 / span 23',
        'span-24': 'span 24 / span 24',
      },
    },
  },
  
  // ✅ Variants personnalisés
  variants: {
    extend: {
      display: ['group-hover', 'group-focus'],
      opacity: ['group-hover', 'group-focus'],
      scale: ['group-hover', 'group-focus'],
      translate: ['group-hover', 'group-focus'],
      backgroundColor: ['active', 'disabled'],
      textColor: ['active', 'disabled'],
      borderColor: ['active', 'disabled'],
      ringColor: ['active', 'disabled'],
      ringWidth: ['active', 'disabled'],
    },
  },
  
  plugins: [
    // ✅ Plugin pour le placeholder
    function({ addUtilities }) {
      const newUtilities = {
        '.placeholder-gray-500::placeholder': {
          color: '#6b7280',
          opacity: '1',
        },
        '.placeholder-orange-400::placeholder': {
          color: '#fb923c',
          opacity: '1',
        },
        '.placeholder-blue-400::placeholder': {
          color: '#60a5fa',
          opacity: '1',
        },
        '.placeholder-green-400::placeholder': {
          color: '#4ade80',
          opacity: '1',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover', 'focus'])
    },
    
    // ✅ Plugin pour les scrollbars personnalisées
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      }
      addUtilities(newUtilities, ['responsive'])
    },
  ],
  
  // ✅ Options de sécurité
  corePlugins: {
    // Désactiver les utilitaires dangereux en production
    float: false,
    clear: false,
  },
  
  // ✅ Mode important (optionnel, pour forcer les styles)
  important: false, // Mettre à true si vous avez des conflits de style
  
  // ✅ Dark mode (optionnel)
  darkMode: 'class', // ou 'media' pour baser sur les préférences système
}