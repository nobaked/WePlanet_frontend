"use client";

import { useState } from "react";
import { clsx } from "clsx";

export default function HeaderBar({
  nickname,
}: {
  nickname: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-30 mb-4">
      {/* グラデの帯 */}
      <div className="rounded-2xl px-4 py-3 shadow-card bg-gradient-to-r from-brand-gradientStart via-brand-gradientMid to-brand-gradientEnd">
        <div className="flex items-center justify-between">
          {/* 左：挨拶 */}
          <div className="text-white font-semibold">
            こんにちは、{nickname}さん
          </div>

          {/* 右：リンク＋ハンバーガー */}
          <div className="flex items-center gap-3">
            <a
              href="https://members.tokyo-gas.co.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white underline underline-offset-2"
            >
              myTOKYO GAS はこちら
            </a>

            {/* ハンバーガー */}
            <button
              type="button"
              aria-label="menu"
              className={clsx(
                "h-10 w-10 rounded-xl2 bg-white/20 hover:bg-white/30",
                "flex items-center justify-center text-white transition-colors"
              )}
              onClick={() => setOpen((v) => !v)}
            >
              {/* アイコン（CSSで3本線） */}
              <span className="block w-5 h-[2px] bg-white" />
              <span className="block w-5 h-[2px] bg-white mt-[6px]" />
              <span className="block w-5 h-[2px] bg-white mt-[6px]" />
            </button>
          </div>
        </div>
      </div>

      {/* 簡易ドロップダウン（必要に応じて項目を差し替え） */}
      {open && (
        <div className="mt-2 rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
          <button
            className="w-full text-left px-4 h-12 hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              alert("設定は後続で実装");
            }}
          >
            設定
          </button>
          <button
            className="w-full text-left px-4 h-12 hover:bg-slate-50 border-t border-slate-100"
            onClick={() => {
              setOpen(false);
              alert("ログアウトは後続で実装（NextAuth連携）");
            }}
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
