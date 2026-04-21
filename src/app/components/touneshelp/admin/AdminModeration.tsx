import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../ui/select";
import { Search, Eye, Check, X } from "lucide-react";
import type { TunisiaCase } from "../../../data/tunisiaData";
import { fetchCases } from "../../../lib/backendApi";

export function AdminModeration() {
  const [pendingCases, setPendingCases] = useState<TunisiaCase[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setPendingCases(await fetchCases({ limit: 50 }));
      } catch (error) {
        console.error("Failed to load moderation cases", error);
      }
    };
    void load();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-[#1C1C1E]">
            File de modération
          </h2>
          <Badge className="bg-[#C0392B] text-white">
            {pendingCases.length} cas en attente
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input placeholder="Rechercher un cas..." className="pl-10" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les gouvernorats</SelectItem>
              <SelectItem value="tunis">Tunis</SelectItem>
              <SelectItem value="sfax">Sfax</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="recent">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récent</SelectItem>
              <SelectItem value="oldest">Plus ancien</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Titre du cas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Auteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Gouvernorat
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
              {pendingCases.map((caseData, index) => (
                <tr
                  key={caseData.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm font-medium text-[#1C1C1E] hover:text-[#C0392B] text-left">
                      {caseData.title}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {caseData.creatorEmail}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-gray-100 text-gray-700">
                      {caseData.governorate}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">il y a 3h</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-600"
                      >
                        <Eye size={16} className="mr-1" />
                        Aperçu
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#27AE60] hover:bg-[#229954] text-white"
                      >
                        <Check size={16} className="mr-1" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <X size={16} className="mr-1" />
                        Rejeter
                      </Button>
                    </div>
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
