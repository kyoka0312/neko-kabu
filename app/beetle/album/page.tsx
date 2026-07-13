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

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("beetle_larvae").select("*").order("id");
      setLarvae(data ?? []);
      if (data && data.length > 0) setLarvaId(data[0].id);
    })();
  }, []);

  const load = async (id: number) => {
    const { data } = await supabase
      .from("beetle_photos")
      .select("*")
      .eq("larva_id", id)
      .order("created_at", { ascending: false });
    setPhotos(data ?? []);
  };

  useEffect(() => {
    if (larvaId) load(larvaId);
  }, [larvaId]);

  const addPhoto = async (blob: Blob) => {
    if (!larvaId) return;
    const path = `beetle/${larvaId}-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg" });
    if (error) return;
    const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    await supabase.from("beetle_photos").insert({ larva_id: larvaId, photo_url: pub.publicUrl });
    load(larvaId);
  };

  const removePhoto = async (id: string) => {
    await supabase.from("beetle_photos").delete().eq("id", id);
    if (larvaId) load(larvaId);
  };

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopBar title="フォトギャラリー" subtitle="Beetle / Photos" backHref="/beetle" accent="#3F5D3A" />
      <div className="px-5 pt-5">
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
