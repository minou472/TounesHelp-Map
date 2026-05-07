import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const API_BASE_URL = "";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload?.error || t("forgot_password.error_msg"));
        if (response.status === 404) {
          navigate("/inscription");
        }
        return;
      }

      toast.success(t("forgot_password.success_msg"));
      navigate("/connexion");
    } catch (error) {
      console.error(error);
      toast.error(t("forgot_password.network_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="bg-[#1A0A00] text-white p-12 lg:p-20 flex flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <span className="text-[#C0392B] font-bold text-2xl">T</span>
            </div>
            <span className="text-white font-bold text-xl">TounesHelp Map</span>
          </div>

          <h2 className="text-[36px] font-bold mb-6">{t("forgot_password.title")}</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            {t("forgot_password.description")}
          </p>
        </div>
      </div>

      <div className="bg-[#FDF6EC] p-8 lg:p-20 flex flex-col justify-center">
        <div className="max-w-[480px] mx-auto w-full bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] p-10">
          <div className="w-12 h-12 rounded-full bg-[#C0392B] flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-xl">T</span>
          </div>

          <h2 className="text-[28px] font-bold text-[#1C1C1E] text-center mb-2">{t("forgot_password.form_title")}</h2>
          <p className="text-center text-[#6B6B6B] mb-8">
            {t("forgot_password.back_to_login")}{' '}
            <Link to="/connexion" className="text-[#C0392B] hover:underline font-semibold">
              {t("forgot_password.sign_in_link")}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-[#1C1C1E] mb-2 block">
                {t("forgot_password.email_label")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-lg bg-white border-gray-300"
                placeholder={t("forgot_password.email_placeholder")}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#C0392B] hover:bg-[#A02E24] text-white h-[52px] rounded-xl text-base font-semibold"
              disabled={loading}
            >
              {loading ? t("forgot_password.sending") : t("forgot_password.submit_btn")}
            </Button>
          </form>

          <p className="mt-6 text-sm text-[#6B6B6B]">
            {t("forgot_password.redirect_notice")}
          </p>
        </div>
      </div>
    </div>
  );
}
