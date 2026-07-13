"use client";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Camera } from "lucide-react";
import { compressImage } from "@/lib/compressImage";

export function TopBar({
  title,
  subtitle,
  backHref,
  accent = "#26241E",
}: {
  title: string;
  subtitle: string;
  backHref?: string;
  accent?: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-4 sticky top-0 z-20 border-b border-line"
      style={{ background: "#F5F1E6ee", backdropFilter: "blur(6px)" }}
    >
      {backHref && (
        <Link
          href={backHref}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-paperDeep"
        >
          <ArrowLeft size={18} />
        </Link>
      )}
      <div className="min-w-0">
        <div
          className="text-[11px] tracking-[0.2em] uppercase font-mono opacity-75"
          style={{ color: accent }}
        >
          {subtitle}
        </div>
        <div className="font-serif text-xl leading-tight truncate font-bold">{title}</div>
      </div>
    </div>
  );
}

export function Card({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl bg-[#FFFDF8] border border-line shadow-sm ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function StampBadge({ n, color }: { n: number; color: string }) {
  return (
    <span
      className="font-mono text-[10px] px-2 py-0.5 rounded-full border"
      style={{ borderColor: color, color }}
    >
      No.{String(n).padStart(3, "0")}
    </span>
  );
}

export function MenuRow({
  icon: Icon,
  label,
  sub,
  href,
  accent,
}: {
  icon: any;
  label: string;
  sub: string;
  href: string;
  accent: string;
}) {
  return (
    <Link href={href} className="w-full flex items-center gap-3 px-4 py-4 text-left border-b border-line last:border-b-0">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent + "22", color: accent }}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[15px]">{label}</div>
        <div className="text-[12px] opacity-60">{sub}</div>
      </div>
      <ChevronRight size={16} className="opacity-40 shrink-0" />
    </Link>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <div className="text-[12px] mb-1.5 opacity-60 font-mono uppercase tracking-wide">{label}</div>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full px-3 py-2.5 rounded-[10px] border border-line bg-[#FFFDF8] text-[15px] outline-none";

export function PhotoPicker({ onPick }: { onPick: (blob: Blob) => void }) {
  return (
    <label className="flex flex-col items-center justify-center gap-2 rounded-2xl cursor-pointer border-[1.5px] border-dashed border-line py-7 px-4 opacity-75">
      <Camera size={22} />
      <span className="text-[13px]">写真を選ぶ</span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const compressed = await compressImage(file);
            onPick(compressed);
          } catch {
            onPick(file);
          }
          e.target.value = "";
        }}
      />
    </label>
  );
}
