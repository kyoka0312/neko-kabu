import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ログイン機能なし・自分専用の運用を想定した単純なクライアント。
// URLを知っている人だけが使える前提（誰かに共有しないよう注意）。
export const supabase = createClient(url, anonKey);

export const PHOTO_BUCKET = "pet-photos";
