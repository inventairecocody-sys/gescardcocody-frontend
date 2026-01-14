import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
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

  const validateFile = (selectedFile: File): boolean => {
    // Vérifier le type de fichier
    const isValidType = selectedFile.name.endsWith('.xlsx') || 
                       selectedFile.name.endsWith('.xls') ||
                       selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                       selectedFile.type === 'application/vnd.ms-excel';
    
    if (!isValidType) {
      setValidationError('❌ Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      return false;
    }

    // Vérifier la taille (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      const sizeMB = (selectedFile.size / 1024 / 1024).toFixed(2);
      setValidationError(`❌ Fichier trop volumineux (${sizeMB}MB). Maximum: 50MB`);
      return false;
    }

    // Vérifier les entêtes (noms de colonnes requis)
    const validExtensions = ['.xlsx', '.xls'];
    const hasValidExtension = validExtensions.some(ext => 
      selectedFile.name.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidExtension) {
      setValidationError('❌ Format non supporté. Utilisez .xlsx ou .xls');
      return false;
    }

    setValidationError(null);
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

  const handleSubmit = () => {
    if (file) {
      onFileSelect(file);
      if (hideInstructions) {
        localStorage.setItem('hideImportInstructions', 'true');
      }
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationError(null);
    onClose();
  };

  const handleHideInstructionsChange = (checked: boolean) => {
    setHideInstructions(checked);
    localStorage.setItem('hideImportInstructions', checked.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
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
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* En-tête */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📤</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">Importation Excel</h2>
                  <p className="text-white/90 text-sm">
                    {mode === 'smart' ? 'Synchronisation Intelligente' : 'Importation Standard'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isImporting}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50"
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
                    className={`p-3 border rounded-lg transition-all ${
                      mode === 'standard'
                        ? 'border-[#0077B6] bg-blue-50 text-[#0077B6] ring-2 ring-blue-100'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    } ${isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">📤</div>
                      <p className="font-medium">Standard</p>
                      <p className="text-xs mt-1">Ajoute seulement</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => onModeChange('smart')}
                    disabled={isImporting}
                    className={`p-3 border rounded-lg transition-all ${
                      mode === 'smart'
                        ? 'border-[#2E8B57] bg-green-50 text-[#2E8B57] ring-2 ring-green-100'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    } ${isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">🔄</div>
                      <p className="font-medium">Intelligent</p>
                      <p className="text-xs mt-1">Synchronise</p>
                    </div>
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
                    Synchronisation Intelligente
                  </h3>
                  <p className="text-green-700 text-sm mb-3">
                    Synchronise les données au lieu de créer des doublons :
                  </p>
                  <ul className="text-green-700 text-sm space-y-1 pl-1">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Met à jour la <strong className="font-bold">DÉLIVRANCE</strong> si différente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Garde les <strong className="font-bold">CONTACTS</strong> existants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Garde la <strong className="font-bold">DATE</strong> de délivrance existante</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Ajoute les nouvelles personnes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Ignorer les doublons exacts</span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <span>📤</span>
                    Importation Standard
                  </h3>
                  <ul className="text-blue-700 text-sm space-y-1 pl-1">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Ajoute de nouvelles cartes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Ignore les doublons existants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Valide les en-têtes requis (NOM, PRENOMS)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Formate automatiquement les dates et contacts</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Sélection de fichier */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sélectionnez un fichier Excel :
              </label>
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer bg-gray-50 ${
                  file 
                    ? 'border-green-500 bg-green-50/30' 
                    : 'border-gray-300 hover:border-[#F77F00]'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  className="hidden"
                  disabled={isImporting}
                />
                <label htmlFor="file-input" className={`cursor-pointer ${isImporting ? 'opacity-50' : ''}`}>
                  <div className="text-3xl mb-3 text-gray-400">📄</div>
                  <p className="text-gray-600 mb-1">
                    {file ? file.name : 'Cliquez ou glissez-déposez un fichier'}
                  </p>
                  <p className="text-gray-500 text-sm mb-3">
                    Formats acceptés : .xlsx, .xls (max 50MB)
                  </p>
                  <button 
                    type="button"
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm disabled:opacity-50"
                    disabled={isImporting}
                  >
                    Parcourir les fichiers
                  </button>
                </label>
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
                        <p className="font-medium text-green-800">{file.name}</p>
                        <p className="text-green-700 text-sm">
                          Taille : {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    {!isImporting && (
                      <button
                        onClick={() => setFile(null)}
                        className="text-gray-500 hover:text-gray-700"
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
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>Les colonnes <strong className="font-bold">NOM</strong> et <strong className="font-bold">PRENOMS</strong> sont obligatoires</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>Format des dates : <strong className="font-bold">AAAA-MM-JJ</strong> (ex: 2024-01-15)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>Les contacts sont automatiquement formatés (8 chiffres)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>Téléchargez le template pour voir la structure</span>
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
                className="flex-1 px-4 py-3 bg-[#F77F00] text-white rounded-lg hover:bg-[#e46f00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {mode === 'smart' ? 'Synchronisation...' : 'Importation...'}
                  </>
                ) : (
                  <>
                    <span className="text-lg">{mode === 'smart' ? '🔄' : '📤'}</span>
                    {mode === 'smart' ? 'Synchroniser' : 'Importer'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Pied de page avec informations supplémentaires */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 rounded-b-xl">
            <div className="text-xs text-gray-600">
              <p className="flex items-center gap-2">
                <span>💡</span>
                <span>L'import peut prendre quelques minutes selon la taille du fichier</span>
              </p>
              {mode === 'smart' && (
                <p className="mt-1 flex items-center gap-2">
                  <span>🔄</span>
                  <span>La synchronisation conserve les données existantes</span>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImportModal;