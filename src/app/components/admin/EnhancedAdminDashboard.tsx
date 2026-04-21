import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Home,
  Briefcase,
  Users,
  MapPin,
  Shield,
  Bell,
  Settings,
  MessageCircle,
  Search,
  TrendingUp,
  TrendingDown,
  Menu,
  X,
  LogOut,
  User,
  ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Badge } from '../ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { CasesManagement } from './CasesManagement';

type NavigationItem = {
  id: string;
  key: string;
  icon: typeof Home;
  path: string;
  badge?: number;
};

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', key: 'dashboard', icon: Home, path: '/admin/enhanced' },
  { id: 'cases', key: 'case_management', icon: Briefcase, path: '/admin/enhanced/cases' },
  { id: 'users', key: 'users', icon: Users, path: '/admin/enhanced/users' },
  { id: 'places', key: 'places_locations', icon: MapPin, path: '/admin/enhanced/places' },
  { id: 'moderation', key: 'moderation_queue', icon: Shield, path: '/admin/enhanced/moderation', badge: 12 },
  { id: 'notifications', key: 'notifications', icon: Bell, path: '/admin/enhanced/notifications', badge: 5 },
  { id: 'settings', key: 'settings', icon: Settings, path: '/admin/enhanced/settings' },
  { id: 'chatbot', key: 'chatbot', icon: MessageCircle, path: '/admin/enhanced/chatbot' },
];

const GOVERNORATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
  "Jendouba", "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia",
  "Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
  "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
];

export function EnhancedAdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [cases, setCases] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCases, resUsers] = await Promise.all([
          fetch('/api/cases?limit=200').then(r => r.json().catch(() => ({}))),
          fetch('/api/users?limit=200', {
            headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('touneshelp_token')
            }
          }).then(r => r.json().catch(() => ({}))),
        ]);
        if (resCases && resCases.success && Array.isArray(resCases.data)) setCases(resCases.data);
        if (resUsers && resUsers.success && Array.isArray(resUsers.data)) setUsers(resUsers.data);
      } catch (e) {
        console.error('Failed to fetch data', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("touneshelp_token");
    localStorage.removeItem("touneshelp_user");
    navigate("/");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : (i18n.language === 'en' ? 'ar' : 'fr');
    i18n.changeLanguage(newLang);
  };

  // Calculate metrics
  const totalCases = cases.length;
  const pendingCases = cases.filter(c => c.status && c.status.toLowerCase() === 'pending').length;
  const resolvedThisMonth = cases.filter(c => c.status && c.status.toLowerCase() === 'resolved').length;
  const totalUsers = users.length;

  // Cases by status data
  const statusData = [
    { name: t('admin.status_suffering'), value: pendingCases, color: '#E53935' },
    { name: t('admin.status_helping'), value: cases.filter(c => c.status === 'helping').length, color: '#FF9800' },
    { name: t('admin.status_resolved'), value: resolvedThisMonth, color: '#43A047' },
  ];

  // Cases by governorate data (top 10)
  const governorateData = GOVERNORATES
    .map(gov => ({
      name: gov,
      cases: cases.filter(c => c.location && c.location.includes(gov)).length,
    }))
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 10);

  // Activity timeline (last 7 days)
  const timelineData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString(i18n.language || 'fr-FR', { day: 'numeric', month: 'short' }),
      cases: Math.floor(Math.random() * 15) + 5,
    };
  });

  const recentActivity = [
    { id: 1, type: 'case', title: 'Nouveau cas soumis', description: 'Urgence médicale à Tunis', time: 'Il y a 5 min', icon: '📋' },
    { id: 2, type: 'user', title: 'Nouvel utilisateur', description: 'Admin Ben Ali a rejoint', time: 'Il y a 12 min', icon: '👤' },
    { id: 3, type: 'status', title: 'Changement de statut', description: 'Cas #2847 résolu', time: 'Il y a 23 min', icon: '✅' },
    { id: 4, type: 'case', title: 'Nouveau cas soumis', description: 'Aide éducative à Sfax', time: 'Il y a 1 h', icon: '📋' },
    { id: 5, type: 'user', title: 'Nouvel utilisateur', description: 'Fatma Bouazizi a rejoint', time: 'Il y a 2 h', icon: '👤' },
  ];

  return (
    <div className="flex h-screen bg-[#F5F7FA]" dir={i18n.dir()}>
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
          } bg-white border-r border-[#E2E8F0] transition-all duration-300 flex flex-col shrink-0 relative`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#E2E8F0]">
          {!sidebarCollapsed ? (
            <h1 className="font-bold text-[#1E88E5] text-lg">TounesHelp</h1>
          ) : (
            <div className="text-2xl w-full text-center">🇹🇳</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-colors relative ${activeNav === item.id
                  ? 'bg-[#E3F2FD] text-[#1E88E5]'
                  : 'text-[#718096] hover:bg-[#F5F7FA]'
                  }`}
              >
                <Icon size={20} className="shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="text-sm font-medium whitespace-nowrap text-left flex-1">{t(`admin.${item.key}`)}</span>
                    {item.badge && (
                      <Badge className="ml-auto bg-[#E53935] text-white shrink-0">{item.badge}</Badge>
                    )}
                  </>
                )}
                {activeNav === item.id && (
                  <div className={`absolute top-0 bottom-0 w-1 bg-[#1E88E5] ${i18n.dir() === 'rtl' ? 'right-0' : 'left-0'}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Profile */}
        <div className="p-4 border-t border-[#E2E8F0] overflow-hidden whitespace-nowrap">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1E88E5] text-white flex items-center justify-center font-bold shrink-0">
                A
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-medium text-[#1A202C]">{t('admin.admin_label')}</div>
                <div className="text-xs text-[#718096] truncate">{t('admin.admin_email')}</div>
              </div>
              <button
                onClick={handleLogout}
                className="text-[#718096] hover:text-[#E53935] shrink-0"
                title={t('admin.logout')}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center text-[#718096] hover:text-[#E53935]"
              title={t('admin.logout')}
            >
              <LogOut size={20} />
            </button>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          title="Toggle sidebar"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`absolute top-20 w-6 h-6 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center shadow-sm hover:bg-[#F5F7FA] z-10 ${i18n.dir() === 'rtl' ? '-left-3' : '-right-3'}`}>
          <ChevronRight
            size={14}
            className={`transition-transform ${sidebarCollapsed ? (i18n.dir() === 'rtl' ? 'rotate-180' : '') : (i18n.dir() === 'rtl' ? '' : 'rotate-180')}`}
          />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-[#E2E8F0] px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#1A202C]">{t('admin.welcome_admin')}</h2>
              <p className="text-sm text-[#718096]">
                {new Date().toLocaleDateString(i18n.language || 'fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className={`absolute ${i18n.dir() === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-[#718096]`} size={18} />
                <Input
                  placeholder={t('admin.search')}
                  className={`w-80 bg-[#F5F7FA] border-0 ${i18n.dir() === 'rtl' ? 'pr-10' : 'pl-10'}`}
                />
              </div>
              <Button onClick={toggleLanguage} variant="outline" size="sm" className="text-xs font-bold uppercase min-w-[50px]">
                {i18n.language}
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E88E5]"></div>
          </div>
        ) : (
          <div className="p-8 space-y-8">
            {activeNav === 'cases' && <CasesManagement />}
            
            {activeNav === 'dashboard' && (
              <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-white border border-[#E2E8F0] rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#718096] mb-1">{t('admin.active_cases')}</p>
                    <h3 className="text-3xl font-bold text-[#1A202C]">{totalCases}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp size={16} className="text-[#43A047]" />
                      <span className="text-xs text-[#43A047]">+12% {t('admin.this_month')}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#E3F2FD] flex items-center justify-center">
                    <Briefcase className="text-[#1E88E5]" size={24} />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-[#E2E8F0] rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#718096] mb-1">{t('admin.pending')}</p>
                    <h3 className="text-3xl font-bold text-[#1A202C]">{pendingCases}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingDown size={16} className="text-[#E53935]" />
                      <span className="text-xs text-[#E53935]">-3% {t('admin.this_week')}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#FFF3E0] flex items-center justify-center">
                    <Shield className="text-[#FF9800]" size={24} />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-[#E2E8F0] rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#718096] mb-1">{t('admin.resolved_this_month')}</p>
                    <h3 className="text-3xl font-bold text-[#1A202C]">{resolvedThisMonth}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp size={16} className="text-[#43A047]" />
                      <span className="text-xs text-[#43A047]">+18% {t('admin.vs_last_month')}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                    <svg className="text-[#43A047]" width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-[#E2E8F0] rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#718096] mb-1">{t('admin.total_users')}</p>
                    <h3 className="text-3xl font-bold text-[#1A202C]">{totalUsers}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp size={16} className="text-[#43A047]" />
                      <span className="text-xs text-[#43A047]">+24 {t('admin.this_week')}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#F3E5F5] flex items-center justify-center">
                    <Users className="text-[#9C27B0]" size={24} />
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cases by Status */}
              <Card className="p-6 bg-white border border-[#E2E8F0] rounded-xl">
                <h4 className="text-lg font-bold text-[#1A202C] mb-4">{t('admin.cases_by_status')}</h4>
                {statusData.reduce((acc, curr) => acc + curr.value, 0) > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-[#718096]">No data</div>
                )}
                <div className="mt-4 space-y-2">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[#718096]">{item.name}</span>
                      </div>
                      <span className="font-medium text-[#1A202C]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Activity Timeline */}
              <Card className="p-6 bg-white border border-[#E2E8F0] rounded-xl lg:col-span-2">
                <h4 className="text-lg font-bold text-[#1A202C] mb-4">{t('admin.activity_last_7_days')}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" tick={{ fill: '#718096', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#718096', fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="cases" stroke="#1E88E5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Cases by Governorate & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cases by Governorate */}
              <Card className="p-6 bg-white border border-[#E2E8F0] rounded-xl">
                <h4 className="text-lg font-bold text-[#1A202C] mb-4">{t('admin.top_10_governorates')}</h4>
                {governorateData.reduce((acc, curr) => acc + curr.cases, 0) > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={governorateData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis type="number" tick={{ fill: '#718096', fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: '#718096', fontSize: 11 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="cases" fill="#1E88E5" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-[#718096]">No data</div>
                )}
              </Card>

              {/* Recent Activity Feed */}
              <Card className="p-6 bg-white border border-[#E2E8F0] rounded-xl">
                <h4 className="text-lg font-bold text-[#1A202C] mb-4">{t('admin.recent_activity')}</h4>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex gap-3 pb-4 border-b border-[#E2E8F0] last:border-0">
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1A202C]">{activity.title}</p>
                        <p className="text-xs text-[#718096]">{activity.description}</p>
                        <p className="text-xs text-[#718096] mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 text-[#1E88E5] border-[#1E88E5]">
                  {t('admin.view_all')}
                </Button>
              </Card>
            </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
