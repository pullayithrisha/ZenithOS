'use client';

import { useEffect, useState } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { Code2, AlertCircle, RefreshCw, Trophy, Star } from 'lucide-react';
import { IntegrationsModal } from '../profile/integrations-modal';

interface LeetCodeData {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  reputation: number;
  fallback?: boolean;
}

export function LeetcodeCard() {
  const { profile } = useHabitStore();
  const [data, setData] = useState<LeetCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchLeetcode() {
      if (!profile?.leetcode_username) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/leetcode?username=${profile.leetcode_username}`);
        const json = await res.json();
        
        if (!res.ok && !json.fallback) {
          throw new Error(json.error || 'Failed to fetch LeetCode data');
        }
        
        setData(json);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeetcode();
  }, [profile?.leetcode_username]);

  if (!profile?.leetcode_username) {
    return (
      <>
        <div className="glass-card p-6 flex flex-col h-full items-center justify-center text-center">
          <Code2 className="w-8 h-8 text-zinc-500 mb-3" />
          <h3 className="text-white font-medium mb-1">LeetCode Integration</h3>
          <p className="text-sm text-zinc-400 mb-4">Connect your account to track solved problems.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-medium px-4 py-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
          >
            Connect LeetCode
          </button>
        </div>
        <IntegrationsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className="glass-card p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-[#FFA116]" />
            <span className="text-sm font-medium text-white">LeetCode Stats</span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-xs text-zinc-500 hover:text-white transition-colors"
          >
            Edit
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-6 h-6 text-red-500/80 mb-2" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : data ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <a href={`https://leetcode.com/${profile.leetcode_username}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-white hover:underline">
                {profile.leetcode_username}
              </a>
              <div className="text-right">
                <div className="text-[10px] text-zinc-400">Global Rank</div>
                <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  {data.ranking > 0 ? data.ranking.toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>

            {data.fallback && (
              <div className="text-[10px] text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                Showing cached/fallback data.
              </div>
            )}

            <div className="bg-black/40 p-3 rounded-lg border border-white/5 mt-1">
              <div className="text-[10px] text-zinc-400 mb-0.5">Total Solved</div>
              <div className="text-2xl font-bold text-white mb-3">{data.totalSolved}</div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#00b8a3]">Easy</span>
                  <span className="font-medium text-white">{data.easySolved}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                  <div className="bg-[#00b8a3] h-full rounded-full" style={{ width: `${Math.min(100, (data.easySolved / Math.max(1, data.totalSolved)) * 100)}%` }} />
                </div>
                
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-[#ffc01e]">Medium</span>
                  <span className="font-medium text-white">{data.mediumSolved}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                  <div className="bg-[#ffc01e] h-full rounded-full" style={{ width: `${Math.min(100, (data.mediumSolved / Math.max(1, data.totalSolved)) * 100)}%` }} />
                </div>
                
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-[#ff375f]">Hard</span>
                  <span className="font-medium text-white">{data.hardSolved}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                  <div className="bg-[#ff375f] h-full rounded-full" style={{ width: `${Math.min(100, (data.hardSolved / Math.max(1, data.totalSolved)) * 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
              <span className="text-xs text-zinc-400 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-500" /> Reputation</span>
              <span className="text-sm font-medium text-white">{data.reputation}</span>
            </div>
          </div>
        ) : null}
      </div>
      <IntegrationsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
