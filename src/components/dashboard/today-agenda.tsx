'use client';

import { useMemo } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { useHabits } from '@/hooks/use-habits';
import { HabitItem } from '@/components/habits/habit-item';
import { format, getDay } from 'date-fns';
import { HabitModal } from '@/components/habits/habit-modal';
import { useState } from 'react';
import { Habit } from '@/types/database';
import { CheckCircle2 } from 'lucide-react';

/**
 * Returns true if a habit is due on the given date based on its frequency.
 */
function isHabitDueToday(habit: Habit, todayStr: string): boolean {
  if (!habit.is_recurring || !habit.is_active) return false;

  const today = new Date(todayStr);
  const dayOfWeek = getDay(today); // 0 = Sun, 6 = Sat

  switch (habit.frequency_type) {
    case 'daily':
      return true;
    case 'weekly':
      // Due on the day of week it was created
      return getDay(new Date(habit.created_at)) === dayOfWeek;
    case 'monthly':
      // Due on same day-of-month it was created
      return new Date(habit.created_at).getDate() === today.getDate();
    case 'custom':
      // frequency_custom_days is array of day indices [0-6]
      return habit.frequency_custom_days?.includes(dayOfWeek) ?? false;
    default:
      return true;
  }
}

export function TodayAgenda() {
  const { habits, logs } = useHabitStore();
  const { toggleHabitCompletion } = useHabits();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Only show habits due today (recurring, active, correct frequency)
  const todaysHabits = useMemo(() => {
    return habits
      .filter(h => isHabitDueToday(h, todayStr))
      .sort((a, b) => {
        const pOrder = { High: 0, Medium: 1, Low: 2 };
        const pDiff = pOrder[a.priority] - pOrder[b.priority];
        if (pDiff !== 0) return pDiff;

        const aCompleted = logs.some(l => l.habit_id === a.id && l.completed_at === todayStr);
        const bCompleted = logs.some(l => l.habit_id === b.id && l.completed_at === todayStr);
        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
        
        return 0;
      });
  }, [habits, logs, todayStr]);

  const completedCount = todaysHabits.filter(h =>
    logs.some(l => l.habit_id === h.id && l.completed_at === todayStr)
  ).length;

  const totalCount = todaysHabits.length;

  return (
    <div className="space-y-3">

      {/* Habits list */}
      {totalCount === 0 ? (
        <div className="glass-card py-10 flex flex-col items-center justify-center text-center border-border">
          <CheckCircle2 className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No habits scheduled for today.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create recurring habits in the Habits tab.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {todaysHabits.map(habit => {
            const isCompleted = logs.some(l => l.habit_id === habit.id && l.completed_at === todayStr);
            return (
              <HabitItem
                key={habit.id}
                habit={habit}
                isCompleted={isCompleted}
                onToggle={(id, val) => toggleHabitCompletion(id, val, todayStr)}
                onEdit={setEditingHabit}
              />
            );
          })}
        </div>
      )}

      {editingHabit && (
        <HabitModal
          isOpen={!!editingHabit}
          onClose={() => setEditingHabit(null)}
          habitToEdit={editingHabit}
        />
      )}
    </div>
  );
}
