"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Card, TopBar, PhotoPicker } from "@/components/ui";
import { supabase, PHOTO_BUCKET } from "@/lib/supabase";
import { todayStr } from "@/lib/utils";
import type { CatPhoto } from "@/lib/types";

export default function CatAlbumPage() {
  const [photos, setPhotos] = useState<CatPhoto[]>([]);

  const load = async () => {
    const { data } = await supabase.from("cat_photos").select("*").order("created_at", { ascending: false });
    setPhotos(data ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const addPhoto = async (blob: Blob) => {
    const path = `cat/album-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg" });
    if (error) return;
    const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    await supabase.from("cat_photos").insert({ photo_url: pub.publicUrl, taken_date: todayStr() });
    load();
  };

  const removePhoto = async (id: string) => {
    await supabase.from("cat_photos").delete().eq("id", id);
    load();
  };

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopBar title="フォトアルバム" subtitle="Cat / Photos" backHref="/cat" accent="#C1694F" />
      <div className="px-5 pt-5">
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
