import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../lib/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import { Progress } from "../ui/progress";
import { Card } from "../ui/card";
import { ArrowRight, ArrowLeft, Check, MapPin, Upload, X } from "lucide-react";
import { tunisiaGovernorates } from "../../data/tunisiaData";
import { toast } from "sonner";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { uploadFile, createCase } from "../../lib/backendApi";

export function CreateCasePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fullDescription: "",
    governorate: "",
    city: "",
    latitude: 34.0,
    longitude: 9.0,
    category: "OTHER" as
      | "MEDICAL"
      | "EDUCATION"
      | "FOOD"
      | "SHELTER"
      | "TRANSPORTATION"
      | "WATER"
      | "OTHER",
    victimName: "",
    victimPhone: "",
    victimEmail: "",
    creatorName: user?.name || "",
    creatorPhone: "",
    creatorEmail: user?.email || "",
    peopleAffected: 1,
    images: [] as string[],
    videoUrl: ""
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Google Maps configuration
  const GOOGLE_MAPS_API_KEY = "AIzaSyAmk4IjHlJsQb8gchi-9SXxRD0vGaCsxaI";
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const containerStyle = {
    width: "100%",
    height: "300px"
  };

  const tunisiaCenter = {
    lat: 34.0,
    lng: 9.0
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isImage && !isVideo) {
        toast.error(t("create_case.messages.file_type_error"));
        return false;
      }
      if (!isValidSize) {
        toast.error(t("create_case.messages.file_size_error"));
        return false;
      }
      return true;
    });

    if (uploadedFiles.length + validFiles.length > 10) {
      toast.error(t("create_case.messages.max_files_error"));
      return;
    }

    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = uploadedFiles.map(async (file) => {
        const result = await uploadFile(file);
        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Separate images and videos
      const images = uploadedUrls.filter((url) => {
        const extension = url.split(".").pop()?.toLowerCase();
        return ["jpg", "jpeg", "png", "webp"].includes(extension || "");
      });

      const videos = uploadedUrls.filter((url) => {
        const extension = url.split(".").pop()?.toLowerCase();
        return ["mp4", "avi", "mov", "wmv"].includes(extension || "");
      });

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...images],
        videoUrl: videos.length > 0 ? videos[0] : prev.videoUrl
      }));

      setUploadedFiles([]);
      toast.success(
        `${uploadedUrls.length} ${t("create_case.messages.upload_success")}`
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("create_case.messages.upload_error"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.description ||
        !formData.governorate ||
        !formData.city ||
        !formData.victimName ||
        !formData.victimPhone ||
        !formData.creatorName ||
        !formData.creatorPhone ||
        !formData.creatorEmail
      ) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      // Prepare data for API
      const caseData = {
        title: formData.title,
        description: formData.description,
        fullDescription: formData.fullDescription || formData.description,
        governorate: formData.governorate,
        city: formData.city,
        latitude: formData.latitude,
        longitude: formData.longitude,
        category: formData.category,
        victimName: formData.victimName,
        victimPhone: formData.victimPhone,
        victimEmail: formData.victimEmail || undefined,
        creatorName: formData.creatorName,
        creatorPhone: formData.creatorPhone,
        creatorEmail: formData.creatorEmail,
        peopleAffected: formData.peopleAffected,
        images: formData.images,
        videoUrl: formData.videoUrl || undefined
      };

      await createCase(caseData);
      toast.success(t("create_case.messages.case_created"));
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Case creation error:", error);
      toast.error(
        typeof error === "string"
          ? error
          : (error as any)?.response?.data?.message ||
              error?.message ||
              t("create_case.messages.case_error")
      );
    }
  };

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else {
      handleSubmit();
    }
  };

  const steps = [
    { number: 1, label: t("create_case.steps.basic_info") },
    { number: 2, label: t("create_case.steps.location") },
    { number: 3, label: t("create_case.steps.person") },
    { number: 4, label: "Créateur" },
    { number: 5, label: t("create_case.steps.media") },
    { number: 6, label: t("create_case.steps.review") }
  ];

  return (
    <div className="min-h-screen bg-[#FDF6EC] py-12">
      {/* Progress Bar */}
      <div className="sticky top-[72px] z-40 bg-white border-b border-gray-200 py-6 mb-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center mb-4">
            {steps.map((s) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s.number < step
                      ? "bg-[#27AE60] text-white"
                      : s.number === step
                        ? "bg-[#C0392B] text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s.number < step ? <Check size={20} /> : s.number}
                </div>
                {s.number < totalSteps && (
                  <div
                    className={`w-12 md:w-24 h-1 mx-2 ${
                      s.number < step ? "bg-[#C0392B]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            {steps.map((s) => (
              <div
                key={s.number}
                className={`font-medium ${
                  s.number === step ? "text-[#C0392B]" : "text-gray-500"
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        <Card className="p-8 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.10)]">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <h2 className="text-2xl font-bold text-[#1C1C1E]">
                    {t("create_case.headings.basic_info")}
                  </h2>
                </div>
              </div>

              <div>
                <Label htmlFor="title">
                  {t("create_case.labels.case_title")}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder={t("create_case.labels.case_title_placeholder")}
                  className="mt-2 h-12"
                />
                <p className="text-sm text-gray-500 mt-1 text-right">
                  {formData.title.length}/100
                </p>
              </div>

              <div>
                <Label htmlFor="description">
                  {t("create_case.labels.description")}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={t("create_case.labels.description_placeholder")}
                  className="mt-2 min-h-[200px]"
                />
                <p className="text-sm text-gray-500 mt-1 text-right">
                  {formData.description.length} caractères (150 minimum)
                </p>
              </div>

              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(
                    value:
                      | "MEDICAL"
                      | "EDUCATION"
                      | "FOOD"
                      | "SHELTER"
                      | "TRANSPORTATION"
                      | "WATER"
                      | "OTHER"
                  ) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEDICAL">Médical</SelectItem>
                    <SelectItem value="EDUCATION">Éducation</SelectItem>
                    <SelectItem value="FOOD">Nourriture</SelectItem>
                    <SelectItem value="SHELTER">Logement</SelectItem>
                    <SelectItem value="TRANSPORTATION">Transport</SelectItem>
                    <SelectItem value="WATER">Eau</SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-[#1C1C1E]">
                    {t("create_case.headings.location")}
                  </h2>
                </div>
              </div>

              <div>
                <Label htmlFor="governorate">
                  {t("create_case.labels.governorate")}
                </Label>
                <Select
                  value={formData.governorate}
                  onValueChange={(v) =>
                    setFormData({ ...formData, governorate: v })
                  }
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue
                      placeholder={t(
                        "create_case.labels.governorate_placeholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {tunisiaGovernorates.map((gov) => (
                      <SelectItem key={gov} value={gov}>
                        {gov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">{t("create_case.labels.city")}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder={t("create_case.labels.city_placeholder")}
                  className="mt-2 h-12"
                />
              </div>

              <div className="space-y-4">
                <Label>{t("create_case.labels.map_location")}</Label>
                <div className="bg-gray-100 rounded-xl overflow-hidden">
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={{
                        lat: formData.latitude,
                        lng: formData.longitude
                      }}
                      zoom={7}
                      onClick={(e) => {
                        if (e.latLng) {
                          setFormData({
                            ...formData,
                            latitude: e.latLng!.lat(),
                            longitude: e.latLng!.lng()
                          });
                        }
                      }}
                    >
                      <Marker
                        position={{
                          lat: formData.latitude,
                          lng: formData.longitude
                        }}
                        icon={{
                          url:
                            "data:image/svg+xml;charset=UTF-8," +
                            encodeURIComponent(`
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="20" cy="20" r="18" fill="#C0392B" stroke="white" stroke-width="4"/>
                              <circle cx="20" cy="20" r="8" fill="white"/>
                            </svg>
                          `),
                          scaledSize: new google.maps.Size(40, 40),
                          anchor: new google.maps.Point(20, 40)
                        }}
                      />
                    </GoogleMap>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      {t("create_case.messages.map_loading")}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {t("create_case.labels.map_click_hint")}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>
                    {t("create_case.labels.coordinates")}{" "}
                    {formData.latitude.toFixed(6)},{" "}
                    {formData.longitude.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <h2 className="text-2xl font-bold text-[#1C1C1E]">
                    {t("create_case.headings.person")}
                  </h2>
                </div>
              </div>

              <div>
                <Label htmlFor="victimName">
                  {t("create_case.labels.victim_name")}
                </Label>
                <Input
                  id="victimName"
                  value={formData.victimName}
                  onChange={(e) =>
                    setFormData({ ...formData, victimName: e.target.value })
                  }
                  placeholder={t("create_case.labels.victim_name_placeholder")}
                  className="mt-2 h-12"
                />
              </div>

              <div>
                <Label htmlFor="victimPhone">
                  {t("create_case.labels.victim_phone")}
                </Label>
                <Input
                  id="victimPhone"
                  type="tel"
                  value={formData.victimPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, victimPhone: e.target.value })
                  }
                  placeholder={t("create_case.labels.victim_phone_placeholder")}
                  className="mt-2 h-12"
                />
              </div>

              <div>
                <Label htmlFor="peopleAffected">
                  {t("create_case.labels.people_affected")}
                </Label>
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        peopleAffected: Math.max(1, formData.peopleAffected - 1)
                      })
                    }
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">
                    {formData.peopleAffected}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        peopleAffected: formData.peopleAffected + 1
                      })
                    }
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-bold">
                    4
                  </div>
                  <h2 className="text-2xl font-bold text-[#1C1C1E]">
                    Informations du Créateur
                  </h2>
                </div>
              </div>

              <div>
                <Label htmlFor="creatorName">Nom du Créateur</Label>
                <Input
                  id="creatorName"
                  value={formData.creatorName}
                  onChange={(e) =>
                    setFormData({ ...formData, creatorName: e.target.value })
                  }
                  placeholder="Votre nom complet"
                  className="mt-2 h-12"
                />
              </div>

              <div>
                <Label htmlFor="creatorPhone">Téléphone du Créateur</Label>
                <Input
                  id="creatorPhone"
                  type="tel"
                  value={formData.creatorPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, creatorPhone: e.target.value })
                  }
                  placeholder="Votre numéro de téléphone"
                  className="mt-2 h-12"
                />
              </div>

              <div>
                <Label htmlFor="creatorEmail">
                  Email du Créateur (Optionnel)
                </Label>
                <Input
                  id="creatorEmail"
                  type="email"
                  value={formData.creatorEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, creatorEmail: e.target.value })
                  }
                  placeholder="Votre email"
                  className="mt-2 h-12"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-bold">
                    5
                  </div>
                  <h2 className="text-2xl font-bold text-[#1C1C1E]">
                    {t("create_case.headings.media")}
                  </h2>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-[#C0392B] transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-6xl mb-4">☁️</div>
                    <p className="text-[#1C1C1E] font-medium mb-2">
                      {t("create_case.labels.upload_hint")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("create_case.labels.upload_limits")}
                    </p>
                  </label>
                </div>

                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-[#1C1C1E]">
                      {t("create_case.labels.files_selected")}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="relative bg-gray-50 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2">
                            {file.type.startsWith("image/") ? (
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                📷
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                                🎥
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(1)}MB
                              </p>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="p-1 hover:bg-gray-200 rounded"
                              disabled={uploading}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {uploadedFiles.length > 0 && (
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-[#C0392B] hover:bg-[#A02E24]"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t("create_case.buttons.uploading")}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2" size={18} />
                        {t("create_case.buttons.upload")} {uploadedFiles.length}{" "}
                        {uploadedFiles.length > 1
                          ? t("create_case.messages.upload_success").split(
                              " "
                            )[0] + "s"
                          : t("create_case.messages.upload_success").split(
                              " "
                            )[0]}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-bold">
                    6
                  </div>
                  <h2 className="text-2xl font-bold text-[#1C1C1E]">
                    {t("create_case.headings.review")}
                  </h2>
                </div>
              </div>

              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">
                  {t("create_case.review.basic_info")}
                </h3>
                <p className="text-sm text-blue-800">{formData.title}</p>
              </Card>

              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">
                  {t("create_case.review.location")}
                </h3>
                <p className="text-sm text-blue-800">
                  {formData.governorate} - {formData.city}
                </p>
                <p className="text-sm text-blue-800">
                  {t("create_case.labels.coordinates")}{" "}
                  {formData.latitude.toFixed(6)},{" "}
                  {formData.longitude.toFixed(6)}
                </p>
              </Card>

              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">
                  {t("create_case.review.person")}
                </h3>
                <p className="text-sm text-blue-800">{formData.victimName}</p>
                <p className="text-sm text-blue-800">{formData.victimPhone}</p>
              </Card>

              {(formData.images.length > 0 || formData.videoUrl) && (
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-2">
                    {t("create_case.review.media")}
                  </h3>
                  {formData.images.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-blue-800">
                        {formData.images.length}{" "}
                        {t("create_case.messages.images_count")}
                      </p>
                    </div>
                  )}
                  {formData.videoUrl && (
                    <p className="text-sm text-blue-800">
                      {t("create_case.messages.video_count")}
                    </p>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="rounded-xl"
            >
              <ArrowLeft className="mr-2" size={20} />
              {t("create_case.buttons.previous")}
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="bg-[#C0392B] hover:bg-[#A02E24] text-white rounded-xl"
            >
              {step === totalSteps
                ? t("create_case.buttons.submit")
                : t("create_case.buttons.next")}
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
