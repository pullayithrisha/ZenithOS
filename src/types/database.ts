export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Profile {
  id: string;
  email: string;
  github_username: string | null;
  leetcode_username: string | null;
  current_streak: number;
  longest_streak: number;
  created_at: string;
  updated_at: string;
}

export type Priority = 'Low' | 'Medium' | 'High';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  frequency_type: FrequencyType;
  frequency_custom_days: number[] | null;
  priority: Priority;
  is_recurring: boolean;
  reminder_time: string | null;
  is_active: boolean;
  current_streak: number;
  longest_streak: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string; // DATE format 'YYYY-MM-DD'
  notes: string | null;
  created_at: string;
}
