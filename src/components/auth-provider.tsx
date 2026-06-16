'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';

const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    // Fetch initial session
    const initializeAuth = async () => {
      try {
        console.log('[AuthProvider] initializeAuth started');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        const currentSession = useAuthStore.getState().session;
        console.log('[AuthProvider] getSession current token:', currentSession?.access_token ? 'exists' : 'null', 'new token:', session?.access_token ? 'exists' : 'null');
        if (currentSession?.access_token !== session?.access_token) {
          console.log('[AuthProvider] getSession: session token changed, updating store');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error fetching auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AuthProvider] onAuthStateChange event:', event, 'user:', session?.user?.id);
        const currentSession = useAuthStore.getState().session;
        if (currentSession?.access_token !== session?.access_token) {
          console.log('[AuthProvider] onAuthStateChange: session token changed, updating store');
          setSession(session);
          setUser(session?.user ?? null);
        } else {
          console.log('[AuthProvider] onAuthStateChange: session token identical, ignoring');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, setSession, setUser, setLoading]);

  return <>{children}</>;
}
