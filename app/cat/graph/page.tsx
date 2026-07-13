"use client";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Sparkles } from "lucide-react";
import { Card, TopBar } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { fmtDate, fmtDateShort, ageMonthsDays, weightComment } from "@/lib/utils";
import type { CatWeight, CatProfile } from "@/lib/types";

export default function CatGraphPage() {
  const [weights, setWeights] = useState<CatWeight[]>([]);
  const [profile, setProfile] = useState<CatProfile | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: w }, { data: p }] = await Promise.all([
        supabase.from("cat_weights").select("*").order("measured_date", { ascending: true }),
        supabase.from("cat_profile").select("*").limit(1).maybeSingle(),
      ]);
      setWeights(w ?? []);
      setProfile(p ?? null);
    })();
  }, []);

  const chartData = useMemo(
    () => weights.map((w) => ({ date: fmtDateShort(w.measured_date), weight: w.weight_kg })),
    [weights]
  );
  const latest = weights[weights.length - 1];
  const months = profile ? ageMonthsDays(profile.birthday).months : 0;
  const comment = latest ? weightComment(latest.weight_kg, months) : null;

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopBar title="グロースチャート" subtitle="Cat / Growth" backHref="/cat" accent="#C1694F" />
      <div className="px-5 pt-5">
        <Card className="p-4">
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#D9CFB4" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="kg" width={50} />
                <Tooltip formatter={(v: any) => [`${v} kg`, "体重"]} />
                <Line type="monotone" dataKey="weight" stroke="#C1694F" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {comment && latest && (
          <Card className="p-5 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} color="#C1694F" />
              <span className="text-[11px] font-mono uppercase tracking-wide text-catAccent">AI コメント</span>
            </div>
            <div className="font-serif text-lg mb-1 font-bold text-catAccent">{comment.verdict}</div>
            <p className="text-[13px] leading-relaxed opacity-80">
              現在 生後{months}ヶ月・体重{latest.weight_kg.toFixed(2)}kg。ラグドール(オス)の同月齢平均の目安は約
              {comment.bench.toFixed(2)}kgのため、平均との差は{comment.diffPct > 0 ? "+" : ""}
              {comment.diffPct.toFixed(0)}%です。
            </p>
            <p className="text-[11px] opacity-50 mt-2">
              ※ 一般的な成長曲線をもとにした目安で個体差があります。健康状態は必ず獣医師にご相談ください。
            </p>
          </Card>
        )}

        <div className="mt-6">
          <div className="text-[12px] opacity-60 mb-2 font-mono uppercase">記録一覧</div>
          <Card className="divide-y divide-line max-h-72 overflow-y-auto scrollbar-thin">
            {weights
              .slice()
              .reverse()
              .map((w) => (
                <div key={w.id} className="flex justify-between px-4 py-3">
                  <div className="text-[13px] opacity-60">{fmtDate(w.measured_date)}</div>
                  <div className="font-mono">{w.weight_kg.toFixed(2)} kg</div>
                </div>
              ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
