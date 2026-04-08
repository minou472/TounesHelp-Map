import { Link, useLocation } from "react-router";
import { Home, FileText, Users, BarChart3, LogOut, ChevronRight, Bell } from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { ReactNode, useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
    { path: '/admin', icon: Home, label: 'Tableau de bord' },
    { path: '/admin/moderation', icon: FileText, label: 'Modération', badge: 14 },
    { path: '/admin/cas', icon: FileText, label: 'Tous les cas' },
    { path: '/admin/utilisateurs', icon: Users, label: 'Utilisateurs' },
    { path: '/admin/stats', icon: BarChart3, label: 'Statistiques' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#1A1A2E] text-white transition-all duration-300 flex flex-col`}>
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
                    ? 'bg-[#C0392B]/20 text-white border-l-3 border-[#C0392B]'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-[#C0392B] text-white">{item.badge}</Badge>
                    )}
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
          <ChevronRight size={14} className={`transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold text-[#1C1C1E]">
            {navItems.find(item => isActive(item.path))?.label || 'Tableau de bord'}
          </h1>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              <div className="absolute top-1 right-1 w-2 h-2 bg-[#C0392B] rounded-full" />
            </button>
            <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-semibold">
              A
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
