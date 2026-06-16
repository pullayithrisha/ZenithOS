'use client';

import { useHabitStore } from "@/store/habit-store";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

export function ProgressCard() {
  const { habits, logs } = useHabitStore();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const activeHabits = habits.filter(h => h.is_active);
  const totalHabits = activeHabits.length;
  
  const completedToday = activeHabits.filter(h => 
    logs.some(l => l.habit_id === h.id && l.completed_at === today)
  ).length;

  const percentage = totalHabits === 0 ? 0 : Math.round((completedToday / totalHabits) * 100);

  return (
    <div className="glass-card p-4 flex flex-col gap-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8" />
      
      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">Daily Progress</h3>
          <p className="text-xl font-bold text-white mt-0.5">{percentage}% Completed</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-primary" />
        </div>
      </div>

      <div className="z-10">
        <div className="flex justify-between text-xs mb-1.5 text-zinc-400">
          <span>{completedToday} of {totalHabits} habits</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
