import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "@tanstack/react-router";

export interface Profile {
  id: string;
  email: string | null;
  role: string | null;
  created_at: string;
  updated_at?: string;
  reseller_api_token?: string | null;
}

export const useAuth = (requireAuth = false) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Stash navigate in a ref so the effect doesn't re-subscribe when it changes.
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const lastUserIdRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      setProfile(data as Profile | null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(session);
      setUser(session?.user ?? null);
      lastUserIdRef.current = session?.user?.id ?? null;

      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      if (cancelled) return;
      setLoading(false);

      if (requireAuth && !session) {
        navigateRef.current({ to: "/auth" });
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore noisy events: TOKEN_REFRESHED fires ~hourly + on tab focus,
      // INITIAL_SESSION fires on every mount. They don't change identity.
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") {
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      const newUserId = session?.user?.id ?? null;
      // Only refetch the profile when the user identity actually changed.
      if (newUserId !== lastUserIdRef.current) {
        lastUserIdRef.current = newUserId;
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } else if (event === "USER_UPDATED" && session?.user) {
        fetchProfile(session.user.id);
      }

      if (requireAuth && !session) {
        navigateRef.current({ to: "/auth" });
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [requireAuth, fetchProfile]);

  return { user, session, profile, loading };
};
