'use client';

import { useHabitStore } from '@/store/habit-store';
import { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-2.5 rounded-lg shadow-xl">
        <p className="text-foreground font-medium text-xs mb-1">{label || payload[0].name}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsCharts() {
  const { logs } = useHabitStore();

  // Daily completions — last 14 days
  const completionData = useMemo(() => {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = logs.filter(log => log.completed_at === dateStr).length;
      data.push({ date: format(date, 'MMM dd'), completed: count });
    }
    return data;
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-16 text-center border-border">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">No data yet</h3>
        <p className="text-muted-foreground text-xs max-w-xs">Complete habits to see your trends.</p>
      </div>
    );
  }

  // Use a generic gray for grids so it looks okay in both modes
  const gridStroke = "rgba(128,128,128,0.15)";
  const axisStroke = "rgba(128,128,128,0.4)";

  return (
    <div className="space-y-4">
      {/* Daily Completion Trend */}
      <div className="glass-card p-4 border-border">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-foreground">Daily Completions (14 Days)</h3>
          <p className="text-[11px] text-muted-foreground">How many items you finished each day</p>
        </div>
        <div className="h-[200px] sm:h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={completionData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="date" stroke={axisStroke} fontSize={10} tickMargin={8} minTickGap={25} />
              <YAxis stroke={axisStroke} fontSize={10} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
