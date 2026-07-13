"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Card, TopBar, Field, inputClass } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { todayStr, fmtDate } from "@/lib/utils";
import type { BeetleLarva, BeetleWeight } from "@/lib/types";

export default function BeetleWeightPage() {
  const [larvae, setLarvae] = useState<BeetleLarva[]>([]);
  const [larvaId, setLarvaId] = useState<number | null>(null);
  const [date, setDate] = useState(todayStr());
  const [weight, setWeight] = useState("");
  const [saved, setSaved] = useState(false);
  const [recent, setRecent] = useState<BeetleWeight[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("beetle_larvae").select("*").order("id");
      setLarvae(data ?? []);
      if (data && data.length > 0) setLarvaId(data[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!larvaId) return;
    (async () => {
      const { data } = await supabase
        .from("beetle_weights")
        .select("*")
        .eq("larva_id", larvaId)
        .order("measured_date", { ascending: false })
        .limit(5);
      setRecent(data ?? []);
    })();
  }, [larvaId, saved]);

  const submit = async () => {
    if (!larvaId || !date || !weight) return;
    await supabase.from("beetle_weights").upsert(
      { larva_id: larvaId, measured_date: date, weight_g: Math.round(parseFloat(weight) * 100) / 100 },
      { onConflict: "larva_id,measured_date" }
    );
    setWeight("");
    setSaved((v) => !v);
  };

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopBar title="ウェイトログ" subtitle="Beetle / Weight" backHref="/beetle" accent="#3F5D3A" />
      <div className="px-5 pt-5">
        <Card className="p-5">
          <Field label="幼虫の名前 *">
            <select className={inputClass} value={larvaId ?? ""} onChange={(e) => setLarvaId(Number(e.target.value))}>
              {larvae.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}（{l.species}）
                </option>
              ))}
            </select>
          </Field>
          <Field label="計測日 *">
            <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="体重（g）*">
            <input
              className={inputClass}
              type="number"
              step="0.01"
              placeholder="例）85.30"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </Field>
          <button
            onClick={submit}
            className="w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 bg-beetleAccent"
          >
            <Plus size={16} /> 記録する
          </button>
        </Card>

        <div className="mt-6">
          <div className="text-[12px] opacity-60 mb-2 font-mono uppercase">この幼虫の直近記録</div>
          <Card className="divide-y divide-line">
            {recent.length === 0 && <div className="px-4 py-3 text-[13px] opacity-50">記録がありません</div>}
            {recent.map((r) => (
              <div key={r.id} className="flex justify-between px-4 py-3">
                <div className="text-[13px] opacity-60">{fmtDate(r.measured_date)}</div>
                <div className="font-mono font-medium">{r.weight_g.toFixed(2)} g</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
