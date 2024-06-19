import { Box } from "@mui/material";
import moment from "moment";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect, useState } from "react";

export interface AutoLogoutProviderProps {
     timeoutMs?: number;
     timeoutCheckMs?: number;
     debug?: boolean;
     requireSession?: boolean;
}

type WindowActivityEvent = keyof WindowEventMap;

export const AutoLogoutProvider = ({
     timeoutMs,
     timeoutCheckMs = 5000,
     debug = false,
     requireSession = false,
     children
}: PropsWithChildren<AutoLogoutProviderProps>) => {
     const [lastActivity, setLastActivity] = useState(initLastActivity());

     const reload = () => {
          window.location.reload();
     }

     function storage() {
          return global.window !== undefined ? window.localStorage : null;
     }

     function initLastActivity() {
          const now = activityDate();
          const lastActivityStr = storage()?.getItem('lastActivity');
          const lastActivity = parseLastActivityString(lastActivityStr);
          return lastActivity == null ? now : lastActivity;
     }

     function parseLastActivityString(activityStr: any) {
          const lastActivity = activityStr;
          const now = activityDate();

          if (lastActivity > now ||
               lastActivity <= 0 ||
               isNaN(lastActivity)) {
               return null;
          }
          return lastActivity;
     }

     function activityDate() {
          return moment().format('YYYY-MM-DD HH:mm:ss');
     }

     function onUserActivity() {
          const now = activityDate();
          if (debug) console.log("activityDate - resetting last activityDate to ", now);
          storage()?.setItem('lastActivity', now.toString());
          setLastActivity(now);
     }

     function onStorage({ key, storageArea, newValue }: StorageEvent) {
          if (key === 'lastActivity' && storageArea === storage()) {
               if (debug) console.log("remote tab activityDate - resetting last activityDate to ", newValue);
               const lastActivity = parseLastActivityString(newValue);
               if (lastActivity !== null) setLastActivity(lastActivity);
          }
     }

     function onTimerElapsed() {
          isUserInactive();
     }

     function isUserInactive() {
          const now = activityDate();
          if (sessionStorage.getItem('authenticated')) {
               const expiry = moment(sessionStorage.getItem('sessionExpires')).format('YYYY-MM-DD HH:mm:ss');
               console.log('now > expiry', now > expiry);

               if (moment().format('YYYY-MM-DD HH:mm:ss') > expiry) {
                    if (debug) console.error("user has expired", expiry, now);
                    sessionStorage.removeItem('authenticated')
                    reload();
                    return true;
               }
          }

          console.log('lastActivity', lastActivity);
          console.log('now', now);

          console.log('lastActivity > now', lastActivity + timeoutMs > now);

          if (lastActivity > now) {
               if (debug) console.error("user inactive", lastActivity, now);
               sessionStorage.removeItem('authenticated')
               reload();
               return true;
          }
          return false;
     }

     useEffect(() => {
          // console.log(sessionStorage.getItem('authenticated'));

          // if (!sessionStorage.getItem('authenticated')) return;
          // console.log(timeoutMs);

          // if (timeoutMs == null) return;
          // if (isUserInactive()) return;

          const windowEvents: WindowActivityEvent[] = ["focus", "scroll", "click"];
          windowEvents.forEach(eventName => {
               window.addEventListener(eventName, onUserActivity, false);
          });

          window.addEventListener("storage", onStorage, false);
          const intervalId = window.setInterval(onTimerElapsed, timeoutCheckMs);

          return () => {
               windowEvents.forEach(eventName => {
                    window.removeEventListener(eventName, onUserActivity, false);
               });
               window.removeEventListener("storage", onStorage, false);
               window.clearInterval(intervalId);
          }
     }, [lastActivity]);

     return (
          <Box>
               {children}
          </Box>
     )

}
