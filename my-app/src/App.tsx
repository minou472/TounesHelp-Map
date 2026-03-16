import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams
} from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { useAuthStore } from "./lib/store/auth-store";
import LanguageSwitcher from "./components/language-switcher";
// import "./App.css"; // Removed - using globals.css

const HomePage = React.lazy(() => import("./pages/Home"));

function AppContent() {
  const { checkAuthStatus } = useAuthStore();
  const params = useParams();

  // Check auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Locale from path /:locale/*
  const locale = params.locale || "fr";

  // Update i18n language
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-lg sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-lg" />
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 bg-clip-text text-transparent">
                  TounesHelp
                </h1>
              </div>
            </div>
            <LanguageSwitcher variant={"dropdown"} />
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/:locale?" element={<HomePage />} />
        <Route path="/:locale/login" element={<div>Login Page</div>} />
        <Route path="/:locale/register" element={<div>Register Page</div>} />
        <Route path="/:locale/dashboard" element={<div>Dashboard</div>} />
        <Route path="/:locale/cases" element={<div>Cases</div>} />
        <Route path="/:locale/cases/new" element={<div>New Case</div>} />
        <Route path="/:locale/admin" element={<div>Admin</div>} />
      </Routes>
    </div>
  );
}

import AuthProvider from "./contexts/AuthProvider";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <Router basename="">
          <AppContent />
        </Router>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
