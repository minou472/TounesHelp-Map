export type TunisiaCase = {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  governorate: string;
  city: string;
  coordinates: [number, number];
  status: "suffering" | "helping" | "resolved";
  victimName: string;
  victimPhone: string;
  victimEmail?: string;
  creatorName: string;
  creatorPhone: string;
  creatorEmail: string;
  peopleAffected: number;
  dateSubmitted: string;
  datePublished?: string;
  dateResolved?: string;
  images: string[];
};

export const tunisiaGovernorates = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
  "Jendouba", "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia",
  "Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
  "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
];
