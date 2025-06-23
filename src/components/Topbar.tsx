"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white border-b">
      <div className="flex items-center gap-2">
        <button
          className="md:hidden text-black text-2xl focus:outline-none"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          &#9776;
        </button>
        <span className="font-medium text-black">
          Welcome: {user?.name} | {user?.role}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
}
