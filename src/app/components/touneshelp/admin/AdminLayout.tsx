import { Link, useLocation } from "react-router";
import {
  Home,
  FileText,
  Users,
  BarChart3,
  LogOut,
  ChevronRight,
  Bell,
  MapPin,
  Settings,
  MessageSquare
} from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { ReactNode, useState, useEffect } from "react";
import {
  fetchNotifications,
  type NotificationsResponse
} from "../../../lib/backendApi";
import { LanguageTranslatorCompact } from "../../touneshelp/LanguageTranslator";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationsResponse | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };

    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: "/admin", icon: Home, label: "Tableau de bord" },
    { path: "/admin/utilisateurs", icon: Users, label: "Utilisateurs" },
    { path: "/admin/lieux", icon: MapPin, label: "Lieux & Locations" },
    { path: "/admin/moderation", icon: FileText, label: "File de modération" },
    { path: "/admin/cas", icon: FileText, label: "Tous les cas" },
    { path: "/admin/notifications", icon: Bell, label: "Notifications" },
    { path: "/admin/stats", icon: BarChart3, label: "Statistiques" },
    { path: "/admin/chatbot", icon: MessageSquare, label: "Chatbot" },
    { path: "/admin/parametres", icon: Settings, label: "Paramètres" }
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? "w-20" : "w-64"} bg-[#1A1A2E] text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          {!sidebarCollapsed ? (
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <span className="text-[#C0392B] font-bold text-lg">T</span>
                </div>
                <span className="text-white font-bold">TounesHelp</span>
              </div>
              <p className="text-xs text-gray-400 ml-12">Administration</p>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center mx-auto">
              <span className="text-[#C0392B] font-bold text-lg">T</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active
                    ? "bg-[#C0392B]/20 text-white border-l-3 border-[#C0392B]"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon size={20} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400">Administrateur</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full text-[#C0392B] hover:text-[#C0392B] hover:bg-red-900/20 justify-start"
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span className="ml-2">Se déconnecter</span>}
          </Button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute right-0 top-20 translate-x-1/2 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600"
        >
          <ChevronRight
            size={14}
            className={`transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
          />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold text-[#1C1C1E]">
            {navItems.find((item) => isActive(item.path))?.label || "Dashboard"}
          </h1>

          <div className="flex items-center gap-4">
            <LanguageTranslatorCompact />
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg"
              >
                <Bell size={20} />
                {notifications && notifications.total > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#C0392B] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {notifications.total > 99 ? "99+" : notifications.total}
                  </div>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-[#1C1C1E]">
                      Notifications
                    </h3>
                    <p className="text-sm text-gray-600">
                      {notifications?.total || 0} notification(s)
                    </p>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications?.details.pendingCasesMessage && (
                      <Link
                        to="/admin/moderation"
                        className="block p-4 border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => setShowNotifications(false)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-[#C0392B] rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-[#1C1C1E]">
                              Cas en attente
                            </p>
                            <p className="text-sm text-gray-600">
                              {notifications.details.pendingCasesMessage}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )}

                    {notifications?.details.recentUsersMessage && (
                      <Link
                        to="/admin/utilisateurs"
                        className="block p-4 border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => setShowNotifications(false)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-[#27AE60] rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-[#1C1C1E]">
                              Nouveaux utilisateurs
                            </p>
                            <p className="text-sm text-gray-600">
                              {notifications.details.recentUsersMessage}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )}

                    {notifications?.details.oldCasesMessage && (
                      <Link
                        to="/admin/cas"
                        className="block p-4 hover:bg-gray-50"
                        onClick={() => setShowNotifications(false)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-[#E67E22] rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-[#1C1C1E]">
                              Cas anciens
                            </p>
                            <p className="text-sm text-gray-600">
                              {notifications.details.oldCasesMessage}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )}

                    {(!notifications || notifications.total === 0) && (
                      <div className="p-8 text-center text-gray-500">
                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Aucune notification</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-semibold">
              A
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
