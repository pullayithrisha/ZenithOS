'use client';

import { LayoutDashboard, Target, BarChart2, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/utils/utils';

const routes = [
  { label: 'Home',      icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Habits',    icon: Target,          href: '/dashboard/habits' },
  { label: 'Analytics', icon: BarChart2,       href: '/dashboard/analytics' },
  { label: 'Settings',  icon: Settings,        href: '/dashboard/settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-white/5 shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.9)]">
      <div
        className="flex items-center justify-around"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)' }}
      >
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'relative flex flex-col items-center justify-center flex-1 pt-2 pb-1 gap-0.5 transition-colors duration-200',
                isActive ? 'text-white' : 'text-zinc-500'
              )}
            >
              {/* Active glow pill behind icon */}
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-pill"
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-8 rounded-xl bg-white/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}

              <route.icon
                className={cn(
                  'relative w-5 h-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
              />
              <span className="relative text-[9px] font-semibold tracking-wide">
                {route.label}
              </span>

              {/* Active dot */}
              {isActive && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary shadow-[0_0_6px_rgba(147,51,234,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
