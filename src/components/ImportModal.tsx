import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../service/api";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => Promise<void> | void;
  isImporting: boolean;
  mode?: 'standard' | 'smart';
  onModeChange?: (mode: 'standard' | 'smart') => void;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onFileSelect,
  isImporting,
  mode = 'standard',
  onModeChange
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [hideInstructions, setHideInstructions] = useState(
    localStorage.getItem('hideImportInstructions') === 'true'
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showFormatComparison, setShowFormatComparison] = useState(false);
  const [recommendation, setRecommendation] = useState<string>('');

  const validateFile = (selectedFile: File): boolean => {
    // Réinitialiser les erreurs
    setValidationError(null);
    setRecommendation('');
    
    // Vérifier le type de fichier
    const isCSV = selectedFile.name.toLowerCase().endsWith('.csv');
    const isExcel = /\.(xlsx|xls)$/i.test(selectedFile.name);
    
    if (!isCSV && !isExcel) {
      setValidationError('❌ Format non supporté. Utilisez .csv, .xlsx ou .xls');
      return false;
    }

    // Vérifier la taille (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      const sizeMB = (selectedFile.size / 1024 / 1024).toFixed(2);
      setValidationError(`❌ Fichier trop volumineux (${sizeMB}MB). Maximum: 50MB`);
      return false;
    }

    // Vérifier si le fichier est vide
    if (selectedFile.size === 0) {
      setValidationError('❌ Le fichier est vide');
      return false;
    }

    // Ajouter des recommandations selon le format et la taille
    const sizeMB = selectedFile.size / (1024 * 1024);
    
    if (isExcel && sizeMB > 10) {
      setRecommendation('💡 Pour de meilleures performances, convertissez ce fichier Excel en CSV');
    } else if (isCSV) {
      setRecommendation('✅ Format CSV optimisé pour les performances');
    } else if (isExcel && sizeMB > 5) {
      setRecommendation('⚠️ Pour les gros fichiers, utilisez CSV pour éviter les timeouts');
    }

    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        setFile(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (file && onFileSelect) {
      try {
        await onFileSelect(file);
        if (hideInstructions) {
          localStorage.setItem('hideImportInstructions', 'true');
        }
        handleClose();
      } catch (error) {
        console.error('❌ Erreur lors de l\'import:', error);
        // Ne pas fermer le modal en cas d'erreur
      }
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationError(null);
    setIsDragging(false);
    setRecommendation('');
    onClose();
  };

  const handleHideInstructionsChange = (checked: boolean) => {
    setHideInstructions(checked);
    localStorage.setItem('hideImportInstructions', checked.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      } else {
        setFile(null);
      }
    }
  };

  // Fonction pour formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Ajouter cette fonction pour télécharger le template
  const handleDownloadTemplate = async (format: 'csv' | 'excel') => {
    try {
      if (format === 'csv') {
        // Créer le template CSV directement
        const csvTemplate = `LIEU D'ENROLEMENT,SITE DE RETRAIT,RANGEMENT,NOM,PRENOMS,DATE DE NAISSANCE,LIEU NAISSANCE,CONTACT,DELIVRANCE,CONTACT DE RETRAIT,DATE DE DELIVRANCE
Abidjan Plateau,Yopougon,A1-001,KOUAME,Jean,Thu Jul 12 2001 00:00:00 GMT+0000,Abidjan,01234567,OUI,07654321,2024-11-20
Cocody Centre,2 Plateaux,B2-001,TRAORE,Amina,Sun Jan 25 2015 00:00:00 GMT+0000,Abidjan,09876543,OUI,01234567,2024-11-21
Treichville,Cocody,C3-001,DIALLO,Fatou,Fri Mar 15 1990 00:00:00 GMT+0000,Bouaké,05566778,NON,,2024-11-22`;
        
        const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-import-cartes.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Template Excel via API
        const response = await api.get('/api/import-export/template', {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-import-cartes.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      
      alert(`✅ Template ${format.toUpperCase()} téléchargé !`);
    } catch (error: any) {
      console.error('❌ Erreur téléchargement template:', error);
      alert('❌ Erreur lors du téléchargement du template');
    }
  };

  // Obtenir l'icône selon le mode
  const getModeIcon = () => {
    return mode === 'smart' ? '🔄' : '📤';
  };

  // Obtenir le titre selon le mode
  const getModeTitle = () => {
    return mode === 'smart' ? 'Synchronisation Intelligente' : 'Importation Standard';
  };

  // Obtenir la description selon le mode
  const getModeDescription = () => {
    return mode === 'smart' 
      ? 'Synchronise les données au lieu de créer des doublons' 
      : 'Ajoute de nouvelles cartes au système';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* En-tête */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">{getModeIcon()}</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">{getModeTitle()}</h2>
                  <p className="text-white/90 text-sm">
                    {getModeDescription()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isImporting}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {/* Sélection du mode */}
            {onModeChange && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Mode d'importation :</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onModeChange('standard')}
                    disabled={isImporting}
                    className={`p-3 border rounded-lg transition-all flex flex-col items-center justify-center ${
                      mode === 'standard'
                        ? 'border-[#0077B6] bg-blue-50 text-[#0077B6] ring-2 ring-blue-100'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    } ${isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    aria-pressed={mode === 'standard'}
                  >
                    <div className="text-lg mb-1">📤</div>
                    <p className="font-medium">Standard</p>
                    <p className="text-xs mt-1 opacity-75">Ajoute seulement</p>
                  </button>
                  
                  <button
                    onClick={() => onModeChange('smart')}
                    disabled={isImporting}
                    className={`p-3 border rounded-lg transition-all flex flex-col items-center justify-center ${
                      mode === 'smart'
                        ? 'border-[#2E8B57] bg-green-50 text-[#2E8B57] ring-2 ring-green-100'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    } ${isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    aria-pressed={mode === 'smart'}
                  >
                    <div className="text-lg mb-1">🔄</div>
                    <p className="font-medium">Intelligent</p>
                    <p className="text-xs mt-1 opacity-75">Synchronise</p>
                  </button>
                </div>
              </div>
            )}

            {/* Instructions selon le mode */}
            <div className="mb-6">
              {mode === 'smart' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <span>🔄</span>
                    Avantages de la synchronisation
                  </h3>
                  <ul className="text-green-700 text-sm space-y-1 pl-1">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5 shrink-0">✓</span>
                      <span>Met à jour la <strong className="font-bold">DÉLIVRANCE</strong> si différente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5 shrink-0">✓</span>
                      <span>Conserve les <strong className="font-bold">CONTACTS</strong> existants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5 shrink-0">✓</span>
                      <span>Conserve la <strong className="font-bold">DATE</strong> de délivrance existante</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5 shrink-0">✓</span>
                      <span>Ajoute les nouvelles personnes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5 shrink-0">✓</span>
                      <span>Ignore les doublons exacts</span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <span>📤</span>
                    Caractéristiques de l'import standard
                  </h3>
                  <ul className="text-blue-700 text-sm space-y-1 pl-1">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5 shrink-0">✓</span>
                      <span>Ajoute de nouvelles cartes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5 shrink-0">✓</span>
                      <span>Ignore les doublons existants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5 shrink-0">✓</span>
                      <span>Valide les en-têtes requis (NOM, PRENOMS)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5 shrink-0">✓</span>
                      <span>Formate automatiquement les dates et contacts</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Télécharger les templates */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Télécharger un template :</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownloadTemplate('csv')}
                  disabled={isImporting}
                  className="flex-1 px-4 py-3 bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-lg">📄</span>
                  <div className="text-left">
                    <p className="font-medium">Template CSV</p>
                    <p className="text-xs opacity-75">Format optimisé</p>
                  </div>
                </button>
                <button
                  onClick={() => handleDownloadTemplate('excel')}
                  disabled={isImporting}
                  className="flex-1 px-4 py-3 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-lg">📊</span>
                  <div className="text-left">
                    <p className="font-medium">Template Excel</p>
                    <p className="text-xs opacity-75">Format compatible</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Comparaison des formats */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Comparaison des formats :</p>
                <button
                  onClick={() => setShowFormatComparison(!showFormatComparison)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {showFormatComparison ? 'Masquer' : 'Voir détails'}
                  <span>{showFormatComparison ? '↑' : '↓'}</span>
                </button>
              </div>
              
              {/* Comparaison détaillée */}
              {showFormatComparison && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                          <span>✅</span>
                          CSV (Recommandé)
                        </h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li className="flex items-center gap-2">
                            <span className="text-green-500 text-xs">⚡</span>
                            <span>10x plus rapide</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-500 text-xs">💾</span>
                            <span>80% moins de mémoire</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-500 text-xs">📈</span>
                            <span>Supporte 5000+ lignes</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-500 text-xs">✅</span>
                            <span>Parsing des dates corrigé</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-orange-200">
                        <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                          <span>⚠️</span>
                          Excel (Compatibilité)
                        </h4>
                        <ul className="text-sm text-orange-700 space-y-1">
                          <li className="flex items-center gap-2">
                            <span className="text-orange-500 text-xs">🐌</span>
                            <span>Plus lent</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-orange-500 text-xs">📊</span>
                            <span>Plus de mémoire utilisée</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-orange-500 text-xs">⚠️</span>
                            <span>Limite: 1000 lignes</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-orange-500 text-xs">❌</span>
                            <span>Erreur 500 possible</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sélection de fichier */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sélectionnez un fichier :
              </label>
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  isDragging 
                    ? 'border-[#F77F00] bg-orange-50/50' 
                    : file 
                      ? 'border-green-500 bg-green-50/30' 
                      : 'border-gray-300 bg-gray-50 hover:border-[#F77F00]'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
                role="button"
                tabIndex={0}
                aria-label="Zone de dépôt de fichier"
              >
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  disabled={isImporting}
                  aria-label="Sélectionner un fichier"
                />
                <div className={`${isImporting ? 'opacity-50' : ''}`}>
                  <div className="text-3xl mb-3 text-gray-400">📄</div>
                  <p className="text-gray-600 mb-1 font-medium">
                    {file ? file.name : isDragging ? 'Déposez le fichier ici' : 'Cliquez ou glissez-déposez un fichier'}
                  </p>
                  <p className="text-gray-500 text-sm mb-3">
                    Formats acceptés : .csv, .xlsx, .xls (max 50MB)
                  </p>
                  <button 
                    type="button"
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isImporting}
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('file-input')?.click();
                    }}
                  >
                    Parcourir les fichiers
                  </button>
                </div>
              </div>
              
              {/* Informations fichier */}
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 text-lg">✓</span>
                      <div>
                        <p className="font-medium text-green-800 truncate max-w-[200px]">{file.name}</p>
                        <p className="text-green-700 text-sm">
                          Taille : {formatFileSize(file.size)} • Format : {file.name.split('.').pop()?.toUpperCase()}
                        </p>
                        {recommendation && (
                          <p className="text-blue-700 text-sm mt-1 flex items-center gap-1">
                            {recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                    {!isImporting && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                        aria-label="Supprimer le fichier"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* Erreur de validation */}
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-red-600">⚠️</span>
                    <div>
                      <p className="font-medium text-red-800">Validation échouée</p>
                      <p className="text-red-700 text-sm">{validationError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Informations importantes */}
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <span>📋</span>
                Instructions importantes
              </h4>
              <ul className="text-yellow-700 text-sm space-y-1 pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5 shrink-0">•</span>
                  <span>Les colonnes <strong className="font-bold">NOM</strong> et <strong className="font-bold">PRENOMS</strong> sont obligatoires</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5 shrink-0">•</span>
                  <span>Format des dates : <strong className="font-bold">AAAA-MM-JJ</strong> ou <strong className="font-bold">Thu Jul 12 2001 00:00:00 GMT+0000</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5 shrink-0">•</span>
                  <span>Les contacts doivent être au format numérique (8 chiffres)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5 shrink-0">•</span>
                  <span>Pour les fichiers Excel volumineux, utilisez CSV pour plus de rapidité</span>
                </li>
              </ul>
            </div>

            {/* Option "Ne plus afficher" */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideInstructions}
                  onChange={(e) => handleHideInstructionsChange(e.target.checked)}
                  className="h-4 w-4 text-[#F77F00] rounded focus:ring-[#F77F00]"
                  disabled={isImporting}
                />
                <span className="text-gray-700 text-sm">
                  Ne plus afficher ces instructions
                </span>
              </label>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isImporting}
                className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
              >
                Annuler
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!file || isImporting || !!validationError}
                className="flex-1 px-4 py-3 bg-[#F77F00] text-white rounded-lg hover:bg-[#e46f00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {mode === 'smart' ? 'Synchronisation...' : 'Importation...'}
                  </>
                ) : (
                  <>
                    <span className="text-lg">{getModeIcon()}</span>
                    {mode === 'smart' ? 'Synchroniser' : 'Importer'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Pied de page avec informations supplémentaires */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 rounded-b-xl">
            <div className="text-xs text-gray-600 space-y-1">
              <p className="flex items-center gap-2">
                <span>💡</span>
                <span>L'import peut prendre quelques minutes selon la taille du fichier</span>
              </p>
              {mode === 'smart' && (
                <p className="flex items-center gap-2">
                  <span>🔄</span>
                  <span>La synchronisation conserve les données existantes</span>
                </p>
              )}
              <p className="flex items-center gap-2">
                <span>📄</span>
                <span>Utilisez le format CSV pour les meilleures performances</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImportModal;