import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <header className="glass border-b border-white/5 sticky top-0 z-50">
        <div className="flex h-16 items-center px-6 justify-between max-w-7xl mx-auto w-full">
          <div className="font-bold text-lg">ZenithOS Dashboard</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="glass-card p-12 max-w-2xl text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to ZenithOS</h1>
          <p className="text-zinc-400 mb-8">
            You have successfully signed in. Phase 1 authentication is complete!
          </p>
        </div>
      </main>
    </div>
  );
}
