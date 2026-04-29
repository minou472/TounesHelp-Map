import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { MapPin, Search, Plus, Building2, Phone, Mail } from "lucide-react";

type Place = {
  id: string;
  name: string;
  address: string;
  city: string;
  governorate: string;
  latitude: number;
  longitude: number;
  type: string;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: string;
};

const placeTypeLabels: Record<string, { label: string; color: string }> = {
  shelter: { label: "Refuge", color: "bg-blue-500" },
  hospital: { label: "Hôpital", color: "bg-red-500" },
  food_bank: { label: "Banque alimentaire", color: "bg-green-500" },
  school: { label: "École", color: "bg-purple-500" },
  mosque: { label: "Mosquée", color: "bg-amber-500" },
  church: { label: "Église", color: "bg-indigo-500" },
  ngo: { label: "ONG", color: "bg-teal-500" },
  government: { label: "Gouvernement", color: "bg-gray-500" },
};

export function AdminLieux() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const token = localStorage.getItem("touneshelp_token");
        const res = await fetch("/api/places?limit=200", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const payload = await res.json();
        if (payload?.data) {
          setPlaces(
            Array.isArray(payload.data)
              ? payload.data
              : payload.data.places || []
          );
        }
      } catch (error) {
        console.error("Failed to load places", error);
      } finally {
        setLoading(false);
      }
    };
    void loadPlaces();
  }, []);

  const filteredPlaces = places.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.governorate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1C1C1E]">
            Lieux & Locations
          </h2>
          <p className="text-gray-600">
            Gérer les lieux d'aide et les points de service
          </p>
        </div>
        <Button className="bg-[#C0392B] hover:bg-[#A02E24] text-white rounded-xl">
          <Plus size={18} className="mr-2" />
          Ajouter un lieu
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          placeholder="Rechercher un lieu par nom, ville ou gouvernorat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 rounded-xl"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total des lieux</p>
          <p className="text-2xl font-bold text-[#1C1C1E]">{places.length}</p>
        </Card>
        <Card className="p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Actifs</p>
          <p className="text-2xl font-bold text-green-600">
            {places.filter((p) => p.isActive).length}
          </p>
        </Card>
        <Card className="p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Inactifs</p>
          <p className="text-2xl font-bold text-red-600">
            {places.filter((p) => !p.isActive).length}
          </p>
        </Card>
        <Card className="p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Gouvernorats couverts</p>
          <p className="text-2xl font-bold text-purple-600">
            {new Set(places.map((p) => p.governorate)).size}
          </p>
        </Card>
      </div>

      {/* Places List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C0392B] mx-auto mb-4" />
          <p className="text-gray-500">Chargement des lieux...</p>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <Card className="p-16 text-center">
          <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Aucun lieu trouvé
          </h3>
          <p className="text-gray-400">
            {searchQuery
              ? "Aucun lieu ne correspond à votre recherche"
              : "Aucun lieu n'a encore été ajouté"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaces.map((place) => {
            const typeInfo = placeTypeLabels[place.type] || {
              label: place.type,
              color: "bg-gray-500",
            };
            return (
              <Card
                key={place.id}
                className="p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-[#C0392B]" />
                    <h3 className="font-semibold text-[#1C1C1E] line-clamp-1">
                      {place.name}
                    </h3>
                  </div>
                  <Badge
                    className={`${place.isActive ? "bg-green-500" : "bg-gray-400"} text-white text-xs`}
                  >
                    {place.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>

                <Badge className={`${typeInfo.color} text-white text-xs mb-3`}>
                  {typeInfo.label}
                </Badge>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>
                      {place.city}, {place.governorate}
                    </span>
                  </div>
                  {place.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} />
                      <span>{place.phone}</span>
                    </div>
                  )}
                  {place.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      <span className="truncate">{place.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <Button size="sm" variant="outline" className="flex-1">
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
