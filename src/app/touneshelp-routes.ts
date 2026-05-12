import { createBrowserRouter } from "react-router";
import { TounesHelpRoot } from "./components/touneshelp/TounesHelpRoot";
import { HomePage } from "./components/touneshelp/HomePage";
import { CasesPage } from "./components/touneshelp/CasesPage";
import { CaseDetailPage } from "./components/touneshelp/CaseDetailPage";
import { LoginPage } from "./components/touneshelp/LoginPage";
import { RegisterPage } from "./components/touneshelp/RegisterPage";
import { ForgotPasswordPage } from "./components/touneshelp/ForgotPasswordPage";
import { UserDashboard } from "./components/touneshelp/UserDashboard";
import { CreateCasePage } from "./components/touneshelp/CreateCasePage";
import { MapPage } from "./components/touneshelp/MapPage";
import { AdminDashboard } from "./components/touneshelp/admin/AdminDashboard";
import { EnhancedAdminDashboard } from "./components/admin/EnhancedAdminDashboard";
import { AdminModeration } from "./components/touneshelp/admin/AdminModeration";
import { AdminUsers } from "./components/touneshelp/admin/AdminUsers";
import { AdminCases } from "./components/touneshelp/admin/AdminCases";
import { AdminStats } from "./components/touneshelp/admin/AdminStats";
import { AdminLieux } from "./components/touneshelp/admin/AdminLieux";
import { AdminNotifications } from "./components/touneshelp/admin/AdminNotifications";
import { AdminChatbot } from "./components/touneshelp/admin/AdminChatbot";
import { AdminSettings } from "./components/touneshelp/admin/AdminSettings";
import { NotFound } from "./components/NotFound";

import { TermsPage } from "./components/touneshelp/TermsPage";

export const tounesHelpRouter = createBrowserRouter([
  {
    path: "/",
    Component: TounesHelpRoot,
    children: [
      { index: true, Component: HomePage },
      { path: "cas", Component: CasesPage },
      { path: "cas/:id", Component: CaseDetailPage },
      { path: "carte", Component: MapPage },
      { path: "connexion", Component: LoginPage },
      { path: "mot-de-passe-oublie", Component: ForgotPasswordPage },
      { path: "inscription", Component: RegisterPage },
      { path: "conditions-utilisation", Component: TermsPage },
      { path: "dashboard", Component: UserDashboard },
      { path: "creer-cas", Component: CreateCasePage },
      { path: "admin", Component: AdminDashboard },
      { path: "admin/enhanced", Component: EnhancedAdminDashboard },
      { path: "admin/moderation", Component: AdminModeration },
      { path: "admin/utilisateurs", Component: AdminUsers },
      { path: "admin/lieux", Component: AdminLieux },
      { path: "admin/cas", Component: AdminCases },
      { path: "admin/notifications", Component: AdminNotifications },
      { path: "admin/stats", Component: AdminStats },
      { path: "admin/chatbot", Component: AdminChatbot },
      { path: "admin/parametres", Component: AdminSettings },
      { path: "*", Component: NotFound },
    ],
  },
]);
