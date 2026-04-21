import { AdminLayout } from "./AdminLayout";
import { useEffect, useState, useMemo } from "react";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FileText, Users, MapPin, TrendingUp, Award, Activity } from "lucide-react";
import { fetchStats, type StatsResponse } from "../../../lib/backendApi";

const STATUS_COLORS: Record<string, string> = {
  SUFFERING: "#E53935",
  HELPING: "#FF9800",
  RESOLVED: "#43A047",
};

const CATEGORY_COLORS = ["#1E88E5", "#E53935", "#43A047", "#FF9800", "#9C27B0", "#00ACC1", "#8D6E63"];

export function AdminStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setStats(await fetchStats());
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const statusData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Souffrance", value: stats.overview.sufferingCases, color: STATUS_COLORS.SUFFERING },
      { name: "En cours", value: stats.overview.helpingCases, color: STATUS_COLORS.HELPING },
      { name: "Résolu", value: stats.overview.resolvedCases, color: STATUS_COLORS.RESOLVED },
    ];
  }, [stats]);

  const topGovernorates = useMemo(
    () => (stats?.casesByGovernorate || []).slice(0, 10).map((g) => ({ name: g.governorate, cases: g.count })),
    [stats]
  );

  const categoryData = useMemo(
    () => (stats?.casesByCategory || []).map((c) => ({ name: c.category, value: c.count })),
    [stats]
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C0392B]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total des cas</p>
              <p className="text-3xl font-bold text-[#1C1C1E]">{stats?.overview.totalCases ?? 0}</p>
            </div>
            <FileText size={40} className="text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Utilisateurs inscrits</p>
              <p className="text-3xl font-bold text-[#1C1C1E]">{stats?.overview.totalUsers ?? 0}</p>
            </div>
            <Users size={40} className="text-purple-500" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Personnes aidées</p>
              <p className="text-3xl font-bold text-[#27AE60]">{stats?.overview.totalPeopleAffected ?? 0}</p>
            </div>
            <Award size={40} className="text-green-500" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Taux de résolution</p>
              <p className="text-3xl font-bold text-[#1C1C1E]">{stats?.overview.resolutionRate ?? 0}%</p>
            </div>
            <TrendingUp size={40} className="text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-[#1C1C1E] mb-4">Cas par statut</h3>
          {statusData.reduce((a, c) => a + c.value, 0) > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">Pas de données</div>
          )}
        </Card>

        {/* Category Chart */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-[#1C1C1E] mb-4">Cas par catégorie</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">Pas de données</div>
          )}
        </Card>
      </div>

      {/* Governorate Chart */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-bold text-[#1C1C1E] mb-2">Top 10 gouvernorats</h3>
        <p className="text-sm text-gray-600 mb-6">Les gouvernorats avec le plus de cas signalés</p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topGovernorates} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="cases" fill="#C0392B" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Cases */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-[#1C1C1E] mb-4">Cas récents</h3>
        <div className="space-y-3">
          {(stats?.recentCases || []).map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`w-2 h-2 rounded-full ${
                c.status === "SUFFERING" ? "bg-red-500" :
                c.status === "HELPING" ? "bg-orange-500" : "bg-green-500"
              }`} />
              <div className="flex-1">
                <p className="font-medium text-[#1C1C1E]">{c.title}</p>
                <p className="text-sm text-gray-500">{c.governorate}</p>
              </div>
              <Badge className={
                c.status === "SUFFERING" ? "bg-red-100 text-red-700" :
                c.status === "HELPING" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
              }>
                {c.status === "SUFFERING" ? "Souffrance" :
                 c.status === "HELPING" ? "En cours" : "Résolu"}
              </Badge>
              <span className="text-sm text-gray-400">
                {new Date(c.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          ))}
          {(!stats?.recentCases || stats.recentCases.length === 0) && (
            <p className="text-center text-gray-400 py-8">Aucun cas récent</p>
          )}
        </div>
      </Card>
    </AdminLayout>
  );
}
