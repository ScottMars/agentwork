import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  "https://sdyemuueuiesosczkrkh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeWVtdXVldWllc29zY3prcmtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDUzNjAsImV4cCI6MjA1Nzk4MTM2MH0.47tDWXUoDcveCyQL1vMCESUhDTS0OoZxAIrY79DAsvg",
  {
    db: {
      schema: "public",
    },
    auth: {
      persistSession: true,
    },
    global: {
      headers: {
        "x-application-name": "anthropic-chat",
      },
    },
  },
);
