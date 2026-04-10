import { RouterProvider } from "react-router";
import { tounesHelpRouter } from "./touneshelp-routes";
import { Toaster } from "./components/ui/sonner";
import { RabbitChatbot } from "./components/touneshelp/RabbitChatbot";
import { AuthProvider } from "./lib/auth";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={tounesHelpRouter} />
      <Toaster />
      <RabbitChatbot />
    </AuthProvider>
  );
}
