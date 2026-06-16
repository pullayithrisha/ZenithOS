'use client';

import { useHabitStore } from '@/store/habit-store';
import { format, parseISO, eachMonthOfInterval, startOfYear, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek, eachDayOfInterval, isBefore, isAfter, startOfDay } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useMemo } from 'react';

// ── Build a full GitHub/LeetCode-style contribution grid ──────────────────
// Columns = weeks (Sun-Sat), Rows = days of week (0=Sun … 6=Sat)
// Start from account creation date (or 1 year ago, whichever is earlier)

export function HabitHeatmap() {
  const { logs, profile } = useHabitStore();

  const today = startOfDay(new Date());

  // Start from profile creation date, or 1 year ago if no profile
  const accountCreated = profile?.created_at ? startOfDay(new Date(profile.created_at)) : null;
  const oneYearAgo = startOfDay(new Date(today));
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Use whichever is earlier: account creation or 1 year ago
  const rawStart = accountCreated && isBefore(accountCreated, oneYearAgo) ? accountCreated : oneYearAgo;

  // Snap to Sunday of that week so the grid aligns perfectly
  const gridStart = startOfWeek(rawStart, { weekStartsOn: 0 });
  const gridEnd = today;

  const gridStartIso = gridStart.toISOString();
  const gridEndIso = gridEnd.toISOString();

  // Collect all weeks
  const weeks = useMemo(() => {
    const allWeeks: Date[][] = [];
    const weekStarts = eachWeekOfInterval(
      { start: gridStart, end: gridEnd },
      { weekStartsOn: 0 }
    );
    for (const weekStart of weekStarts) {
      const days: Date[] = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + d);
        days.push(day);
      }
      allWeeks.push(days);
    }
    return allWeeks;
  }, [gridStartIso, gridEndIso]);

  // Completions per day
  const countsByDate = useMemo(() => {
    return logs.reduce((acc, log) => {
      acc[log.completed_at] = (acc[log.completed_at] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [logs]);

  // Month labels: for each column (week), record its month when the week starts a new month
  const monthLabels = useMemo(() => {
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      const month = week[0].getMonth();
      if (month !== lastMonth) {
        lastMonth = month;
        labels.push({ col, label: format(week[0], 'MMM') });
      }
    });
    return labels;
  }, [weeks]);

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const CELL = 13; // px per cell
  const GAP = 2;   // px gap
  const STEP = CELL + GAP;

  const getColor = (count: number) => {
    if (count === 0) return 'transparent';
    if (count === 1) return 'rgba(168,85,247,0.35)';
    if (count === 2) return 'rgba(168,85,247,0.60)';
    if (count === 3) return 'rgba(168,85,247,0.80)';
    return '#a855f7';                        // full primary
  };

  const totalContributions = logs.length;

  return (
    <div className="glass-card p-4 sm:p-6 border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Activity</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {totalContributions} habit completions
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm border border-[#27272a] bg-transparent" />
          {['rgba(168,85,247,0.35)', 'rgba(168,85,247,0.60)', '#a855f7'].map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Scrollable SVG grid */}
      <div className="overflow-x-auto">
        <svg
          width={weeks.length * STEP + 32}
          height={7 * STEP + 24}
          style={{ display: 'block', minWidth: weeks.length * STEP + 32 }}
        >
          {/* Month labels row */}
          {monthLabels.map(({ col, label }) => (
            <text
              key={label + col}
              x={32 + col * STEP}
              y={10}
              fontSize={10}
              fill="#71717a"
              fontFamily="inherit"
            >
              {label}
            </text>
          ))}

          {/* Day-of-week labels (left side) */}
          {[1, 3, 5].map((dayIdx) => (
            <text
              key={dayIdx}
              x={0}
              y={16 + dayIdx * STEP + CELL / 2 + 3}
              fontSize={9}
              fill="#52525b"
              fontFamily="inherit"
            >
              {DAY_LABELS[dayIdx].slice(0, 3)}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((week, col) =>
            week.map((day, row) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isFuture = isAfter(startOfDay(day), today);
              const isBeforeStart = isBefore(startOfDay(day), accountCreated ? startOfDay(accountCreated) : gridStart);
              const count = isFuture || isBeforeStart ? -1 : (countsByDate[dateStr] || 0);
              const isToday = dateStr === format(today, 'yyyy-MM-dd');

              const x = 32 + col * STEP;
              const y = 16 + row * STEP;

              if (isFuture || isBeforeStart) {
                return (
                  <rect
                    key={dateStr}
                    x={x} y={y}
                    width={CELL} height={CELL}
                    rx={2} ry={2}
                    fill="transparent"
                  />
                );
              }

              return (
                <rect
                  key={dateStr}
                  x={x} y={y}
                  width={CELL} height={CELL}
                  rx={2} ry={2}
                  fill={getColor(count)}
                  stroke={isToday ? '#a855f7' : (count === 0 ? '#27272a' : 'none')}
                  strokeWidth={isToday ? 1.5 : (count === 0 ? 1 : 0)}
                  data-tooltip-id="heatmap-tip"
                  data-tooltip-content={
                    count === 0
                      ? `No activity on ${format(day, 'MMM d, yyyy')}`
                      : `${count} habit${count > 1 ? 's' : ''} on ${format(day, 'MMM d, yyyy')}`
                  }
                  style={{ cursor: 'default' }}
                />
              );
            })
          )}
        </svg>
      </div>

      <Tooltip
        id="heatmap-tip"
        className="z-50 !bg-secondary !text-foreground !text-xs !rounded-md !px-2.5 !py-1 border border-border"
      />
    </div>
  );
}
