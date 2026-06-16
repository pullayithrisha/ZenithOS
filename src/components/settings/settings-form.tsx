/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { createClient } from '@/lib/supabase/client';
import { useNotifications } from '@/hooks/use-notifications';
import { Save, Download, Trash2, Bell, BellOff, GitBranch, Code2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsForm() {
  const { profile, setProfile, habits, logs } = useHabitStore();
  const supabase = createClient();
  const { permission, requestPermission } = useNotifications();

  const [github, setGithub] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setGithub(profile.github_username || '');
      setLeetcode(profile.leetcode_username || '');
    }
  }, [profile]);

  const handleSaveIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          github_username: github.trim() || null,
          leetcode_username: leetcode.trim() || null,
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      if (data) setProfile(data);
      toast.success('Integrations saved');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to save';
      console.error('[SettingsForm] handleSaveIntegrations error:', msg);
      toast.error(`Failed to save: ${msg}`);
      setGithub(profile.github_username || '');
      setLeetcode(profile.leetcode_username || '');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ profile, habits, logs, exportDate: new Date().toISOString() }, null, 2));
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', 'zenithos_export.json');
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Exported as JSON');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleExportCSV = () => {
    try {
      if (habits.length === 0) { toast.info('No habits to export'); return; }
      const csvContent = [
        ['ID', 'Title', 'Category', 'Priority', 'Created At'].join(','),
        ...habits.map(h => [h.id, `"${h.title}"`, `"${h.category || ''}"`, h.priority, h.created_at].join(','))
      ].join('\n');
      const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', 'zenithos_habits.csv');
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Exported as CSV');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Delete your account permanently? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      if (profile) {
        const { error } = await supabase.from('profiles').delete().eq('id', profile.id);
        if (error) throw error;
      }
      toast.success('Account deleted');
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  // Reusable row primitive
  const Row = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex items-center justify-between py-3 border-b border-white/5 last:border-0 ${className}`}>
      {children}
    </div>
  );

  const Label = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
    <div>
      <span className="text-sm font-medium text-foreground">{children}</span>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );

  const Toggle = ({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-40 ${on ? 'bg-primary' : 'bg-primary/20'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${on ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );

  return (
    <div className="w-full max-w-4xl pb-28 space-y-4">

      {/* ── Main Layout: Two Columns on Desktop ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Left Column ── */}
        <div className="flex flex-col gap-4">
          {/* Preferences & Export */}
          <div className="glass-card px-4 py-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-3 pb-1">Preferences</p>

            {/* Notifications */}
            <Row>
              <Label sub={`Status: ${permission}`}>
                <span className="flex items-center gap-1.5">
                  {permission === 'granted'
                    ? <Bell className="w-3.5 h-3.5 text-green-500" />
                    : <BellOff className="w-3.5 h-3.5 text-muted-foreground" />}
                  Notifications
                </span>
              </Label>
              <Toggle
                on={permission === 'granted'}
                onToggle={async () => {
                  if (permission === 'granted') return;
                  if (permission === 'denied') {
                    toast.error('Notifications blocked. Please enable them in your browser settings (usually near the URL bar).');
                    return;
                  }
                  const granted = await requestPermission();
                  if (granted) toast.success('Notifications enabled');
                  else toast.error('Permission denied. Please check your browser settings.');
                }}
                disabled={permission === 'granted'}
              />
            </Row>

            {/* Data Export */}
            <div className="py-3">
              <p className="text-xs font-medium text-foreground mb-2">Export Data</p>
              <div className="flex gap-2">
                <button
                  onClick={handleExportJSON}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-lg transition-colors border border-border text-xs"
                >
                  <Download className="w-3.5 h-3.5" /> JSON
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-lg transition-colors border border-border text-xs"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card px-4 py-3 border border-destructive/20 hidden md:block">
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
                  <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Permanently deletes all your data.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium rounded-lg transition-colors disabled:opacity-50 text-xs flex-shrink-0 ml-4"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-4">
          {/* Integrations */}
          <div className="glass-card px-4 py-1 flex flex-col flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-3 pb-2">Integrations</p>
            <form onSubmit={handleSaveIntegrations} className="flex flex-col flex-1 space-y-3 pb-3">
              <div>
                <label className="flex items-center text-xs font-medium text-muted-foreground mb-1 gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" /> GitHub Username
                </label>
                <input
                  type="text"
                  value={github}
                  onChange={e => setGithub(e.target.value)}
                  placeholder="e.g., torvalds"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="flex items-center text-xs font-medium text-muted-foreground mb-1 gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[#FFA116]" /> LeetCode Username
                </label>
                <input
                  type="text"
                  value={leetcode}
                  onChange={e => setLeetcode(e.target.value)}
                  placeholder="e.g., neetcode"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex-1" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 justify-center w-full py-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-lg transition-colors disabled:opacity-50 text-sm border border-border"
              >
                <Save className="w-3.5 h-3.5" />
                {isSubmitting ? 'Saving...' : 'Save Integrations'}
              </button>
            </form>
          </div>
          
          {/* Danger Zone (mobile fallback so it's always at the bottom) */}
          <div className="glass-card px-4 py-3 border border-destructive/20 md:hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
                  <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Permanently deletes all your data.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium rounded-lg transition-colors disabled:opacity-50 text-xs flex-shrink-0 ml-4"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
