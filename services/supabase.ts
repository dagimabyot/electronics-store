
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cncejkyoadvejmlehgsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuY2Vqa3lvYWR2ZWptbGVoZ3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTI0NDcsImV4cCI6MjA4Njk4ODQ0N30.Y2hmYWAgyQP5Vnf2R09bOTffiReSJ0jcHODxrNmVwdo';

export const supabase = createClient(supabaseUrl, supabaseKey);
