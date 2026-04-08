"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import UserLayout from "@/components/layouts/userLayout";

export default function UserDashboard() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "USER")) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== "USER") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <UserLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome to your dashboard!</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">My Cases</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">0</p>
            <p className="mt-2 text-sm text-slate-500">
              Cases you have submitted
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Notifications
            </h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">0</p>
            <p className="mt-2 text-sm text-slate-500">Unread notifications</p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
