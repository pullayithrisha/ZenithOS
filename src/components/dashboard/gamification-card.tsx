'use client';

import { useHabitStore } from "@/store/habit-store";
import { Star, Flame } from "lucide-react";
import { motion } from "framer-motion";

export function GamificationCard() {
  const { profile } = useHabitStore();

  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const currentStreak = profile?.current_streak || 0;

  const xpForNextLevel = Math.pow(level, 2) * 100;
  const progressToNextLevel = Math.min(100, Math.round((xp / xpForNextLevel) * 100));

  return (
    <div className="glass-card p-4 flex flex-col gap-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
      
      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">Level {level}</h3>
          <motion.p 
            key={xp}
            initial={{ scale: 1.2, color: "#eab308" }}
            animate={{ scale: 1, color: "#ffffff" }}
            className="text-xl font-bold text-white mt-0.5"
          >
            {xp} XP
          </motion.p>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
          <Star className="w-4 h-4 text-blue-400 fill-blue-400/20" />
        </div>
      </div>

      <div className="z-10">
        <div className="flex justify-between text-xs mb-1.5 text-zinc-400">
          <span>To Level {level + 1}</span>
          <span>{xp} / {xpForNextLevel} XP</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressToNextLevel}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-blue-500 rounded-full" 
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5 border-t border-white/5 pt-3 z-10">
        <div className="w-7 h-7 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
        </div>
        <div>
          <p className="text-[10px] text-zinc-400">Current Streak</p>
          <p className="text-sm font-bold text-white leading-tight">{currentStreak} Days</p>
        </div>
      </div>
    </div>
  );
}
