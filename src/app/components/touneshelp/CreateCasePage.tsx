import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";
import { Card } from "../ui/card";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { tunisiaGovernorates } from "../../data/tunisiaData";
import { toast } from "sonner";

export function CreateCasePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    governorate: '',
    city: '',
    victimName: '',
    victimPhone: '',
    peopleAffected: 1,
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else {
      toast.success('Cas créé avec succès!');
      navigate('/dashboard');
    }
  };

  const steps = [
    { number: 1, label: 'Informations' },
    { number: 2, label: 'Localisation' },
    { number: 3, label: 'Personne' },
    { number: 4, label: 'Médias' },
    { number: 5, label: 'Révision' },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6EC] py-12">
      {/* Progress Bar */}
      <div className="sticky top-[72px] z-40 bg-white border-b border-gray-200 py-6 mb-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center mb-4">
            {steps.map((s) => (
              <div key={s.number} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  s.number < step
                    ? 'bg-[#27AE60] text-white'
                    : s.number === step
                    ? 'bg-[#C0392B] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {s.number < step ? <Check size={20} /> : s.number}
                </div>
                {s.number < totalSteps && (
                  <div className={`w-12 md:w-24 h-1 mx-2 ${
                    s.number < step ? 'bg-[#C0392B]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            {steps.map((s) => (
              <div key={s.number} className={`font-medium ${
                s.number === step ? 'text-[#C0392B]' : 'text-gray-500'
              }`}>
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
                  <h2 className="text-2xl font-bold text-[#1C1C1E]">Informations de base</h2>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Titre du cas *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Décrivez brièvement la situation"
                  className="mt-2 h-12"
                />
                <p className="text-sm text-gray-500 mt-1 text-right">{formData.title.length}/100</p>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Décrivez la situation en détail..."
                  className="mt-2 min-h-[200px]"
                />
                <p className="text-sm text-gray-500 mt-1 text-right">
                  {formData.description.length} caractères (150 minimum)
                </p>
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
                  <h2 className="text-2xl font-bold text-[#1C1C1E]">Localisation</h2>
                </div>
              </div>

              <div>
                <Label htmlFor="governorate">Gouvernorat *</Label>
                <Select value={formData.governorate} onValueChange={(v) => setFormData({...formData, governorate: v})}>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Sélectionner un gouvernorat" />
                  </SelectTrigger>
                  <SelectContent>
                    {tunisiaGovernorates.map((gov) => (
                      <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">Ville/Délégation *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Ex: Sfax Ville"
                  className="mt-2 h-12"
                />
              </div>

              <div className="bg-gray-100 rounded-xl h-[300px] flex items-center justify-center text-gray-500">
                Carte interactive (placeholder)
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
                  <h2 className="text-2xl font-bold text-[#1C1C1E]">Personne concernée</h2>
                </div>
              </div>

              <div>
                <Label htmlFor="victimName">Nom de la personne *</Label>
                <Input
                  id="victimName"
                  value={formData.victimName}
                  onChange={(e) => setFormData({...formData, victimName: e.target.value})}
                  placeholder="Nom complet ou anonyme"
                  className="mt-2 h-12"
                />
              </div>

              <div>
                <Label htmlFor="victimPhone">Téléphone *</Label>
                <Input
                  id="victimPhone"
                  type="tel"
                  value={formData.victimPhone}
                  onChange={(e) => setFormData({...formData, victimPhone: e.target.value})}
                  placeholder="+216"
                  className="mt-2 h-12"
                />
              </div>

              <div>
                <Label htmlFor="peopleAffected">Nombre de personnes affectées</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setFormData({...formData, peopleAffected: Math.max(1, formData.peopleAffected - 1)})}
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{formData.peopleAffected}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setFormData({...formData, peopleAffected: formData.peopleAffected + 1})}
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
                  <h2 className="text-2xl font-bold text-[#1C1C1E]">Médias</h2>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-[#C0392B] transition-colors cursor-pointer">
                <div className="text-6xl mb-4">☁️</div>
                <p className="text-[#1C1C1E] font-medium mb-2">
                  Glissez vos photos ici ou cliquez pour parcourir
                </p>
                <p className="text-sm text-gray-500">
                  Max 10 photos · 5MB · JPG PNG WebP
                </p>
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
                  <h2 className="text-2xl font-bold text-[#1C1C1E]">Révision</h2>
                </div>
              </div>

              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">Informations de base</h3>
                <p className="text-sm text-blue-800">{formData.title}</p>
              </Card>

              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">Localisation</h3>
                <p className="text-sm text-blue-800">{formData.governorate} - {formData.city}</p>
              </Card>

              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">Personne concernée</h3>
                <p className="text-sm text-blue-800">{formData.victimName}</p>
              </Card>
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
              Précédent
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="bg-[#C0392B] hover:bg-[#A02E24] text-white rounded-xl"
            >
              {step === totalSteps ? 'Soumettre' : 'Suivant'}
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
