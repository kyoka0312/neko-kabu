"use client";
import { useEffect, useState } from "react";
import { Cat } from "lucide-react";
import { Card, TopBar, PhotoPicker } from "@/components/ui";
import { supabase, PHOTO_BUCKET } from "@/lib/supabase";
import { fmtDate, ageMonthsDays } from "@/lib/utils";
import type { CatProfile } from "@/lib/types";

export default function CatProfilePage() {
  const [profile, setProfile] = useState<CatProfile | null>(null);
  const [editPhoto, setEditPhoto] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("cat_profile").select("*").limit(1).maybeSingle();
    setProfile(data);
  };
  useEffect(() => {
    load();
  }, []);

  const uploadPhoto = async (blob: Blob) => {
    if (!profile) return;
    const path = `cat/profile-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg" });
    if (error) return;
    const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    await supabase.from("cat_profile").update({ photo_url: pub.publicUrl }).eq("id", profile.id);
    setEditPhoto(false);
    load();
  };

  if (!profile) {
    return (
      <div className="max-w-md mx-auto pb-10">
        <TopBar title="プロフィール" subtitle="Cat / Profile" backHref="/cat" accent="#C1694F" />
        <div className="px-5 pt-8 text-[13px] opacity-60">
          まだ cat_profile テーブルにデータがありません。Supabaseの Table Editor から1行登録してください。
        </div>
      </div>
    );
  }

  const { months, days } = ageMonthsDays(profile.birthday);
  const rows: [string, string][] = [
    ["性別", profile.sex ?? "―"],
    ["猫種", profile.breed ?? "―"],
    ["カラー（色柄）", profile.color ?? "―"],
    ["誕生日", fmtDate(profile.birthday)],
    ["お迎え日", fmtDate(profile.arrival_date)],
    ["お父さん", profile.father_info ?? "―"],
    ["お母さん", profile.mother_info ?? "―"],
    ["最後のワクチン接種日", fmtDate(profile.last_vaccine_date)],
    ["マイクロチップ番号", profile.microchip_no ?? "―"],
    ["かかりつけ動物病院", profile.vet_clinic ?? "―"],
    ["去勢・避妊", profile.neutered == null ? "―" : profile.neutered ? "済み" : "未実施"],
    ["フード・アレルギー", profile.allergy_note ?? "―"],
    ["性格・好きなこと", profile.personality_note ?? "―"],
  ];

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopBar title="プロフィール" subtitle="Cat / Profile" backHref="/cat" accent="#C1694F" />
      <div className="px-5 pt-5">
        <Card className="p-5 flex flex-col items-center text-center">
          <div
            className="w-28 h-28 rounded-2xl overflow-hidden mb-3 flex items-center justify-center bg-catAccentSoft cursor-pointer"
            onClick={() => setEditPhoto((v) => !v)}
          >
            {profile.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo_url} className="w-full h-full object-cover" alt={profile.name} />
            ) : (
              <Cat size={40} color="#C1694F" />
            )}
          </div>
          {editPhoto && (
            <div className="mb-3">
              <PhotoPicker onPick={uploadPhoto} />
            </div>
          )}
          <div className="font-serif text-2xl font-bold">{profile.name}</div>
          <div className="mt-2 px-3 py-1 rounded-full text-[12px] font-mono bg-catAccentSoft text-catAccent">
            生後 {months}ヶ月{days}日
          </div>
        </Card>

        <Card className="mt-4 divide-y divide-line">
          {rows.map(([label, val]) => (
            <div key={label} className="flex justify-between px-4 py-3">
              <div className="text-[13px] opacity-60">{label}</div>
              <div className="text-[14px] font-medium text-right max-w-[60%]">{val}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
