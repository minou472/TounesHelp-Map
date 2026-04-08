import { createBrowserRouter } from "react-router";
import { TounesHelpRoot } from "./components/touneshelp/TounesHelpRoot";
import { HomePage } from "./components/touneshelp/HomePage";
import { CasesPage } from "./components/touneshelp/CasesPage";
import { CaseDetailPage } from "./components/touneshelp/CaseDetailPage";
import { LoginPage } from "./components/touneshelp/LoginPage";
import { RegisterPage } from "./components/touneshelp/RegisterPage";
import { UserDashboard } from "./components/touneshelp/UserDashboard";
import { CreateCasePage } from "./components/touneshelp/CreateCasePage";
import { MapPage } from "./components/touneshelp/MapPage";
import { AdminDashboard } from "./components/touneshelp/admin/AdminDashboard";
import { EnhancedAdminDashboard } from "./components/admin/EnhancedAdminDashboard";
import { AdminModeration } from "./components/touneshelp/admin/AdminModeration";
import { AdminUsers } from "./components/touneshelp/admin/AdminUsers";
import { NotFound } from "./components/NotFound";

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
      { path: "inscription", Component: RegisterPage },
      { path: "dashboard", Component: UserDashboard },
      { path: "creer-cas", Component: CreateCasePage },
      { path: "admin", Component: AdminDashboard },
      { path: "admin/enhanced", Component: EnhancedAdminDashboard },
      { path: "admin/moderation", Component: AdminModeration },
      { path: "admin/utilisateurs", Component: AdminUsers },
      { path: "*", Component: NotFound },
    ],
  },
]);
