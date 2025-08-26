"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type HeaderProps = {
  currentPage?: string;
};

export default function Header({ currentPage }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const router = useRouter();

  // ニックネームを取得
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setNickname(null);
      return;
    }

    // バックエンドからニックネームを取得
    (async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("ユーザー情報取得失敗");

        const data = await res.json();
        setNickname(data.nickname); // ← DBのカラム `nickname` を想定
      } catch (err) {
        console.error(err);
        setNickname(null);
      }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setNickname(null);
    router.push("/login");
  };

  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white/20 backdrop-blur-md fixed top-0 left-0 w-full z-40">
      {/* 左側：ニックネーム or ゲスト */}
      <div>
        <h1 className="text-lg font-bold text-green-900">We Planet</h1>
        <p className="text-sm text-gray-700">
          {nickname ? `ようこそ、${nickname}さん` : "ようこそ、ゲストさん"}
        </p>
      </div>

      {/* ハンバーガーボタン */}
      <button
        className="text-3xl text-gray-800 hover:text-gray-900"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      {/* メニュー */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-72 h-full bg-white shadow-2xl p-6 flex flex-col gap-4 animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="self-end text-2xl text-gray-600 hover:text-gray-900"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-lg font-bold text-gray-800 mb-2">メニュー</h2>

            <button
              onClick={() => router.push("/ecoboard")}
              className="p-3 rounded-md bg-green-100 hover:bg-green-200 text-left font-semibold"
            >
              📊 エコボード
            </button>
            <button
              onClick={() => router.push("/mission")}
              className="p-3 rounded-md bg-pink-100 hover:bg-pink-200 text-left font-semibold"
            >
              🎯 ミッション
            </button>
            <button
              onClick={() => router.push("/badge")}
              className="p-3 rounded-md bg-yellow-100 hover:bg-yellow-200 text-left font-semibold"
            >
              🏆 エコバッジ
            </button>
            <button
              onClick={() => router.push("/mypage")}
              className="p-3 rounded-md bg-blue-100 hover:bg-blue-200 text-left font-semibold"
            >
              👤 マイページ
            </button>

            <hr />

            <button
              onClick={handleLogout}
              className="p-3 rounded-md bg-red-100 hover:bg-red-200 text-left text-red-600 font-semibold"
            >
              🚪 ログアウト
            </button>
          </div>
        </div>
      )}

      {/* アニメーション */}
      <style jsx>{`
        .animate-slideIn {
          animation: slideIn 0.25s ease-out forwards;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0%);
          }
        }
      `}</style>
    </header>
  );
}
