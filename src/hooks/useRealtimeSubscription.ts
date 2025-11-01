import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface RealtimeSubscriptionConfig {
  table: string;
  event: "*" | "INSERT" | "UPDATE" | "DELETE";
  filter?: string;
  callback: (payload: RealtimePostgresChangesPayload<any>) => void;
}

export const useRealtimeSubscription = (
  channelName: string,
  config: RealtimeSubscriptionConfig
) => {
  useEffect(() => {
    let mounted = true;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: config.event,
          schema: 'public',
          table: config.table,
          filter: config.filter
        } as any,
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (mounted) {
            config.callback(payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to ${channelName}`);
        }
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel).then(() => {
        console.log(`🔌 Unsubscribed from ${channelName}`);
      }).catch((err) => {
        console.error(`Failed to unsubscribe from ${channelName}:`, err);
      });
    };
  }, [channelName, config.table, config.event, config.filter]);
};
