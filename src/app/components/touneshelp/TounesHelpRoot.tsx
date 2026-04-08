import { Outlet, Link, useLocation } from "react-router";
import { Button } from "../ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { LanguageTranslator, LanguageTranslatorCompact } from "./LanguageTranslator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function TounesHelpRoot() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    setUserToken(localStorage.getItem('userToken'));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setUserToken(null);
  };

  // Check if we're on an admin page
  const isAdminPage = location.pathname.startsWith('/admin');
  
  // If admin page, just render outlet without navbar
  if (isAdminPage) {
    return <Outlet />;
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF6EC]">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-[#1A0A00] font-bold text-lg hidden sm:block">
                TounesHelp Map
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className={`text-[15px] relative ${
                  isActive('/')
                    ? 'text-[#C0392B] font-semibold'
                    : 'text-[#6B6B6B] hover:text-[#1C1C1E]'
                }`}
              >
                Accueil
                {isActive('/') && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C0392B]" />
                )}
              </Link>
              <Link
                to="/cas"
                className={`text-[15px] relative ${
                  isActive('/cas')
                    ? 'text-[#C0392B] font-semibold'
                    : 'text-[#6B6B6B] hover:text-[#1C1C1E]'
                }`}
              >
                Les Cas
                {isActive('/cas') && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C0392B]" />
                )}
              </Link>
              <Link
                to="/carte"
                className={`text-[15px] relative ${
                  isActive('/carte')
                    ? 'text-[#C0392B] font-semibold'
                    : 'text-[#6B6B6B] hover:text-[#1C1C1E]'
                }`}
              >
                Carte
                {isActive('/carte') && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C0392B]" />
                )}
              </Link>
              <Link
                to="/"
                className="text-[15px] text-[#6B6B6B] hover:text-[#1C1C1E]"
              >
                À propos
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Translator */}
              <LanguageTranslator />
              
              {userToken ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 outline-none">
                      <Avatar className="h-9 w-9 border border-gray-200">
                        <AvatarFallback className="bg-orange-100 text-[#C0392B]">U</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">Mon Profil</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Tableau de bord</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2">
                  <Link to="/connexion">
                    <Button variant="outline">Se connecter</Button>
                  </Link>
                  <Link to="/creer-cas">
                    <Button className="bg-[#C0392B] hover:bg-[#A02E24]">Signaler un cas</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-[#1C1C1E]" />
              ) : (
                <Menu size={24} className="text-[#1C1C1E]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              <Link
                to="/"
                className="block text-[#6B6B6B] hover:text-[#C0392B] py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/cas"
                className="block text-[#6B6B6B] hover:text-[#C0392B] py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Les Cas
              </Link>
              <Link
                to="/carte"
                className="block text-[#6B6B6B] hover:text-[#C0392B] py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Carte
              </Link>
              <Link
                to="/"
                className="block text-[#6B6B6B] hover:text-[#C0392B] py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                À propos
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {userToken ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start mt-2">
                        <User className="mr-2 h-4 w-4" /> Mon Tableau de bord
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2" 
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/connexion" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Se connecter
                      </Button>
                    </Link>
                    <Link to="/inscription" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-[#C0392B] hover:bg-[#A02E24]">
                        S'inscrire
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#1A0A00] text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo & Tagline */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <span className="text-white font-bold text-lg">
                  TounesHelp Map
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecter les communautés en souffrance avec ceux qui peuvent aider.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold mb-4">Navigation</h3>
              <div className="space-y-2">
                <Link to="/cas" className="block text-gray-400 hover:text-white text-sm">
                  Les Cas
                </Link>
                <Link to="/carte" className="block text-gray-400 hover:text-white text-sm">
                  Carte
                </Link>
                <Link to="/" className="block text-gray-400 hover:text-white text-sm">
                  À propos
                </Link>
                <Link to="/" className="block text-gray-400 hover:text-white text-sm">
                  Contact
                </Link>
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-semibold mb-4">Suivez-nous</h3>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  Facebook
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2026 TounesHelp Map. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}