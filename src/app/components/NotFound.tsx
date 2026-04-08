import { Link } from "react-router";
import { Button } from "./ui/button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-[120px] font-bold text-[#C0392B] mb-4">404</h1>
        <h2 className="text-3xl font-bold text-[#1C1C1E] mb-4">Page non trouvée</h2>
        <p className="text-[#6B6B6B] mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link to="/">
          <Button className="bg-[#C0392B] hover:bg-[#A02E24] text-white rounded-xl h-12 px-8">
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
