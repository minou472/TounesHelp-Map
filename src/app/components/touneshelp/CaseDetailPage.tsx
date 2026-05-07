import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, MapPin, Calendar, Phone, Mail, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";
import type { TunisiaCase } from "../../data/tunisiaData";
import { fetchCaseById } from "../../lib/backendApi";

export function CaseDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<TunisiaCase | null>(null);
  const [loading, setLoading] = useState(true);

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

            {/* Photo Gallery */}
            {caseData.images.length > 1 && (
              <div>
                <h3 className="font-bold text-xl text-[#1C1C1E] mb-4">{t("case_detail.photos")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {caseData.images.map((img, index) => (
                    <div key={index} className="aspect-square rounded-xl overflow-hidden">
                      <img src={img} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sticky */}
          <div className="space-y-6">
            {/* Victim Info Card */}
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

            {/* Contact Card */}
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
