'use client';

import { useEffect, useState } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { GitBranch, Users, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { IntegrationsModal } from '../profile/integrations-modal';

interface GithubData {
  name: string;
  avatar_url: string;
  followers: number;
  public_repos: number;
  topLanguage: string;
  fallback?: boolean;
}

export function GithubCard() {
  const { profile } = useHabitStore();
  const [data, setData] = useState<GithubData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchGithub() {
      if (!profile?.github_username) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/github?username=${profile.github_username}`);
        const json = await res.json();
        
        if (!res.ok && !json.fallback) {
          throw new Error(json.error || 'Failed to fetch GitHub data');
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

    fetchGithub();
  }, [profile?.github_username]);

  if (!profile?.github_username) {
    return (
      <>
        <div className="glass-card p-6 flex flex-col h-full items-center justify-center text-center">
          <GitBranch className="w-8 h-8 text-zinc-500 mb-3" />
          <h3 className="text-white font-medium mb-1">GitHub Integration</h3>
          <p className="text-sm text-zinc-400 mb-4">Connect your account to track repos and activity.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-medium px-4 py-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
          >
            Connect GitHub
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
            <GitBranch className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">GitHub Stats</span>
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
            <div className="flex items-center gap-3">
              {data.avatar_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={data.avatar_url} alt="GitHub Avatar" className="w-9 h-9 rounded-full border border-white/10" />
              )}
              <div>
                <h4 className="text-sm text-white font-bold">{data.name || profile.github_username}</h4>
                <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline">
                  @{profile.github_username}
                </a>
              </div>
            </div>

            {data.fallback && (
              <div className="text-[10px] text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                Showing cached/fallback data due to API limits.
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                <div className="flex items-center gap-1 text-zinc-400 mb-1">
                  <BookOpen className="w-3 h-3" />
                  <span className="text-[10px]">Repositories</span>
                </div>
                <div className="text-lg font-bold text-white">{data.public_repos}</div>
              </div>
              <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                <div className="flex items-center gap-1 text-zinc-400 mb-1">
                  <Users className="w-3 h-3" />
                  <span className="text-[10px]">Followers</span>
                </div>
                <div className="text-lg font-bold text-white">{data.followers}</div>
              </div>
            </div>

            <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">Top Language</span>
              <span className="text-xs font-medium text-white">{data.topLanguage}</span>
            </div>
          </div>
        ) : null}
      </div>
      <IntegrationsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
