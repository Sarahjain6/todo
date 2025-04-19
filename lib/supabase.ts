import { createClient } from "@supabase/supabase-js"

// For server-side operations (API routes, Server Actions)
export const createServerSupabaseClient = () => {
  const supabaseUrl = "https://bbobtfqllaenlnjgzfbi.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJib2J0ZnFsbGFlbmxuamd6ZmJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTA0NDM3MSwiZXhwIjoyMDYwNjIwMzcxfQ.moICWlOhZDkS1qv-AOFJe7FVSDt1AaWDczqe1GPC8Cs";
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// For client-side operations (browser)
// Use singleton pattern to avoid multiple instances
let clientSupabaseInstance: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseInstance) return clientSupabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  clientSupabaseInstance = createClient(supabaseUrl, supabaseKey)
  return clientSupabaseInstance
}
