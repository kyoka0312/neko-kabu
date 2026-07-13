"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Sparkles } from "lucide-react";
import { Card, TopBar, StampBadge, PhotoPicker } from "@/components/ui";
import { supabase, PHOTO_BUCKET } from "@/lib/supabase";
import { fmtDate, daysBetween, beetleGrowthComment } from "@/lib/utils";
import type { BeetleLarva, BeetleWeight, BeetlePhoto } from "@/lib/types";

export default function BeetleDetailPage({ params }: { params: { id: string } }) {
  const larvaId = Number(params.id);
  const [larva, setLarva] = useState<BeetleLarva | null>(null);
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [records, setRecords] = useState<(BeetleWeight & { days: number })[]>([]);
  const [photos, setPhotos] = useState<BeetlePhoto[]>([]);
  const [peerSeries, setPeerSeries] = useState<{ days: number; weight_g: number }[][]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const { data: l, error: lErr } = await supabase
        .from("beetle_larvae")
        .select("*")
        .eq("id", larvaId)
        .maybeSingle();
      if (lErr) throw lErr;
      setLarva(l);
      if (!l) return;
      const [{ data: father }, { data: mother }, { data: r }, { data: p }, { data: peers }] = await Promise.all([
        l.father_id ? supabase.from("beetle_parents").select("name").eq("id", l.father_id).maybeSingle() : Promise.resolve({ data: null }),
        l.mother_id ? supabase.from("beetle_parents").select("name").eq("id", l.mother_id).maybeSingle() : Promise.resolve({ data: null }),
        supabase.from("beetle_weights").select("*").eq("larva_id", larvaId).order("measured_date"),
        supabase.from("beetle_photos").select("*").eq("larva_id", larvaId).order("created_at", { ascending: false }),
        supabase.from("beetle_larvae").select("id,hatch_date").eq("species", l.species).neq("id", larvaId),
      ]);
      setFatherName(father?.name ?? "不明");
      setMotherName(mother?.name ?? "不明");
      setRecords(
        (r ?? []).map((rec) => ({
          ...rec,
          days: daysBetween(l.hatch_date, rec.measured_date),
        }))
      );
      setPhotos(p ?? []);

      // 同じ種類のほかの幼虫の体重系列（各個体の孵化日基準の経過日数）を集める
      const peerList = peers ?? [];
      if (peerList.length > 0) {
        const { data: pw } = await supabase
          .from("beetle_weights")
          .select("larva_id,measured_date,weight_g")
          .in("larva_id", peerList.map((x) => x.id));
        const hatchById = Object.fromEntries(peerList.map((x) => [x.id, x.hatch_date]));
        const grouped: Record<number, { days: number; weight_g: number }[]> = {};
        (pw ?? []).forEach((w) => {
          const hatch = hatchById[w.larva_id];
          if (!hatch) return;
          (grouped[w.larva_id] ??= []).push({ days: daysBetween(hatch, w.measured_date), weight_g: Number(w.weight_g) });
        });
        setPeerSeries(Object.values(grouped));
      } else {
        setPeerSeries([]);
      }
    } catch (e: any) {
      setError(`データの取得に失敗しました：${e?.message ?? String(e)}`);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [larvaId]);

  const addPhoto = async (blob: Blob) => {
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
    load();
  };

  const latest = records[records.length - 1];
  const comment = latest ? beetleGrowthComment(latest.days, Number(latest.weight_g), peerSeries) : null;

  if (!larva) {
    return (
      <div className="max-w-md mx-auto pb-10">
        <TopBar title="個体詳細" subtitle="Beetle" backHref="/beetle/overview" accent="#3F5D3A" />
        {error && (
          <div className="px-5 pt-5">
            <Card className="p-4 border-red-300">
              <div className="text-[13px] text-red-600">{error}</div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopBar title={larva.name} subtitle={`Beetle / ${larva.species}`} backHref="/beetle/overview" accent="#3F5D3A" />
      <div className="px-5 pt-5">
        {error && (
          <Card className="p-4 mb-4 border-red-300">
            <div className="text-[13px] text-red-600">{error}</div>
          </Card>
        )}
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

        {latest && (
          <Card className="p-5 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} color="#3F5D3A" />
              <span className="text-[11px] font-mono uppercase tracking-wide text-beetleAccent">AI コメント</span>
            </div>
            {comment ? (
              <>
                <div className="font-serif text-lg mb-1 font-bold text-beetleAccent">{comment.verdict}</div>
                <p className="text-[13px] leading-relaxed opacity-80">
                  孵化から{latest.days}日目・体重{Number(latest.weight_g).toFixed(1)}g。同じ{larva.species}
                  のほかの子たち（{comment.count}匹）の{latest.days}日目時点の平均はおよそ
                  {comment.avg.toFixed(1)}gのため、平均との差は{comment.diffPct > 0 ? "+" : ""}
                  {comment.diffPct.toFixed(0)}%です。
                </p>
                <p className="text-[11px] opacity-50 mt-2">
                  ※ この家の同じ種類の幼虫の記録をもとにした比較です。個体差・雌雄差があります。
                </p>
              </>
            ) : (
              <p className="text-[13px] leading-relaxed opacity-60">
                同じ時期に比較できる同種の記録がまだ足りないため、平均との比較コメントは表示できません。
              </p>
            )}
          </Card>
        )}

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
                  <div className="font-mono font-medium">{Number(r.weight_g).toFixed(2)} g</div>
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
