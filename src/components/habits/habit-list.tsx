'use client';

import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";
import { HabitModal } from "./habit-modal";
import { Habit } from "@/types/database";
import { useHabits } from "@/hooks/use-habits";
import { useHabitStore } from "@/store/habit-store";
import { HabitItem } from "./habit-item";
import { Plus } from "lucide-react";

export function HabitList() {
  const { toggleHabitCompletion } = useHabits();
  const { habits, logs } = useHabitStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const openModal = (habit?: Habit) => {
    setHabitToEdit(habit || null);
    setIsModalOpen(true);
  };

  const activeHabits = habits.filter(h => h.is_active);
  const completedCount = activeHabits.filter(h =>
    logs.some(l => l.habit_id === h.id && l.completed_at === today)
  ).length;

  if (activeHabits.length === 0) {
    return (
      <>
        <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
          <span className="text-3xl mb-3">🎯</span>
          <h3 className="text-base font-bold text-white mb-1">No habits yet</h3>
          <p className="text-zinc-500 text-xs max-w-xs mb-4">Start tracking your daily routines by creating your first habit.</p>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Create Habit
          </button>
        </div>
        <HabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} habitToEdit={habitToEdit} />
      </>
    );
  }

  return (
    <div>
      {/* Compact section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white">Today&apos;s Habits</h3>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
            {completedCount}/{activeHabits.length}
          </span>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-3 h-3" /> New
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {activeHabits.map(habit => {
            const isCompleted = logs.some(l => l.habit_id === habit.id && l.completed_at === today);
            return (
              <HabitItem
                key={habit.id}
                habit={habit}
                isCompleted={isCompleted}
                onToggle={(id, completed) => toggleHabitCompletion(id, completed, today)}
                onEdit={openModal}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <HabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} habitToEdit={habitToEdit} />
    </div>
  );
}
