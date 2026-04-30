import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CaseCard } from "./CaseCard";
import { tunisiaGovernorates } from "../../data/tunisiaData";
import type { CaseStatus, TunisiaCase } from "../../data/tunisiaData";
import { fetchCases } from "../../lib/backendApi";

export function CasesPage() {
  const { t } = useTranslation();
  const [cases, setCases] = useState<TunisiaCase[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | 'all'>('all');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setCases(await fetchCases({ limit: 200 }));
      } catch (error) {
        console.error("Failed to load cases", error);
      }
    };
    void load();
  }, []);

  const filteredCases = useMemo(() => cases.filter((c) => {
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (selectedGovernorate !== 'all' && c.governorate !== selectedGovernorate) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }), [cases, selectedStatus, selectedGovernorate, searchQuery]);

  const featuredCases = useMemo(() => cases.slice(0, 4), [cases]);

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      {/* Page Header */}
      <section className="bg-[#1A0A00] py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[48px] font-bold text-white mb-4">{t("navigation.cases", "Les Cas")}</h1>
          <p className="text-white/60 text-lg mb-8">
            {t("cases_list.each_card_desc", "Chaque carte représente une vraie personne qui attend votre aide")}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-[600px] mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder={t("cases_list.search_placeholder", "Rechercher par titre, lieu, situation...")}
              className="w-full h-14 pl-12 pr-4 rounded-full bg-white border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-[72px] z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Status Filters */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedStatus === 'all'
                    ? 'bg-[#C0392B] text-white shadow-md'
                    : 'bg-white text-[#6B6B6B] border-2 border-gray-200 hover:border-[#C0392B]'
                }`}
              >
                {t("cases_list.all", "Tous")}
              </button>
              <button
                onClick={() => setSelectedStatus('suffering')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedStatus === 'suffering'
                    ? 'bg-[#C0392B] text-white shadow-md'
                    : 'bg-white text-[#C0392B] border-2 border-[#C0392B] hover:bg-[#C0392B] hover:text-white'
                }`}
              >
                {t("home.suffering_cases", "Souffre encore")}
              </button>
              <button
                onClick={() => setSelectedStatus('helping')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedStatus === 'helping'
                    ? 'bg-[#E67E22] text-white shadow-md'
                    : 'bg-white text-[#E67E22] border-2 border-[#E67E22] hover:bg-[#E67E22] hover:text-white'
                }`}
              >
                {t("home.helping_cases", "En cours d'aide")}
              </button>
              <button
                onClick={() => setSelectedStatus('resolved')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedStatus === 'resolved'
                    ? 'bg-[#27AE60] text-white shadow-md'
                    : 'bg-white text-[#27AE60] border-2 border-[#27AE60] hover:bg-[#27AE60] hover:text-white'
                }`}
              >
                {t("admin.resolved", "Résolu")}
              </button>
            </div>

            {/* Additional Filters */}
            <div className="flex gap-3">
              <Select value={selectedGovernorate} onValueChange={setSelectedGovernorate}>
                <SelectTrigger className="w-[180px] rounded-lg">
                  <SelectValue placeholder="Gouvernorat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("cases_list.all_governorates", "Tous les gouvernorats")}</SelectItem>
                  {tunisiaGovernorates.map((gov) => (
                    <SelectItem key={gov} value={gov}>
                      {gov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select defaultValue="recent">
                <SelectTrigger className="w-[160px] rounded-lg">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t("cases_list.most_recent", "Plus récent")}</SelectItem>
                  <SelectItem value="oldest">Plus ancien</SelectItem>
                  <SelectItem value="governorate">Par gouvernorat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Featured Cases - Horizontal Scroll */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#1C1C1E]">{t("cases_list.featured", "À la une")}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full">
                <ChevronLeft size={20} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {featuredCases.map((caseData) => (
              <CaseCard key={caseData.id} case={caseData} />
            ))}
          </div>
        </section>

        {/* All Cases Grid */}
        <section>
          <h2 className="text-2xl font-bold text-[#1C1C1E] mb-6">
            {t("map_page.all_cases", "Tous les cas")} ({filteredCases.length})
          </h2>
          
          {filteredCases.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#6B6B6B] text-lg mb-4">Aucun cas trouvé</p>
              <Button
                onClick={() => {
                  setSelectedStatus('all');
                  setSelectedGovernorate('all');
                  setSearchQuery('');
                }}
                className="bg-[#C0392B] hover:bg-[#A02E24]"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCases.map((caseData) => (
                  <div key={caseData.id} className="flex justify-center">
                    <CaseCard case={caseData} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button variant="outline" size="icon" className="rounded-lg">
                  <ChevronLeft size={20} />
                </Button>
                <Button className="bg-[#C0392B] text-white w-10 h-10 rounded-lg">1</Button>
                <Button variant="outline" className="w-10 h-10 rounded-lg">2</Button>
                <Button variant="outline" className="w-10 h-10 rounded-lg">3</Button>
                <Button variant="outline" size="icon" className="rounded-lg">
                  <ChevronRight size={20} />
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
