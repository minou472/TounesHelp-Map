import { AdminLayout } from "./AdminLayout";
import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../ui/select";
import { toast } from "sonner";
interface TunisiaCase {
  id: string;
  title: string;
  description: string;
  governorate: string;
  city: string;
  status: string;
  victimName: string;
  victimPhone: string;
  creatorName: string;
  creatorEmail: string;
  createdAt?: string;
}
import { fetchCases, updateCase, deleteCase } from "../../../lib/backendApi";

export function AdminCases() {
  const [cases, setCases] = useState<TunisiaCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await fetchCases({ limit: 200 });
      // Normalize status to lowercase for frontend consistency
      const normalizedCases = data.map((caseData: any) => ({
        ...caseData,
        status: caseData.status?.toLowerCase() || "suffering"
      }));
      setCases(normalizedCases);
    } catch (error) {
      console.error("Failed to load cases", error);
      toast.error("Erreur lors du chargement des cas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCases();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cas ?")) return;

    try {
      await deleteCase(id);
      toast.success("Cas supprimé avec succès");
      setCases(cases.filter((c) => c.id !== id));
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la suppression");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateCase(id, { status: newStatus as "SUFFERING" | "HELPING" | "RESOLVED" });
      toast.success("Statut mis à jour");
      loadCases();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la mise à jour");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "suffering":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
            <AlertCircle size={12} />
            Souffrance
          </Badge>
        );
      case "helping":
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 flex items-center gap-1">
            <Clock size={12} />
            En cours d'aide
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle size={12} />
            Résolu
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.governorate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.victimName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.creatorName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1C1C1E]">Tous les cas</h2>
            <p className="text-sm text-gray-600">
              {cases.length} cas au total ·{" "}
              {cases.filter((c) => c.status === "suffering").length} en
              souffrance · {cases.filter((c) => c.status === "resolved").length}{" "}
              résolus
            </p>
          </div>
          <Button
            onClick={loadCases}
            variant="outline"
            className="text-[#C0392B] border-[#C0392B]"
          >
            Rafraîchir
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Rechercher par titre, lieu, victime ou créateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter size={16} className="mr-2 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="suffering">Souffrance</SelectItem>
              <SelectItem value="helping">En cours</SelectItem>
              <SelectItem value="resolved">Résolu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cases Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Victime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Créateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Gouvernorat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C0392B] mx-auto mb-2" />
                    Chargement...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Aucun cas trouvé.
                  </td>
                </tr>
              ) : (
                filteredCases.map((caseData, index) => (
                  <tr
                    key={caseData.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#1C1C1E] max-w-[200px] truncate">
                        {caseData.title}
                      </div>
                      <div className="text-xs text-gray-500 max-w-[200px] truncate">
                        {caseData.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {caseData.victimName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {caseData.victimPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {caseData.creatorName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {caseData.creatorEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-gray-100 text-gray-700">
                        {caseData.governorate}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {caseData.city}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(caseData.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {caseData.createdAt
                        ? new Date(caseData.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            }
                          )
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {caseData.status === "suffering" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-orange-600 hover:bg-orange-50 h-8 px-2"
                            onClick={() =>
                              handleStatusChange(caseData.id, "HELPING")
                            }
                            title="Marquer en cours"
                          >
                            <Clock size={14} />
                          </Button>
                        )}
                        {caseData.status !== "resolved" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:bg-green-50 h-8 px-2"
                            onClick={() =>
                              handleStatusChange(caseData.id, "RESOLVED")
                            }
                            title="Marquer résolu"
                          >
                            <CheckCircle size={14} />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 h-8 px-2"
                          onClick={() => handleDelete(caseData.id)}
                          title="Rejeter / Supprimer"
                        >
                          Rejeter
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
