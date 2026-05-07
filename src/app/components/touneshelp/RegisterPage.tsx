import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../lib/auth";
import { useTranslation } from "react-i18next";

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: location.state?.email || '',
    password: '',
    confirmPassword: '',
    phone: '',
    terms: false,
  });

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return 0;
    if (pwd.length < 6) return 1;
    if (pwd.length < 10) return 2;
    if (pwd.length < 14) return 3;
    return 4;
  };

  const strength = getPasswordStrength(formData.password);
  const strengthLabels = ['', t("register.password_strength"), t("register.medium"), t("register.good"), t("register.strong")];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  const { login } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error(t("register.passwords_mismatch"));
      return;
    }
    if (!formData.terms) {
      toast.error(t("register.accept_terms"));
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload?.error || t("register.register_error"));
        if (response.status === 409) {
          navigate("/connexion");
        }
        return;
      }

      login(payload.data.user, payload.data.token);
      toast.success(t("register.account_created"));
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(t("register.register_failed"));
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column */}
      <div className="bg-[#1A0A00] text-white p-12 lg:p-20 flex flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <span className="text-[#C0392B] font-bold text-2xl">T</span>
            </div>
            <span className="text-white font-bold text-xl">TounesHelp Map</span>
          </div>

          <h2 className="text-[36px] font-bold mb-6">
            {t("register.join_us")}
          </h2>

          <p className="text-white/70 text-lg leading-relaxed">
            {t("register.join_us_desc")}
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="bg-[#FDF6EC] p-8 lg:p-12 flex flex-col justify-center overflow-y-auto">
        <div className="max-w-[480px] mx-auto w-full bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] p-10">
          <div className="w-12 h-12 rounded-full bg-[#C0392B] flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-xl">T</span>
          </div>

          <h2 className="text-[28px] font-bold text-[#1C1C1E] text-center mb-2">
            {t("register.create_account")}
          </h2>

          <p className="text-center text-[#6B6B6B] mb-8">
            {t("register.have_account")}{' '}
            <Link to="/connexion" className="text-[#C0392B] hover:underline font-semibold">
              {t("register.sign_in_link")}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name">{t("register.full_name")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 rounded-lg mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">{t("register.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 rounded-lg mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">{t("register.password")}</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 rounded-lg pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${i <= strength ? strengthColors[strength] : 'bg-gray-200'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">{strengthLabels[strength]}</p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t("register.confirm_password")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="h-12 rounded-lg mt-2"
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X size={14} /> {t("register.passwords_mismatch")}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">{t("register.phone")}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+216"
                className="h-12 rounded-lg mt-2"
                required
              />
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                {t("register.terms")}<Link to="/" className="text-[#C0392B] hover:underline">{t("register.terms_link")}</Link> {t("register.privacy_link")}
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#C0392B] hover:bg-[#A02E24] text-white h-[52px] rounded-xl text-base font-semibold"
            >
              {t("register.create_account_btn")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
