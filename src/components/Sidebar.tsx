"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Tasks", href: "/dashboard/tasks" },
    { name: "Admin", href: "/dashboard/admin" },
    { name: "User", href: "/dashboard/user" },
  ];

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
