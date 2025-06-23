"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Sidebar() {
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

  return (
    <aside className="w-64 bg-gray-800 text-white h-full p-4 space-y-4">
      <h2 className="text-xl font-bold mb-6">Task Manager</h2>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
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
