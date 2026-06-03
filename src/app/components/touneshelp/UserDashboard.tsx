import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { uploadFile } from "../../lib/backendApi";
import { fetchCurrentUser, fetchUserById, updateCurrentUser } from "../../lib/backendApi";
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
  ChevronUp,
  Eye,

  History,
  Bell
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { useTranslation } from "react-i18next";
import type { TunisiaCase } from "../../data/tunisiaData";
import { fetchCases, updateCase, deleteCase, fetchUserNotifications, markNotificationsAsRead } from "../../lib/backendApi";
import { toast } from "sonner";

const GOOGLE_MAPS_API_KEY = "AIzaSyAmk4IjHlJsQb8gchi-9SXxRD0vGaCsxaI";

type ProfileForm = {
  name: string;
  phone: string;
  bio: string;
  idCard: string;
  matricule: string;
  userType: string;
  userTypeDescription: string;
};

type ProfileSource = {
  name?: string | null;
  phone?: string | null;
  bio?: string | null;
  idCard?: string | null;
  matricule?: string | null;
  userType?: string | null;
  userTypeDescription?: string | null;
};

const EMPTY_PROFILE_FORM: ProfileForm = {
  name: "",
  phone: "",
  bio: "",
  idCard: "",
  matricule: "",
  userType: "",
  userTypeDescription: "",
};

const normalizeUserType = (value?: string | null) => (value || "").toUpperCase();

const buildProfileForm = (profile: ProfileSource): ProfileForm => ({
  ...EMPTY_PROFILE_FORM,
  name: profile.name || "",
  phone: profile.phone || "",
  bio: profile.bio || "",
  idCard: profile.idCard || "",
  matricule: profile.matricule || "",
  userType: profile.userType || "",
  userTypeDescription: profile.userTypeDescription || "",
});

const getStoredUserId = () => {
  const rawUser = localStorage.getItem("touneshelp_user");
  try {
    const parsed = JSON.parse(rawUser || "{}") as { id?: string };
    return parsed.id || "";
  } catch {
    return "";
  }
};

const getIdentityType = (profile: Pick<ProfileForm, "userType" | "idCard" | "matricule">) => {
  const userType = normalizeUserType(profile.userType);
  if (userType === "ORGANIZATION" || userType === "OTHER") return "MATRICULE";
  if (userType === "VOLUNTEER" || userType === "CITIZEN") return "CIN";
  return profile.matricule ? "MATRICULE" : "CIN";
};

const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve(-1);
    };
  });
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * UserDashboard is the personal hub for every hero on this platform.
 * It tracks the cases reported by the user and their interactions, 
 * providing a clear view of the tangible impact they are having on 
 * the lives of their fellow Tunisians.
 */
export function UserDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allCases, setAllCases] = useState<TunisiaCase[]>([]);
  const [userName, setUserName] = useState(user?.name || "");

  const dateLocale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-US' : 'fr-FR';

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Profile state
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>(EMPTY_PROFILE_FORM);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Personal location (localStorage only)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; city?: string } | null>(null);
  const [locationMapOpen, setLocationMapOpen] = useState(false);
  const { isLoaded } = useJsApiLoader({ id: "google-map-script", googleMapsApiKey: GOOGLE_MAPS_API_KEY });

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<TunisiaCase | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", fullDescription: "" });
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editNewFiles, setEditNewFiles] = useState<Array<{ file: File; previewUrl: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    if (!editDialogOpen) {
      editNewFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
      setEditNewFiles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDialogOpen]);

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
      const [cases, notifs] = await Promise.all([
        fetchCases({ limit: 300 }),
        fetchUserNotifications().catch(() => [])
      ]);
      setAllCases(
        userEmail ? cases.filter((c) => c.creatorEmail === userEmail) : []
      );
      setNotifications(notifs);
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
        const p = JSON.parse(rawUser) as ProfileSource;
        if (p.name) setUserName(p.name);
        setProfileForm(buildProfileForm(p));
      } catch { /* ignore */ }
    } else if (user?.name) {
      setUserName(user.name);
      setProfileForm(buildProfileForm(user));
    }

    const currentUserId = getStoredUserId() || user?.id || "";
    const profileRequest = currentUserId ? fetchUserById(currentUserId) : fetchCurrentUser();

    void profileRequest
      .then((freshUser) => {
        setUserName(freshUser.name);
        setProfileForm(buildProfileForm(freshUser));
        const stored = localStorage.getItem("touneshelp_user");
        let previous = {};
        try {
          previous = stored ? JSON.parse(stored) : {};
        } catch {
          previous = {};
        }
        localStorage.setItem("touneshelp_user", JSON.stringify({ ...previous, ...freshUser }));
      })
      .catch(() => {
        // The local profile is still usable if the server refresh is unavailable.
      });

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
      const identityType = getIdentityType(profileForm);
      const cleanProfile = {
        name: profileForm.name,
        phone: profileForm.phone,
        bio: profileForm.bio,
        ...(profileForm.userType ? { userType: profileForm.userType } : {}),
        ...(normalizeUserType(profileForm.userType) === "OTHER" ? { userTypeDescription: profileForm.userTypeDescription } : {}),
        ...(identityType === "CIN" ? { idCard: profileForm.idCard } : {}),
        ...(identityType === "MATRICULE" ? { matricule: profileForm.matricule } : {}),
      };
      const updatedUser = await updateCurrentUser(cleanProfile);
      const nextProfile = buildProfileForm(updatedUser);
      setUserName(nextProfile.name);
      setProfileForm(nextProfile);
      // Update localStorage
      const rawUser = localStorage.getItem("touneshelp_user");
      if (rawUser) {
        const p = JSON.parse(rawUser);
        localStorage.setItem("touneshelp_user", JSON.stringify({ ...p, ...updatedUser }));
      }
      toast.success(t("dashboard.profile_saved"));
      setProfileDialogOpen(false);
    } catch (e: any) {
      toast.error(e?.message || t("dashboard.profile_save_error"));
    } finally { setSavingProfile(false); }
  };

  const handleOpenProfileDialog = async () => {
    setLoadingProfile(true);
    try {
      const currentUserId = getStoredUserId() || user?.id || "";
      const freshUser = currentUserId ? await fetchUserById(currentUserId) : await fetchCurrentUser();
      setUserName(freshUser.name);
      setProfileForm(buildProfileForm(freshUser));
      const stored = localStorage.getItem("touneshelp_user");
      let previous = {};
      try {
        previous = stored ? JSON.parse(stored) : {};
      } catch {
        previous = {};
      }
      localStorage.setItem("touneshelp_user", JSON.stringify({ ...previous, ...freshUser }));
    } catch {
      // Keep the last known local profile if the server is temporarily unavailable.
    } finally {
      setLoadingProfile(false);
      setProfileDialogOpen(true);
    }
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

  const handleEditFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const checkedFiles: Array<{ file: File; previewUrl: string }> = [];

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB

      if (!isImage && !isVideo) {
        toast.error(`${file.name}: Type de fichier non supporté.`);
        continue;
      }
      if (!isValidSize) {
        toast.error(`${file.name}: Le fichier est trop volumineux. La taille maximale est de 50MB.`);
        continue;
      }

      if (isVideo) {
        const duration = await getVideoDuration(file);
        const maxDuration = 60; // 60 seconds limit
        if (duration > maxDuration) {
          toast.error(
            `La vidéo "${file.name}" est trop longue (${Math.round(duration)}s). Veuillez limiter vos vidéos à ${maxDuration} secondes pour les adapter à la plateforme.`
          );
          continue;
        }
      }

      checkedFiles.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    const currentTotal = editImages.length + editNewFiles.length;
    if (currentTotal + checkedFiles.length > 10) {
      checkedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
      toast.error("Maximum 10 fichiers autorisés.");
      return;
    }

    setEditNewFiles((prev) => [...prev, ...checkedFiles]);
  };

  const removeEditNewFile = (index: number) => {
    const item = editNewFiles[index];
    if (item) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setEditNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    if (!editingCase) return;
    const totalFiles = editImages.length + editNewFiles.length;
    if (totalFiles === 0) { toast.error(t("create_case.messages.min_one_file")); return; }
    setIsSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      const failedFiles: Array<{ file: File; previewUrl: string }> = [];

      for (const item of editNewFiles) {
        try {
          const res = await uploadFile(item.file);
          uploadedUrls.push(res.url);
          URL.revokeObjectURL(item.previewUrl);
        } catch (err: any) {
          console.error("Failed to upload", item.file.name, err);
          failedFiles.push(item);
          toast.error(`Échec de l'importation de "${item.file.name}": ${err?.message || "Erreur"}`);
        }
      }

      if (failedFiles.length > 0) {
        setEditNewFiles(failedFiles);
        setEditImages((prev) => [...prev, ...uploadedUrls]);
        setIsSubmitting(false);
        return;
      }

      await updateCase(editingCase.id, {
        title: editForm.title,
        description: editForm.description,
        fullDescription: editForm.fullDescription || editForm.description,
        images: [...editImages, ...uploadedUrls]
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

  const handleOpenNotifications = async () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen) {
      const unread = notifications.some(n => !n.isRead);
      if (unread) {
        try {
          await markNotificationsAsRead();
          setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (e) {
          console.error("Failed to mark notifications as read", e);
        }
      }
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
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2 text-sm text-[#6B6B6B]">
            <Badge className={`${badgeColor} text-white`}>{badgeText}</Badge>
            <span>📍 {c.governorate}</span>
            <span>
              📅{" "}
              {new Date(c.dateSubmitted).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "short"
              })}
            </span>
            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs">
              <Eye size={12} /> {c.visitorsCount || 0} vues
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

      <div className="flex flex-wrap justify-end items-center mt-3 pt-3 border-t border-gray-100">

        {c.modifications && c.modifications.length > 0 && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <History size={12} /> {c.modifications.length} modification(s)
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
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button
                  variant="outline"
                  className="bg-white rounded-full w-12 h-12 p-0 relative border-gray-200"
                  onClick={handleOpenNotifications}
                >
                  <Bell className="text-gray-600" size={20} />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </Button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Notifications</h3>
                      <span className="text-xs text-gray-500">{notifications.length} au total</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div key={n.id} className={`p-4 border-b border-gray-50 text-sm ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                            <p className="text-gray-800">{n.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString(dateLocale)}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-500 text-sm">
                          Aucune notification
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link to="/creer-cas">
                <Button className="bg-[#C0392B] hover:bg-[#A02E24] text-white rounded-xl h-12 px-6 font-semibold shadow-sm">
                  <Plus className="mr-2" size={20} />
                  {t("dashboard.report_new_case")}
                </Button>
              </Link>
            </div>
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
              <Button variant="ghost" size="sm" onClick={handleOpenProfileDialog} disabled={loadingProfile} className="text-blue-600">
                <Edit size={16} className="mr-1" /> {loadingProfile ? "..." : t("dashboard.edit")}
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

      {/* ── Donut Chart ── */}
      {userCases.length > 0 && (() => {
        const total = userCases.length;
        const segments = [
          { label: t("dashboard.suffering"), count: sufferingCases.length, color: "#C0392B", bg: "#FFF0EE" },
          { label: t("dashboard.helping"), count: helpingCases.length, color: "#E67E22", bg: "#FFF4ED" },
          { label: t("dashboard.resolved"), count: resolvedCases.length, color: "#27AE60", bg: "#F0FFF4" },
        ];

        // Build SVG arcs
        const R = 70, r = 42, cx = 90, cy = 90;

        let cumAngle = -Math.PI / 2; // start at 12 o'clock

        const arcs = segments.map((seg) => {
          const fraction = total > 0 ? seg.count / total : 0;
          const angle = fraction * 2 * Math.PI;
          const x1 = cx + R * Math.cos(cumAngle);
          const y1 = cy + R * Math.sin(cumAngle);
          cumAngle += angle;
          const x2 = cx + R * Math.cos(cumAngle);
          const y2 = cy + R * Math.sin(cumAngle);
          const largeArc = angle > Math.PI ? 1 : 0;
          // inner arc
          const ix1 = cx + r * Math.cos(cumAngle - angle);
          const iy1 = cy + r * Math.sin(cumAngle - angle);
          const ix2 = cx + r * Math.cos(cumAngle);
          const iy2 = cy + r * Math.sin(cumAngle);
          const path =
            fraction === 0
              ? ""
              : fraction >= 1
                ? // full circle — draw two halves
                `M ${cx + R} ${cy} A ${R} ${R} 0 1 1 ${cx - R} ${cy} A ${R} ${R} 0 1 1 ${cx + R} ${cy}
                 M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} Z`
                : `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}
                 L ${ix2} ${iy2} A ${r} ${r} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
          return { ...seg, path, fraction };
        });

        return (
          <section className="max-w-7xl mx-auto px-6 lg:px-24 py-2 pb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#1C1C1E] mb-6">
                📊 {t("dashboard.cases_status") || "Mes cas par statut"}
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                {/* SVG donut */}
                <div className="relative flex-shrink-0">
                  <svg width="180" height="180" viewBox="0 0 180 180">
                    <defs>
                      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
                      </filter>
                    </defs>
                    {/* background ring */}
                    <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3F4F6" strokeWidth={R - r} />
                    {/* coloured arcs */}
                    {arcs.map((arc, i) =>
                      arc.path ? (
                        <path
                          key={i}
                          d={arc.path}
                          fill={arc.color}
                          filter="url(#shadow)"
                          style={{
                            transition: "opacity 0.3s",
                            opacity: 0.92,
                          }}
                        />
                      ) : null
                    )}
                    {/* centre text */}
                    <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="#1C1C1E">
                      {total}
                    </text>
                    <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#6B6B6B">
                      cas
                    </text>
                  </svg>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-3 min-w-[160px]">
                  {arcs.map((seg, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: seg.color }}
                        />
                        <span className="text-sm text-gray-700 font-medium">{seg.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: seg.color }}>
                          {seg.count}
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                          style={{ background: seg.bg, color: seg.color }}
                        >
                          {total > 0 ? Math.round((seg.count / total) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* My Cases + History Sidebar */}
      <section className="max-w-7xl mx-auto px-6 lg:px-24 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left: My Cases ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-7 rounded-full bg-[#C0392B]" />
              <h2 className="text-2xl font-bold text-[#1C1C1E]">
                {t("dashboard.my_cases", "Mes Cas")}
              </h2>
              <span className="ml-2 bg-[#C0392B] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {userCases.length}
              </span>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {/* Suffering Cases */}
              <AccordionItem value="suffering" className="border-0">
                <AccordionTrigger className="bg-[#FFF0EE] hover:bg-[#FFE5E2] px-6 py-5 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C0392B]" />
                    <span className="font-bold text-[#1C1C1E]">{t("dashboard.suffering_cases")}</span>
                    <Badge className="bg-[#C0392B] text-white ml-2">{sufferingCases.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-3">
                  {sufferingCases.map((c) => renderCaseCard(c, "border-[#C0392B]", "bg-[#C0392B]", t("dashboard.suffering")))}
                  {sufferingCases.length === 0 && <p className="text-center text-gray-500 py-4">{t("dashboard.no_suffering_cases")}</p>}
                </AccordionContent>
              </AccordionItem>

              {/* Helping Cases */}
              <AccordionItem value="helping" className="border-0">
                <AccordionTrigger className="bg-[#FFF4ED] hover:bg-[#FFEEE0] px-6 py-5 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E67E22]" />
                    <span className="font-bold text-[#1C1C1E]">{t("dashboard.helping_cases")}</span>
                    <Badge className="bg-[#E67E22] text-white ml-2">{helpingCases.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-3">
                  {helpingCases.map((c) => renderCaseCard(c, "border-[#E67E22]", "bg-[#E67E22]", t("dashboard.helping")))}
                  {helpingCases.length === 0 && <p className="text-center text-gray-500 py-4">{t("dashboard.no_helping_cases")}</p>}
                </AccordionContent>
              </AccordionItem>

              {/* Resolved Cases */}
              <AccordionItem value="resolved" className="border-0">
                <AccordionTrigger className="bg-[#F0FFF4] hover:bg-[#E5FFE9] px-6 py-5 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27AE60]" />
                    <span className="font-bold text-[#1C1C1E]">{t("dashboard.resolved_cases")}</span>
                    <Badge className="bg-[#27AE60] text-white ml-2">{resolvedCases.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-3">
                  {resolvedCases.map((c) => (
                    <Card key={c.id} className="p-4 border-l-4 border-[#27AE60] bg-white">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 text-sm text-[#6B6B6B]">
                            <Badge className="bg-[#27AE60] text-white">{t("dashboard.resolved_badge")}</Badge>
                            <span>📍 {c.governorate}</span>
                            <span>📅 {new Date(c.dateSubmitted).toLocaleDateString(dateLocale, { day: "numeric", month: "short" })}</span>
                          </div>
                          <Link to={`/cas/${c.id}`} className="font-semibold text-[#1C1C1E] hover:text-[#C0392B]">{c.title}</Link>
                        </div>
                        <Link to={`/cas/${c.id}`}>
                          <Button size="sm" variant="outline" className="text-[#27AE60]">{t("dashboard.view_resolution")}</Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                  {resolvedCases.length === 0 && <p className="text-center text-gray-500 py-4">{t("dashboard.no_resolved_cases")}</p>}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* ── Right: Cases History Sidebar ── */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Sidebar header */}
                <div className="bg-gradient-to-r from-[#1C1C1E] to-[#3a3a3e] px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <History size={18} className="text-white" />
                    <h3 className="font-bold text-white text-base">
                      {t("dashboard.cases_history", "Historique des cas")}
                    </h3>
                  </div>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter("")}
                      className="mt-2 text-xs text-white/70 hover:text-white underline"
                    >
                      {t("dashboard.clear_filter", "Effacer le filtre")}
                    </button>
                  )}
                </div>

                {/* Timeline list */}
                <div className="max-h-[560px] overflow-y-auto">
                  {(() => {
                    const filtered = [...userCases]
                      .filter(c => {
                        if (!dateFilter) return true;
                        return new Date(c.dateSubmitted).toISOString().startsWith(dateFilter);
                      })
                      .sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());

                    if (filtered.length === 0) return (
                      <div className="p-6 text-center text-gray-400 text-sm">
                        {dateFilter
                          ? t("dashboard.no_cases_on_date", "Aucun cas pour cette date")
                          : t("dashboard.no_suffering_cases")}
                      </div>
                    );

                    const statusColors: Record<string, string> = {
                      suffering: "#C0392B",
                      helping: "#E67E22",
                      resolved: "#27AE60",
                    };

                    return filtered.map((c, i) => (
                      <div key={c.id} className="relative">
                        {/* timeline line */}
                        {i < filtered.length - 1 && (
                          <div className="absolute left-[26px] top-10 bottom-0 w-0.5 bg-gray-100" />
                        )}
                        <Link to={`/cas/${c.id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                          {/* dot */}
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow flex-shrink-0 mt-1"
                            style={{ backgroundColor: statusColors[c.status?.toLowerCase()] ?? "#718096" }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1C1C1E] group-hover:text-[#C0392B] truncate">
                              {c.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              📅 {new Date(c.dateSubmitted).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                            <p className="text-xs text-gray-400">📍 {c.governorate}</p>
                          </div>
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                            style={{ backgroundColor: statusColors[c.status?.toLowerCase()] ?? "#718096" }}
                          />
                        </Link>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>

        </div>
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
                <Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
              </div>
              <div>
                <Label>{t("dashboard.phone")}</Label>
                <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+216 ..." />
              </div>
              <div>
                <Label>{t("dashboard.bio")}</Label>
                <Textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder={t("dashboard.bio_placeholder")} />
              </div>
              {getIdentityType(profileForm) === "MATRICULE" ? (
                <div>
                  <Label>{t("register.matricule") || "Matricule"}</Label>
                  <Input value={profileForm.matricule} onChange={(e) => setProfileForm({ ...profileForm, matricule: e.target.value })} placeholder="MF-XXXXXXX" />
                </div>
              ) : (
                <div>
                  <Label>{t("register.id_card") || "CIN"}</Label>
                  <Input value={profileForm.idCard} onChange={(e) => setProfileForm({ ...profileForm, idCard: e.target.value })} placeholder="XXXXXXXX" />
                </div>
              )}
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
                  accept="image/*,video/*"
                  onChange={handleEditFileSelect}
                  className="text-sm"
                />
              </div>

              {/* New Files Preview */}
              {editNewFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editNewFiles.map(({ file, previewUrl }, i) => (
                    <div key={`new-${i}`} className="relative group w-16 h-16 rounded overflow-hidden border bg-gray-50">
                      {file.type.startsWith("image/") ? (
                        <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <video src={previewUrl} className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={() => removeEditNewFile(i)}
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
