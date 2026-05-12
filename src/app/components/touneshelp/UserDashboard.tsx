import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { uploadFile } from "../../lib/backendApi";
import { updateCurrentUser } from "../../lib/backendApi";
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
  Trash,
  MapPin,
  User,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { useTranslation } from "react-i18next";
import type { TunisiaCase } from "../../data/tunisiaData";
import { fetchCases, updateCase, deleteCase } from "../../lib/backendApi";
import { toast } from "sonner";

const GOOGLE_MAPS_API_KEY = "AIzaSyAmk4IjHlJsQb8gchi-9SXxRD0vGaCsxaI";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function UserDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allCases, setAllCases] = useState<TunisiaCase[]>([]);
  const [userName, setUserName] = useState(user?.name || "");

  const dateLocale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-US' : 'fr-FR';

  // Profile state
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", bio: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Personal location (localStorage only)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; city?: string } | null>(null);
  const [locationMapOpen, setLocationMapOpen] = useState(false);
  const { isLoaded } = useJsApiLoader({ id: "google-map-script", googleMapsApiKey: GOOGLE_MAPS_API_KEY });

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<TunisiaCase | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", fullDescription: "" });
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editNewFiles, setEditNewFiles] = useState<File[]>([]);
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
    // Auth guard
    const token = localStorage.getItem("touneshelp_token");
    if (!token) { navigate("/connexion"); return; }

    const rawUser = localStorage.getItem("touneshelp_user");
    if (rawUser) {
      try {
        const p = JSON.parse(rawUser) as { name?: string; phone?: string; bio?: string };
        if (p.name) setUserName(p.name);
        setProfileForm({ name: p.name || "", phone: p.phone || "", bio: p.bio || "" });
      } catch { /* ignore */ }
    } else if (user?.name) {
      setUserName(user.name);
      setProfileForm({ name: user.name, phone: "", bio: "" });
    }

    // Load saved personal location
    const savedLoc = localStorage.getItem("touneshelp_user_location");
    if (savedLoc) {
      try { setUserLocation(JSON.parse(savedLoc)); } catch { /* ignore */ }
    }

    void loadCases();
  }, []);

  const userCases = useMemo(() => allCases.slice(0, 20), [allCases]);
  const sufferingCases = userCases.filter((c) => c.status === "suffering");
  const helpingCases = userCases.filter((c) => c.status === "helping");
  const resolvedCases = userCases.filter((c) => c.status === "resolved");

  // Nearby cases (Haversine, max 100km, top 5)
  const nearbyCases = useMemo(() => {
    if (!userLocation) return [];
    return allCases
      .map((c) => ({ ...c, _km: haversineKm(userLocation.lat, userLocation.lng, c.coordinates[0], c.coordinates[1]) }))
      .filter((c) => c._km <= 100)
      .sort((a, b) => a._km - b._km)
      .slice(0, 5);
  }, [allCases, userLocation]);

  // --- Profile handlers ---
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateCurrentUser(profileForm);
      setUserName(profileForm.name);
      // Update localStorage
      const rawUser = localStorage.getItem("touneshelp_user");
      if (rawUser) {
        const p = JSON.parse(rawUser);
        localStorage.setItem("touneshelp_user", JSON.stringify({ ...p, ...profileForm }));
      }
      toast.success(t("dashboard.profile_saved"));
      setProfileDialogOpen(false);
    } catch (e: any) {
      toast.error(e?.message || t("dashboard.profile_save_error"));
    } finally { setSavingProfile(false); }
  };

  // --- Location handler ---
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const loc = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setUserLocation(loc);
    localStorage.setItem("touneshelp_user_location", JSON.stringify(loc));
    toast.success(t("dashboard.location_saved"));
  };

  // --- Edit handler ---
  const handleOpenEdit = (c: TunisiaCase) => {
    setEditingCase(c);
    setEditForm({ title: c.title || "", description: c.description || "", fullDescription: c.fullDescription || "" });
    setEditImages(c.images || []);
    setEditNewFiles([]);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCase) return;
    const totalFiles = editImages.length + editNewFiles.length;
    if (totalFiles === 0) { toast.error(t("create_case.messages.min_one_file")); return; }
    setIsSubmitting(true);
    try {
      let newUrls: string[] = [];
      if (editNewFiles.length > 0) {
        const results = await Promise.all(editNewFiles.map((f) => uploadFile(f)));
        newUrls = results.map((r) => r.url);
      }
      await updateCase(editingCase.id, {
        title: editForm.title,
        description: editForm.description,
        fullDescription: editForm.fullDescription || editForm.description,
        images: [...editImages, ...newUrls]
      });
      toast.success(t("dashboard.case_updated_success"));
      setEditDialogOpen(false);
      setEditingCase(null);
      void loadCases();
    } catch (error: any) {
      toast.error(error?.message || t("dashboard.case_update_error"));
    } finally { setIsSubmitting(false); }
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

      {/* Profile & Location Row */}
      <section className="max-w-7xl mx-auto px-6 lg:px-24 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{userName}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setProfileDialogOpen(true)} className="text-blue-600">
                <Edit size={16} className="mr-1" /> {t("dashboard.edit")}
              </Button>
            </div>
            {profileForm.phone && <p className="text-sm text-gray-700 mt-2">📞 {profileForm.phone}</p>}
            {profileForm.bio && <p className="text-sm text-gray-600 mt-2 italic">"{profileForm.bio}"</p>}
          </Card>

          {/* Location Card */}
          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 font-bold text-lg">
                <MapPin className="text-[#C0392B]" /> {t("dashboard.my_location")}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setLocationMapOpen(!locationMapOpen)}>
                {locationMapOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>
            {userLocation ? (
              <p className="text-sm text-green-600 mb-2 font-medium">✅ {t("dashboard.location_set")}</p>
            ) : (
              <p className="text-sm text-gray-500 mb-2">{t("dashboard.set_location_prompt")}</p>
            )}
            
            {locationMapOpen && isLoaded && (
              <div className="h-[200px] w-full rounded-xl overflow-hidden mt-2 relative">
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={userLocation || { lat: 33.8869, lng: 9.5375 }}
                  zoom={userLocation ? 10 : 6}
                  onClick={handleMapClick}
                  options={{ disableDefaultUI: true, zoomControl: true }}
                >
                  {userLocation && <Marker position={userLocation} />}
                </GoogleMap>
                <div className="absolute top-2 left-2 right-2 bg-white/90 p-2 rounded text-xs text-center shadow">
                  {t("dashboard.set_location_hint")}
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Stats Row */}
      <section className="max-w-7xl mx-auto px-6 lg:px-24 py-6">
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

      {/* Nearby Cases Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-24 pb-20">
        <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">{t("dashboard.nearby_cases")}</h2>
        <p className="text-[#6B6B6B] mb-6">{t("dashboard.nearby_cases_desc")}</p>
        
        {!userLocation ? (
          <Card className="p-6 text-center text-gray-500 bg-gray-50">
            <MapPin className="mx-auto mb-2 text-gray-400" size={32} />
            {t("dashboard.set_location_prompt")}
          </Card>
        ) : nearbyCases.length === 0 ? (
          <Card className="p-6 text-center text-gray-500 bg-gray-50">
            {t("dashboard.no_nearby_cases")}
          </Card>
        ) : (
          <div className="space-y-4">
            {nearbyCases.map((c) => (
              <div key={`nearby-${c.id}`} className="relative">
                {renderCaseCard(c, "border-blue-500", "bg-blue-50", t(`dashboard.status_${c.status}`), false)}
                <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded text-xs font-bold text-blue-600 shadow">
                  📍 {t("dashboard.km_away", { km: c._km?.toFixed(1) })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Profile Edit Dialog */}
      {profileDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl">
            <h2 className="text-xl font-bold mb-4">{t("dashboard.edit_profile")}</h2>
            <div className="space-y-4">
              <div>
                <Label>{t("dashboard.name")}</Label>
                <Input value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} />
              </div>
              <div>
                <Label>{t("dashboard.phone")}</Label>
                <Input value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} placeholder="+216 ..." />
              </div>
              <div>
                <Label>{t("dashboard.bio")}</Label>
                <Textarea value={profileForm.bio} onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})} placeholder={t("dashboard.bio_placeholder")} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>{t("dashboard.cancel")}</Button>
              <Button onClick={handleSaveProfile} disabled={savingProfile} className="bg-blue-600 hover:bg-blue-700 text-white">
                {savingProfile ? "..." : t("dashboard.save")}
              </Button>
            </div>
          </Card>
        </div>
      )}

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

            {/* Edit Media Section */}
            <div className="space-y-3 pt-2">
              <Label>{t("dashboard.edit_media")}</Label>
              
              {/* Current Files */}
              {editImages.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">{t("dashboard.current_files")}</p>
                  <div className="flex flex-wrap gap-2">
                    {editImages.map((url, i) => (
                      <div key={`existing-${i}`} className="relative group w-16 h-16 rounded overflow-hidden border">
                        <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setEditImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Files */}
              <div>
                <p className="text-xs text-gray-500 mb-2">{t("dashboard.add_new_files")}</p>
                <Input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/avi,video/quicktime"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const totalLimit = 10;
                    const currentTotal = editImages.length + editNewFiles.length;
                    if (currentTotal + files.length > totalLimit) {
                      toast.error("Max 10 files allowed");
                      return;
                    }
                    setEditNewFiles((prev) => [...prev, ...files]);
                  }}
                  className="text-sm"
                />
              </div>

              {/* New Files Preview */}
              {editNewFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editNewFiles.map((file, i) => (
                    <div key={`new-${i}`} className="relative group w-16 h-16 rounded overflow-hidden border bg-gray-50">
                      {file.type.startsWith("image/") ? (
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={() => setEditNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
