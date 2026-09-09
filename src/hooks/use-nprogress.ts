'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import nProgress from 'nprogress';

// App Router has no Router.events; instead we patch history.pushState/replaceState
// once (both Link navigation and router.push() go through these) to start the bar,
// and mark it done whenever the rendered pathname/search params actually change.
let historyPatched = false;

function patchHistory() {
     if (historyPatched || typeof window === 'undefined') return;
     historyPatched = true;

     const originalPushState = window.history.pushState.bind(window.history);
     const originalReplaceState = window.history.replaceState.bind(window.history);

     window.history.pushState = (...args: Parameters<typeof window.history.pushState>) => {
          nProgress.start();
          return originalPushState(...args);
     };
     window.history.replaceState = (...args: Parameters<typeof window.history.replaceState>) => {
          nProgress.start();
          return originalReplaceState(...args);
     };
}

export function useNProgress() {
     const pathname = usePathname();
     const searchParams = useSearchParams();

     useEffect(() => {
          patchHistory();
     }, []);

     useEffect(() => {
          nProgress.done();
     }, [pathname, searchParams]);
}
