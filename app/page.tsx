"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Cat, Bug, ChevronRight, Camera } from "lucide-react";
import { Card, PhotoPicker } from "@/components/ui";
import { supabase, supabaseConfigError, PHOTO_BUCKET } from "@/lib/supabase";
import { ageMonthsDays } from "@/lib/utils";
import type { CatProfile } from "@/lib/types";

export default function Home() {
  const [profile, setProfile] = useState<CatProfile | null>(null);
  const [beetleCover, setBeetleCover] = useState<string | null>(null);
  const [editCat, setEditCat] = useState(false);
  const [editBeetle, setEditBeetle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (supabaseConfigError) {
      setError(supabaseConfigError);
      return;
    }
    try {
      const { data: p, error: pErr } = await supabase
        .from("cat_profile")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (pErr) throw pErr;
      setProfile(p);
    } catch (e: any) {
      setError(`データの取得に失敗しました：${e?.message ?? String(e)}`);
    }
    // app_settings は後から追加したテーブルなので、まだ無い環境でもホームを壊さない
    try {
      const { data: s } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "beetle_cover")
        .maybeSingle();
      setBeetleCover(s?.value ?? null);
    } catch {
      /* テーブル未作成なら表紙なしで表示 */
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (blob: Blob, prefix: string): Promise<string> => {
    const path = `${prefix}-${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, blob, { contentType: "image/jpeg" });
    if (upErr) throw upErr;
    return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
  };

  const changeCatPhoto = async (blob: Blob) => {
    setError(null);
    try {
      if (!profile) throw new Error("先にプロフィールを登録してください（ねこの部屋 → プロフィール）");
      const url = await upload(blob, "cat/home");
      const { error: dbErr } = await supabase
        .from("cat_profile")
        .update({ photo_url: url })
        .eq("id", profile.id);
      if (dbErr) throw dbErr;
    } catch (e: any) {
      setError(`写真の変更に失敗しました：${e?.message ?? String(e)}`);
      return;
    }
    setEditCat(false);
    load();
  };

  const changeBeetlePhoto = async (blob: Blob) => {
    setError(null);
    try {
      const url = await upload(blob, "beetle/cover");
      const { error: dbErr } = await supabase
        .from("app_settings")
        .upsert({ key: "beetle_cover", value: url }, { onConflict: "key" });
      if (dbErr) throw dbErr;
    } catch (e: any) {
      setError(`写真の変更に失敗しました：${e?.message ?? String(e)}`);
      return;
    }
    setEditBeetle(false);
    load();
  };

  const hasName = profile && profile.name && profile.name !== "（未登録）";
  const months = profile?.birthday ? ageMonthsDays(profile.birthday).months : null;
  const catSub = profile
    ? `${profile.breed ?? "猫"}${months != null ? `　生後${months}ヶ月` : ""}`
    : "体重・プロフィール・アルバム";

  return (
    <div className="max-w-md mx-auto pb-10">
      <div className="px-6 pt-10 pb-6">
        <div className="text-[11px] tracking-[0.25em] uppercase font-mono opacity-50">Family Log</div>
        <h1 className="font-hand text-3xl mt-1 font-bold">猫とカブトムシ</h1>
        <p className="text-[13px] opacity-60 mt-1">体重・プロフィール・写真をまとめて記録</p>
      </div>

      <div className="px-6 flex flex-col gap-4">
        {error && (
          <Card className="p-4 border-red-300">
            <div className="text-[13px] text-red-600">{error}</div>
          </Card>
        )}

        <Link href="/cat">
          <Card className="p-5 active:scale-[0.99] transition-transform" style={{ borderColor: "#C1694F55" }}>
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditCat((v) => !v);
                  setEditBeetle(false);
                }}
                className="relative w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 bg-catAccentSoft text-catAccent"
                aria-label="猫の写真を変更"
              >
                {profile?.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photo_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <Cat size={26} />
                )}
                <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-white/80 flex items-center justify-center">
                  <Camera size={10} color="#C1694F" />
                </span>
              </button>
              <div className="flex-1">
                <div className="text-[11px] font-mono uppercase tracking-wide text-catAccent">Cat Room</div>
                <div className="font-serif text-lg font-bold">{hasName ? `${profile!.name}の部屋` : "ねこの部屋"}</div>
                <div className="text-[12px] opacity-60">{catSub}</div>
              </div>
              <ChevronRight size={18} className="opacity-40" />
            </div>
          </Card>
        </Link>
        {editCat && <PhotoPicker onPick={changeCatPhoto} />}

        <Link href="/beetle">
          <Card className="p-5 active:scale-[0.99] transition-transform" style={{ borderColor: "#3F5D3A55" }}>
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditBeetle((v) => !v);
                  setEditCat(false);
                }}
                className="relative w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 bg-beetleAccentSoft text-beetleAccent"
                aria-label="カブトムシの写真を変更"
              >
                {beetleCover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={beetleCover} className="w-full h-full object-cover" alt="" />
                ) : (
                  <Bug size={26} />
                )}
                <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-white/80 flex items-center justify-center">
                  <Camera size={10} color="#3F5D3A" />
                </span>
              </button>
              <div className="flex-1">
                <div className="text-[11px] font-mono uppercase tracking-wide text-beetleAccent">Beetle Room</div>
                <div className="font-serif text-lg font-bold">カブトムシの部屋</div>
                <div className="text-[12px] opacity-60">ヘラクレスオオカブト＆エレファスゾウカブト</div>
              </div>
              <ChevronRight size={18} className="opacity-40" />
            </div>
          </Card>
        </Link>
        {editBeetle && <PhotoPicker onPick={changeBeetlePhoto} />}
      </div>
    </div>
  );
}
