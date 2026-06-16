import { create } from 'zustand';
import { Habit, HabitLog, Profile } from '@/types/database';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  setHabits: (habits: Habit[]) => void;
  setLogs: (logs: HabitLog[]) => void;
  setProfile: (profile: Profile | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addLog: (log: HabitLog) => void;
  removeLog: (logId: string) => void;
  updateHabit: (habit: Habit) => void;
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  logs: [],
  profile: null,
  isLoading: true,
  error: null,
  setHabits: (habits) => set({ habits }),
  setLogs: (logs) => set({ logs }),
  setProfile: (profile) => set({ profile }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  removeLog: (logId) => set((state) => ({ logs: state.logs.filter((l) => l.id !== logId) })),
  updateHabit: (habit) => set((state) => {
    const exists = state.habits.some((h) => h.id === habit.id);
    if (exists) {
      if (habit.deleted_at) {
        return { habits: state.habits.filter((h) => h.id !== habit.id) };
      }
      return {
        habits: state.habits.map((h) => (h.id === habit.id ? habit : h))
      };
    } else {
      if (habit.deleted_at) return {};
      return {
        habits: [...state.habits, habit]
      };
    }
  }),
}));
