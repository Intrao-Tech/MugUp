"use client";

import { useEffect, useRef } from "react";
import { signOutIdle, stampAdminActivity } from "./actions";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

/**
 * Makes the idle timeout behave the way people expect it to:
 *  - reading or scrolling without clicking still counts as activity — a
 *    throttled heartbeat re-stamps the server-side activity cookie while the
 *    tab is actually in use;
 *  - after `timeoutMinutes` with no activity the tab signs itself out and
 *    goes to the login page instead of waiting for the next click to bounce
 *    (an explicit sign-out, because any request — even a reload — would
 *    re-stamp the activity cookie and keep the session alive).
 * The server stays the authority (src/lib/admin-session.ts): it signs the
 * session out on the first request after the cookie expires, whatever this
 * component does or fails to do.
 */
export function IdleGuard({ timeoutMinutes }: { timeoutMinutes: number }) {
  const lastActivity = useRef(Date.now());
  const lastStamp = useRef(Date.now());
  const expired = useRef(false);

  useEffect(() => {
    const timeoutMs = timeoutMinutes * 60_000;
    // Heartbeat at most every quarter of the timeout (a 15-minute timeout
    // stamps roughly every 4 minutes of real use), never more than once a minute.
    const heartbeatMs = Math.max(60_000, timeoutMs / 4);
    const onActivity = () => {
      lastActivity.current = Date.now();
    };
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }
    const timer = window.setInterval(() => {
      const now = Date.now();
      if (now - lastActivity.current >= timeoutMs) {
        if (expired.current) return;
        expired.current = true;
        window.clearInterval(timer);
        signOutIdle().catch(() => {
          window.location.assign("/admin/login?error=expired");
        });
        return;
      }
      if (lastActivity.current > lastStamp.current && now - lastStamp.current >= heartbeatMs) {
        lastStamp.current = now;
        stampAdminActivity().catch(() => {
          // Network hiccup: the next heartbeat (or click) stamps again.
        });
      }
    }, 30_000);
    return () => {
      window.clearInterval(timer);
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, onActivity);
    };
  }, [timeoutMinutes]);

  return null;
}
