'use client';

import { useHabitStore } from "@/store/habit-store";
import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  const { isLoading, error } = useHabitStore();

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-6 w-24 bg-white/5 rounded-md" />
        <div className="h-32 bg-white/5 rounded-xl" />
        <div className="h-40 bg-white/5 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-xl font-bold text-red-500 mb-2">Failed to load settings</h3>
        <p className="text-zinc-400 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
      </div>
      <SettingsForm />
    </div>
  );
}
