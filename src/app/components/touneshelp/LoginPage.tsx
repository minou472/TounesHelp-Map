import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../lib/auth";

export function LoginPage() {
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
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload?.error || "Erreur de connexion");
        if (response.status === 404) {
          navigate("/inscription");
        }
        return;
      }

      login(payload.data.user, payload.data.token);
      toast.success("Connexion réussie !");
      navigate(payload.data.user.role === "ADMIN" ? "/admin/enhanced" : "/");
    } catch (error) {
      console.error(error);
      toast.error("Impossible de se connecter. Réessayez plus tard.");
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
            Ensemble, aidons la Tunisie
          </h2>
          
          <p className="text-white/70 text-lg mb-12 leading-relaxed">
            Connectez-vous pour signaler des cas, suivre leur évolution et agir.
          </p>

          <div className="space-y-4 mb-12">
            <div className="flex items-center gap-3">
              <Check className="text-[#27AE60] flex-shrink-0" size={20} />
              <span className="text-white/90">Signalez des cas en quelques minutes</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="text-[#27AE60] flex-shrink-0" size={20} />
              <span className="text-white/90">Suivez la progression en temps réel</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="text-[#27AE60] flex-shrink-0" size={20} />
              <span className="text-white/90">Rejoignez une communauté solidaire</span>
            </div>
          </div>

          <blockquote className="text-[#C0392B] italic text-lg border-l-4 border-[#C0392B] pl-4">
            "Chaque action compte. Chaque vie vaut."
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
            Se connecter
          </h2>
          
          <p className="text-center text-[#6B6B6B] mb-8">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="text-[#C0392B] hover:underline font-semibold">
              S'inscrire →
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-[#1C1C1E] mb-2 block">
                Adresse e-mail
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
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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
                <Link to="/mot-de-passe-oublie" className="text-sm text-[#C0392B] hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#C0392B] hover:bg-[#A02E24] text-white h-[52px] rounded-xl text-base font-semibold"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
