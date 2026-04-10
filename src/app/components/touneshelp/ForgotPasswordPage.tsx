import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
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
        toast.error(payload?.error || "Une erreur est survenue.");
        if (response.status === 404) {
          navigate("/inscription");
        }
        return;
      }

      toast.success("Instructions de réinitialisation envoyées par e-mail.");
      navigate("/connexion");
    } catch (error) {
      console.error(error);
      toast.error("Impossible d'envoyer l'email. Réessayez plus tard.");
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

          <h2 className="text-[36px] font-bold mb-6">Mot de passe oublié</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Entrez votre adresse e-mail pour recevoir des instructions de réinitialisation du mot de passe.
          </p>
        </div>
      </div>

      <div className="bg-[#FDF6EC] p-8 lg:p-20 flex flex-col justify-center">
        <div className="max-w-[480px] mx-auto w-full bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] p-10">
          <div className="w-12 h-12 rounded-full bg-[#C0392B] flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-xl">T</span>
          </div>

          <h2 className="text-[28px] font-bold text-[#1C1C1E] text-center mb-2">Récupération du mot de passe</h2>
          <p className="text-center text-[#6B6B6B] mb-8">
            Vous voulez retourner à la connexion ?{' '}
            <Link to="/connexion" className="text-[#C0392B] hover:underline font-semibold">
              Se connecter
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

            <Button
              type="submit"
              className="w-full bg-[#C0392B] hover:bg-[#A02E24] text-white h-[52px] rounded-xl text-base font-semibold"
              disabled={loading}
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-[#6B6B6B]">
            Si aucun compte n'est trouvé, vous serez redirigé vers la page d'inscription.
          </p>
        </div>
      </div>
    </div>
  );
}
