import React, { useState, useEffect } from 'react';
import api from '../service/api';

interface SiteDropdownProps {
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
  selectedSites?: string[] | string;
  placeholder?: string;
  className?: string;
}

const SiteDropdown: React.FC<SiteDropdownProps> = ({ 
  multiple = false, 
  onChange, 
  selectedSites = multiple ? [] : '', 
  placeholder = "Rechercher un site...",
  className = ""
}) => {
  const [sites, setSites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSites, setFilteredSites] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (search === '') {
      setFilteredSites(sites);
    } else {
      const filtered = sites.filter(site =>
        site.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredSites(filtered);
    }
  }, [search, sites]);

  const loadSites = async () => {
    try {
      setError('');
      console.log('🔍 Chargement des sites pour tous les utilisateurs...');
      
      // ✅ CHANGEMENT ICI : Appeler l'endpoint public ou sans restriction de rôle
      const response = await api.get('/api/sites/public');
      
      if (response.data.sites && Array.isArray(response.data.sites)) {
        setSites(response.data.sites);
        setFilteredSites(response.data.sites);
        console.log(`✅ ${response.data.sites.length} sites chargés pour tous les utilisateurs`);
      } else {
        // Fallback: essayer l'ancien endpoint si le nouveau ne fonctionne pas
        const fallbackResponse = await api.get('/api/import-export/sites');
        setSites(fallbackResponse.data.sites || []);
        setFilteredSites(fallbackResponse.data.sites || []);
        console.log(`✅ ${fallbackResponse.data.sites?.length || 0} sites chargés (fallback)`);
      }
      
    } catch (error: any) {
      console.error('❌ Erreur chargement sites:', error);
      
      // ✅ AJOUT : Utiliser des sites par défaut si l'API échoue
      const defaultSites = [
        "ABIDJAN NORD-COCODY",
        "ABIDJAN SUD-PLATEAU",
        "ABOBO",
        "ADJAME",
        "ATTECOUBE",
        "BINGERVILLE",
        "COCODY",
        "KOUMASSI",
        "MARCORY",
        "PLATEAU",
        "TREICHVILLE",
        "YOPOUGON"
      ];
      
      setSites(defaultSites);
      setFilteredSites(defaultSites);
      setError('Chargement API échoué, sites par défaut utilisés');
      
      console.log('⚠️ Utilisation des sites par défaut:', defaultSites.length, 'sites');
    } finally {
      setLoading(false);
    }
  };

  const handleSiteSelect = (site: string) => {
    if (multiple) {
      const currentSites = selectedSites as string[];
      const newSites = currentSites.includes(site)
        ? currentSites.filter(s => s !== site)
        : [...currentSites, site];
      onChange(newSites);
    } else {
      onChange(site);
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleRemoveSite = (site: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      const currentSites = selectedSites as string[];
      const newSites = currentSites.filter(s => s !== site);
      onChange(newSites);
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      const sites = selectedSites as string[];
      if (sites.length === 0) return search;
      return `${sites.length} site${sites.length > 1 ? 's' : ''} sélectionné${sites.length > 1 ? 's' : ''}`;
    } else {
      return selectedSites as string;
    }
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 animate-pulse flex items-center justify-between">
          <span className="text-gray-500">Chargement des sites...</span>
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Message d'erreur discret */}
      {error && (
        <div className="mb-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
          ⚠️ {error}
        </div>
      )}
      
      {/* Champ de recherche avec dropdown */}
      <div className="relative">
        <div
          onClick={() => setIsOpen(true)}
          className={`w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F77F00] focus:border-[#F77F00] transition-all duration-200 min-h-[42px] flex items-center flex-wrap gap-1 ${isOpen ? 'ring-2 ring-[#F77F00] border-[#F77F00]' : ''}`}
        >
          {/* Affichage des sites sélectionnés (multi) */}
          {multiple && Array.isArray(selectedSites) && selectedSites.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {(selectedSites as string[]).map((site, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-[#F77F00] text-white text-xs px-2 py-1 rounded-full"
                >
                  {site}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSite(site, e)}
                    className="text-white hover:text-gray-200 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={(selectedSites as string[]).length === 0 ? placeholder : "Ajouter un site..."}
                className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-gray-700 placeholder-gray-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <input
              type="text"
              value={multiple ? search : getDisplayValue()}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!multiple) {
                  onChange(e.target.value);
                }
              }}
              placeholder={placeholder}
              className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-400"
              onFocus={() => setIsOpen(true)}
            />
          )}
          
          {/* Indicateur de nombre de sites */}
          {!multiple && sites.length > 0 && (
            <span className="absolute right-10 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {sites.length} sites
            </span>
          )}
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {isOpen ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Dropdown des sites */}
      {isOpen && (
        <>
          {/* Overlay pour fermer en cliquant ailleurs */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* En-tête du dropdown */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600 font-medium">
                    {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''} disponible{filteredSites.length > 1 ? 's' : ''}
                  </span>
                  {error && (
                    <span className="ml-2 text-xs text-yellow-600">(Données locales)</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearch('');
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    Effacer recherche
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
            
            {/* Liste des sites */}
            <div className="py-1">
              {filteredSites.length === 0 ? (
                <div className="px-3 py-4 text-gray-500 text-center">
                  <div className="text-lg mb-1">🔍</div>
                  <p className="font-medium">Aucun site trouvé</p>
                  <p className="text-sm mt-1">Essayez avec d'autres termes</p>
                </div>
              ) : (
                filteredSites.map((site, index) => {
                  const isSelected = multiple 
                    ? (selectedSites as string[]).includes(site)
                    : selectedSites === site;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleSiteSelect(site)}
                      className={`px-3 py-3 cursor-pointer hover:bg-gray-50 transition-all duration-200 flex items-center justify-between border-b border-gray-100 last:border-b-0 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-blue-50 to-green-50 text-blue-700 border-l-4 border-[#F77F00]' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#F77F00] text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {isSelected ? '✓' : '🏢'}
                        </div>
                        <div>
                          <span className={`font-medium ${isSelected ? 'text-[#F77F00]' : 'text-gray-800'}`}>
                            {site}
                          </span>
                          {isSelected && (
                            <div className="text-xs text-gray-500 mt-0.5">Cliquez pour désélectionner</div>
                          )}
                        </div>
                      </div>
                      {isSelected && !multiple && (
                        <div className="text-[#F77F00] font-bold text-lg">✓</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Pour sélection multiple : bouton valider */}
            {multiple && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Sélection : {(selectedSites as string[]).length} site{(selectedSites as string[]).length !== 1 ? 's' : ''}
                  </span>
                  {(selectedSites as string[]).length > 0 && (
                    <button
                      onClick={() => onChange([])}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                    >
                      Tout effacer
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-lg hover:from-[#e46f00] hover:to-[#FF8C00] transition-all duration-300 font-medium shadow-sm hover:shadow"
                >
                  Valider la sélection
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SiteDropdown;