import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import { createClient } from '@/utils/supabase/server';

export const metadata: Metadata = {
     title: 'LDA Subotica',
     icons: {
          icon: [
               { url: '/favicon.ico' },
               { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
               { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
          ],
          apple: '/apple-touch-icon.png',
     },
};

export const viewport: Viewport = {
     width: 'device-width',
     initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
     const supabase = await createClient();
     const {
          data: { user },
     } = await supabase.auth.getUser();

     return (
          <html lang="en">
               <head>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" />
                    <link
                         rel="stylesheet"
                         href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
                    />
                    <link
                         rel="stylesheet"
                         href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400&display=swap"
                    />
                    <link
                         rel="stylesheet"
                         href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&display=swap"
                    />
               </head>
               <body>
                    <Providers initialUser={user}>{children}</Providers>
               </body>
          </html>
     );
}
