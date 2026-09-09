'use client';

import { Suspense, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from '@/hooks/use-auth';
import { useNProgress } from '@/hooks/use-nprogress';
import { createTheme } from '@/theme';

function NProgressListener() {
     useNProgress();
     return null;
}

export function Providers({ initialUser, children }: { initialUser: User | null; children: ReactNode }) {
     const theme = createTheme();

     return (
          <AppRouterCacheProvider options={{ key: 'css' }}>
               <AuthProvider initialUser={initialUser}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                         <ThemeProvider theme={theme}>
                              <CssBaseline />
                              <Suspense fallback={null}>
                                   <NProgressListener />
                              </Suspense>
                              {children}
                         </ThemeProvider>
                    </LocalizationProvider>
               </AuthProvider>
          </AppRouterCacheProvider>
     );
}
