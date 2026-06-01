import { AdminLayout } from "./AdminLayout";
import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import {
  Search,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle,
  Filter,
  Users,
  ArrowUpCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../ui/select";
import { toast } from "sonner";
import { fetchAdminUsers, type AdminUser, fetchCases, updateCase, deleteCase } from "../../../lib/backendApi";
import type { TunisiaCase } from "../../../data/tunisiaData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../../ui/dialog";

/**
 * AdminCases Component
 * The central dashboard where humanitarian efforts are coordinated.
 * This is where we ensure no cry for help goes unanswered. Every row represents a real plea,
 * and assigning an NGO (helping) or resolving it means a family receives the support they need.
 */
export function AdminCases() {
  const [cases, setCases] = useState<TunisiaCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ngos, setNgos] = useState<AdminUser[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCaseForAssign, setSelectedCaseForAssign] = useState<string | null>(null);
  const [selectedNgo, setSelectedNgo] = useState("");

  const loadCasesAndNgos = async () => {
    setLoading(true);
    try {
      const [casesData, usersData] = await Promise.all([
        fetchCases({ limit: 200 }),
        fetchAdminUsers()
      ]);
      
      const normalizedCases = casesData.map((caseData: any) => ({
        ...caseData,
        status: caseData.status?.toLowerCase() || "suffering"
      }));
      setCases(normalizedCases);

      const orgs = usersData.users.filter(u => u.userType === "ORGANIZATION");
      setNgos(orgs);
    } catch (error) {
      console.error("Failed to load data", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCasesAndNgos();
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
      loadCasesAndNgos();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleEscalate = async (id: string) => {
    try {
      await updateCase(id, { isEscalated: true });
      toast.success("Cas escaladé avec succès");
      loadCasesAndNgos();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de l'escalade");
    }
  };

  const handleAssignNGO = async () => {
    if (!selectedCaseForAssign || !selectedNgo) {
      toast.error("Veuillez sélectionner une ONG");
      return;
    }
    try {
      await updateCase(selectedCaseForAssign, { assignedToId: selectedNgo, status: "HELPING" });
      toast.success("Cas assigné avec succès");
      setAssignDialogOpen(false);
      setSelectedCaseForAssign(null);
      setSelectedNgo("");
      loadCasesAndNgos();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de l'assignation");
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
            onClick={loadCasesAndNgos}
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
                      <div className="flex gap-1 mt-1">
                        {caseData.isEscalated && (
                          <Badge variant="destructive" className="h-4 text-[10px] px-1">Escaladé</Badge>
                        )}
                        {caseData.assignedTo && (
                          <Badge variant="secondary" className="h-4 text-[10px] px-1 bg-blue-100 text-blue-800">
                            Assigné: {caseData.assignedTo.name}
                          </Badge>
                        )}
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
                      {caseData.dateSubmitted
                        ? new Date(caseData.dateSubmitted).toLocaleDateString(
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
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {!caseData.assignedTo?.id && caseData.status === "suffering" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:bg-blue-50 h-8 px-2"
                            onClick={() => {
                              setSelectedCaseForAssign(caseData.id);
                              setAssignDialogOpen(true);
                            }}
                            title="Assigner ONG"
                          >
                            <Users size={14} />
                          </Button>
                        )}
                        {!caseData.isEscalated && caseData.status !== "resolved" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-purple-600 hover:bg-purple-50 h-8 px-2"
                            onClick={() => handleEscalate(caseData.id)}
                            title="Escalader le cas"
                          >
                            <ArrowUpCircle size={14} />
                          </Button>
                        )}
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

      {/* Assign NGO Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner une organisation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Sélectionnez une ONG</label>
            <Select value={selectedNgo} onValueChange={setSelectedNgo}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une ONG..." />
              </SelectTrigger>
              <SelectContent>
                {ngos.length > 0 ? (
                  ngos.map((ngo) => (
                    <SelectItem key={ngo.id} value={ngo.id}>
                      {ngo.name} ({ngo.email})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Aucune ONG disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAssignNGO} className="bg-blue-600 hover:bg-blue-700 text-white">Assigner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
