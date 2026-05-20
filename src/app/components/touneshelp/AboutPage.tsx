import { useTranslation } from "react-i18next";
import { Card } from "../ui/card";
import { Heart, Globe, Zap, Users } from "lucide-react";
import { motion } from "motion/react";

export function AboutPage() {
  const { t } = useTranslation();

  const values = t("about_page.values_list").split("|");
  const icons = [
    <Heart className="w-6 h-6 text-[#C0392B]" />,
    <Globe className="w-6 h-6 text-[#C0392B]" />,
    <Zap className="w-6 h-6 text-[#C0392B]" />,
    <Users className="w-6 h-6 text-[#C0392B]" />,
  ];

  return (
    <div className="min-h-screen bg-[#FDF6EC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 rounded-full bg-[#C0392B] flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">T</span>
          </div>
          <h1 className="text-4xl font-bold text-[#1A0A00] mb-4">
            {t("about_page.title")}
          </h1>
          <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
            {t("home.hero_description")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-8 h-full bg-white border-0 shadow-sm rounded-2xl">
              <h2 className="text-2xl font-bold text-[#C0392B] mb-4">
                {t("about_page.mission_title")}
              </h2>
              <p className="text-[#1C1C1E] leading-relaxed">
                {t("about_page.mission_text")}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-8 h-full bg-white border-0 shadow-sm rounded-2xl">
              <h2 className="text-2xl font-bold text-[#C0392B] mb-4">
                {t("about_page.story_title")}
              </h2>
              <p className="text-[#1C1C1E] leading-relaxed">
                {t("about_page.story_text")}
              </p>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-3xl p-12 shadow-sm"
        >
          <h2 className="text-3xl font-bold text-center text-[#1A0A00] mb-12">
            {t("about_page.values_title")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-[#FDF6EC] rounded-xl flex items-center justify-center mx-auto mb-4">
                  {icons[index]}
                </div>
                <h3 className="font-bold text-[#1A0A00]">{value}</h3>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
