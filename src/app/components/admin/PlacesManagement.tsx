import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TunisiaMap } from '../touneshelp/TunisiaMap';
import { tunisiaGovernorates } from '../../data/tunisiaData';
import type { TunisiaCase } from '../../data/tunisiaData';
import { fetchCases } from '../../lib/backendApi';
import { Search, MapPin, Edit, Trash2, Plus, Map } from 'lucide-react';

/**
 * PlacesManagement Component
 * This section is an operational command center. By maintaining accurate locations of needs across Tunisia,
 * we empower volunteers and NGOs to reach vulnerable populations faster. A pinpoint on this map is
 * often a lifeline for a family in crisis.
 */
export function PlacesManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [cases, setCases] = useState<TunisiaCase[]>([]);

  // Fetch geographic spread of suffering to better orchestrate help
  useEffect(() => {
    void fetchCases({ limit: 500 }).then(setCases).catch(err => console.error("Failed to fetch cases for map", err));
  }, []);

  /**
   * Calculating crisis density per governorate. 
   * This helps administration identify regions requiring urgent humanitarian intervention
   * and allows us to distribute resources equitably across the country.
   */
  const governorateStats = tunisiaGovernorates.map((gov: string) => {
    const govCases = cases.filter((c: TunisiaCase) => c.governorate === gov);
    const avgLat = govCases.reduce((sum: number, c: TunisiaCase) => sum + c.coordinates[0], 0) / govCases.length || 0;
    const avgLng = govCases.reduce((sum: number, c: TunisiaCase) => sum + c.coordinates[1], 0) / govCases.length || 0;
    
    return {
      name: gov,
      caseCount: govCases.length,
      coordinates: [avgLat, avgLng] as [number, number],
      lastUpdated: new Date() // Refreshed live to ensure we operate on current data and reach victims on time
    };
  }).filter(gov => gov.caseCount > 0);

  const filteredLocations = governorateStats.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A202C]">Lieux & Locations</h2>
          <p className="text-sm text-[#718096] mt-1">Gérer les emplacements géographiques pour accélérer l'aide</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F5F7FA] rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-[#1E88E5] shadow-sm'
                  : 'text-[#718096] hover:text-[#1A202C]'
              }`}
            >
              <Map size={16} className="inline mr-2" />
              Carte
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-[#1E88E5] shadow-sm'
                  : 'text-[#718096] hover:text-[#1A202C]'
              }`}
            >
              Liste
            </button>
          </div>
          <Button className="bg-[#1E88E5] hover:bg-[#1976D2] text-white">
            <Plus size={18} className="mr-2" />
            Ajouter un lieu
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-white border border-[#E2E8F0]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" size={18} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par gouvernorat pour cibler l'intervention..."
            className="w-full pl-10"
          />
        </div>
      </Card>

      {/* Overview built to visualize impact and need across communities */}
      {viewMode === 'map' && (
        <Card className="p-6 bg-white border border-[#E2E8F0]">
          <TunisiaMap cases={cases} height="600px" zoom={6} />
        </Card>
      )}

      {viewMode === 'list' && (
        <Card className="bg-white border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F7FA] border-b border-[#E2E8F0]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A202C]">Gouvernorat</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A202C]">Nombre de cas</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A202C]">Coordonnées cibles</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A202C]">Dernière mise à jour</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-[#1A202C]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredLocations.map((location, index: number) => (
                  <tr
                    key={location.name}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F5F7FA]/30'} hover:bg-[#E3F2FD] transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E3F2FD] rounded-lg flex items-center justify-center">
                          <MapPin className="text-[#1E88E5]" size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-[#1A202C]">{location.name}</div>
                          <div className="text-xs text-[#718096]">Tunisie</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-[#1E88E5] text-white">
                        {location.caseCount} urgence{location.caseCount > 1 ? 's' : ''}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#1A202C] font-mono">
                        {location.coordinates[0].toFixed(4)}°, {location.coordinates[1].toFixed(4)}°
                      </div>
                      <button className="text-xs text-[#1E88E5] hover:underline mt-1">
                        Copier pour les équipes de terrain
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#718096]">
                        {location.lastUpdated.toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${location.coordinates[0]},${location.coordinates[1]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline" className="text-xs">
                            <Map size={14} className="mr-1" />
                            Voir
                          </Button>
                        </a>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Edit size={14} className="mr-1" />
                          Modifier
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs text-[#E53935] border-[#E53935] hover:bg-[#E53935] hover:text-white">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLocations.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="mx-auto text-[#718096] mb-3" size={48} />
              <h3 className="text-lg font-medium text-[#1A202C] mb-2">Aucune alerte ici</h3>
              <p className="text-sm text-[#718096]">
                Essayez de modifier votre recherche
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Snapshot of our geographic capacity to render help */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E3F2FD] rounded-lg flex items-center justify-center">
              <MapPin className="text-[#1E88E5]" size={20} />
            </div>
            <div>
              <p className="text-xs text-[#718096]">Régions atteintes</p>
              <p className="text-xl font-bold text-[#1A202C]">{governorateStats.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center">
              <svg className="text-[#43A047]" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[#718096]">Emplacements d'urgence</p>
              <p className="text-xl font-bold text-[#1A202C]">{cases.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFF3E0] rounded-lg flex items-center justify-center">
              <svg className="text-[#FF9800]" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[#718096]">En attente de repérage</p>
              <p className="text-xl font-bold text-[#1A202C]">0</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FCE4EC] rounded-lg flex items-center justify-center">
              <svg className="text-[#E53935]" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[#718096]">Vérifications sur terrain</p>
              <p className="text-xl font-bold text-[#1A202C]">0</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
