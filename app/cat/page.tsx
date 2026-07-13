"use client";
import { useEffect, useState } from "react";
import { Cat, Scale, User, LineChart as LineChartIcon, Images } from "lucide-react";
import { Card, TopBar, MenuRow } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import type { CatProfile } from "@/lib/types";

export default function CatHome() {
  const [profile, setProfile] = useState<CatProfile | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("cat_profile").select("*").limit(1).maybeSingle();
      setProfile(data);
    })();
  }, []);

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopBar title="ねこの部屋" subtitle="Cat Room" backHref="/" accent="#C1694F" />
      <div className="px-5 pt-5">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-catAccentSoft">
            {profile?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo_url} alt="cat" className="w-full h-full object-cover" />
            ) : (
              <Cat size={28} color="#C1694F" />
            )}
          </div>
          <div>
            <div className="font-serif text-lg font-bold">{profile?.name ?? "未登録"}</div>
            <div className="text-[12px] opacity-60">
              {profile?.breed ?? ""} ・ {profile?.color ?? ""}
            </div>
          </div>
        </Card>
      </div>
      <div className="px-5 pt-5">
        <Card>
          <MenuRow icon={Scale} label="ウェイトログ" sub="体重を記録する" accent="#C1694F" href="/cat/weight" />
          <MenuRow icon={User} label="プロフィール" sub="基本情報・親の情報" accent="#C1694F" href="/cat/profile" />
          <MenuRow icon={LineChartIcon} label="グロースチャート" sub="成長グラフとAIコメント" accent="#C1694F" href="/cat/graph" />
          <MenuRow icon={Images} label="フォトアルバム" sub="思い出の写真" accent="#C1694F" href="/cat/album" />
        </Card>
      </div>
    </div>
  );
}
