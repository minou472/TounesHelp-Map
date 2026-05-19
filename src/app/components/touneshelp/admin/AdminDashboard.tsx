import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FileText, Clock, CheckCircle, Users, TrendingUp } from "lucide-react";
import { fetchStats, type StatsResponse } from "../../../lib/backendApi";

const STATUS_COLORS = {
  resolved: '#27AE60',
  helping: '#F39C12',
  suffering: '#C0392B'
};

export function AdminDashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setStats(await fetchStats());
      } catch (error) {
        console.error("Failed to load admin stats", error);
      }
    };
    void load();
  }, []);

  const topGovernorates = useMemo(
    () => (stats?.casesByGovernorate || []).slice(0, 10).map((g) => ({ name: g.governorate, cases: g.count })),
    [stats]
  );

  const statusData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Résolus (Solved)', value: stats.overview.resolvedCases, color: STATUS_COLORS.resolved },
      { name: 'En cours (Helping Now)', value: stats.overview.helpingCases, color: STATUS_COLORS.helping },
      { name: 'Non résolus (Unsolved)', value: stats.overview.sufferingCases, color: STATUS_COLORS.suffering },
    ];
  }, [stats]);

  const recentTimingData = useMemo(() => {
    if (!stats) return [];
    // Aggregate recent cases by date to show timing
    const dates: Record<string, number> = {};
    stats.recentCases.forEach(c => {
      const date = new Date(c.createdAt).toLocaleDateString();
      dates[date] = (dates[date] || 0) + 1;
    });
    return Object.entries(dates).map(([date, count]) => ({ date, cases: count })).slice(0, 7); // last 7 distinct dates
  }, [stats]);

  const totalCases = stats?.overview.totalCases ?? 0;
  const pendingCases = stats?.overview.sufferingCases ?? 0;
  const helpingCases = stats?.overview.helpingCases ?? 0;
  const resolvedCases = stats?.overview.resolvedCases ?? 0;
  const totalUsers = stats?.overview.totalUsers ?? 0;

  return (
    <AdminLayout>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total des cas</p>
              <p className="text-3xl font-bold text-[#1C1C1E]">{totalCases}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                Global
              </p>
            </div>
            <FileText size={40} className="text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-[#C0392B]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Non résolus</p>
              <p className="text-3xl font-bold text-[#C0392B]">{pendingCases}</p>
              <p className="text-xs text-[#C0392B] mt-1">
                Nécessite de l'aide
              </p>
            </div>
            <div className="relative">
              <Clock size={40} className="text-[#C0392B]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#C0392B] rounded-full animate-pulse" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-[#F39C12]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En cours d'aide</p>
              <p className="text-3xl font-bold text-[#F39C12]">{helpingCases}</p>
              <p className="text-xs text-[#F39C12] mt-1">
                Aide en route
              </p>
            </div>
            <div className="relative">
              <Users size={40} className="text-[#F39C12]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-[#27AE60]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cas résolus</p>
              <p className="text-3xl font-bold text-[#27AE60]">{resolvedCases}</p>
              <p className="text-xs text-gray-500 mt-1">Succès</p>
            </div>
            <CheckCircle size={40} className="text-[#27AE60]" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Utilisateurs</p>
              <p className="text-3xl font-bold text-[#1C1C1E]">{totalUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Inscrits</p>
            </div>
            <Users size={40} className="text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Chart */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-[#1C1C1E] mb-2">Répartition des statuts de cas</h3>
          <p className="text-sm text-gray-600 mb-6">Proportion des cas résolus, non résolus et en cours</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Timing Chart */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-[#1C1C1E] mb-2">Timing des cas récents</h3>
          <p className="text-sm text-gray-600 mb-6">Évolution des signalements sur les derniers jours</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentTimingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cases" fill="#3498db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-8">
        <h3 className="text-xl font-bold text-[#1C1C1E] mb-2">Cas par gouvernorat</h3>
        <p className="text-sm text-gray-600 mb-6">Top 10 des gouvernorats avec le plus de cas signalés</p>
        
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

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-[#1C1C1E] mb-6">Activité récente</h3>
        
        <div className="space-y-4">
          {[
            { type: 'approved', text: 'Cas approuvé', case: 'Famille sans eau potable à Kasserine', time: 'il y a 2h', color: 'bg-green-500' },
            { type: 'new', text: 'Nouveau cas soumis', case: 'École sans chauffage à Jendouba', time: 'il y a 3h', color: 'bg-blue-500' },
            { type: 'resolved', text: 'Cas résolu', case: 'Personne âgée isolée à Gafsa', time: 'il y a 5h', color: 'bg-[#27AE60]' },
            { type: 'rejected', text: 'Cas rejeté', case: 'Demande non conforme', time: 'il y a 7h', color: 'bg-red-500' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
              <div className={`w-2 h-2 rounded-full ${activity.color}`} />
              <div className="flex-1">
                <p className="text-sm text-gray-600">{activity.text}</p>
                <p className="font-medium text-[#1C1C1E]">{activity.case}</p>
              </div>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </AdminLayout>
  );
}
