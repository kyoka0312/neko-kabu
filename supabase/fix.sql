-- ============================================================
-- 修正用SQL（SupabaseのSQL Editorに貼り付けてRunしてください）
--
-- ★ 大事：データ修正を先に、ストレージ設定を最後に置いてあります。
--   最後のストレージ設定の部分は、Supabaseのプロジェクトによっては
--   「must be owner of table objects」というエラーになります。
--   その場合はSQLではなく管理画面から設定してください（READMEの
--   手順、またはClaudeからの案内メッセージを参照）。
--   エラーが出ても、それより上のデータ修正は完了しています。
-- ============================================================

-- 1. アプリ設定テーブル（ホーム画面のカブトムシ表紙写真などを保存）
create table if not exists app_settings (
  key text primary key,
  value text
);
alter table app_settings disable row level security;

-- 2-1. メル丸2号_1 と 炭治郎 を削除（写真・体重記録も含めて）
delete from beetle_photos
  where larva_id in (select id from beetle_larvae where name in ('メル丸2号_1', '炭治郎'));
delete from beetle_weights
  where larva_id in (select id from beetle_larvae where name in ('メル丸2号_1', '炭治郎'));
delete from beetle_larvae where name in ('メル丸2号_1', '炭治郎');

-- 2-2. マルル・メルル・オススはヘラクレスオオカブト（父: サド丸２号 × 母: メス丸２号）
--      ※系図では母親の違いにより「サド丸２号×メス丸」の家族とは別のカードに表示されます
update beetle_larvae
set species   = 'ヘラクレスオオカブト',
    father_id = (select id from beetle_parents where name = 'サド丸２号'),
    mother_id = (select id from beetle_parents where name = 'メス丸２号')
where name in ('マルル', 'メルル', 'オスス');

-- 2-3. 天ぷらもヘラクレスオオカブト（親は不明のまま）
update beetle_larvae
set species = 'ヘラクレスオオカブト'
where name = '天ぷら';

-- ============================================================
-- 3. ストレージ設定（写真アップロード用）
--    ここから先でエラーが出た場合は、管理画面のStorage→Policiesから
--    設定してください（上のデータ修正はすでに反映済みです）
-- ============================================================

insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do update set public = true;

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
