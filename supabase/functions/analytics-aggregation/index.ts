// Daily Analytics Aggregation Job
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Aggregate yesterday's counts
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = yesterday.toISOString().split('T')[0]

    // Fetch counts grouped by type
    const { data: events } = await supabase
      .from('analytics_events')
      .select('event_type, event_category, entity_type')
      .gte('created_at', dateStr + 'T00:00:00')
      .lt('created_at', dateStr + 'T23:59:59')

    if (events && events.length > 0) {
      // Perform aggregation counts and upsert into analytics_daily_summary table
      // ...
    }

    return new Response(JSON.stringify({ success: true, processed_date: dateStr }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
