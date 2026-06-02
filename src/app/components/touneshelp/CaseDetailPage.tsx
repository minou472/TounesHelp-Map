import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, MapPin, Calendar, Phone, Mail, Users, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";
import type { TunisiaCase } from "../../data/tunisiaData";
import { fetchCaseById } from "../../lib/backendApi";
import { useAuth } from "../../lib/auth";

/**
 * CaseDetailPage provides a deep dive into an individual's journey.
 * It provides the full context, media, and contact details necessary
 * to turn a simple notification into a direct act of humanitarian assistance.
 */
export function CaseDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<TunisiaCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const MEDIA_PREVIEW_COUNT = 3;
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [showAdminEmail, setShowAdminEmail] = useState(false);

  const handleHelpClick = () => {
    setShowAdminEmail(true);
    if (!caseData) return;
    const subject = encodeURIComponent(`${t("cases_list.help_email_subject", "Je veux aider")} : ${caseData.title}`);
    const body = encodeURIComponent(
      `${t("cases_list.help_email_body_intro", "Bonjour, je souhaite apporter mon aide pour le cas suivant :")}\n\n` +
      `- ${t("case_detail.title_label", "Titre")} : ${caseData.title}\n` +
      `- ${t("case_detail.location_label", "Localisation")} : ${caseData.governorate}, ${caseData.city}\n\n` +
      `${t("cases_list.help_email_body_outro", "Merci de me recontacter.")}`
    );
    window.location.href = `mailto:touneshelp.admin@gmail.com?subject=${subject}&body=${body}`;
  };

  const dateLocale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-US' : 'fr-FR';

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        setCaseData(await fetchCaseById(id));
      } catch (error) {
        console.error("Failed to load case detail", error);
        setCaseData(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
        <p className="text-[#6B6B6B]">{t("case_detail.loading")}</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6B6B6B] mb-4">{t("case_detail.not_found")}</p>
          <Button onClick={() => navigate('/cas')}>{t("case_detail.back_to_cases")}</Button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    suffering: { label: t("case_detail.status_suffering"), className: 'bg-[#C0392B] text-white' },
    helping: { label: t("case_detail.status_helping"), className: 'bg-[#E67E22] text-white' },
    resolved: { label: t("case_detail.status_resolved"), className: 'bg-[#27AE60] text-white' },
  };

  const config = statusConfig[caseData.status];

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/cas')}
            className="text-[#C0392B] hover:text-[#A02E24] hover:bg-red-50 -ml-2"
          >
            <ArrowLeft className="mr-2" size={20} />
            {t("case_detail.back_to_cases")}
          </Button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img
          src={caseData.images[0]}
          alt={caseData.title}
          className="w-full h-full object-cover"
        />
        <Badge className={`absolute top-6 right-6 ${config.className} text-base px-4 py-2 rounded-full`}>
          {config.label}
        </Badge>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-[42px] font-bold text-[#1C1C1E] mb-4">{caseData.title}</h1>
              
              <div className="flex flex-wrap gap-4 text-[#6B6B6B] mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#C0392B]" />
                  <span>{caseData.governorate} • {caseData.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{t("case_detail.reported_on")} {new Date(caseData.dateSubmitted).toLocaleDateString(dateLocale)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span>
                    {caseData.peopleAffected > 1
                      ? t("case_detail.people_affected_plural", { count: caseData.peopleAffected })
                      : t("case_detail.people_affected", { count: caseData.peopleAffected })}
                  </span>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-[#1C1C1E] text-lg leading-relaxed whitespace-pre-wrap">
                  {caseData.fullDescription}
                </p>
              </div>
            </div>

            {/* Media Gallery */}
            {(caseData.images.length > 0 || caseData.videoUrl) && (
              <div>
                <h3 className="font-bold text-xl text-[#1C1C1E] mb-4">{t("case_detail.media_section")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {caseData.images
                    .slice(0, showAllMedia ? undefined : MEDIA_PREVIEW_COUNT)
                    .map((img, index) => (
                      <div key={index} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={img} alt={`Photo ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  {/* Video thumbnail in the grid */}
                  {caseData.videoUrl && (showAllMedia || caseData.images.length < MEDIA_PREVIEW_COUNT) && (
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-900">
                      <video
                        src={caseData.videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                      />
                    </div>
                  )}
                </div>
                {/* Expand / Collapse button */}
                {caseData.images.length > MEDIA_PREVIEW_COUNT && (
                  <button
                    onClick={() => setShowAllMedia((v) => !v)}
                    className="mt-3 flex items-center gap-1 text-sm font-medium text-[#C0392B] hover:text-[#A02E24] transition-colors"
                  >
                    {showAllMedia ? (
                      <><ChevronUp size={16} /> {t("case_detail.show_less")}</>
                    ) : (
                      <><ChevronDown size={16} /> +{caseData.images.length - MEDIA_PREVIEW_COUNT} {t("case_detail.show_more")}</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Sticky */}
          <div className="space-y-6">
            {/* Help/Action Card */}
            <Card className="p-6 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.10)] border-t-4 border-[#C0392B]">
              <h3 className="font-bold text-lg text-[#1C1C1E] mb-2 flex items-center gap-2">
                <span className="text-xl">🤝</span>
                {t("case_detail.i_want_to_help", "Je veux aider")}
              </h3>
              <p className="text-sm text-[#6B6B6B] mb-4">
                {t("case_detail.help_description", "Vous pouvez soutenir directement ce cas en contactant l'administration de TounesHelp.")}
              </p>
              
              {showAdminEmail && (
                <div className="mb-4 p-4 bg-red-50/50 border border-red-100 rounded-xl text-center">
                  <p className="text-xs text-[#6B6B6B] mb-1.5">{t("case_detail.admin_email_label", "Voici l'email de l'admin :")}</p>
                  <a href="mailto:touneshelp.admin@gmail.com" className="font-bold text-[#C0392B] hover:underline text-sm break-all">
                    touneshelp.admin@gmail.com
                  </a>
                </div>
              )}

              <Button 
                onClick={handleHelpClick}
                className="w-full bg-[#C0392B] hover:bg-[#A02E24] text-white rounded-xl h-12 font-semibold shadow-md shadow-red-900/10 hover:shadow-red-900/20 transition-all duration-200"
              >
                {t("case_detail.i_want_to_help_btn", "JE VEUX AIDER")}
              </Button>
            </Card>

            {/* Victim Info Card */}
            {isAuthenticated ? (
              <Card className="p-6 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.10)]">
                <h3 className="font-bold text-lg text-[#1C1C1E] mb-4">{t("case_detail.affected_person")}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#6B6B6B] mb-1">{t("case_detail.name")}</p>
                    <p className="font-semibold text-[#1C1C1E]">{caseData.victimName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B6B6B] mb-1">{t("case_detail.phone")}</p>
                    <a href={`tel:${caseData.victimPhone}`} className="text-[#C0392B] hover:underline flex items-center gap-2">
                      <Phone size={16} />
                      {caseData.victimPhone}
                    </a>
                  </div>
                  {caseData.victimEmail && (
                    <div>
                      <p className="text-xs text-[#6B6B6B] mb-1">{t("case_detail.email")}</p>
                      <a href={`mailto:${caseData.victimEmail}`} className="text-[#C0392B] hover:underline flex items-center gap-2 break-all">
                        <Mail size={16} />
                        {caseData.victimEmail}
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-6 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.10)]">
                <h3 className="font-bold text-lg text-[#1C1C1E] mb-4">{t("case_detail.affected_person")}</h3>
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Lock size={24} className="text-[#C0392B]" />
                  </div>
                  <p className="text-sm text-[#6B6B6B] mb-3">{t("case_detail.login_to_see", "Connectez-vous pour voir les informations de la personne concernée")}</p>
                  <Button onClick={() => navigate('/connexion')} variant="outline" className="text-[#C0392B] border-[#C0392B] hover:bg-red-50">
                    {t("case_detail.login_btn", "Se connecter")}
                  </Button>
                </div>
              </Card>
            )}

            {/* Contact Card */}
            {isAuthenticated ? (
              <Card className="p-6 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.10)] border-t-4 border-[#C0392B]">
                <h3 className="font-bold text-lg text-[#1C1C1E] mb-4">{t("case_detail.contact_responsible")}</h3>
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-xs text-[#6B6B6B] mb-1">{t("case_detail.created_by")}</p>
                    <p className="font-semibold text-[#1C1C1E]">{caseData.creatorName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B6B6B] mb-1">{t("case_detail.phone")}</p>
                    <a href={`tel:${caseData.creatorPhone}`} className="text-[#C0392B] hover:underline">
                      {caseData.creatorPhone}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B6B6B] mb-1">{t("case_detail.email")}</p>
                    <a href={`mailto:${caseData.creatorEmail}`} className="text-[#C0392B] hover:underline break-all">
                      {caseData.creatorEmail}
                    </a>
                  </div>
                </div>
                <Button className="w-full bg-[#C0392B] hover:bg-[#A02E24] text-white rounded-xl h-12 font-semibold">
                  {t("case_detail.contact_now")}
                </Button>
              </Card>
            ) : (
              <Card className="p-6 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.10)] border-t-4 border-[#C0392B]">
                <h3 className="font-bold text-lg text-[#1C1C1E] mb-4">{t("case_detail.contact_responsible")}</h3>
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Lock size={24} className="text-[#C0392B]" />
                  </div>
                  <p className="text-sm text-[#6B6B6B] mb-3">{t("case_detail.login_to_contact", "Connectez-vous pour contacter le responsable")}</p>
                  <Button onClick={() => navigate('/connexion')} className="w-full bg-[#C0392B] hover:bg-[#A02E24] text-white rounded-xl h-12 font-semibold">
                    {t("case_detail.login_btn", "Se connecter")}
                  </Button>
                </div>
              </Card>
            )}

            {/* Status Timeline Card */}
            <Card className="p-6 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.10)]">
              <h3 className="font-bold text-lg text-[#1C1C1E] mb-4">{t("case_detail.case_status")}</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-[#27AE60]" />
                    <div className="w-0.5 h-full bg-gray-200" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-[#1C1C1E]">{t("case_detail.submitted")}</p>
                    <p className="text-xs text-[#6B6B6B]">{new Date(caseData.dateSubmitted).toLocaleDateString(dateLocale)}</p>
                  </div>
                </div>
                {caseData.datePublished && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#27AE60]" />
                      {(caseData.status === 'helping' || caseData.status === 'resolved') && (
                        <div className="w-0.5 h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-[#1C1C1E]">{t("case_detail.published")}</p>
                      <p className="text-xs text-[#6B6B6B]">{new Date(caseData.datePublished).toLocaleDateString(dateLocale)}</p>
                    </div>
                  </div>
                )}
                {caseData.status === 'helping' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#E67E22]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1C1C1E]">{t("case_detail.being_helped")}</p>
                      <p className="text-xs text-[#6B6B6B]">{t("case_detail.in_progress")}</p>
                    </div>
                  </div>
                )}
                {caseData.status === 'resolved' && caseData.dateResolved && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#27AE60]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1C1C1E]">{t("case_detail.resolved")}</p>
                      <p className="text-xs text-[#6B6B6B]">{new Date(caseData.dateResolved).toLocaleDateString(dateLocale)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
