import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ArrowLeft, Shield, AlertTriangle, FileText, Lock } from "lucide-react";

export function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#FDF6EC] py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <Link
          to="/inscription"
          className="inline-flex items-center text-[#C0392B] hover:text-[#A02E24] mb-8 font-semibold transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          {t("terms.back")}
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-[#C0392B] p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{t("terms.title")}</h1>
            <p className="text-white/80">{t("terms.last_updated")}</p>
          </div>

          <div className="p-8 lg:p-12 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-4 text-[#1C1C1E]">
                <FileText className="text-[#C0392B]" />
                <h2 className="text-2xl font-bold">{t("terms.intro_title")}</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.intro_text")}
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-[#1C1C1E]">
                <Shield className="text-[#C0392B]" />
                <h2 className="text-2xl font-bold">{t("terms.responsibilities_title")}</h2>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-[#C0392B] mt-2 mr-3 flex-shrink-0" />
                  <p>{t("terms.resp_1")}</p>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-[#C0392B] mt-2 mr-3 flex-shrink-0" />
                  <p>{t("terms.resp_2")}</p>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-[#C0392B] mt-2 mr-3 flex-shrink-0" />
                  <p>{t("terms.resp_3")}</p>
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-[#1C1C1E]">
                <AlertTriangle className="text-[#C0392B]" />
                <h2 className="text-2xl font-bold">{t("terms.prohibited_title")}</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                {t("terms.prohibited_intro")}
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0" />
                  <p>{t("terms.prohibited_1")}</p>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0" />
                  <p>{t("terms.prohibited_2")}</p>
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-[#1C1C1E]">
                <Lock className="text-[#C0392B]" />
                <h2 className="text-2xl font-bold">{t("terms.privacy_title")}</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.privacy_text")}
              </p>
            </section>
          </div>
          
          <div className="bg-gray-50 p-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              {t("terms.contact_info")} <a href="mailto:support@touneshelp.tn" className="text-[#C0392B] hover:underline font-semibold">support@touneshelp.tn</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
