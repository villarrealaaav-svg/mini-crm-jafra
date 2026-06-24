import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Flag para que la UI pueda avisar si falta configurar Supabase.
export const supabaseConfigured = Boolean(url && anon)

// Cliente anon (lectura pública). Placeholder si no hay env para no romper el build.
export const supabase = createClient(url || 'http://localhost:54321', anon || 'public-anon-key')
