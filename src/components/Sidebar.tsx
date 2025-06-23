"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Debug logging
  console.log("🔍 Sidebar - User:", user);
  console.log("🔍 Sidebar - User role:", user?.role);

  // Base links that all authenticated users can see
  const baseLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Tasks", href: "/dashboard/tasks" },
  ];

  // Role-specific links
  const adminLinks = [{ name: "Admin", href: "/dashboard/admin" }];

  const userLinks = [{ name: "User", href: "/dashboard/user" }];

  // Combine links based on user role - STRICT separation
  let links = [...baseLinks];

  if (user?.role === "admin") {
    console.log("✅ Adding admin links only");
    // Admins can ONLY see admin routes
    links = [...links, ...adminLinks];
  } else if (user?.role === "user") {
    console.log("✅ Adding user links only");
    // Regular users can ONLY see user routes
    links = [...links, ...userLinks];
  } else {
    console.log("❌ No role match found");
  }

  console.log("🔍 Final links:", links);

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    // Only close on mobile screens
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <aside
      className={`fixed z-40 inset-y-0 left-0 transform bg-gray-800 text-white h-full p-4 space-y-4 w-64 transition-transform duration-200 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:static md:translate-x-0 md:w-64 md:block`}
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Task Manager</h2>
        <button
          className="md:hidden text-white text-2xl focus:outline-none"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          &times;
        </button>
      </div>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          onClick={handleLinkClick}
          className={`block px-2 py-1 rounded hover:bg-gray-700 ${
            isLinkActive(link.href) ? "bg-gray-700" : ""
          }`}
        >
          {link.name}
        </Link>
      ))}
    </aside>
  );
}
