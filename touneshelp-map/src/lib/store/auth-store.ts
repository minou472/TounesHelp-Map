"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types matching Prisma schema
export type Role = "USER" | "ADMIN";
export type Language = "AR" | "FR" | "EN";

export interface User {
    id: string;
    email: string;
    role: Role;
    language: Language;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface AuthState {
  // State
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

  // Actions
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
    checkAuthStatus: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
      // Initial state
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

/**
* Login action - calls /api/auth/login endpoint
*/
        async login(credentials: LoginCredentials) {
            set({ isLoading: true, error: null });
            try {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(credentials),
        });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Login failed");
    }

            const data = await res.json();

            set({
                user: {
                    id: data.userId,
                    email: credentials.email,
                    role: data.role as Role,
                    language: data.language as Language,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
        });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Login failed",
        });
        throw error;
        }
    },

    /**
     * Logout action - calls /api/auth/logout endpoint
     */
        async logout() {
            try {
                set({ isLoading: true, error: null });
                await fetch("/api/auth/logout", { method: "POST" });
        } finally {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
        });
        }
    },

/**
* Set user directly (useful after registration or profile update)
*/
    setUser(user: User | null) {
        set({
        user,
        isAuthenticated: !!user,
        });
    },

/**
       * Check authentication status
       * This should be called on app initialization to sync server/client auth state
*/
    async checkAuthStatus() {
        if (get().isLoading) return;
        set({ isLoading: true, error: null });
        try {
            const res = await fetch("/api/auth/me");
            if (res.status === 401) {
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
            });
            return;
        }
            if (res.ok) {
                const data = await res.json();
                set({
                    user: data.user,
                    isAuthenticated: data.user?.isActive ?? false,
                    isLoading: false,
            });
        }
        } catch (err) {
            console.error("Auth check failed:", err);
        } finally {
            set({ isLoading: false });
        }
    },

/**
* Clear error state
*/
        clearError() {
            set({ error: null });
    },
    }),
    {
        name: "auth-storage", // localStorage key
        partialize: (state) => ({
            user: state.user,
            isAuthenticated: state.isAuthenticated,
    }),
    }
)
);
