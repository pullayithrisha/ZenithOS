'use client';

import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useHabitDataSync } from "@/hooks/use-habits";
import { useHabitStore } from "@/store/habit-store";
import { useNotifications } from "@/hooks/use-notifications";
import { useEffect, useRef } from "react";
import { format } from "date-fns";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Single dashboard-wide sync/realtime listener hook
  useHabitDataSync();
  const { habits, logs } = useHabitStore();
  const { sendNotification } = useNotifications();
  const notifiedHabitsRef = useRef<Set<string>>(new Set());

  // Background reminder checker
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const todayDateStr = format(now, 'yyyy-MM-dd');

      habits.forEach(habit => {
        if (!habit.is_active || !habit.reminder_time) return;
        
        // Don't notify if already completed today
        const isCompleted = logs.some(l => l.habit_id === habit.id && l.completed_at === todayDateStr);
        if (isCompleted) return;

        const [remHour, remMin] = habit.reminder_time.split(':').map(Number);
        
        // Notify if we are exactly at the reminder time or up to 5 mins before
        const timeDiffMins = (remHour * 60 + remMin) - (currentHour * 60 + currentMinute);
        
        if (timeDiffMins >= 0 && timeDiffMins <= 5) {
          const reminderKey = `${habit.id}-${todayDateStr}`;
          if (!notifiedHabitsRef.current.has(reminderKey)) {
            sendNotification(`Time for: ${habit.title}`, {
              body: habit.description || `Don't break your streak!`,
              icon: '/icon.png', // Fallback icon
            });
            notifiedHabitsRef.current.add(reminderKey);
          }
        }
      });
    };

    // Check every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [habits, logs, sendNotification]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
