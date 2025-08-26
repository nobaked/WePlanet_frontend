"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";

type User = {
  user_id: number;
  email: string;
  nickname: string;
  badge_id?: number | null;
  points: number;
};

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("ログインが必要です");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const detail = await res.text();
          throw new Error(`API request failed: ${res.status} ${detail}`);
        }
        return res.json();
      })
      .then(setUser)
      .catch((e) => setError(e.message ?? "failed"));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-green-400 to-blue-600">
        <Header currentPage="/mypage" />
        <div className="text-center mt-10 text-red-600">
          データ取得に失敗しました: {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-green-400 to-blue-600">
        <Header currentPage="/mypage" />
        <div className="text-center mt-10">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-green-400 to-blue-600">
      {/* 共通ヘッダー */}
      <Header currentPage="/mypage" />

      {/* 中央カード */}
      <div className="max-w-md mx-auto p-6 space-y-6 bg-white/90 backdrop-blur-sm shadow-2xl rounded-lg mt-6">
        {/* タイトル */}
        <h1 className="text-2xl font-bold text-center mb-6">マイページ</h1>

        {/* ポイント情報 */}
        <div className="bg-orange-100 rounded-lg p-4 shadow">
          <h2 className="text-lg font-bold mb-2">💰 ポイント情報</h2>
          <p className="text-red-600 font-semibold text-xl">
            現在のポイント: {user.points}pt
          </p>
          <p className="text-sm text-gray-600">
            パッチョポイント交換可能: {Math.floor(user.points / 10)}pt
          </p>
          <a
            href="https://login.tokyo-gas.co.jp/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="mt-2 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
              パッチョポイントと交換
            </button>
          </a>
        </div>

        {/* ユーザー情報 */}
        <div className="bg-white rounded-lg p-4 shadow space-y-4">
          <h2 className="text-lg font-bold">👤 ユーザー情報</h2>
          <div>
            <label className="block text-sm font-medium">ニックネーム</label>
            <input
              type="text"
              value={user.nickname}
              readOnly
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">メールアドレス</label>
            <input
              type="text"
              value={user.email}
              readOnly
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">ユーザーID</label>
            <input
              type="text"
              value={user.user_id}
              readOnly
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        </div>

        {/* サポート */}
        <div className="bg-white rounded-lg p-4 shadow space-y-2">
          <h2 className="text-lg font-bold">🛠 サポート</h2>
          <button className="w-full border rounded py-2 hover:bg-gray-50">
            ❓ ヘルプ
          </button>
          <button className="w-full border rounded py-2 hover:bg-gray-50">
            📢 お知らせ
          </button>
        </div>

        {/* アカウント管理 */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-lg font-bold text-red-600">⚠ アカウント管理</h2>
          <button className="w-full mt-2 bg-red-100 text-red-700 py-2 rounded hover:bg-red-200">
            🗑 退会手続き
          </button>
        </div>
      </div>
    </div>
  );
}
