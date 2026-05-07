import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../lib/auth";

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          toast.error(t("login.account_not_found"));
          navigate("/inscription", { state: { email } });
          return;
        }
        if (response.status === 401 && payload?.error === "Invalid password") {
          toast.error(t("login.wrong_password"));
          setTimeout(() => navigate("/mot-de-passe-oublie", { state: { email } }), 2000);
          return;
        }
        toast.error(payload?.error || t("login.login_error"));
        return;
      }

      login(payload.data.user, payload.data.token);
      toast.success(t("login.sign_in_success"));
      navigate(payload.data.user.role === "ADMIN" ? "/admin/enhanced" : "/");
    } catch (error) {
      console.error(error);
      toast.error(t("login.login_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column - Dark */}
      <div className="bg-[#1A0A00] text-white p-12 lg:p-20 flex flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <span className="text-[#C0392B] font-bold text-2xl">T</span>
            </div>
            <span className="text-white font-bold text-xl">TounesHelp Map</span>
          </div>

          <h2 className="text-[36px] font-bold mb-6">
            {t("login.together_help")}
          </h2>

          <p className="text-white/70 text-lg mb-12 leading-relaxed">
            {t("login.connect_report_cases")}
          </p>

          <div className="space-y-4 mb-12">
            <div className="flex items-center gap-3">
              <Check className="text-[#27AE60] flex-shrink-0" size={20} />
              <span className="text-white/90">
                {t("login.report_cases_minutes")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="text-[#27AE60] flex-shrink-0" size={20} />
              <span className="text-white/90">
                {t("login.track_progress_realtime")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="text-[#27AE60] flex-shrink-0" size={20} />
              <span className="text-white/90">
                {t("login.join_supportive_community")}
              </span>
            </div>
          </div>

          <blockquote className="text-[#C0392B] italic text-lg border-l-4 border-[#C0392B] pl-4">
            {t("login.quote")}
          </blockquote>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="bg-[#FDF6EC] p-8 lg:p-20 flex flex-col justify-center">
        <div className="max-w-[480px] mx-auto w-full bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] p-10">
          <div className="w-12 h-12 rounded-full bg-[#C0392B] flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-xl">T</span>
          </div>

          <h2 className="text-[28px] font-bold text-[#1C1C1E] text-center mb-2">
            {t("login.sign_in")}
          </h2>

          <p className="text-center text-[#6B6B6B] mb-8">
            {t("login.no_account")}{" "}
            <Link
              to="/inscription"
              className="text-[#C0392B] hover:underline font-semibold"
            >
              {t("login.sign_up")}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-[#1C1C1E] mb-2 block">
                {t("login.email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-lg bg-white border-gray-300"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#1C1C1E] mb-2 block">
                {t("login.password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-lg bg-white border-gray-300 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-sm text-[#C0392B] hover:underline"
                >
                  {t("login.forgot_password")}
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#C0392B] hover:bg-[#A02E24] text-white h-[52px] rounded-xl text-base font-semibold"
              disabled={loading}
            >
              {loading ? t("login.connecting") : t("login.sign_in")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
