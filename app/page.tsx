import Link from "next/link";
import { Cat, Bug, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui";

export default function Home() {
  return (
    <div className="max-w-md mx-auto pb-10">
      <div className="px-6 pt-10 pb-6">
        <div className="text-[11px] tracking-[0.25em] uppercase font-mono opacity-50">Family Log</div>
        <h1 className="font-serif text-3xl mt-1 font-bold">うちの子ノート</h1>
        <p className="text-[13px] opacity-60 mt-1">体重・プロフィール・写真をまとめて記録</p>
      </div>

      <div className="px-6 flex flex-col gap-4">
        <Link href="/cat">
          <Card className="p-5 active:scale-[0.99] transition-transform" style={{ borderColor: "#C1694F55" }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-catAccentSoft text-catAccent">
                <Cat size={26} />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-mono uppercase tracking-wide text-catAccent">Cat Room</div>
                <div className="font-serif text-lg font-bold">ねこの部屋</div>
                <div className="text-[12px] opacity-60">体重・プロフィール・アルバム</div>
              </div>
              <ChevronRight size={18} className="opacity-40" />
            </div>
          </Card>
        </Link>

        <Link href="/beetle">
          <Card className="p-5 active:scale-[0.99] transition-transform" style={{ borderColor: "#3F5D3A55" }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-beetleAccentSoft text-beetleAccent">
                <Bug size={26} />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-mono uppercase tracking-wide text-beetleAccent">Beetle Lab</div>
                <div className="font-serif text-lg font-bold">カブトムシラボ</div>
                <div className="text-[12px] opacity-60">幼虫18匹の系図と成長記録</div>
              </div>
              <ChevronRight size={18} className="opacity-40" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
