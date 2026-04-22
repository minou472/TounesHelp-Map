import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Search,
  MoreVertical,
  ShieldAlert,
  Trash2,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import {
  fetchAdminUsers,
  updateUser,
  deleteUser,
  createUser,
  type AdminUser,
} from "../../../lib/backendApi";
import { toast } from "sonner";

const EMPTY_CREATE_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "USER" as "USER" | "ADMIN",
  status: "ACTIVE" as "ACTIVE" | "BLOCKED",
};

export function AdminUsers() {
  const [usersData, setUsersData] = useState<{
    users: AdminUser[];
    total: number;
  }>({ users: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Create user dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [isCreating, setIsCreating] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminUsers();
      setUsersData(data);
    } catch (error: any) {
      console.error("Failed to load admin users", error);
      toast.error(error?.message || "Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const activeCount = useMemo(
    () => usersData.users.filter((u: AdminUser) => u.status === "ACTIVE").length,
    [usersData.users]
  );
  const blockedCount = useMemo(
    () => usersData.users.filter((u: AdminUser) => u.status === "BLOCKED").length,
    [usersData.users]
  );

  const handleUpdateStatus = async (id: string, currentStatus: "ACTIVE" | "BLOCKED") => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
      await updateUser(id, { status: newStatus });
      toast.success(
        newStatus === "BLOCKED"
          ? "Utilisateur bloqué avec succès."
          : "Utilisateur débloqué avec succès."
      );
      await load();
      setOpenMenuId(null);
    } catch (error: any) {
      console.error("Failed to update status", error);
      toast.error(error?.message || "Erreur lors de la mise à jour du statut.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    try {
      await deleteUser(id);
      toast.success("Utilisateur supprimé avec succès.");
      await load();
      setOpenMenuId(null);
    } catch (error: any) {
      console.error("Failed to delete user", error);
      toast.error(error?.message || "Impossible de supprimer l'utilisateur.");
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error("Nom, email et mot de passe sont obligatoires.");
      return;
    }
    if (createForm.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setIsCreating(true);
    try {
      await createUser({
        name: createForm.name,
        email: createForm.email,
        phone: createForm.phone || undefined,
        role: createForm.role,
        status: createForm.status,
        password: createForm.password,
      });
      toast.success("Utilisateur créé avec succès.");
      setCreateDialogOpen(false);
      setCreateForm(EMPTY_CREATE_FORM);
      await load();
    } catch (error: any) {
      console.error("Failed to create user", error);
      toast.error(error?.message || "Erreur lors de la création de l'utilisateur.");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = usersData.users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-bold text-[#1C1C1E]">{usersData.total}</p>
              <p className="text-sm text-gray-600">Utilisateurs inscrits</p>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <p className="text-2xl font-bold text-[#27AE60]">{activeCount}</p>
              <p className="text-sm text-gray-600">Actifs</p>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <p className="text-2xl font-bold text-[#C0392B]">{blockedCount}</p>
              <p className="text-sm text-gray-600">Bloqués</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              className="bg-[#C0392B] hover:bg-[#A02E24] text-white flex items-center gap-2"
              onClick={() => setCreateDialogOpen(true)}
            >
              <UserPlus size={16} />
              Ajouter
            </Button>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full relative">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user: AdminUser) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-semibold">
                        {user.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[#1C1C1E]">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.casesCreated || 0} cas créés</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {user.role === "ADMIN" ? "Administrateur" : "Utilisateur"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        user.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {user.status === "ACTIVE" ? "Actif" : "Bloqué"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 relative">
                    <button
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Actions utilisateur"
                      onClick={() =>
                        setOpenMenuId(openMenuId === user.id ? null : user.id)
                      }
                    >
                      <MoreVertical size={18} className="text-gray-600" />
                    </button>
                    {openMenuId === user.id && (
                      <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => handleUpdateStatus(user.id, user.status)}
                        >
                          {user.status === "ACTIVE" ? (
                            <>
                              <ShieldAlert size={16} /> Bloquer
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={16} /> Débloquer
                            </>
                          )}
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 size={16} /> Supprimer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {loading ? "Chargement en cours..." : "Aucun utilisateur trouvé."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="new-name">Nom complet *</Label>
              <Input
                id="new-name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Nom de l'utilisateur"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-email">Adresse e-mail *</Label>
              <Input
                id="new-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="email@exemple.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-phone">Téléphone (optionnel)</Label>
              <Input
                id="new-phone"
                type="tel"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-password">Mot de passe *</Label>
              <Input
                id="new-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Minimum 6 caractères"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Rôle</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(v: "USER" | "ADMIN") =>
                    setCreateForm({ ...createForm, role: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Utilisateur</SelectItem>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Statut</Label>
                <Select
                  value={createForm.status}
                  onValueChange={(v: "ACTIVE" | "BLOCKED") =>
                    setCreateForm({ ...createForm, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Actif</SelectItem>
                    <SelectItem value="BLOCKED">Bloqué</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setCreateForm(EMPTY_CREATE_FORM);
              }}
              disabled={isCreating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={isCreating}
              className="bg-[#C0392B] hover:bg-[#A02E24] text-white"
            >
              {isCreating ? "Création..." : "Créer l'utilisateur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
