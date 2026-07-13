"use client";

// ページ内で予期しないエラーが起きたとき、真っ白な画面の代わりに原因を表示する
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-5 py-10">
      <div className="rounded-2xl bg-[#FFFDF8] border border-red-300 p-5">
        <div className="font-serif text-lg font-bold text-red-600 mb-2">エラーが発生しました</div>
        <p className="text-[13px] leading-relaxed opacity-80 break-all">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 w-full py-3 rounded-xl text-white font-medium bg-catAccent"
        >
          再試行
        </button>
      </div>
    </div>
  );
}
