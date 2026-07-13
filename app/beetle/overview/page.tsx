"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { User, X } from "lucide-react";
import { Card, TopBar, StampBadge } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { fmtDate } from "@/lib/utils";
import type { BeetleLarva, BeetleParent, BeetleWeight } from "@/lib/types";

const LINE_COLORS = [
  "#3F5D3A", "#B8862E", "#8B5A8C", "#4477AA", "#C1694F", "#7A9E4F", "#A65A2E", "#5B7A99",
  "#9C5B5B", "#5E8B7E", "#8A7A3E", "#6B5B8A", "#4E8A6B", "#B0703C", "#5B7A5E", "#7A5B6B",
  "#3E6B8A", "#8A6B3E",
];

export default function BeetleOverviewPage() {
  const [larvae, setLarvae] = useState<BeetleLarva[]>([]);
  const [parents, setParents] = useState<BeetleParent[]>([]);
  const [records, setRecords] = useState<BeetleWeight[]>([]);
  const [speciesFilter, setSpeciesFilter] = useState("ヘラクレスオオカブト");
  const [parentModal, setParentModal] = useState<BeetleParent | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: l }, { data: p }, { data: r }] = await Promise.all([
        supabase.from("beetle_larvae").select("*").order("id"),
        supabase.from("beetle_parents").select("*").order("id"),
        supabase.from("beetle_weights").select("*"),
      ]);
      setLarvae(l ?? []);
      setParents(p ?? []);
      setRecords(r ?? []);
    })();
  }, []);

  const larvaeBySpecies = useMemo(() => larvae.filter((l) => l.species === speciesFilter), [larvae, speciesFilter]);

  const larvaHatch = useMemo(() => Object.fromEntries(larvae.map((l) => [l.id, l.hatch_date])), [larvae]);

  const chartData = useMemo(() => {
    const byDay: Record<number, any> = {};
    records
      .filter((r) => larvaeBySpecies.some((l) => l.id === r.larva_id))
      .forEach((r) => {
        const hatch = larvaHatch[r.larva_id];
        if (!hatch) return;
        const days = Math.floor(
          (new Date(r.measured_date + "T00:00:00").getTime() - new Date(hatch + "T00:00:00").getTime()) / 86400000
        );
        const larvaName = larvae.find((l) => l.id === r.larva_id)?.name ?? "";
        if (!byDay[days]) byDay[days] = { days };
        byDay[days][larvaName] = r.weight_g;
      });
    return Object.values(byDay).sort((a: any, b: any) => a.days - b.days);
  }, [records, larvaeBySpecies, larvaHatch, larvae]);

  const families = useMemo(() => {
    const map: Record<string, { father: BeetleParent | undefined; mother: BeetleParent | undefined; children: BeetleLarva[] }> = {};
    larvaeBySpecies.forEach((l) => {
      const key = `${l.father_id}__${l.mother_id}`;
      if (!map[key]) {
        map[key] = {
          father: parents.find((p) => p.id === l.father_id),
          mother: parents.find((p) => p.id === l.mother_id),
          children: [],
        };
      }
      map[key].children.push(l);
    });
    return Object.values(map);
  }, [larvaeBySpecies, parents]);

  const speciesList = ["ヘラクレスオオカブト", "エレファスゾウカブト", "不明"];

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopBar title="系図 & 成長記録" subtitle="Beetle / Genealogy" backHref="/beetle" accent="#3F5D3A" />
      <div className="px-5 pt-5">
        <div className="flex gap-2 mb-4">
          {speciesList.map((s) => (
            <button
              key={s}
              onClick={() => setSpeciesFilter(s)}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium border border-beetleAccent"
              style={{
                background: speciesFilter === s ? "#3F5D3A" : "transparent",
                color: speciesFilter === s ? "#fff" : "#26241E",
              }}
            >
              {s === "不明" ? "その他" : s}
            </button>
          ))}
        </div>

        <Card className="p-4">
          <div className="text-[12px] opacity-60 mb-2 font-mono uppercase">体重推移（孵化日からの経過日数）</div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#D9CFB4" strokeDasharray="3 3" />
                <XAxis dataKey="days" tick={{ fontSize: 10 }} unit="日" />
                <YAxis tick={{ fontSize: 10 }} unit="g" width={45} />
                <Tooltip />
                {larvaeBySpecies.map((l, i) => (
                  <Line
                    key={l.id}
                    type="monotone"
                    dataKey={l.name}
                    stroke={LINE_COLORS[i % LINE_COLORS.length]}
                    strokeWidth={1.8}
                    dot={{ r: 2 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="mt-6">
          <div className="text-[12px] opacity-60 mb-3 font-mono uppercase">家系図</div>
          <div className="flex flex-col gap-4">
            {families.map((fam, fi) => (
              <Card key={fi} className="p-4">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <button
                    onClick={() => fam.father && setParentModal(fam.father)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1 bg-beetleAccentSoft text-beetleAccent"
                  >
                    <User size={12} /> {fam.father?.name ?? "不明"}
                  </button>
                  <span className="opacity-40 text-[12px]">×</span>
                  <button
                    onClick={() => fam.mother && setParentModal(fam.mother)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1 bg-catAccentSoft text-catAccent"
                  >
                    <User size={12} /> {fam.mother?.name ?? "不明"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fam.children.map((c) => (
                    <Link
                      key={c.id}
                      href={`/beetle/${c.id}`}
                      className="px-3 py-2 rounded-xl text-[13px] flex items-center gap-1.5 bg-[#FFFDF8] border border-line"
                    >
                      <StampBadge n={c.id} color="#3F5D3A" />
                      {c.name}
                    </Link>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {parentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={() => setParentModal(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
            <Card className="p-5 m-3 rounded-2xl">
              <div className="flex justify-between items-start mb-3">
                <div className="font-serif text-xl font-bold">{parentModal.name}</div>
                <button onClick={() => setParentModal(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-2 text-[13px]">
                <Row label="種類" value={parentModal.species} />
                <Row label="性別" value={parentModal.sex ?? "―"} />
                <Row label="羽化日" value={fmtDate(parentModal.emerge_date)} />
                <Row label="お迎えした日" value={fmtDate(parentModal.arrival_date)} />
                {parentModal.first_feed_date && <Row label="後食開始日" value={fmtDate(parentModal.first_feed_date)} />}
                {parentModal.death_date && <Row label="星になった日" value={fmtDate(parentModal.death_date)} />}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="opacity-60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
