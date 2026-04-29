import { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Database,
  Save,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "TounesHelp Map",
    contactEmail: "admin@touneshelp.tn",
    maxFileSize: "5",
    notificationsEnabled: true,
    autoApprove: false,
    maintenanceMode: false,
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    toast.success("Paramètres sauvegardés avec succès");
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1C1C1E]">Paramètres</h2>
          <p className="text-gray-600">
            Configuration générale de la plateforme
          </p>
        </div>
        <Button
          onClick={() => void handleSave()}
          disabled={saving}
          className="bg-[#C0392B] hover:bg-[#A02E24] text-white rounded-xl"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Globe size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1C1C1E]">Général</h3>
              <p className="text-sm text-gray-500">
                Paramètres de base du site
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nom du site</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email de contact</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) =>
                  setSettings({ ...settings, contactEmail: e.target.value })
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">
                Taille max. des fichiers (MB)
              </Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) =>
                  setSettings({ ...settings, maxFileSize: e.target.value })
                }
                className="h-11"
              />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Bell size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1C1C1E]">Notifications</h3>
              <p className="text-sm text-gray-500">
                Gérer les alertes et notifications
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="font-medium text-[#1C1C1E]">
                  Notifications par email
                </p>
                <p className="text-sm text-gray-500">
                  Recevoir les alertes par email
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    notificationsEnabled: !settings.notificationsEnabled,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notificationsEnabled
                    ? "bg-[#27AE60]"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.notificationsEnabled
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1C1C1E]">Sécurité</h3>
              <p className="text-sm text-gray-500">
                Paramètres de sécurité et modération
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="font-medium text-[#1C1C1E]">
                  Approbation automatique
                </p>
                <p className="text-sm text-gray-500">
                  Approuver automatiquement les nouveaux cas
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    autoApprove: !settings.autoApprove,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.autoApprove ? "bg-[#27AE60]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.autoApprove
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* System Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Database size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1C1C1E]">Système</h3>
              <p className="text-sm text-gray-500">
                État et maintenance du système
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="font-medium text-[#1C1C1E]">
                  Mode maintenance
                </p>
                <p className="text-sm text-gray-500">
                  Désactiver temporairement le site
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    maintenanceMode: !settings.maintenanceMode,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.maintenanceMode ? "bg-[#C0392B]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.maintenanceMode
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">
                  Système opérationnel
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1 ml-6">
                Base de données SQLite • Next.js 15 • Prisma ORM
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
