import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CaseCard } from "./CaseCard";
import { tunisiaGovernorates } from "../../data/tunisiaData";
import type { CaseStatus, TunisiaCase } from "../../data/tunisiaData";
import { fetchCases } from "../../lib/backendApi";

const PAGE_SIZE = 9;
type SortOrder = "recent" | "oldest" | "governorate";

export function CasesPage() {
  const { t } = useTranslation();
  const [cases, setCases] = useState<TunisiaCase[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | "all">("all");
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetchCases({ limit: 500 })
      .then(setCases)
      .catch((err) => console.error("Failed to load cases", err));
  }, []);

  // Reset page when any filter changes
  useEffect(() => { setCurrentPage(1); }, [selectedStatus, selectedGovernorate, searchQuery, sortOrder]);

  // 1. Filter
  const filteredCases = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return cases.filter((c) => {
      if (selectedStatus !== "all" && c.status !== selectedStatus) return false;
      if (selectedGovernorate !== "all" && c.governorate !== selectedGovernorate) return false;
      if (q && !c.title.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q) && !c.governorate.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [cases, selectedStatus, selectedGovernorate, searchQuery]);

  // 2. Sort
  const sortedCases = useMemo(() => {
    const arr = [...filteredCases];
    if (sortOrder === "recent")
      return arr.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
    if (sortOrder === "oldest")
      return arr.sort((a, b) => new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime());
    if (sortOrder === "governorate")
      return arr.sort((a, b) => a.governorate.localeCompare(b.governorate));
    return arr;
  }, [filteredCases, sortOrder]);

  // 3. Paginate
  const totalPages = Math.max(1, Math.ceil(sortedCases.length / PAGE_SIZE));
  const pagedCases = sortedCases.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const featuredCases = useMemo(() => cases.slice(0, 8), [cases]);

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === "left" ? -carouselRef.current.clientWidth * 0.7 : carouselRef.current.clientWidth * 0.7, behavior: "smooth" });
  };

  const pageNumbers = useMemo(() => {
    const delta = 2, range: number[] = [];
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) range.push(i);
    return range;
  }, [currentPage, totalPages]);

  // Live counts per status
  const counts = useMemo(() => ({
    all:       cases.length,
    suffering: cases.filter((c) => c.status === "suffering").length,
    helping:   cases.filter((c) => c.status === "helping").length,
    resolved:  cases.filter((c) => c.status === "resolved").length,
  }), [cases]);

  const statusOptions: { value: CaseStatus | "all"; label: string; activeColor: string; inactiveClass: string }[] = [
    { value: "all",       label: t("cases_list.all", "Tous"),                 activeColor: "bg-[#C0392B]", inactiveClass: "border-gray-200 text-[#6B6B6B] hover:border-[#C0392B] hover:text-[#C0392B]" },
    { value: "suffering", label: t("home.suffering_cases", "Souffre encore"), activeColor: "bg-[#C0392B]", inactiveClass: "border-[#C0392B] text-[#C0392B] hover:bg-[#C0392B] hover:text-white" },
    { value: "helping",   label: t("home.helping_cases", "En cours d'aide"), activeColor: "bg-[#E67E22]", inactiveClass: "border-[#E67E22] text-[#E67E22] hover:bg-[#E67E22] hover:text-white" },
    { value: "resolved",  label: t("admin.resolved", "Résolu"),               activeColor: "bg-[#27AE60]", inactiveClass: "border-[#27AE60] text-[#27AE60] hover:bg-[#27AE60] hover:text-white" },
  ];

  const hasActiveFilter = selectedStatus !== "all" || selectedGovernorate !== "all" || searchQuery !== "";
  const resetAll = () => { setSelectedStatus("all"); setSelectedGovernorate("all"); setSearchQuery(""); setSortOrder("recent"); };

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      {/* Header */}
      <section className="bg-[#1A0A00] py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[48px] font-bold text-white mb-4">{t("navigation.cases", "Les Cas")}</h1>
          <p className="text-white/60 text-lg mb-8">
            {t("cases_list.each_card_desc", "Chaque carte représente une vraie personne qui attend votre aide")}
          </p>
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
            {/* Status pills with live counts */}
            <div className="flex flex-wrap gap-3">
              {statusOptions.map(({ value, label, activeColor, inactiveClass }) => (
                <button
                  key={value}
                  onClick={() => setSelectedStatus(value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                    selectedStatus === value
                      ? `${activeColor} text-white shadow-md border-transparent`
                      : `bg-white ${inactiveClass}`
                  }`}
                >
                  {label}
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    selectedStatus === value ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {counts[value]}
                  </span>
                </button>
              ))}
            </div>

            {/* Governorate + Sort */}
            <div className="flex gap-3 flex-wrap">
              <Select value={selectedGovernorate} onValueChange={setSelectedGovernorate}>
                <SelectTrigger className="w-[180px] rounded-lg">
                  <SelectValue placeholder={t("cases_list.all_governorates")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("cases_list.all_governorates", "Tous les gouvernorats")}</SelectItem>
                  {tunisiaGovernorates.map((gov) => (
                    <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
                <SelectTrigger className="w-[160px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t("cases_list.most_recent", "Plus récent")}</SelectItem>
                  <SelectItem value="oldest">{t("cases_list.oldest", "Plus ancien")}</SelectItem>
                  <SelectItem value="governorate">{t("cases_list.by_governorate", "Par gouvernorat")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilter && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 items-center">
              <span className="text-xs text-gray-500 font-medium">Filtres actifs :</span>
              {selectedStatus !== "all" && (
                <span className="flex items-center gap-1 text-xs bg-red-50 text-[#C0392B] border border-red-200 px-2 py-0.5 rounded-full font-medium">
                  {statusOptions.find((o) => o.value === selectedStatus)?.label}
                  <button onClick={() => setSelectedStatus("all")}><X size={10} /></button>
                </span>
              )}
              {selectedGovernorate !== "all" && (
                <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                  {selectedGovernorate}
                  <button onClick={() => setSelectedGovernorate("all")}><X size={10} /></button>
                </span>
              )}
              {searchQuery && (
                <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}><X size={10} /></button>
                </span>
              )}
              <button onClick={resetAll} className="text-xs text-gray-400 hover:text-red-500 underline ml-1 transition-colors">
                Tout effacer
              </button>
              <span className="text-xs text-gray-400 ml-auto">
                {sortedCases.length} résultat{sortedCases.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Featured Carousel */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#1C1C1E]">{t("cases_list.featured", "À la une")}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollCarousel("left")} aria-label="Précédent">
                <ChevronLeft size={20} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollCarousel("right")} aria-label="Suivant">
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
          <div ref={carouselRef} className="flex gap-6 overflow-x-auto pb-4 scroll-smooth" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {featuredCases.map((c) => <CaseCard key={c.id} case={c} />)}
          </div>
        </section>

        {/* All Cases Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1C1C1E]">
              {t("map_page.all_cases", "Tous les cas")}
              <span className="ml-2 text-base font-normal text-gray-500">({sortedCases.length})</span>
            </h2>
          </div>

          {sortedCases.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-[#6B6B6B] text-lg mb-4">{t("cases_list.no_cases_found")}</p>
              <Button onClick={resetAll} className="bg-[#C0392B] hover:bg-[#A02E24]">
                {t("cases_list.reset_filters")}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pagedCases.map((c) => (
                  <div key={c.id} className="flex justify-center">
                    <CaseCard case={c} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <Button variant="outline" size="icon" className="rounded-lg" disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft size={20} />
                  </Button>

                  {pageNumbers[0] > 1 && (
                    <>
                      <Button variant="outline" className="w-10 h-10 rounded-lg" onClick={() => setCurrentPage(1)}>1</Button>
                      {pageNumbers[0] > 2 && <span className="px-1 text-gray-400">…</span>}
                    </>
                  )}

                  {pageNumbers.map((p) => (
                    <Button key={p} onClick={() => setCurrentPage(p)}
                      variant={p === currentPage ? "default" : "outline"}
                      className={`w-10 h-10 rounded-lg font-semibold ${
                        p === currentPage
                          ? "bg-[#C0392B] hover:bg-[#A02E24] text-white border-transparent"
                          : "text-gray-700 hover:border-[#C0392B] hover:text-[#C0392B]"
                      }`}>
                      {p}
                    </Button>
                  ))}

                  {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                      {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
                      <Button variant="outline" className="w-10 h-10 rounded-lg" onClick={() => setCurrentPage(totalPages)}>
                        {totalPages}
                      </Button>
                    </>
                  )}

                  <Button variant="outline" size="icon" className="rounded-lg" disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                    <ChevronRight size={20} />
                  </Button>
                </div>
              )}

              {totalPages > 1 && (
                <p className="text-center text-sm text-gray-400 mt-3">
                  Page {currentPage} / {totalPages} &mdash; {sortedCases.length} cas
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
