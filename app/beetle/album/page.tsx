"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Card, TopBar, Field, inputClass, PhotoPicker } from "@/components/ui";
import { supabase, PHOTO_BUCKET } from "@/lib/supabase";
import type { BeetleLarva, BeetlePhoto } from "@/lib/types";

export default function BeetleAlbumPage() {
  const [larvae, setLarvae] = useState<BeetleLarva[]>([]);
  const [larvaId, setLarvaId] = useState<number | null>(null);
  const [photos, setPhotos] = useState<BeetlePhoto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("beetle_larvae").select("*").order("id");
        if (error) throw error;
        setLarvae(data ?? []);
        if (data && data.length > 0) setLarvaId(data[0].id);
      } catch (e: any) {
        setError(`データの取得に失敗しました：${e?.message ?? String(e)}`);
      }
    })();
  }, []);

  const load = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("beetle_photos")
        .select("*")
        .eq("larva_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPhotos(data ?? []);
    } catch (e: any) {
      setError(`データの取得に失敗しました：${e?.message ?? String(e)}`);
    }
  };

  useEffect(() => {
    if (larvaId) load(larvaId);
  }, [larvaId]);

  const addPhoto = async (blob: Blob) => {
    if (!larvaId) return;
    setError(null);
    try {
      const path = `beetle/${larvaId}-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
      const { error: dbErr } = await supabase.from("beetle_photos").insert({ larva_id: larvaId, photo_url: pub.publicUrl });
      if (dbErr) throw dbErr;
    } catch (e: any) {
      setError(`写真のアップロードに失敗しました：${e?.message ?? String(e)}`);
      return;
    }
    load(larvaId);
  };

  const removePhoto = async (id: string) => {
    setError(null);
    try {
      const { error } = await supabase.from("beetle_photos").delete().eq("id", id);
      if (error) throw error;
    } catch (e: any) {
      setError(`削除に失敗しました：${e?.message ?? String(e)}`);
      return;
    }
    if (larvaId) load(larvaId);
  };

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopBar title="フォトギャラリー" subtitle="Beetle / Photos" backHref="/beetle" accent="#3F5D3A" />
      <div className="px-5 pt-5">
        {error && (
          <Card className="p-4 mb-4 border-red-300">
            <div className="text-[13px] text-red-600">{error}</div>
          </Card>
        )}
        <Field label="幼虫を選ぶ">
          <select className={inputClass} value={larvaId ?? ""} onChange={(e) => setLarvaId(Number(e.target.value))}>
            {larvae.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </Field>
        <PhotoPicker onPick={addPhoto} />
        <div className="grid grid-cols-3 gap-2 mt-5">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo_url} className="w-full h-full object-cover" alt="" />
              <button
                onClick={() => removePhoto(p.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        {photos.length === 0 && <div className="text-center text-[13px] opacity-50 mt-8">まだ写真がありません</div>}
      </div>
    </div>
  );
}
