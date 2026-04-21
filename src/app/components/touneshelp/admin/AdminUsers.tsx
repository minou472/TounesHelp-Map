import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Search, MoreVertical } from "lucide-react";
import { fetchAdminUsers, type AdminUser } from "../../../lib/backendApi";

export function AdminUsers() {
  const [usersData, setUsersData] = useState<{
    users: AdminUser[];
    total: number;
  }>({ users: [], total: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAdminUsers();
        setUsersData(data);
      } catch (error) {
        console.error("Failed to load admin users", error);
      }
    };
    void load();
  }, []);

  const activeCount = useMemo(
    () =>
      usersData.users.filter((u: AdminUser) => u.status === "ACTIVE").length,
    [usersData.users]
  );
  const blockedCount = useMemo(
    () =>
      usersData.users.filter((u: AdminUser) => u.status === "BLOCKED").length,
    [usersData.users]
  );

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-bold text-[#1C1C1E]">
                {usersData.total}
              </p>
              <p className="text-sm text-gray-600">Utilisateurs inscrits</p>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <p className="text-2xl font-bold text-[#27AE60]">{activeCount}</p>
              <p className="text-sm text-gray-600">Actifs</p>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <p className="text-2xl font-bold text-[#C0392B]">
                {blockedCount}
              </p>
              <p className="text-sm text-gray-600">Bloqués</p>
            </div>
          </div>

          <div className="relative w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Rechercher un utilisateur..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
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
              {usersData.users.map((user: AdminUser) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-semibold">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-[#1C1C1E]">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.casesCreated || 0} cas créés
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>
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
                  <td className="px-6 py-4">
                    <button
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Actions utilisateur"
                    >
                      <MoreVertical size={18} className="text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
