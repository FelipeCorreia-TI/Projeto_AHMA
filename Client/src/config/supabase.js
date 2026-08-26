import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'https://vfbtkvaeybtvsoivtbwl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YDm5mU4ZFKq_RZeL8jfb2Q_i4YQ7CC6';

export const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);