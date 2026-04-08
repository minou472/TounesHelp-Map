import { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { TunisiaMap } from "./TunisiaMap";
import type { CaseStatus, TunisiaCase } from "../../data/tunisiaData";
import { fetchCases } from "../../lib/backendApi";

export function MapPage() {
  const [cases, setCases] = useState<TunisiaCase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | 'all'>('all');

  useEffect(() => {
    const load = async () => {
      try {
        setCases(await fetchCases({ limit: 300 }));
      } catch (error) {
        console.error("Failed to load map cases", error);
      }
    };
    void load();
  }, []);

  const filteredCases = useMemo(() => cases.filter((c) => {
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.governorate.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }), [cases, selectedStatus, searchQuery]);

  const sufferingCount = cases.filter((c) => c.status === "suffering").length;
  const helpingCount = cases.filter((c) => c.status === "helping").length;
  const resolvedCount = cases.filter((c) => c.status === "resolved").length;

  return (
    <div className="h-[calc(100vh-72px)] relative">
      {/* Search Bar - Floating */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un cas sur la carte..."
            className="w-full h-12 pl-12 pr-4 rounded-full bg-white shadow-lg border-0"
          />
        </div>
      </div>

      {/* Status Filter Pills - Floating */}
      <div className="absolute top-24 left-6 z-10">
        <Card className="p-3 bg-white shadow-lg rounded-xl">
          <div className="space-y-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStatus === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tous les cas
            </button>
            <button
              onClick={() => setSelectedStatus('suffering')}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedStatus === 'suffering'
                  ? 'bg-[#C0392B] text-white'
                  : 'bg-white text-gray-700 hover:bg-red-50'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-[#C0392B]" />
              Souffre encore
            </button>
            <button
              onClick={() => setSelectedStatus('helping')}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedStatus === 'helping'
                  ? 'bg-[#E67E22] text-white'
                  : 'bg-white text-gray-700 hover:bg-orange-50'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-[#E67E22]" />
              En cours d'aide
            </button>
            <button
              onClick={() => setSelectedStatus('resolved')}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedStatus === 'resolved'
                  ? 'bg-[#27AE60] text-white'
                  : 'bg-white text-gray-700 hover:bg-green-50'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-[#27AE60]" />
              Résolu
            </button>
          </div>
        </Card>
      </div>

      {/* Map */}
      <TunisiaMap cases={filteredCases} height="100%" zoom={7} />

      {/* Legend - Floating */}
      <Card className="absolute bottom-6 right-6 p-4 bg-white shadow-lg rounded-xl">
        <h4 className="font-bold text-[#1C1C1E] mb-3">Légende</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#C0392B]" />
            <span className="text-[#6B6B6B]">Souffre encore ({sufferingCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E67E22]" />
            <span className="text-[#6B6B6B]">En cours d'aide ({helpingCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#27AE60]" />
            <span className="text-[#6B6B6B]">Résolu ({resolvedCount})</span>
          </div>
        </div>
      </Card>
    </div>
  );
}