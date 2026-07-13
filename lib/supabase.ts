import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// よくある設定ミスを自動補正する：
// 末尾のスラッシュや「/rest/v1」はクライアントが自動で付けるため、
// 環境変数に含まれているとパスが二重になりエラーになる。
const url = rawUrl
  ?.replace(/\/+$/, "")
  .replace(/\/rest\/v1$/, "")
  .replace(/\/+$/, "");

// 環境変数が未設定・サンプル値のままの場合でもアプリ全体をクラッシュさせず、
// 各ページでこのメッセージを表示できるようにする。
export const supabaseConfigError: string | null =
  !url || !anonKey
    ? "Supabaseの環境変数（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY）が設定されていません。ローカルなら .env.local、Vercelなら Environment Variables を設定し、ビルドし直してください。"
    : url.includes("xxxxxxxx")
      ? ".env.local がサンプル値（xxxxxxxx）のままです。SupabaseのProject Settings → API で実際のURLとanonキーを確認して設定してください。"
      : null;

// ログイン機能なし・自分専用の運用を想定した単純なクライアント。
// URLを知っている人だけが使える前提（誰かに共有しないよう注意）。
export const supabase = createClient(
  url || "https://not-configured.supabase.co",
  anonKey || "not-configured"
);

export const PHOTO_BUCKET = "pet-photos";
