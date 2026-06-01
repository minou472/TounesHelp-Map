import { RouterProvider } from "react-router";
import { tounesHelpRouter } from "./touneshelp-routes";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./lib/auth";

/**
 * Root Application Component
 * Wraps the routing and auth providers, bringing life into the platform.
 * Through this root, we initialize the tools that will carry hope to those who need it.
 */
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={tounesHelpRouter} />
      <Toaster />
    </AuthProvider>
  );
}
