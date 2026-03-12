import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://felrwzxojmgpqsjtiwrf.supabase.co"
const supabaseKey = "sb_publishable_DEcyh6yRIi54Nt5OwC2dkw_kG4TJ_Iq"

export const supabase = createClient(supabaseUrl, supabaseKey)