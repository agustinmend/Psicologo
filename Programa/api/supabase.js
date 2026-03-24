import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
const SUPABASE_URL = 'https://ubscjoigadsctakxigvv.supabase.co'
const SUPABASE_KEY = 'sb_publishable_bU1YErB1FtFxa5F_rWsJ-w_CktJkV7q'
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)