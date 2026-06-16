'use client';

import { Activity, LayoutDashboard, Target, BarChart2, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/utils/utils";

export function Sidebar() {
  const pathname = usePathname();

  const routes = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Habits", icon: Target, href: "/dashboard/habits" },
    { label: "Analytics", icon: BarChart2, href: "/dashboard/analytics" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border glass bg-background/50 z-20">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-zinc-200" />
          </div>
          <span className="font-bold tracking-tight">ZenithOS</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {routes.map((route) => {
          const isActive = pathname === route.href;

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors z-10",
                isActive ? "text-white" : "text-muted-foreground hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-lg bg-white/10 border border-white/5 -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <route.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{route.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
