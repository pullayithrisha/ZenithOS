'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { useHabits } from '@/hooks/use-habits';
import { calculateHabitStats } from '@/utils/habit-utils';
import { HabitModal } from '@/components/habits/habit-modal';
import { Habit } from '@/types/database';
import { eachDayOfInterval, subDays, format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { Check, Target, Plus, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/utils';

// Desktop: 1 month. Mobile: last 5 days (controlled via CSS).
const MOBILE_DAYS = 5;

export default function HabitsPage() {
  const { habits, logs, isLoading, error } = useHabitStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const activeHabits = useMemo(
    () => habits.filter(h => h.is_active && h.is_recurring),
    [habits]
  );

  // Always show selected month
  const dates = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(selectedDate),
      end: endOfMonth(selectedDate),
    });
  }, [selectedDate]);

  // Build month labels
  const monthLabels = useMemo(() => {
    const labels: { label: string; colIndex: number }[] = [];
    let lastMonth = -1;
    dates.forEach((date, i) => {
      if (date.getMonth() !== lastMonth) {
        lastMonth = date.getMonth();
        labels.push({ label: format(date, 'MMM'), colIndex: i });
      }
    });
    return labels;
  }, [dates]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollContainerRef.current) {
      if (isMobile) {
        // On mobile, scroll to the end to show the most recent days
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
      } else {
        // On desktop, ensure we start from the 1st
        scrollContainerRef.current.scrollLeft = 0;
      }
    }
  }, [activeHabits.length, isMobile, dates]);

  const { toggleHabitCompletion } = useHabits();

  const openModal = (habit: Habit | null = null) => {
    setSelectedHabit(habit);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-secondary rounded-md" />
        <div className="h-72 glass-card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-xl font-bold text-destructive mb-2">Failed to load habits</h3>
        <p className="text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  const CELL_W = isMobile ? 32 : 24;
  const HABIT_COL_W = isMobile ? 90 : 140;
  const STATS_COL_W = isMobile ? 70 : 100;

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">Habits</h1>
              <input
                type="month"
                value={format(selectedDate, 'yyyy-MM')}
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month] = e.target.value.split('-');
                    setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, 1));
                  }
                }}
                className="bg-secondary/50 border border-border text-foreground text-xs font-semibold rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
              />
          </div>
          <p className="text-muted-foreground text-xs mt-0.5">
            Monthly tracker
          </p>
        </div>
        <button
          onClick={() => openModal(null)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all text-sm shadow"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Habit</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {activeHabits.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center border-border">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4 border border-border">
            <Target className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No habits yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs mb-5">
            Create your first habit to start tracking your consistency.
          </p>
          <button
            onClick={() => openModal(null)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Create First Habit
          </button>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto w-full border border-border rounded-xl bg-card shadow-lg"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* ── Month labels ── */}
          {monthLabels.length > 0 && (
            <div
              className="flex"
              style={{ paddingLeft: HABIT_COL_W, minWidth: HABIT_COL_W + dates.length * CELL_W + STATS_COL_W }}
            >
              {monthLabels.map(({ label, colIndex }, i) => {
                const nextCol = monthLabels[i + 1]?.colIndex ?? dates.length;
                const width = (nextCol - colIndex) * CELL_W;
                return (
                  <div
                    key={label + colIndex}
                    className="text-[10px] font-bold text-muted-foreground py-1.5 pl-1 flex-shrink-0"
                    style={{ width, minWidth: width }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Table ── */}
          <table
            className="border-collapse table-fixed"
            style={{ minWidth: HABIT_COL_W + dates.length * CELL_W + STATS_COL_W }}
          >
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {/* Habit name col */}
                <th
                  className="sticky left-0 bg-zinc-950/95 backdrop-blur-md z-30 text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-r border-border"
                  style={{ width: HABIT_COL_W, minWidth: HABIT_COL_W }}
                >
                  Habit
                </th>

                {/* Date headers */}
                {dates.map(date => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const isToday = dateStr === todayStr;
                  return (
                    <th
                      key={dateStr}
                      className={cn(
                        'text-center pb-1 pt-1.5',
                        isToday ? 'text-primary' : 'text-muted-foreground/50'
                      )}
                      style={{ width: CELL_W, minWidth: CELL_W, padding: '6px 2px' }}
                    >
                      <div className="flex flex-col items-center gap-0.5 select-none">
                        <span className="text-[9px] font-semibold uppercase">
                          {format(date, isMobile ? 'EEE' : 'EEEEE')}
                        </span>
                        {isToday ? (
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold">
                            {format(date, 'd')}
                          </span>
                        ) : (
                          <span className="text-[9px]">{format(date, 'd')}</span>
                        )}
                      </div>
                    </th>
                  );
                })}

                {/* Stats col */}
                <th
                  className="sticky right-0 bg-zinc-950/95 backdrop-blur-md z-30 text-center px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-l border-border"
                  style={{ width: STATS_COL_W, minWidth: STATS_COL_W }}
                >
                  Stats
                </th>
              </tr>
            </thead>

            <tbody>
              {activeHabits.map(habit => {
                const stats = calculateHabitStats(habit.id, logs);
                return (
                  <tr
                    key={habit.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                  >
                    {/* Habit name (sticky left) */}
                    <td
                      className="sticky left-0 bg-zinc-950/95 backdrop-blur-md z-20 px-3 py-2.5 border-r border-border"
                      style={{ width: HABIT_COL_W, minWidth: HABIT_COL_W }}
                    >
                      <div className="flex items-center justify-between group">
                        <span className="font-semibold text-xs text-foreground truncate flex-1 pr-1">
                          {habit.title}
                        </span>
                        {/* Edit button — appears on hover */}
                        <button
                          onClick={() => openModal(habit)}
                          className="p-0.5 rounded bg-secondary border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted flex-shrink-0"
                          title="Edit"
                        >
                          <Pencil className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </td>

                    {/* Heatmap cells */}
                    {dates.map(date => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const isCompleted = logs.some(
                        l => l.habit_id === habit.id && l.completed_at === dateStr
                      );
                      const isToday = dateStr === todayStr;

                      return (
                        <td
                          key={dateStr}
                          className="text-center"
                          style={{ width: CELL_W, minWidth: CELL_W, padding: '5px 3px' }}
                        >
                          <button
                            onClick={() => toggleHabitCompletion(habit.id, !isCompleted, dateStr)}
                            className={cn(
                              'rounded-sm border flex items-center justify-center transition-all duration-200 mx-auto outline-none focus-visible:ring-1 focus-visible:ring-primary',
                              isMobile ? 'w-6 h-6 rounded-full' : 'w-[18px] h-[18px]',
                              isCompleted
                                ? 'bg-primary border-primary shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                                : isToday
                                ? 'bg-zinc-700/60 border-zinc-500 hover:border-primary/60'
                                : 'bg-zinc-800/60 border-zinc-700 hover:border-zinc-500'
                            )}
                            title={`${habit.title}: ${isCompleted ? 'Done' : 'Not done'} on ${format(date, 'MMM d, yyyy')}`}
                          >
                            {isCompleted && (
                              <Check
                                className="text-white"
                                style={{ width: isMobile ? 14 : 10, height: isMobile ? 14 : 10 }}
                                strokeWidth={3}
                              />
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* Stats (sticky right) — no dividers between stats */}
                    <td
                      className="sticky right-0 bg-zinc-950/95 backdrop-blur-md z-20 px-2 py-2 border-l border-border"
                      style={{ width: STATS_COL_W, minWidth: STATS_COL_W }}
                    >
                      <div className="flex items-center justify-around text-[11px] font-bold">
                        <div className="flex flex-col items-center gap-0.5" title="Current Streak">
                          <span>🔥</span>
                          <span className="text-orange-400">{stats.currentStreak}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5" title="Best Streak">
                          <span>🏆</span>
                          <span className="text-yellow-500">{stats.longestStreak}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5" title="Total">
                          <span>✅</span>
                          <span className="text-green-400">{stats.totalCompletions}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Habit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        habitToEdit={selectedHabit}
      />
    </div>
  );
}
