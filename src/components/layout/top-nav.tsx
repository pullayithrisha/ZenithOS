'use client';

import { useAuthStore } from "@/store/auth-store";
import { LogOut, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";
import { useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':            'Overview',
  '/dashboard/habits':     'Habits',
  '/dashboard/analytics':  'Analytics',
  '/dashboard/settings':   'Settings',
};

export function TopNav() {
  const { user } = useAuthStore();
  const supabase = createClient();
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'Dashboard';
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <>
      <header className="h-12 md:h-14 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background/70 backdrop-blur-md flex-shrink-0 relative z-40">
        {/* Left: Logo (mobile) + page title */}
        <div className="flex items-center gap-2.5">
          {/* Logo shown only on mobile (sidebar hidden) */}
          <div className="md:hidden w-6 h-6 rounded-md bg-secondary flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-foreground" />
          </div>
          <h2 className="font-semibold text-sm md:text-base text-foreground">{title}</h2>
        </div>

        {/* Right: avatar + logout */}
        <div className="flex flex-col items-center justify-center">
          {user && (
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
              {user.user_metadata?.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-[13px] font-medium leading-none">
                  {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          )}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-[10px] font-semibold text-red-500 hover:text-red-400 transition-colors mt-1"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-border bg-background p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-4 text-foreground">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Sign Out</h3>
                <p className="text-xs text-muted-foreground">Are you sure you want to log out?</p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium rounded-lg transition-colors border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
