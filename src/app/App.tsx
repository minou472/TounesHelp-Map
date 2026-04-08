import { RouterProvider } from "react-router";
import { tounesHelpRouter } from "./touneshelp-routes";
import { Toaster } from "./components/ui/sonner";
import { RabbitChatbot } from "./components/touneshelp/RabbitChatbot";

export default function App() {
  return (
    <>
      <RouterProvider router={tounesHelpRouter} />
      <Toaster />
      <RabbitChatbot />
    </>
  );
}