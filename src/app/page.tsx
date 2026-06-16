'use client';

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Code, Activity, Trophy } from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const supabase = createClient();

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      setIsLoggingIn(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-zinc-800/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-800/20 blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <nav className="glass border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-zinc-200" />
            </div>
            <span className="font-bold text-lg tracking-tight">ZenithOS</span>
          </div>
          <Button 
            variant="outline" 
            className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 transition-all"
            onClick={handleLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Connecting..." : "Sign In"}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 text-sm font-medium text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Productivity Reimagined
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-gradient"
          >
            Master Your Habits. <br className="hidden md:block" /> Power Your Career.
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            A premium habit tracker built to build consistency in your daily life. 
            Perfect for tech students and developers—automatically sync your GitHub activity and LeetCode progress while you track your routines.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="rounded-full bg-white text-black hover:bg-zinc-200 text-base font-medium h-14 px-8 w-full sm:w-auto"
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>

          {/* Features Preview */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left">
            {[
              { icon: Activity, title: "Habit Tracking", desc: "Build powerful routines with comprehensive analytics and streaks." },
              { icon: Code, title: "Dev Integrations", desc: "Automatically sync your GitHub commits and LeetCode solved problems." },
              { icon: Trophy, title: "Gamification", desc: "Earn XP, level up, and unlock achievements as you progress." }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-zinc-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
