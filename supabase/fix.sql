-- ============================================================
-- 修正用SQL（SupabaseのSQL Editorに貼り付けてRunしてください）
-- 内容:
--   1. 写真アップロードを可能にする（ストレージのバケット作成＋ポリシー設定）
--   2. ホーム画面のカブトムシ表紙写真用テーブル app_settings を作成
--   3. カブトムシのデータ修正（メル丸2号_1・炭治郎の削除、
--      マルル・メルル・オススの種類と両親の修正）
-- 何度実行しても安全なように書いてあります。
-- ============================================================

-- 1. 写真用バケット（無ければ作成、あればpublic化のみ）
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do update set public = true;

-- 1. ストレージのポリシー（Public bucketでも書き込みには明示的なポリシーが必要）
drop policy if exists "pet-photos read" on storage.objects;
create policy "pet-photos read" on storage.objects
  for select using (bucket_id = 'pet-photos');

drop policy if exists "pet-photos insert" on storage.objects;
create policy "pet-photos insert" on storage.objects
  for insert with check (bucket_id = 'pet-photos');

drop policy if exists "pet-photos update" on storage.objects;
create policy "pet-photos update" on storage.objects
  for update using (bucket_id = 'pet-photos');

drop policy if exists "pet-photos delete" on storage.objects;
create policy "pet-photos delete" on storage.objects
  for delete using (bucket_id = 'pet-photos');

-- 2. アプリ設定テーブル（ホーム画面のカブトムシ表紙写真などを保存）
create table if not exists app_settings (
  key text primary key,
  value text
);
alter table app_settings disable row level security;

-- 3-1. メル丸2号_1 と 炭治郎 を削除（写真・体重記録も含めて）
delete from beetle_photos
  where larva_id in (select id from beetle_larvae where name in ('メル丸2号_1', '炭治郎'));
delete from beetle_weights
  where larva_id in (select id from beetle_larvae where name in ('メル丸2号_1', '炭治郎'));
delete from beetle_larvae where name in ('メル丸2号_1', '炭治郎');

-- 3-2. マルル・メルル・オススはヘラクレスオオカブト（父: サド丸２号 × 母: メス丸２号）
update beetle_larvae
set species   = 'ヘラクレスオオカブト',
    father_id = (select id from beetle_parents where name = 'サド丸２号'),
    mother_id = (select id from beetle_parents where name = 'メス丸２号')
where name in ('マルル', 'メルル', 'オスス');
