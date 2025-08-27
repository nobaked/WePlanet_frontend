"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Header from "@/components/layout/Header";

type Summary = { month: string; sugi: number; co2_g: number };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

// ------------------------------------------------------------
// 「今月のCO2削減量」だけを動的化したブロック
// ------------------------------------------------------------
function EcoboardSummaryPanel() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/ecoboard/summary/me`, {
          headers: {
            Accept: "application/json",
            "x-user-id": "1", // 擬似ログイン（本番はJWT）
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e?.message ?? "取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border-2 border-green-200">
      <div className="flex items-center gap-4">
        <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/70 border border-green-200">
          <span className="text-4xl sm:text-5xl">🌳</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-green-700">今月のCO₂削減量</h3>
          {children}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Frame>
        <p className="text-gray-500 mt-1">読み込み中…</p>
      </Frame>
    );
  }

  if (error || !data) {
    return (
      <Frame>
        <p className="text-red-600 text-sm mt-1">取得に失敗しました：{error ?? "unknown"}</p>
      </Frame>
    );
  }

  return (
    <Frame>
      <p className="text-lg font-bold text-green-700 mt-1">
        スギ
        <span className="text-2xl font-extrabold tabular-nums mx-1">{data.sugi}</span>
        本分のCO₂を吸収するお手伝いが出来たよ！
      </p>
      <p className="text-sm text-gray-600 mt-1">
        （CO₂削減量：
        <span className="font-semibold tabular-nums">{data.co2_g}</span>g）
      </p>
    </Frame>
  );
}

// ------------------------------------------------------------
// ecoboard ページ本体
// ------------------------------------------------------------
export default function EcoboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-green-400 to-blue-600">
      <Header currentPage="/ecoboard" />

      <div className="flex items-center justify-center p-4 relative overflow-hidden">
        {/* 背景の星っぽい装飾 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-10 right-10 w-2 h-2 bg-white rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-200"></div>
        </div>

        {/* 地球のイラスト風 */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-green-300 to-blue-400 rounded-full relative">
            <div className="absolute top-4 left-8 w-12 h-8 bg-green-500 rounded-full opacity-70"></div>
            <div className="absolute top-12 right-6 w-8 h-6 bg-green-500 rounded-full opacity-70"></div>
            <div className="absolute bottom-8 left-12 w-16 h-10 bg-green-500 rounded-full opacity-70"></div>
          </div>
        </div>

        {/* Card → div に修正 */}
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm shadow-2xl border-0 mt-4 space-y-6 text-center p-6 rounded-xl">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            📊 エコボード
          </h2>
          <p className="text-lg text-gray-600 font-medium">CO₂削減量をチェック！</p>

          {/* ★ 今月のCO2削減量（動的化部分） */}
          <EcoboardSummaryPanel />

          {/* ミッション誘導 */}
          <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-xl border-2 border-orange-200 text-center">
            <h3 className="text-lg font-bold text-orange-700 mb-2">🎯 今日のエコ活動</h3>
            <p className="text-sm text-orange-600 mb-3">
              新しいミッションにチャレンジして、さらにCO₂を削減しよう！
            </p>
            <Button
              onClick={() => router.push("/mission")}
              variant="primary" // ✅ 修正：outline props を variant に統一
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🚀 今日のミッションにチャレンジする
            </Button>
          </div>

          {/* SNSリンク */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-gray-700">成果をシェアしよう！</h4>
            <div className="grid grid-cols-3 gap-2">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 flex items-center justify-center text-sm font-bold bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-white"
              >
                📘 Facebook
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 flex items-center justify-center text-sm font-bold bg-black hover:bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-white"
              >
                🐦 X
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 flex items-center justify-center text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-white"
              >
                📷 Instagram
              </a>
            </div>
          </div>

          {/* フォトギャラリー */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-gray-700">📸 エコ活動の記録</h4>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-lg border-2 border-green-200 flex items-center justify-center">
                <span className="text-2xl">🌱</span>
              </div>
              <div className="aspect-square bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg border-2 border-orange-200 flex items-center justify-center">
                <span className="text-2xl">♻️</span>
              </div>
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border-2 border-purple-200 flex items-center justify-center">
                <span className="text-2xl">🚲</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center">
              ミッション達成時の写真が表示されます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
