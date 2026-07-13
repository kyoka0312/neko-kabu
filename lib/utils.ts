export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function fmtDate(s: string | null): string {
  if (!s) return "―";
  const d = new Date(s + "T00:00:00");
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function fmtDateShort(s: string): string {
  const d = new Date(s + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function daysBetween(from: string, to: string): number {
  return Math.floor(
    (new Date(to + "T00:00:00").getTime() - new Date(from + "T00:00:00").getTime()) / 86400000
  );
}

export function ageMonthsDays(birthday: string | null): { months: number; days: number } {
  if (!birthday) return { months: 0, days: 0 };
  const b = new Date(birthday + "T00:00:00");
  const n = new Date();
  let months = (n.getFullYear() - b.getFullYear()) * 12 + (n.getMonth() - b.getMonth());
  let days = n.getDate() - b.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(n.getFullYear(), n.getMonth(), 0);
    days += prevMonth.getDate();
  }
  return { months, days };
}

// ラグドール・オスの月齢別平均体重の目安（一般的な目安・個体差あり、kg）
const RAGDOLL_MALE_BENCHMARK: [number, number][] = [
  [0, 0.11], [1, 0.6], [2, 1.2], [3, 1.9], [4, 2.6], [5, 3.3],
  [6, 3.9], [9, 5.3], [12, 6.3], [18, 7.3], [24, 8.0], [36, 8.3],
];

export function interpolateBenchmark(months: number): number {
  const t = RAGDOLL_MALE_BENCHMARK;
  if (months <= t[0][0]) return t[0][1];
  if (months >= t[t.length - 1][0]) return t[t.length - 1][1];
  for (let i = 0; i < t.length - 1; i++) {
    const [m0, w0] = t[i];
    const [m1, w1] = t[i + 1];
    if (months >= m0 && months <= m1) {
      const ratio = (months - m0) / (m1 - m0);
      return w0 + (w1 - w0) * ratio;
    }
  }
  return t[t.length - 1][1];
}

// カブトムシ幼虫の孵化後日数別の平均体重の目安（一般的な飼育記録に基づく目安、g）。
// 雌雄でかなり差があるため、オス・メス込みのざっくりした平均値。
const BEETLE_BENCHMARKS: Record<string, [number, number][]> = {
  ヘラクレスオオカブト: [
    [0, 0.5], [30, 3], [60, 10], [90, 18], [120, 28], [180, 45],
    [240, 60], [300, 72], [365, 82], [450, 92], [540, 97],
  ],
  エレファスゾウカブト: [
    [0, 0.5], [30, 5], [60, 12], [90, 22], [120, 35], [180, 60],
    [240, 85], [300, 105], [365, 120], [450, 135], [540, 145],
  ],
};

function interpolateTable(table: [number, number][], x: number): number {
  if (x <= table[0][0]) return table[0][1];
  if (x >= table[table.length - 1][0]) return table[table.length - 1][1];
  for (let i = 0; i < table.length - 1; i++) {
    const [x0, y0] = table[i];
    const [x1, y1] = table[i + 1];
    if (x >= x0 && x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return table[table.length - 1][1];
}

// カブトムシ幼虫の成長コメント：
// 孵化からD日目の体重を、その種の一般的な平均体重の目安と比較する。
// 目安データが無い種は null。
export function beetleGrowthComment(
  species: string,
  targetDay: number,
  targetWeightG: number
): { bench: number; diffPct: number; verdict: string } | null {
  const table = BEETLE_BENCHMARKS[species];
  if (!table) return null;
  const bench = interpolateTable(table, targetDay);
  const diffPct = ((targetWeightG - bench) / bench) * 100;
  let verdict: string;
  if (diffPct > 20) verdict = "平均より大きめに育っています";
  else if (diffPct < -20) verdict = "平均よりやや小さめです";
  else verdict = "順調に育っています（ほぼ平均的）";
  return { bench, diffPct, verdict };
}

export function weightComment(latestWeightKg: number, months: number) {
  const bench = interpolateBenchmark(months);
  const diffPct = ((latestWeightKg - bench) / bench) * 100;
  let verdict: string;
  if (diffPct > 12) verdict = "平均よりやや重め";
  else if (diffPct < -12) verdict = "平均よりやや軽め";
  else verdict = "ほぼ平均的な体重";
  return { bench, verdict, diffPct };
}
