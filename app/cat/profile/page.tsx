"use client";
import { useEffect, useState } from "react";
import { Cat, Pencil, Camera } from "lucide-react";
import { Card, TopBar, Field, inputClass, PhotoPicker } from "@/components/ui";
import { supabase, supabaseConfigError, PHOTO_BUCKET } from "@/lib/supabase";
import { fmtDate, ageMonthsDays } from "@/lib/utils";
import type { CatProfile } from "@/lib/types";

// フォームの入力値（空文字は保存時に null へ変換する）
type ProfileForm = {
  name: string;
  sex: string;
  breed: string;
  color: string;
  birthday: string;
  arrival_date: string;
  father_info: string;
  mother_info: string;
  last_vaccine_date: string;
  microchip_no: string;
  vet_clinic: string;
  neutered: string; // "" | "true" | "false"
  allergy_note: string;
  personality_note: string;
};

const emptyForm: ProfileForm = {
  name: "",
  sex: "",
  breed: "",
  color: "",
  birthday: "",
  arrival_date: "",
  father_info: "",
  mother_info: "",
  last_vaccine_date: "",
  microchip_no: "",
  vet_clinic: "",
  neutered: "",
  allergy_note: "",
  personality_note: "",
};

function toForm(p: CatProfile): ProfileForm {
  return {
    name: p.name === "（未登録）" ? "" : p.name,
    sex: p.sex ?? "",
    breed: p.breed ?? "",
    color: p.color ?? "",
    birthday: p.birthday ?? "",
    arrival_date: p.arrival_date ?? "",
    father_info: p.father_info ?? "",
    mother_info: p.mother_info ?? "",
    last_vaccine_date: p.last_vaccine_date ?? "",
    microchip_no: p.microchip_no ?? "",
    vet_clinic: p.vet_clinic ?? "",
    neutered: p.neutered == null ? "" : String(p.neutered),
    allergy_note: p.allergy_note ?? "",
    personality_note: p.personality_note ?? "",
  };
}

function toRow(f: ProfileForm) {
  const nul = (s: string) => (s.trim() === "" ? null : s.trim());
  return {
    name: f.name.trim() || "（未登録）",
    sex: nul(f.sex),
    breed: nul(f.breed),
    color: nul(f.color),
    birthday: nul(f.birthday),
    arrival_date: nul(f.arrival_date),
    father_info: nul(f.father_info),
    mother_info: nul(f.mother_info),
    last_vaccine_date: nul(f.last_vaccine_date),
    microchip_no: nul(f.microchip_no),
    vet_clinic: nul(f.vet_clinic),
    neutered: f.neutered === "" ? null : f.neutered === "true",
    allergy_note: nul(f.allergy_note),
    personality_note: nul(f.personality_note),
  };
}

export default function CatProfilePage() {
  const [profile, setProfile] = useState<CatProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [editPhoto, setEditPhoto] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof ProfileForm) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const load = async () => {
    if (supabaseConfigError) {
      setError(supabaseConfigError);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from("cat_profile").select("*").limit(1).maybeSingle();
      if (error) throw error;
      setProfile(data);
    } catch (e: any) {
      setError(`データの取得に失敗しました：${e?.message ?? String(e)}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const startEdit = () => {
    setForm(profile ? toForm(profile) : emptyForm);
    setError(null);
    setEditing(true);
  };

  const save = async () => {
    setError(null);
    try {
      const row = toRow(form);
      const q = profile
        ? supabase.from("cat_profile").update(row).eq("id", profile.id)
        : supabase.from("cat_profile").insert(row);
      const { error } = await q;
      if (error) throw error;
    } catch (e: any) {
      setError(`保存に失敗しました：${e?.message ?? String(e)}`);
      return;
    }
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    load();
  };

  const uploadPhoto = async (blob: Blob) => {
    if (!profile) return;
    setError(null);
    try {
      const path = `cat/profile-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, blob, { contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
      const { error: dbErr } = await supabase
        .from("cat_profile")
        .update({ photo_url: pub.publicUrl })
        .eq("id", profile.id);
      if (dbErr) throw dbErr;
    } catch (e: any) {
      setError(`写真のアップロードに失敗しました：${e?.message ?? String(e)}`);
      return;
    }
    setEditPhoto(false);
    load();
  };

  if (editing) {
    return (
      <div className="max-w-md mx-auto pb-10">
        <TopBar title="プロフィール編集" subtitle="Cat / Profile" backHref="/cat" accent="#C1694F" />
        <div className="px-5 pt-5">
          <Card className="p-5">
            <Field label="名前 *">
              <input className={inputClass} value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="例）むぎ" />
            </Field>
            <Field label="性別">
              <select className={inputClass} value={form.sex} onChange={(e) => set("sex")(e.target.value)}>
                <option value="">未設定</option>
                <option value="オス">オス</option>
                <option value="メス">メス</option>
              </select>
            </Field>
            <Field label="猫種">
              <input className={inputClass} value={form.breed} onChange={(e) => set("breed")(e.target.value)} placeholder="例）ラグドール" />
            </Field>
            <Field label="カラー（色柄）">
              <input className={inputClass} value={form.color} onChange={(e) => set("color")(e.target.value)} placeholder="例）ブルーポイント" />
            </Field>
            <Field label="誕生日">
              <input className={inputClass} type="date" value={form.birthday} onChange={(e) => set("birthday")(e.target.value)} />
            </Field>
            <Field label="お迎え日">
              <input className={inputClass} type="date" value={form.arrival_date} onChange={(e) => set("arrival_date")(e.target.value)} />
            </Field>
            <Field label="お父さん">
              <input className={inputClass} value={form.father_info} onChange={(e) => set("father_info")(e.target.value)} placeholder="名前・猫種など" />
            </Field>
            <Field label="お母さん">
              <input className={inputClass} value={form.mother_info} onChange={(e) => set("mother_info")(e.target.value)} placeholder="名前・猫種など" />
            </Field>
            <Field label="最後のワクチン接種日">
              <input className={inputClass} type="date" value={form.last_vaccine_date} onChange={(e) => set("last_vaccine_date")(e.target.value)} />
            </Field>
            <Field label="マイクロチップ番号">
              <input className={inputClass} value={form.microchip_no} onChange={(e) => set("microchip_no")(e.target.value)} />
            </Field>
            <Field label="かかりつけ動物病院">
              <input className={inputClass} value={form.vet_clinic} onChange={(e) => set("vet_clinic")(e.target.value)} />
            </Field>
            <Field label="去勢・避妊">
              <select className={inputClass} value={form.neutered} onChange={(e) => set("neutered")(e.target.value)}>
                <option value="">未設定</option>
                <option value="true">済み</option>
                <option value="false">未実施</option>
              </select>
            </Field>
            <Field label="フード・アレルギー">
              <textarea className={inputClass} style={{ minHeight: 70 }} value={form.allergy_note} onChange={(e) => set("allergy_note")(e.target.value)} />
            </Field>
            <Field label="性格・好きなこと">
              <textarea className={inputClass} style={{ minHeight: 70 }} value={form.personality_note} onChange={(e) => set("personality_note")(e.target.value)} />
            </Field>

            <button onClick={save} className="w-full py-3 rounded-xl text-white font-medium bg-catAccent">
              保存する
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              className="w-full py-3 rounded-xl font-medium mt-2 border border-line"
            >
              キャンセル
            </button>
            {error && <div className="text-center text-[13px] mt-3 text-red-600">{error}</div>}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-10">
      <TopBar title="プロフィール" subtitle="Cat / Profile" backHref="/cat" accent="#C1694F" />
      <div className="px-5 pt-5">
        {error && (
          <Card className="p-4 mb-4 border-red-300">
            <div className="text-[13px] text-red-600">{error}</div>
          </Card>
        )}
        {saved && (
          <Card className="p-4 mb-4">
            <div className="text-center text-[13px] text-catAccent">保存しました</div>
          </Card>
        )}

        {!profile ? (
          !loading && (
            <Card className="p-5 text-center">
              <div className="text-[13px] opacity-60 mb-4">プロフィールがまだ登録されていません。</div>
              <button onClick={startEdit} className="w-full py-3 rounded-xl text-white font-medium bg-catAccent">
                プロフィールを登録する
              </button>
            </Card>
          )
        ) : (
          <>
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
              <button
                onClick={() => setEditPhoto((v) => !v)}
                className="mb-3 px-3 py-1.5 rounded-full text-[12px] flex items-center gap-1 border border-line opacity-70"
              >
                <Camera size={12} /> 写真を変更
              </button>
              {editPhoto && (
                <div className="mb-3">
                  <PhotoPicker onPick={uploadPhoto} />
                </div>
              )}
              <div className="font-serif text-2xl font-bold">{profile.name}</div>
              {profile.birthday && (
                <div className="mt-2 px-3 py-1 rounded-full text-[12px] font-mono bg-catAccentSoft text-catAccent">
                  生後 {ageMonthsDays(profile.birthday).months}ヶ月{ageMonthsDays(profile.birthday).days}日
                </div>
              )}
              <button
                onClick={startEdit}
                className="mt-4 px-4 py-2 rounded-xl text-[13px] font-medium flex items-center gap-1.5 border border-line"
              >
                <Pencil size={14} /> 編集する
              </button>
            </Card>

            <Card className="mt-4 divide-y divide-line">
              {(
                [
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
                ] as [string, string][]
              ).map(([label, val]) => (
                <div key={label} className="flex justify-between px-4 py-3">
                  <div className="text-[13px] opacity-60">{label}</div>
                  <div className="text-[14px] font-medium text-right max-w-[60%] whitespace-pre-wrap">{val}</div>
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
