// Weekly Events Cleanup Job
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete events older than 90 days
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 90)

    const { count, error } = await supabase
      .from('analytics_events')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffDate.toISOString())

    if (error) throw error

    return new Response(JSON.stringify({ success: true, deleted_count: count }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
