"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, setAuth } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedToken || !storedUser) {
      router.push("/login");
    } else if (!token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAuth(storedToken, parsedUser);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        router.push("/login");
      }
    }
  }, [token, setAuth, router]);

  return (
    <div className="flex min-h-screen relative">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Sidebar backdrop"
        />
      )}
      <div className="flex flex-col flex-1">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 bg-gray-100 flex-1">{children}</main>
      </div>
    </div>
  );
}
