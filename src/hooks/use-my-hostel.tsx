import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/integrations/supabase/types";

export type Hostel = Tables<"hostels">;

export function useMyHostel() {
  const { user, loading: authLoading } = useAuth();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!user) {
      setHostel(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("hostels")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    setHostel((data as Hostel) ?? null);
    setLoading(false);
  }, [user, authLoading]);

  useEffect(() => {
    load();
  }, [load]);

  return { hostel, loading, reload: load };
}
