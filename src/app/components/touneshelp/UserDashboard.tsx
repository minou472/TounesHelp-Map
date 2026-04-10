import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "../ui/accordion";
import {
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  Edit,
  Trash
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import type { TunisiaCase } from "../../data/tunisiaData";
import { fetchCases } from "../../lib/backendApi";

export function UserDashboard() {
  const { user } = useAuth();
  const [allCases, setAllCases] = useState<TunisiaCase[]>([]);
  const [userName, setUserName] = useState(user?.name || "Utilisateur");

  useEffect(() => {
    const rawUser = localStorage.getItem("touneshelp_user");
    let userEmail = user?.email || "";

    if (user?.name) {
      setUserName(user.name);
    } else if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser) as { name?: string; email?: string };
        if (parsed.name) {
          setUserName(parsed.name);
        }
        userEmail = userEmail || parsed.email || "";
      } catch {
        // ignore parsing issues
      }
    }

    const load = async () => {
      try {
        const cases = await fetchCases({ limit: 300 });
        setAllCases(
          userEmail ? cases.filter((c) => c.creatorEmail === userEmail) : []
        );
      } catch (error) {
        console.error("Failed to load dashboard cases", error);
        setAllCases([]);
      }
    };
    void load();
  }, []);

  const userCases = useMemo(() => allCases.slice(0, 20), [allCases]);
  const sufferingCases = userCases.filter((c) => c.status === "suffering");
  const helpingCases = userCases.filter((c) => c.status === "helping");
  const resolvedCases = userCases.filter((c) => c.status === "resolved");

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      {/* Welcome Header */}
      <section className="bg-[#FDF6EC] border-b border-[#F0E6D3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-24 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-[36px] font-bold text-[#1C1C1E] mb-2">
                Bon retour, {userName} 👋
              </h1>
              <p className="text-[#6B6B6B]">Voici l'état de vos cas signalés</p>
            </div>
            <Link to="/creer-cas">
              <Button className="bg-[#C0392B] hover:bg-[#A02E24] text-white rounded-xl h-12 px-6 font-semibold">
                <Plus className="mr-2" size={20} />
                Signaler un nouveau cas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="max-w-7xl mx-auto px-6 lg:px-24 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#FFF0EE] border-l-4 border-[#C0392B] p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="text-[#C0392B]" size={32} />
              <div>
                <div className="text-[36px] font-bold text-[#C0392B]">
                  {sufferingCases.length}
                </div>
                <div className="text-[#6B6B6B]">Souffre encore</div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#FFF4ED] border-l-4 border-[#E67E22] p-6">
            <div className="flex items-center gap-4">
              <Clock className="text-[#E67E22]" size={32} />
              <div>
                <div className="text-[36px] font-bold text-[#E67E22]">
                  {helpingCases.length}
                </div>
                <div className="text-[#6B6B6B]">En cours d'aide</div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#F0FFF4] border-l-4 border-[#27AE60] p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="text-[#27AE60]" size={32} />
              <div>
                <div className="text-[36px] font-bold text-[#27AE60]">
                  {resolvedCases.length}
                </div>
                <div className="text-[#6B6B6B]">Résolus</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Accordion Cases */}
      <section className="max-w-7xl mx-auto px-6 lg:px-24 pb-12">
        <Accordion type="single" collapsible className="space-y-4">
          {/* Suffering Cases */}
          <AccordionItem value="suffering" className="border-0">
            <AccordionTrigger className="bg-[#FFF0EE] hover:bg-[#FFE5E2] px-6 py-5 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C0392B]" />
                <span className="font-bold text-[#1C1C1E]">
                  Cas en souffrance
                </span>
                <Badge className="bg-[#C0392B] text-white ml-2">
                  {sufferingCases.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              {sufferingCases.map((c) => (
                <Card
                  key={c.id}
                  className="p-4 border-l-4 border-[#C0392B] bg-white"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 text-sm text-[#6B6B6B]">
                        <Badge className="bg-[#C0392B] text-white">
                          Souffre encore
                        </Badge>
                        <span>📍 {c.governorate}</span>
                        <span>
                          📅{" "}
                          {new Date(c.dateSubmitted).toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "short" }
                          )}
                        </span>
                      </div>
                      <Link
                        to={`/cas/${c.id}`}
                        className="font-semibold text-[#1C1C1E] hover:text-[#C0392B]"
                      >
                        {c.title}
                      </Link>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#C0392B]"
                      >
                        <Edit size={16} className="mr-1" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Helping Cases */}
          <AccordionItem value="helping" className="border-0">
            <AccordionTrigger className="bg-[#FFF4ED] hover:bg-[#FFEEE0] px-6 py-5 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E67E22]" />
                <span className="font-bold text-[#1C1C1E]">
                  En cours d'aide
                </span>
                <Badge className="bg-[#E67E22] text-white ml-2">
                  {helpingCases.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              {helpingCases.map((c) => (
                <Card
                  key={c.id}
                  className="p-4 border-l-4 border-[#E67E22] bg-white"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 text-sm text-[#6B6B6B]">
                        <Badge className="bg-[#E67E22] text-white">
                          En cours d'aide
                        </Badge>
                        <span>📍 {c.governorate}</span>
                        <span>
                          📅{" "}
                          {new Date(c.dateSubmitted).toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "short" }
                          )}
                        </span>
                      </div>
                      <Link
                        to={`/cas/${c.id}`}
                        className="font-semibold text-[#1C1C1E] hover:text-[#C0392B]"
                      >
                        {c.title}
                      </Link>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#C0392B]"
                      >
                        <Edit size={16} className="mr-1" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Resolved Cases */}
          <AccordionItem value="resolved" className="border-0">
            <AccordionTrigger className="bg-[#F0FFF4] hover:bg-[#E5FFE9] px-6 py-5 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#27AE60]" />
                <span className="font-bold text-[#1C1C1E]">Cas résolus</span>
                <Badge className="bg-[#27AE60] text-white ml-2">
                  {resolvedCases.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              {resolvedCases.map((c) => (
                <Card
                  key={c.id}
                  className="p-4 border-l-4 border-[#27AE60] bg-white"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 text-sm text-[#6B6B6B]">
                        <Badge className="bg-[#27AE60] text-white">
                          Résolu
                        </Badge>
                        <span>📍 {c.governorate}</span>
                        <span>
                          📅{" "}
                          {new Date(c.dateSubmitted).toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "short" }
                          )}
                        </span>
                      </div>
                      <Link
                        to={`/cas/${c.id}`}
                        className="font-semibold text-[#1C1C1E] hover:text-[#C0392B]"
                      >
                        {c.title}
                      </Link>
                    </div>
                    <Link to={`/cas/${c.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#27AE60]"
                      >
                        Voir la résolution →
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
