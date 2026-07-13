"use client";
import { Scale, LineChart as LineChartIcon, Images } from "lucide-react";
import { Card, TopBar, MenuRow } from "@/components/ui";

export default function BeetleHome() {
  return (
    <div className="max-w-md mx-auto pb-10">
      <TopBar title="カブトムシラボ" subtitle="Beetle Lab" backHref="/" accent="#3F5D3A" />
      <div className="px-5 pt-5">
        <Card>
          <MenuRow icon={Scale} label="ウェイトログ" sub="幼虫の体重を記録する" accent="#3F5D3A" href="/beetle/weight" />
          <MenuRow icon={LineChartIcon} label="系図 & 成長記録" sub="全18匹の成長グラフと血統" accent="#3F5D3A" href="/beetle/overview" />
          <MenuRow icon={Images} label="フォトギャラリー" sub="幼虫・成虫の写真" accent="#3F5D3A" href="/beetle/album" />
        </Card>
      </div>
    </div>
  );
}
