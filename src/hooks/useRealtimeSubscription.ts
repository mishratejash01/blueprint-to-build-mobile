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
    let channel: any = null;
    
    const setupChannel = async () => {
      // CRITICAL FIX: Remove any existing channel with same name FIRST
      const existingChannel = supabase.channel(channelName);
      await supabase.removeChannel(existingChannel);
      
      channel = supabase
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
            console.log(`✅ ${channelName} subscribed`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`❌ ${channelName} error`);
          }
        });
    };
    
    setupChannel();
    
    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel).then(() => {
          console.log(`🔌 ${channelName} unsubscribed`);
        }).catch((err) => {
          console.error(`Failed to cleanup ${channelName}:`, err);
        });
      }
    };
  }, [channelName, config.table, config.event, config.filter]);
};
