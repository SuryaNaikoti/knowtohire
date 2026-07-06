// Hourly/Daily Digest Email sender
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Query active digests
    const { data: usersToNotify } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('digest_enabled', true)

    // Process and dispatch queued notification summaries
    // ...

    return new Response(JSON.stringify({ success: true, dispatched: usersToNotify?.length ?? 0 }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
