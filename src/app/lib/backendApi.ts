import type { TunisiaCase } from "../data/tunisiaData";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type BackendCase = {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  governorate: string;
  city: string;
  latitude: number;
  longitude: number;
  status: "SUFFERING" | "HELPING" | "RESOLVED";
  victimName: string;
  victimPhone: string;
  victimEmail?: string | null;
  creatorName: string;
  creatorPhone: string;
  creatorEmail: string;
  peopleAffected: number;
  datePublished?: string | null;
  dateResolved?: string | null;
  createdAt: string;
  imagesJson?: string;
};

export type StatsResponse = {
  overview: {
    totalCases: number;
    sufferingCases: number;
    helpingCases: number;
    resolvedCases: number;
    totalUsers: number;
    totalPlaces: number;
    totalPeopleAffected: number;
    resolutionRate: number;
  };
  recentCases: Array<{
    id: string;
    title: string;
    status: string;
    governorate: string;
    createdAt: string;
  }>;
  casesByGovernorate: Array<{ governorate: string; count: number }>;
  casesByCategory: Array<{ category: string; count: number }>;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BLOCKED";
  avatar?: string | null;
  rating?: number;
  helpedCount?: number;
  casesCreated?: number;
  createdAt: string;
};

function getToken() {
  return localStorage.getItem("touneshelp_token");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const payload = await res.json();
  if (!res.ok || payload?.success === false) {
    throw new Error(payload?.error || "Request failed");
  }

  return payload.data as T;
}

export function mapCaseStatus(status: BackendCase["status"]): TunisiaCase["status"] {
  if (status === "SUFFERING") return "suffering";
  if (status === "HELPING") return "helping";
  return "resolved";
}

export function mapBackendCaseToUi(item: BackendCase): TunisiaCase {
  let images: string[] = [];
  if (item.imagesJson) {
    try {
      const parsed = JSON.parse(item.imagesJson) as string[];
      if (Array.isArray(parsed)) images = parsed;
    } catch {
      images = [];
    }
  }

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    fullDescription: item.fullDescription,
    governorate: item.governorate,
    city: item.city,
    coordinates: [item.latitude, item.longitude],
    status: mapCaseStatus(item.status),
    victimName: item.victimName,
    victimPhone: item.victimPhone,
    victimEmail: item.victimEmail || undefined,
    creatorName: item.creatorName,
    creatorPhone: item.creatorPhone,
    creatorEmail: item.creatorEmail,
    peopleAffected: item.peopleAffected,
    dateSubmitted: item.createdAt,
    datePublished: item.datePublished || undefined,
    dateResolved: item.dateResolved || undefined,
    images: images.length ? images : ["https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"],
  };
}

export async function fetchCases(params?: { status?: "SUFFERING" | "HELPING" | "RESOLVED"; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  query.set("limit", String(params?.limit || 100));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const data = await request<BackendCase[]>(`/api/cases${suffix}`);
  return data.map(mapBackendCaseToUi);
}

export async function fetchCaseById(id: string) {
  const data = await request<BackendCase>(`/api/cases/${id}`);
  return mapBackendCaseToUi(data);
}

export function fetchStats() {
  return request<StatsResponse>("/api/stats");
}

export function fetchAdminUsers() {
  return request<AdminUser[]>("/api/users?limit=200");
}

