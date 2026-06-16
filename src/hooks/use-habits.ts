'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useHabitStore } from '@/store/habit-store';
import { useAuthStore } from '@/store/auth-store';
import { Habit, HabitLog } from '@/types/database';

const supabase = createClient();

// Map to track active subscription channels across component cycles
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeChannels = new Map<string, any>();

export function useHabits() {
  // Retain the legacy signature returning CRUD functions for backwards compatibility,
  // but do not run any fetch/realtime useEffects here to prevent multi-triggering
  return useHabitsActions();
}

export function useHabitDataSync() {
  const { user } = useAuthStore();
  const { setHabits, setLogs, setProfile, setIsLoading, setError, addLog, removeLog, updateHabit } = useHabitStore();
  const fetchedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      fetchedUserIdRef.current = null;
      return;
    }
    
    if (fetchedUserIdRef.current === user.id) {
      console.log('[useHabitDataSync] user.id unchanged, skipping fetch');
      return;
    }
    fetchedUserIdRef.current = user.id;

    let isMounted = true;

    async function fetchInitialData() {
      console.log('[useHabitDataSync] fetchInitialData started');
      setIsLoading(true);
      setError(null);
      try {
        console.log('[useHabitDataSync] fetch habits start');
        const habitsRes = await supabase.from('habits').select('*').is('deleted_at', null);
        if (habitsRes.error) {
          console.error('[useHabitDataSync] habits error:', habitsRes.error.message);
        }

        console.log('[useHabitDataSync] fetch logs start');
        const logsRes = await supabase.from('habit_logs').select('*');
        if (logsRes.error) {
          console.error('[useHabitDataSync] logs error:', logsRes.error.message);
        }

        console.log('[useHabitDataSync] fetch profile start');
        const profileRes = await supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle();
        if (profileRes.error) {
          console.error('[useHabitDataSync] profile error:', profileRes.error.message);
        }

        let profileData = profileRes.data;

        // Profile may be missing on first login if the trigger hasn't fired yet.
        // Attempt a client-side INSERT — this is covered by the INSERT RLS policy (auth.uid() = id).
        if (!profileData && !profileRes.error) {
          console.log('[useHabitDataSync] profile missing, attempting client-side insert');
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ id: user!.id, email: user!.email })
            .select()
            .single();

          if (insertError) {
            // Surface the real error — do NOT invent a fake profile
            console.error('[useHabitDataSync] profile insert failed:', insertError.message);
            throw new Error(`Profile could not be created: ${insertError.message}`);
          }
          profileData = newProfile;
          console.log('[useHabitDataSync] profile created successfully');
        }

        // If the select itself errored, surface it
        if (!profileData && profileRes.error) {
          throw new Error(`Profile fetch failed: ${profileRes.error.message}`);
        }

        if (isMounted) {
          if (habitsRes.data) setHabits(habitsRes.data);
          if (logsRes.data) setLogs(logsRes.data);
          setProfile(profileData);
        }
      } catch (error: unknown) {
        console.error('[useHabitDataSync] Failed to fetch initial data:', error);
        if (isMounted) {
          const errMsg = error instanceof Error ? error.message : 'Failed to load dashboard';
          setError(errMsg);
        }
      } finally {
        console.log('[useHabitDataSync] finally block reached, setting isLoading to false');
        // Always resolve loading state to avoid infinite skeletons, even if component is unmounted
        setIsLoading(false);
      }
    }

    console.log('[useHabitDataSync] useEffect triggered for user:', user.id);
    fetchInitialData();

    // Setup Realtime Subscriptions without collision
    const channelKey = `dashboard_data_${user.id}`;
    if (!activeChannels.has(channelKey)) {
      console.log('[useHabitDataSync] setting up realtime channel:', channelKey);
      const channel = supabase.channel(channelKey);
      
      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'habits', filter: `user_id=eq.${user.id}` }, (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            updateHabit(payload.new as Habit);
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs', filter: `user_id=eq.${user.id}` }, (payload) => {
          if (payload.eventType === 'INSERT') {
            addLog(payload.new as HabitLog);
          } else if (payload.eventType === 'DELETE') {
            removeLog(payload.old.id);
          }
        });
        
      channel.subscribe();
      activeChannels.set(channelKey, channel);
    }

    return () => {
      console.log('[useHabitDataSync] useEffect cleanup');
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
}

export function useHabitsActions() {
  const { user } = useAuthStore();
  const { setHabits, addLog, removeLog } = useHabitStore();

  // --------------------------------------------------------------------------
  // Toggle habit completion — optimistic update with rollback on failure
  // --------------------------------------------------------------------------
  const toggleHabitCompletion = async (habitId: string, isCompleted: boolean, date: string) => {
    if (!user) return;

    if (isCompleted) {
      // OPTIMISTIC: add a temp log immediately so the cell lights up at once
      const tempId = `optimistic-${habitId}-${date}`;
      const tempLog: HabitLog = {
        id: tempId,
        habit_id: habitId,
        user_id: user.id,
        completed_at: date,
        notes: null,
        created_at: new Date().toISOString(),
      };
      addLog(tempLog);

      // Persist to DB
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.id, completed_at: date })
        .select()
        .single();

      if (error) {
        // ROLLBACK: remove the optimistic entry
        removeLog(tempId);
        console.error('[toggle] insert failed:', error.message);
      } else if (data) {
        // Replace temp entry with real DB row so IDs are consistent
        removeLog(tempId);
        addLog(data);
      }
    } else {
      // OPTIMISTIC: find and remove the log immediately
      const existingLog = useHabitStore.getState().logs.find(
        (l) => l.habit_id === habitId && l.completed_at === date
      );
      if (!existingLog) return;

      removeLog(existingLog.id);

      // Persist to DB
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .match({ habit_id: habitId, user_id: user.id, completed_at: date });

      if (error) {
        // ROLLBACK: put the log back
        addLog(existingLog);
        console.error('[toggle] delete failed:', error.message);
      }
    }
  };

  // --------------------------------------------------------------------------
  // Create habit — optimistic: Realtime will insert the real row into store
  // --------------------------------------------------------------------------
  const createHabit = async (habitData: Partial<Habit>) => {
    if (!user) return;
    const { error } = await supabase.from('habits').insert({
      ...habitData,
      user_id: user.id,
    });
    if (error) {
      console.error('[createHabit] failed:', error.message);
      throw error; // bubble up so modal can show error
    }
    // Realtime INSERT event will call updateHabit → store updates automatically
  };

  // --------------------------------------------------------------------------
  // Update habit — optimistic: apply locally then confirm via DB
  // --------------------------------------------------------------------------
  const updateHabitDetails = async (habitId: string, updates: Partial<Habit>) => {
    if (!user) return;

    // OPTIMISTIC: update the store immediately
    const prevHabits = useHabitStore.getState().habits;
    const optimistic = prevHabits.map((h) => (h.id === habitId ? { ...h, ...updates } : h));
    setHabits(optimistic);

    const { error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', habitId)
      .eq('user_id', user.id);

    if (error) {
      // ROLLBACK
      setHabits(prevHabits);
      console.error('[updateHabitDetails] failed:', error.message);
      throw error;
    }
    // Realtime UPDATE event will also fire and reconcile — no harm
  };

  // --------------------------------------------------------------------------
  // Delete (soft) habit — optimistic remove from store
  // --------------------------------------------------------------------------
  const deleteHabit = async (habitId: string) => {
    if (!user) return;

    // OPTIMISTIC: remove from store immediately
    const prevHabits = useHabitStore.getState().habits;
    setHabits(prevHabits.filter((h) => h.id !== habitId));

    const { error } = await supabase
      .from('habits')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', habitId)
      .eq('user_id', user.id);

    if (error) {
      // ROLLBACK
      setHabits(prevHabits);
      console.error('[deleteHabit] failed:', error.message);
      throw error;
    }
  };

  return { toggleHabitCompletion, createHabit, updateHabitDetails, deleteHabit };
}

