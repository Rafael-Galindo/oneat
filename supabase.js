import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://ybampodlxewokuiduyoy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliYW1wb2RseGV3b2t1aWR1eW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY3Nzg3OTAsImV4cCI6MjA0MjM1NDc5MH0.G5xtKpyamIema0Nh5xKZ0Gt1FkvvRPKKIQO01bNL4pk')

export default supabase;
