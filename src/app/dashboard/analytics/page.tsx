'use client';

import { useHabitStore } from "@/store/habit-store";
import { AnalyticsCharts } from "@/components/analytics/charts";
import { Trophy, Flame, Target, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const { isLoading, error, profile, logs } = useHabitStore();

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-6 w-32 bg-secondary rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[0,1,2,3].map(i => <div key={i} className="h-16 glass-card" />)}
        </div>
        <div className="h-64 glass-card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-xl font-bold text-destructive mb-2">Failed to load analytics</h3>
        <p className="text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  const totalCompleted = logs.length;
  const activeDays = new Set(logs.map(l => l.completed_at)).size;
  const consistencyScore = Math.min(100, Math.round((activeDays / 30) * 100));

  const stats = [
    { icon: Target,   color: "text-primary",      label: "Completed", value: totalCompleted },
    { icon: Trophy,   color: "text-yellow-500",   label: "Best Streak", value: profile?.longest_streak || 0 },
    { icon: Flame,    color: "text-orange-500",   label: "Active Days",value: activeDays },
    { icon: Activity, color: "text-green-500",    label: "Consistency",value: `${consistencyScore}%` },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-24">
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Your productivity insights</p>
      </div>

      {/* 2 columns on tiny phones, 4 on md so text is visible */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="glass-card p-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-zinc-300">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white leading-none">{value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts />
    </div>
  );
}
