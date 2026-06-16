'use client';

import { Habit } from "@/types/database";
import { motion } from "framer-motion";
import { Check, Flame, Pencil, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/utils/utils";

interface HabitItemProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: (habitId: string, isCompleted: boolean) => void;
  onEdit: (habit: Habit) => void;
}

export function HabitItem({ habit, isCompleted, onToggle, onEdit }: HabitItemProps) {
  
  const getPriorityIcon = () => {
    switch(habit.priority) {
      case 'High': return <ArrowUp className="w-2.5 h-2.5 text-red-400" />;
      case 'Low': return <ArrowDown className="w-2.5 h-2.5 text-blue-400" />;
      default: return <ArrowRight className="w-2.5 h-2.5 text-yellow-400" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-300",
        isCompleted
          ? "bg-primary/5 border-primary/20"
          : "glass-card border-border"
      )}
    >
      {/* Left: toggle + title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={() => onToggle(habit.id, !isCompleted)}
          className={cn(
            "relative w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isCompleted
              ? "bg-primary border-primary"
              : "border-muted-foreground hover:border-primary"
          )}
        >
          <motion.div
            initial={false}
            animate={{ scale: isCompleted ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
          >
            <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        </button>

        <div className="flex flex-col min-w-0">
          <h4 className={cn(
            "text-sm font-medium transition-colors duration-300 break-words flex items-center gap-1.5",
            isCompleted ? "text-zinc-500 line-through decoration-zinc-500/50" : "text-foreground"
          )}>
            {habit.title}
          </h4>
          {habit.description && (
            <p className="text-[10px] text-muted-foreground truncate">{habit.description}</p>
          )}
        </div>
      </div>

      {/* Right: priority + streak + edit */}
      <div className="flex items-center gap-1 flex-shrink-0 ml-1">
        
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border">
          {getPriorityIcon()}
          <span className="text-[9px] font-medium">{habit.priority}</span>
        </div>

        {habit.current_streak > 0 && (
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <Flame className="w-2.5 h-2.5" />
            <span className="text-[9px] font-bold">{habit.current_streak}</span>
          </div>
        )}
        
        <button
          onClick={() => onEdit(habit)}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors sm:opacity-0 sm:group-hover:opacity-100"
          title="Edit"
        >
          <Pencil className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
