import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { CaseCard } from "./CaseCard";
import { TunisiaMap } from "./TunisiaMap";
import { Megaphone, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import type { TunisiaCase } from "../../data/tunisiaData";
import { fetchCases, fetchStats } from "../../lib/backendApi";

export function HomePage() {
  const { t } = useTranslation();
  const [cases, setCases] = useState<TunisiaCase[]>([]);
  const [stats, setStats] = useState({
    totalCases: 0,
    resolvedCases: 0,
    helpingCases: 0,
    governorates: 0,
    sufferingCases: 0
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [casesData, statsData] = await Promise.all([
          fetchCases({ limit: 100 }),
          fetchStats()
        ]);
        setCases(casesData);
        setStats({
          totalCases: statsData.overview.totalCases,
          resolvedCases: statsData.overview.resolvedCases,
          helpingCases: statsData.overview.helpingCases,
          governorates: statsData.casesByGovernorate.length,
          sufferingCases: statsData.overview.sufferingCases
        });
      } catch (error) {
        console.error("Failed to load homepage data", error);
      }
    };
    void load();
  }, []);

  const recentCases = useMemo(() => cases.slice(0, 5), [cases]);

  return (
    <div className="bg-[#FDF6EC]">
      {/* Hero Section */}
      <section className="min-h-[calc(100vh-72px)] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
        {/* Left Half */}
        <div className="flex flex-col justify-center px-6 lg:px-24 py-12 lg:py-0">
          <div className="uppercase text-[#C0392B] font-bold text-[11px] tracking-[2px] mb-6">
            {t("home.hero_subtitle")}
          </div>

          <h1 className="text-[42px] md:text-[56px] font-bold text-[#1C1C1E] leading-[1.1] mb-6">
            {t("home.hero_title_line1")}
            <br />
            {t("home.hero_title_line2")}
            <br />
            {t("home.hero_title_line3")}
          </h1>

          <p className="text-lg text-[#6B6B6B] max-w-[480px] mb-8 leading-relaxed">
            {t("home.hero_description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link to="/cas">
              <Button className="bg-[#C0392B] hover:bg-[#A02E24] text-white rounded-xl h-14 px-8 text-base font-semibold">
                {t("home.view_cases")} <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link to="/creer-cas">
              <Button
                variant="outline"
                className="border-2 border-[#1A0A00] text-[#1A0A00] hover:bg-[#1A0A00] hover:text-white rounded-xl h-14 px-8 text-base font-semibold"
              >
                {t("home.report_case")}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-12">
            <div>
              <div className="text-[40px] font-bold text-[#C0392B]">
                {stats.totalCases}
              </div>
              <div className="text-sm text-[#6B6B6B]">
                {t("home.cases_reported")}
              </div>
            </div>
            <div>
              <div className="text-[40px] font-bold text-[#27AE60]">
                {stats.resolvedCases}
              </div>
              <div className="text-sm text-[#6B6B6B]">Résolus</div>
            </div>
            <div>
              <div className="text-[40px] font-bold text-[#E67E22]">
                {stats.governorates}
              </div>
              <div className="text-sm text-[#6B6B6B]">Gouvernorats</div>
            </div>
          </div>
        </div>

        {/* Right Half - Tunisia Map */}
        <div className="p-6 lg:p-8 flex items-center">
          <TunisiaMap cases={cases} height="600px" zoom={6} />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[36px] font-bold text-[#1C1C1E] text-center mb-4">
            Comment ça fonctionne ?
          </h2>
          <p className="text-center text-[#6B6B6B] text-lg mb-16">
            Simple, rapide et transparent
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
                01
              </div>
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Megaphone size={64} className="text-[#C0392B]" />
              </div>
              <h3 className="font-bold text-xl text-[#1C1C1E] mb-3">
                Signaler un cas
              </h3>
              <p className="text-[#6B6B6B]">
                Tout citoyen peut signaler une situation de souffrance en
                quelques clics
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight size={32} className="text-gray-300" />
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
                02
              </div>
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <ShieldCheck size={64} className="text-[#E67E22]" />
              </div>
              <h3 className="font-bold text-xl text-[#1C1C1E] mb-3">
                Vérification
              </h3>
              <p className="text-[#6B6B6B]">
                Notre équipe vérifie chaque cas pour garantir son authenticité
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight size={32} className="text-gray-300" />
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
                03
              </div>
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Heart size={64} className="text-[#27AE60]" fill="#27AE60" />
              </div>
              <h3 className="font-bold text-xl text-[#1C1C1E] mb-3">
                Aide apportée
              </h3>
              <p className="text-[#6B6B6B]">
                Les bénévoles, ONG et donateurs se mobilisent pour apporter leur
                aide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Cases Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[36px] font-bold text-[#1C1C1E]">
              Les derniers cas signalés
            </h2>
            <Link
              to="/cas"
              className="text-[#C0392B] hover:text-[#A02E24] font-semibold flex items-center gap-2"
            >
              Voir tous les cas <ArrowRight size={20} />
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {recentCases.map((caseData) => (
              <CaseCard key={caseData.id} case={caseData} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#1A0A00] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-[72px] font-bold text-[#C0392B] mb-2">
                {stats.sufferingCases}
              </div>
              <div className="text-white text-lg">Cas encore en souffrance</div>
            </div>
            <div className="border-l border-r border-gray-700">
              <div className="text-[72px] font-bold text-[#E67E22] mb-2">
                {stats.helpingCases}
              </div>
              <div className="text-white text-lg">En cours d'aide</div>
            </div>
            <div>
              <div className="text-[72px] font-bold text-[#27AE60] mb-2">
                {stats.resolvedCases}
              </div>
              <div className="text-white text-lg">Cas résolus</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#C0392B] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[36px] md:text-[42px] font-bold text-white mb-8">
            Vous pouvez changer une vie aujourd'hui
          </h2>
          <Link to="/inscription">
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-[#C0392B] rounded-xl h-14 px-12 text-lg font-semibold"
            >
              Créer un compte gratuitement
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
