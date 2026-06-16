/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { createClient } from '@/lib/supabase/client';
import { X, Save, GitBranch, Code2 } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IntegrationsModal({ isOpen, onClose }: IntegrationsModalProps) {
  const { profile, setProfile } = useHabitStore();
  const supabase = createClient();
  
  const [github, setGithub] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setGithub(profile.github_username || '');
      setLeetcode(profile.leetcode_username || '');
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          email: profile.email,
          github_username: github.trim() || null,
          leetcode_username: leetcode.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Only update local state when DB confirms the write succeeded
      if (data) setProfile(data);
      toast.success('Integrations saved successfully');
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to save integrations';
      console.error('[IntegrationsModal] handleSubmit error:', msg);
      toast.error(`Failed to save: ${msg}`);
      // Keep modal open so the user can retry — do NOT update local state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-xl font-bold">Developer Integrations</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-zinc-400 mb-6">
            Link your developer accounts to display live statistics and activity directly on your dashboard.
          </p>

          <div>
            <label className="flex items-center text-sm font-medium text-zinc-300 mb-1">
              <GitBranch className="w-4 h-4 mr-2" />
              GitHub Username
            </label>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="e.g., torvalds"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-zinc-300 mb-1">
              <Code2 className="w-4 h-4 mr-2" />
              LeetCode Username
            </label>
            <input
              type="text"
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
              placeholder="e.g., neetcode"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-white/5 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Connections'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
