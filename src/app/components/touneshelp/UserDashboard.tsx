import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../ui/dialog";
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
import { useTranslation } from "react-i18next";
import type { TunisiaCase } from "../../data/tunisiaData";
import { fetchCases, updateCase, deleteCase } from "../../lib/backendApi";
import { toast } from "sonner";

export function UserDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [allCases, setAllCases] = useState<TunisiaCase[]>([]);
  const [userName, setUserName] = useState(user?.name || "");

  const dateLocale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-US' : 'fr-FR';

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<TunisiaCase | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    fullDescription: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCases = async () => {
    const rawUser = localStorage.getItem("touneshelp_user");
    let userEmail = user?.email || "";

    if (!userEmail && rawUser) {
      try {
        const parsed = JSON.parse(rawUser) as { email?: string };
        userEmail = parsed.email || "";
      } catch {
        // ignore
      }
    }

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

  useEffect(() => {
    const rawUser = localStorage.getItem("touneshelp_user");

    if (user?.name) {
      setUserName(user.name);
    } else if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser) as { name?: string };
        if (parsed.name) {
          setUserName(parsed.name);
        }
      } catch {
        // ignore parsing issues
      }
    }

    void loadCases();
  }, []);

  const userCases = useMemo(() => allCases.slice(0, 20), [allCases]);
  const sufferingCases = userCases.filter((c) => c.status === "suffering");
  const helpingCases = userCases.filter((c) => c.status === "helping");
  const resolvedCases = userCases.filter((c) => c.status === "resolved");

  // --- Edit handler ---
  const handleOpenEdit = (c: TunisiaCase) => {
    setEditingCase(c);
    setEditForm({
      title: c.title || "",
      description: c.description || "",
      fullDescription: c.fullDescription || ""
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCase) return;
    setIsSubmitting(true);
    try {
      await updateCase(editingCase.id, {
        title: editForm.title,
        description: editForm.description,
        fullDescription: editForm.fullDescription || editForm.description
      });
      toast.success(t("dashboard.case_updated_success"));
      setEditDialogOpen(false);
      setEditingCase(null);
      void loadCases();
    } catch (error: any) {
      toast.error(error?.message || t("dashboard.case_update_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete handler ---
  const handleDelete = async (id: string) => {
    if (!confirm(t("dashboard.delete_confirm"))) return;
    try {
      await deleteCase(id);
      toast.success(t("dashboard.case_deleted_success"));
      setAllCases((prev) => prev.filter((c) => c.id !== id));
    } catch (error: any) {
      toast.error(error?.message || t("dashboard.case_delete_error"));
    }
  };

  const renderCaseCard = (
    c: TunisiaCase,
    borderColor: string,
    badgeColor: string,
    badgeText: string,
    showEditDelete = true
  ) => (
    <Card key={c.id} className={`p-4 border-l-4 ${borderColor} bg-white`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 text-sm text-[#6B6B6B]">
            <Badge className={`${badgeColor} text-white`}>{badgeText}</Badge>
            <span>📍 {c.governorate}</span>
            <span>
              📅{" "}
              {new Date(c.dateSubmitted).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "short"
              })}
            </span>
          </div>
          <Link
            to={`/cas/${c.id}`}
            className="font-semibold text-[#1C1C1E] hover:text-[#C0392B]"
          >
            {c.title}
          </Link>
        </div>
        {showEditDelete && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-[#C0392B]"
              onClick={() => handleOpenEdit(c)}
            >
              <Edit size={16} className="mr-1" />
              {t("dashboard.edit")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => handleDelete(c.id)}
            >
              <Trash size={16} />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      {/* Welcome Header */}
      <section className="bg-[#FDF6EC] border-b border-[#F0E6D3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-24 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-[36px] font-bold text-[#1C1C1E] mb-2">
                {t("dashboard.welcome_back", { name: userName })}
              </h1>
              <p className="text-[#6B6B6B]">{t("dashboard.cases_status")}</p>
            </div>
            <Link to="/creer-cas">
              <Button className="bg-[#C0392B] hover:bg-[#A02E24] text-white rounded-xl h-12 px-6 font-semibold">
                <Plus className="mr-2" size={20} />
                {t("dashboard.report_new_case")}
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
                <div className="text-[#6B6B6B]">{t("dashboard.suffering")}</div>
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
                <div className="text-[#6B6B6B]">{t("dashboard.helping")}</div>
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
                <div className="text-[#6B6B6B]">{t("dashboard.resolved")}</div>
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
                  {t("dashboard.suffering_cases")}
                </span>
                <Badge className="bg-[#C0392B] text-white ml-2">
                  {sufferingCases.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              {sufferingCases.map((c) =>
                renderCaseCard(
                  c,
                  "border-[#C0392B]",
                  "bg-[#C0392B]",
                  t("dashboard.suffering")
                )
              )}
              {sufferingCases.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  {t("dashboard.no_suffering_cases")}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Helping Cases */}
          <AccordionItem value="helping" className="border-0">
            <AccordionTrigger className="bg-[#FFF4ED] hover:bg-[#FFEEE0] px-6 py-5 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E67E22]" />
                <span className="font-bold text-[#1C1C1E]">
                  {t("dashboard.helping_cases")}
                </span>
                <Badge className="bg-[#E67E22] text-white ml-2">
                  {helpingCases.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              {helpingCases.map((c) =>
                renderCaseCard(
                  c,
                  "border-[#E67E22]",
                  "bg-[#E67E22]",
                  t("dashboard.helping")
                )
              )}
              {helpingCases.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  {t("dashboard.no_helping_cases")}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Resolved Cases */}
          <AccordionItem value="resolved" className="border-0">
            <AccordionTrigger className="bg-[#F0FFF4] hover:bg-[#E5FFE9] px-6 py-5 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#27AE60]" />
                <span className="font-bold text-[#1C1C1E]">{t("dashboard.resolved_cases")}</span>
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
                          {t("dashboard.resolved_badge")}
                        </Badge>
                        <span>📍 {c.governorate}</span>
                        <span>
                          📅{" "}
                          {new Date(c.dateSubmitted).toLocaleDateString(
                            dateLocale,
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
                        {t("dashboard.view_resolution")}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
              {resolvedCases.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  {t("dashboard.no_resolved_cases")}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("dashboard.edit_case_title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">{t("dashboard.edit_title_label")}</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">{t("dashboard.edit_description_label")}</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fullDescription">
                {t("dashboard.edit_full_description_label")}
              </Label>
              <Textarea
                id="edit-fullDescription"
                value={editForm.fullDescription}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    fullDescription: e.target.value
                  })
                }
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              {t("dashboard.cancel")}
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSubmitting}
              className="bg-[#C0392B] hover:bg-[#A02E24] text-white"
            >
              {isSubmitting ? t("dashboard.saving") : t("dashboard.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
