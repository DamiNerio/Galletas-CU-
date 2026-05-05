import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://qjtxumahovqojdyywyjl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdHh1bWFob3Zxb2pkeXl3eWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NTA0NzcsImV4cCI6MjA4ODQyNjQ3N30.YthIq-OT4xC0QbB4XmwzaLL6udUoBsUrnqeKMsR1rqo'

export const supabase = createClient(supabaseUrl, supabaseKey)
