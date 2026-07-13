-- 「うちの子ノート」テーブル定義
-- 自分専用（ログイン機能なし）での運用を前提に、
-- Row Level Security は有効化しません（デフォルトで無効＝anonキーで読み書き可能）。
-- URLとanonキーを他人に教えない限り、実質的に自分専用です。

-- 猫プロフィール（1匹想定なので1行運用）
create table cat_profile (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sex text,
  breed text,
  color text,
  birthday date,
  arrival_date date,
  father_info text,
  mother_info text,
  last_vaccine_date date,
  photo_url text,
  microchip_no text,
  vet_clinic text,
  neutered boolean,
  allergy_note text,
  personality_note text,
  updated_at timestamptz default now()
);

-- 猫の体重記録（同じ日に2回登録したら上書きされるよう measured_date を一意に）
create table cat_weights (
  id uuid primary key default gen_random_uuid(),
  measured_date date not null unique,
  weight_kg numeric(5,2) not null,
  memo text,
  created_at timestamptz default now()
);

-- 猫の写真
create table cat_photos (
  id uuid primary key default gen_random_uuid(),
  photo_url text not null,
  taken_date date,
  created_at timestamptz default now()
);

-- カブトムシ：成虫（親）
create table beetle_parents (
  id serial primary key,
  name text not null,
  species text not null,
  sex text,
  emerge_date date,
  arrival_date date,
  first_feed_date date,
  death_date date,
  photo_url text
);

-- カブトムシ：幼虫（個体）
create table beetle_larvae (
  id serial primary key,
  name text not null,
  species text not null,
  hatch_date date not null,
  note text,
  father_id int references beetle_parents(id),
  mother_id int references beetle_parents(id)
);

-- カブトムシ：体重記録（同じ個体・同じ日は上書き）
create table beetle_weights (
  id uuid primary key default gen_random_uuid(),
  larva_id int references beetle_larvae(id) not null,
  measured_date date not null,
  weight_g numeric(6,2) not null,
  created_at timestamptz default now(),
  unique (larva_id, measured_date)
);

-- カブトムシ：写真
create table beetle_photos (
  id uuid primary key default gen_random_uuid(),
  larva_id int references beetle_larvae(id),
  parent_id int references beetle_parents(id),
  photo_url text not null,
  taken_date date,
  created_at timestamptz default now()
);

-- アプリ設定（ホーム画面のカブトムシ表紙写真などを保存）
create table app_settings (
  key text primary key,
  value text
);

-- 猫プロフィールの初期1行（あとでTable Editorから実データに書き換えてください）
insert into cat_profile (name, sex, breed, color, birthday, arrival_date, father_info, mother_info, last_vaccine_date)
values ('（未登録）', null, null, null, null, null, null, null, null);
