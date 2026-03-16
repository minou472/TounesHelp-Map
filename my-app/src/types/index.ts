export type Role = "USER" | "ADMIN";
export type Language = "ar" | "fr" | "en";

export interface User {
  id: string;
  email: string;
  role: Role;
  language: Language;
}
