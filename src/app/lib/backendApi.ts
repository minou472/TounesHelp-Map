import type { TunisiaCase } from "../data/tunisiaData";

const API_BASE_URL = "";

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
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {})
      }
    });
  } catch (networkError) {
    throw new Error(
      "Cannot connect to the server. Please make sure the backend is running on port 3001."
    );
  }

  // Safely parse JSON — handle empty or non-JSON responses
  const text = await res.text();
  let payload: any;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    console.error(`[API ${path}] Non-JSON response:`, text.slice(0, 200));
    throw new Error(
      `Server returned an invalid response (${res.status}). The backend may not be running.`
    );
  }

  if (!res.ok || payload?.success === false) {
    if (res.status === 401) {
      localStorage.removeItem("touneshelp_token");
      localStorage.removeItem("touneshelp_user");
      // Only redirect if not already on the login page to avoid infinite loops
      if (!window.location.pathname.includes("/connexion")) {
        window.location.href = "/connexion";
      }
    }
    throw new Error(payload?.error || `Request failed (${res.status})`);
  }

  return payload?.data as T;
}

export function mapCaseStatus(
  status: BackendCase["status"]
): TunisiaCase["status"] {
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
    images: images.length
      ? images
      : ["https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"]
  };
}

export async function fetchCases(params?: {
  status?: "SUFFERING" | "HELPING" | "RESOLVED";
  limit?: number;
}) {
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

export type CreateCaseData = {
  title: string;
  description: string;
  fullDescription: string;
  governorate: string;
  city: string;
  latitude: number;
  longitude: number;
  category?:
    | "MEDICAL"
    | "EDUCATION"
    | "FOOD"
    | "SHELTER"
    | "TRANSPORTATION"
    | "WATER"
    | "OTHER";
  victimName: string;
  victimPhone: string;
  victimEmail?: string;
  creatorName: string;
  creatorPhone: string;
  creatorEmail: string;
  peopleAffected: number;
  images: string[];
  videoUrl?: string;
};

export function createCase(data: CreateCaseData) {
  // Clean up empty optional fields before sending
  const cleanData = {
    ...data,
    victimEmail: data.victimEmail || undefined,
    videoUrl: data.videoUrl || undefined,
    fullDescription: data.fullDescription || data.description
  };
  return request<BackendCase>("/api/cases", {
    method: "POST",
    body: JSON.stringify(cleanData)
  });
}

export type UpdateCaseData = {
  title?: string;
  description?: string;
  fullDescription?: string;
  governorate?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  status?: "SUFFERING" | "HELPING" | "RESOLVED";
  victimName?: string;
  victimPhone?: string;
  victimEmail?: string;
  peopleAffected?: number;
  images?: string[];
  videoUrl?: string;
};

export function updateCase(id: string, data: UpdateCaseData) {
  return request<BackendCase>(`/api/cases/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export function deleteCase(id: string) {
  return request<{ message: string }>(`/api/cases/${id}`, {
    method: "DELETE"
  });
}

export function fetchStats() {
  return request<StatsResponse>("/api/stats");
}

export async function fetchAdminUsers(): Promise<{ users: AdminUser[]; total: number }> {
  // Backend returns successResponse({ users, total }) → request() gives us { users, total } directly
  const data = await request<{ users: AdminUser[]; total: number }>("/api/users?limit=200");
  // Normalize: if backend returned array directly (old format), wrap it
  if (Array.isArray(data)) {
    return { users: data as AdminUser[], total: (data as AdminUser[]).length };
  }
  return data;
}

export type CreateUserData = {
  name: string;
  email: string;
  phone?: string;
  role?: "USER" | "ADMIN";
  status?: "ACTIVE" | "BLOCKED";
  password?: string;
};

export type UpdateUserData = {
  name?: string;
  phone?: string;
  bio?: string;
  role?: "USER" | "ADMIN";
  status?: "ACTIVE" | "BLOCKED";
};

export function createUser(data: CreateUserData) {
  return request<AdminUser>("/api/users", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function updateUser(id: string, data: UpdateUserData) {
  return request<AdminUser>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

export function deleteUser(id: string) {
  return request<{ message: string }>(`/api/users/${id}`, {
    method: "DELETE"
  });
}

export type ChatbotResponse = {
  response: string;
  links?: string[];
  language: string;
};

export function sendChatbotMessage(
  sessionId: string,
  message: string,
  language: string
) {
  return request<ChatbotResponse>("/api/chatbot", {
    method: "POST",
    body: JSON.stringify({ sessionId, message, language })
  });
}

export type UploadResponse = {
  url: string;
  type: "image" | "video";
  size: number;
  name: string;
};

export async function uploadFile(file: File): Promise<UploadResponse> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  let res: Response;
  try {
    res = await fetch(`/api/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
  } catch (networkError) {
    throw new Error(
      "Cannot connect to the server. Please make sure the backend is running on port 3001."
    );
  }

  // Safely parse JSON — handle empty or non-JSON responses
  const text = await res.text();
  let payload: any;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    console.error("[Upload] Non-JSON response:", text.slice(0, 200));
    throw new Error(
      `Upload failed: server returned an invalid response (${res.status}). The backend may not be running.`
    );
  }

  if (!res.ok || payload?.success === false) {
    if (res.status === 401) {
      localStorage.removeItem("touneshelp_token");
      localStorage.removeItem("touneshelp_user");
      // Only redirect if not already on the login page to avoid infinite loops
      if (!window.location.pathname.includes("/connexion")) {
        window.location.href = "/connexion";
      }
    }
    throw new Error(payload?.error || "Upload failed");
  }

  return payload.data as UploadResponse;
}
export type NotificationsResponse = {
  total: number;
  breakdown: {
    pendingCases: number;
    recentUsers: number;
    oldUnresolvedCases: number;
  };
  details: {
    pendingCasesMessage: string | null;
    recentUsersMessage: string | null;
    oldCasesMessage: string | null;
  };
};

export function fetchNotifications() {
  return request<NotificationsResponse>("/api/notifications");
}
