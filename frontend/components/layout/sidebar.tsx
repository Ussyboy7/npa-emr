//app/components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { sidebarModules } from "@/lib/sidebarconfig";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const getNavCls = (href: string) =>
    `flex items-center gap-2 py-2 px-3 text-sm rounded transition-colors ${
      isActive(href)
        ? "bg-npa-accent text-white font-medium"
        : "hover:bg-npa-accent/70 hover:text-white"
    }`;

  return (
    <aside
      className={`h-screen flex flex-col 
        bg-npa-primary text-white 
        dark:bg-gray-950 dark:text-gray-200
        transition-all duration-300 
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 
          border-b border-npa-accent/40 
          dark:border-gray-700"
      >
        {!collapsed && <h1 className="text-lg font-bold">NPA EMR</h1>}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="hover:text-npa-accent dark:hover:text-gray-300"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {sidebarModules.map((module) => (
          <div key={module.name} className="mb-4">
            {!collapsed && (
              <h3
                className="uppercase text-[11px] font-semibold text-npa-accent 
                  dark:text-gray-400 mb-2 tracking-wider"
              >
                {module.name}
              </h3>
            )}
            <ul className="space-y-1">
              {module.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link href={item.href} className={getNavCls(item.href)}>
                      <Icon size={18} />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}