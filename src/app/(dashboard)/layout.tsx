import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';

export default async function Layout({ children }: { children: ReactNode }) {
     const supabase = await createClient();
     const {
          data: { user },
     } = await supabase.auth.getUser();

     if (!user) {
          redirect('/auth/login');
     }

     return <DashboardLayout>{children}</DashboardLayout>;
}
