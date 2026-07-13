# うちの子ノート

猫1匹・カブトムシの幼虫18匹の体重／プロフィール／写真を記録する、自分専用のWebアプリです。
ログイン機能はありません（Supabase・VercelともにURLとキーを他人に教えなければ実質自分専用）。

## 0. 前提

- Node.js 18以上がPCにインストールされていること
- GitHubアカウント（Vercelのデプロイに使います）

## 1. Supabaseプロジェクトを作る（無料）

1. https://supabase.com にアクセスしてサインアップ（GitHubアカウントでOK）
2. 「New project」→ プロジェクト名を入力（例：`uchinoko-note`）、リージョンは `Northeast Asia (Tokyo)`、DBパスワードを設定して作成
3. 左メニュー「SQL Editor」→「New query」を開き、`supabase/schema.sql` の中身を貼り付けて実行（テーブルが作成されます）
4. 続けて `supabase/seed.sql` の中身も貼り付けて実行（カブトムシの実データ18匹分・体重記録107件が入ります）
5. 左メニュー「Storage」→「New bucket」→ バケット名 `pet-photos` を作成し、「Public bucket」をONにする
6. 左メニュー「Project Settings → API」を開き、`Project URL` と `anon public key` をメモしておく

## 2. 猫のプロフィールを実データに更新する

「Table Editor」→ `cat_profile` テーブルを開き、初期登録されている1行を実際の情報に書き換えてください（名前・性別・猫種・カラー・誕生日・お迎え日・両親の情報・ワクチン接種日など）。
猫の体重の過去記録があれば、`cat_weights` テーブルに `measured_date` / `weight_kg` / `memo` を1行ずつ追加（またはCSVインポート）してください。

## 3. ローカルで動かしてみる

```bash
npm install
cp .env.local.example .env.local
# .env.local を開いて、1で控えたSupabaseのURLとanon keyを入力
npm run dev
```

http://localhost:3000 をブラウザで開いて動作確認してください。

## 4. Vercelにデプロイする

1. このプロジェクトフォルダをGitHubリポジトリにpush
   ```bash
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin <あなたのGitHubリポジトリURL>
   git push -u origin main
   ```
2. https://vercel.com にアクセスし、GitHubアカウントでサインアップ
3. 「Add New... → Project」→ 該当リポジトリを選択
4. 「Environment Variables」に `.env.local` と同じ2つの値（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`）を設定
5. 「Deploy」をクリック。数分で `https://uchinoko-note-xxxx.vercel.app` のようなURLが発行されます

## 5. スマホ・PCで使う

発行されたURLをスマホ・PC両方のブラウザでブックマークするか、iPhoneなら共有ボタン→「ホーム画面に追加」でアイコン化できます。以後はそのURLにアクセスするだけで、どの端末からでも同じデータが見られます。

## 運用メモ

- Supabase無料プランは7日間アクセスがないとプロジェクトが自動休止します。再アクセスすれば数分で復帰しますが、しばらく開かないと最初の表示が遅くなることがあります。
- 写真はアップロード時にブラウザ側で自動圧縮（長辺1600px程度）してからSupabase Storageに送るようにしているので、無料枠（1GB）を圧迫しにくくなっています。
- GitHubにpushするたびにVercelが自動で再デプロイします。コードを直したいときは編集→pushだけでOKです。

## フォルダ構成

```
app/
  page.tsx                … ホーム
  cat/                     … ねこの部屋（体重・プロフィール・グラフ・アルバム）
  beetle/                  … カブトムシラボ（体重・系図/成長記録・個体詳細・アルバム）
lib/
  supabase.ts              … Supabaseクライアント
  types.ts                 … 型定義
  utils.ts                 … 日付計算・AIコメントのロジック
  compressImage.ts         … 写真アップロード前の圧縮
components/ui.tsx          … 共通UIパーツ
supabase/
  schema.sql               … テーブル定義
  seed.sql                 … カブトムシの実データ投入用SQL
```
