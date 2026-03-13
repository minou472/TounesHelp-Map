import { redirect } from "@/i18n/routing";

export default function Home() {
  // Redirect to the default locale (fr)
  redirect({ href: "/", locale: "fr" });
}
