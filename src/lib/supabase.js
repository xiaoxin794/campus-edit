import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ibtelmgbrorvgvqjdizz.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_bxNPyn7LKXQKyIsSVQbqPg_V4SWeRUt'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
