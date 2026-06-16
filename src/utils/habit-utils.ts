import { subDays, differenceInDays, parseISO, format } from 'date-fns';
import { HabitLog } from '@/types/database';

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
}

export function calculateHabitStats(habitId: string, logs: HabitLog[]): HabitStats {
  // Filter logs for this habit
  const habitLogs = logs.filter(l => l.habit_id === habitId);

  // Get unique sorted dates (YYYY-MM-DD strings)
  const completedDatesStr = Array.from(new Set(habitLogs.map(l => l.completed_at)))
    .sort((a, b) => a.localeCompare(b)); // Ascending

  const totalCompletions = completedDatesStr.length;

  if (totalCompletions === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };
  }

  const completedDates = completedDatesStr.map(d => parseISO(d));

  // Longest streak calculation
  let longestStreak = 0;
  let currentConsecutive = 0;
  let previousDate: Date | null = null;

  for (const date of completedDates) {
    if (previousDate === null) {
      currentConsecutive = 1;
    } else {
      const diff = differenceInDays(date, previousDate);
      if (diff === 1) {
        currentConsecutive++;
      } else if (diff > 1) {
        if (currentConsecutive > longestStreak) {
          longestStreak = currentConsecutive;
        }
        currentConsecutive = 1;
      }
    }
    previousDate = date;
  }
  
  if (currentConsecutive > longestStreak) {
    longestStreak = currentConsecutive;
  }

  // Current streak calculation (ending today or yesterday)
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  let currentStreak = 0;
  const completedDatesSet = new Set(completedDatesStr);

  if (completedDatesSet.has(todayStr)) {
    currentStreak = 1;
    let checkDate = subDays(new Date(), 1);
    while (completedDatesSet.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  } else if (completedDatesSet.has(yesterdayStr)) {
    currentStreak = 1;
    let checkDate = subDays(new Date(), 2);
    while (completedDatesSet.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  }

  return { currentStreak, longestStreak, totalCompletions };
}
