"use client";

import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const handleSignup = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      console.log("API_BASE_URL (Signup):", apiBase);

      const res = await fetch(`${apiBase}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,   // FastAPI 側でハッシュ化される
          nickname,   // ✅ backend の UserCreate に合わせる
        }),
      });

      if (res.ok) {
        alert("アカウント作成が完了しました！ログインしてください。");
        window.location.href = "/login";
      } else {
        const errorText = await res.text();
        console.error("Signup failed:", errorText);
        alert(`アカウント作成に失敗しました: ${errorText}`);
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("エラーが発生しました。");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-300 via-blue-300 to-teal-300">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-purple-600 mb-4">
          ✨ アカウント作成
        </h1>
        <p className="text-center text-gray-600 mb-6">
          家族みんなでエコ活動を楽しみながら、地球を守る仲間になりませんか？
        </p>

        {/* ニックネーム */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ニックネーム
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="ニックネームを入力"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        {/* メール */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        {/* パスワード */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          パスワード
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワードを入力"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <button
          onClick={handleSignup}
          className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium shadow hover:bg-purple-700"
        >
          ✨ アカウント作成
        </button>

        <p className="text-sm text-gray-600 mt-6 text-center">
          すでにアカウントをお持ちですか？{" "}
          <a href="/login" className="text-purple-600 hover:underline">
            ログインはこちら
          </a>
        </p>
      </div>
    </div>
  );
}
