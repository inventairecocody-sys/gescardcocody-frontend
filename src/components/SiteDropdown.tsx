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
      const response = await api.get('/api/import-export/sites');
      setSites(response.data.sites || []);
      setFilteredSites(response.data.sites || []);
    } catch (error) {
      console.error('Erreur chargement sites:', error);
      setSites([]);
      setFilteredSites([]);
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
        <div className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 animate-pulse">
          Chargement des sites...
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
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
                <span className="text-sm text-gray-600">
                  {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''} disponible{filteredSites.length > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Fermer
                </button>
              </div>
            </div>
            
            {/* Liste des sites */}
            <div className="py-1">
              {filteredSites.length === 0 ? (
                <div className="px-3 py-3 text-gray-500 text-center">
                  {search ? 'Aucun site trouvé pour cette recherche' : 'Aucun site disponible'}
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
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between ${
                        isSelected 
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {multiple && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                        )}
                        <span className={isSelected ? 'font-semibold' : ''}>
                          {site}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-blue-600 font-bold">✓</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Pour sélection multiple : bouton valider */}
            {multiple && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="w-full py-2 bg-[#F77F00] text-white rounded-lg hover:bg-[#e46f00] transition-colors font-medium"
                >
                  Valider ({(selectedSites as string[]).length})
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