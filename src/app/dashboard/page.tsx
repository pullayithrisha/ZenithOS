'use client';

import { useHabitStore } from "@/store/habit-store";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { GithubCard } from "@/components/dashboard/github-card";
import { LeetcodeCard } from "@/components/dashboard/leetcode-card";
import { HabitHeatmap } from "@/components/dashboard/habit-heatmap";
import { TodayAgenda } from "@/components/dashboard/today-agenda";
import { format } from "date-fns";

export default function DashboardPage() {
  const { isLoading, error, profile } = useHabitStore();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-14 w-48 bg-secondary rounded-md" />
        <div className="h-40 glass-card" />
        <div className="h-24 glass-card" />
        <div className="h-40 glass-card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-xl font-bold text-destructive mb-2">Failed to load dashboard</h3>
        <p className="text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  // Extract first name from github_username or email
  const rawName = profile?.github_username || profile?.email?.split('@')[0] || 'there';
  const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  // Format: Mon, Jun 16
  const dayDate = format(new Date(), 'EEE, MMM d');

  return (
    <div className="space-y-4">
      {/* ── Greeting Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Hi {firstName} <span>👋</span>
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">{dayDate}</p>
        </div>
      </div>

      {/* ── Today's Habits ── */}
      <TodayAgenda />

      {/* ── Daily Progress ── */}
      <ProgressCard />

      {/* ── Integrations ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <LeetcodeCard />
        <GithubCard />
      </div>
    </div>
  );
}
