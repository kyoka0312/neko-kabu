"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, TopBar, StampBadge, PhotoPicker } from "@/components/ui";
import { supabase, PHOTO_BUCKET } from "@/lib/supabase";
import { fmtDate } from "@/lib/utils";
import type { BeetleLarva, BeetleWeight, BeetlePhoto } from "@/lib/types";

export default function BeetleDetailPage({ params }: { params: { id: string } }) {
  const larvaId = Number(params.id);
  const [larva, setLarva] = useState<BeetleLarva | null>(null);
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [records, setRecords] = useState<(BeetleWeight & { days: number })[]>([]);
  const [photos, setPhotos] = useState<BeetlePhoto[]>([]);

  const load = async () => {
    const { data: l } = await supabase.from("beetle_larvae").select("*").eq("id", larvaId).maybeSingle();
    setLarva(l);
    if (l) {
      const [{ data: father }, { data: mother }, { data: r }, { data: p }] = await Promise.all([
        l.father_id ? supabase.from("beetle_parents").select("name").eq("id", l.father_id).maybeSingle() : Promise.resolve({ data: null }),
        l.mother_id ? supabase.from("beetle_parents").select("name").eq("id", l.mother_id).maybeSingle() : Promise.resolve({ data: null }),
        supabase.from("beetle_weights").select("*").eq("larva_id", larvaId).order("measured_date"),
        supabase.from("beetle_photos").select("*").eq("larva_id", larvaId).order("created_at", { ascending: false }),
      ]);
      setFatherName(father?.name ?? "不明");
      setMotherName(mother?.name ?? "不明");
      setRecords(
        (r ?? []).map((rec) => ({
          ...rec,
          days: Math.floor(
            (new Date(rec.measured_date + "T00:00:00").getTime() - new Date(l.hatch_date + "T00:00:00").getTime()) / 86400000
          ),
        }))
      );
      setPhotos(p ?? []);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [larvaId]);

  const addPhoto = async (blob: Blob) => {
    const path = `beetle/${larvaId}-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg" });
    if (error) return;
    const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    await supabase.from("beetle_photos").insert({ larva_id: larvaId, photo_url: pub.publicUrl });
    load();
  };

  if (!larva) return null;

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopBar title={larva.name} subtitle={`Beetle / ${larva.species}`} backHref="/beetle/overview" accent="#3F5D3A" />
      <div className="px-5 pt-5">
        <Card className="p-4 flex items-center gap-3">
          <StampBadge n={larva.id} color="#3F5D3A" />
          <div className="text-[13px]">
            <div>孵化日：{fmtDate(larva.hatch_date)}</div>
            <div className="opacity-60">
              父：{fatherName} ／ 母：{motherName}
            </div>
          </div>
        </Card>

        <Card className="p-4 mt-4">
          <div className="text-[12px] opacity-60 mb-2 font-mono uppercase">成長グラフ</div>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={records} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#D9CFB4" strokeDasharray="3 3" />
                <XAxis dataKey="days" tick={{ fontSize: 10 }} unit="日" />
                <YAxis dataKey="weight_g" tick={{ fontSize: 10 }} unit="g" width={45} />
                <Tooltip />
                <Line type="monotone" dataKey="weight_g" stroke="#3F5D3A" strokeWidth={2.2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="mt-4">
          <div className="text-[12px] opacity-60 mb-2 font-mono uppercase">体重記録一覧</div>
          <Card className="divide-y divide-line">
            {records
              .slice()
              .reverse()
              .map((r) => (
                <div key={r.id} className="flex justify-between px-4 py-3">
                  <div className="text-[13px] opacity-60">
                    {fmtDate(r.measured_date)}（{r.days}日目）
                  </div>
                  <div className="font-mono font-medium">{r.weight_g.toFixed(2)} g</div>
                </div>
              ))}
          </Card>
        </div>

        <div className="mt-4">
          <div className="text-[12px] opacity-60 mb-2 font-mono uppercase">写真</div>
          <PhotoPicker onPick={addPhoto} />
          <div className="grid grid-cols-3 gap-2 mt-3">
            {photos.map((p) => (
              <div key={p.id} className="aspect-square rounded-lg overflow-hidden border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.photo_url} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
            {photos.length === 0 && <div className="col-span-3 text-[13px] opacity-50 text-center py-4">まだ写真がありません</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
