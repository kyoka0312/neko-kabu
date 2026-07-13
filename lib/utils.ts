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

// カブトムシ幼虫の成長コメント：
// 対象個体の最新計測（孵化からD日目）について、同種のほかの幼虫の
// 体重系列を各個体の孵化日基準で線形補間してD日目の推定体重を求め、
// その平均と比較する。比較できる個体が2匹未満なら null。
export function beetleGrowthComment(
  targetDay: number,
  targetWeightG: number,
  peers: { days: number; weight_g: number }[][]
): { avg: number; diffPct: number; verdict: string; count: number } | null {
  const estimates: number[] = [];
  for (const series of peers) {
    const sorted = series.slice().sort((a, b) => a.days - b.days);
    if (sorted.length === 0) continue;
    if (targetDay < sorted[0].days || targetDay > sorted[sorted.length - 1].days) continue;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].days === targetDay) {
        estimates.push(Number(sorted[i].weight_g));
        break;
      }
      if (i < sorted.length - 1 && sorted[i].days < targetDay && targetDay < sorted[i + 1].days) {
        const ratio = (targetDay - sorted[i].days) / (sorted[i + 1].days - sorted[i].days);
        estimates.push(
          Number(sorted[i].weight_g) + (Number(sorted[i + 1].weight_g) - Number(sorted[i].weight_g)) * ratio
        );
        break;
      }
    }
  }
  if (estimates.length < 2) return null;
  const avg = estimates.reduce((s, v) => s + v, 0) / estimates.length;
  const diffPct = ((targetWeightG - avg) / avg) * 100;
  let verdict: string;
  if (diffPct > 15) verdict = "平均より大きめに育っています";
  else if (diffPct < -15) verdict = "平均より小さめです";
  else verdict = "順調に育っています（ほぼ平均的）";
  return { avg, diffPct, verdict, count: estimates.length };
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
