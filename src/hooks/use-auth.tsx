'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

type AuthContextValue = {
     user: User | null;
     status: 'loading' | 'authenticated' | 'unauthenticated';
};

const AuthContext = createContext<AuthContextValue>({ user: null, status: 'loading' });

// Replaces next-auth/react's <SessionProvider>. Hydrated with the user resolved
// server-side (no loading flash), then kept in sync via onAuthStateChange.
export function AuthProvider({ initialUser, children }: { initialUser: User | null; children: ReactNode }) {
     const [state, setState] = useState<AuthContextValue>({
          user: initialUser,
          status: initialUser ? 'authenticated' : 'unauthenticated',
     });

     useEffect(() => {
          const supabase = createClient();
          const {
               data: { subscription },
          } = supabase.auth.onAuthStateChange((_event, session) => {
               setState({
                    user: session?.user ?? null,
                    status: session?.user ? 'authenticated' : 'unauthenticated',
               });
          });

          return () => subscription.unsubscribe();
     }, []);

     return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

// Replaces next-auth/react's useSession().
export function useAuth() {
     return useContext(AuthContext);
}
