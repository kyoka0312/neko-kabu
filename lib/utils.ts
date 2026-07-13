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

export function weightComment(latestWeightKg: number, months: number) {
  const bench = interpolateBenchmark(months);
  const diffPct = ((latestWeightKg - bench) / bench) * 100;
  let verdict: string;
  if (diffPct > 12) verdict = "平均よりやや重め";
  else if (diffPct < -12) verdict = "平均よりやや軽め";
  else verdict = "ほぼ平均的な体重";
  return { bench, verdict, diffPct };
}
