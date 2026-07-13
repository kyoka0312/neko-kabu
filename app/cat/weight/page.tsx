"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Card, TopBar, Field, inputClass } from "@/components/ui";
import { supabase, supabaseConfigError } from "@/lib/supabase";
import { todayStr, fmtDate } from "@/lib/utils";
import type { CatWeight } from "@/lib/types";

export default function CatWeightPage() {
  const [date, setDate] = useState(todayStr());
  const [weight, setWeight] = useState("");
  const [memo, setMemo] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [recent, setRecent] = useState<CatWeight[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (supabaseConfigError) {
      setSaveError(supabaseConfigError);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("cat_weights")
        .select("*")
        .order("measured_date", { ascending: false })
        .limit(6);
      if (error) throw error;
      setRecent(data ?? []);
    } catch (e: any) {
      setSaveError(`データの取得に失敗しました：${e?.message ?? String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!date || !weight) return;
    if (supabaseConfigError) {
      setSaveError(supabaseConfigError);
      return;
    }
    setSaveError(null);
    try {
      const { error } = await supabase.from("cat_weights").upsert(
        { measured_date: date, weight_kg: Math.round(parseFloat(weight) * 100) / 100, memo: memo || null },
        { onConflict: "measured_date" }
      );
      if (error) throw error;
    } catch (e: any) {
      setSaveError(`保存に失敗しました：${e?.message ?? String(e)}`);
      return;
    }
    setWeight("");
    setMemo("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    load();
  };

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopBar title="ウェイトログ" subtitle="Cat / Weight" backHref="/cat" accent="#C1694F" />
      <div className="px-5 pt-5">
        <Card className="p-5">
          <Field label="計測日 *">
            <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="体重（kg）*">
            <input
              className={inputClass}
              type="number"
              step="0.01"
              placeholder="例）5.32"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </Field>
          <Field label="メモ（任意）">
            <textarea
              className={inputClass}
              style={{ minHeight: 70 }}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="体調や様子など"
            />
          </Field>
          <button
            onClick={submit}
            className="w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 bg-catAccent"
          >
            <Plus size={16} /> 記録する
          </button>
          {saved && <div className="text-center text-[13px] mt-3 text-catAccent">保存しました</div>}
          {saveError && <div className="text-center text-[13px] mt-3 text-red-600">{saveError}</div>}
        </Card>

        <div className="mt-6">
          <div className="text-[12px] opacity-60 mb-2 font-mono uppercase">直近の記録</div>
          <Card className="divide-y divide-line">
            {!loading && recent.length === 0 && <div className="px-4 py-3 text-[13px] opacity-50">記録がありません</div>}
            {recent.map((w) => (
              <div key={w.id} className="flex justify-between items-center px-4 py-3">
                <div>
                  <div className="text-[13px] opacity-60">{fmtDate(w.measured_date)}</div>
                  {w.memo && <div className="text-[12px] opacity-50">{w.memo}</div>}
                </div>
                <div className="font-mono font-medium">{Number(w.weight_kg).toFixed(2)} kg</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
