"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        alert("ログインに失敗しました");
        return;
      }

      const data = await res.json();
      // JWT を保存
      localStorage.setItem("access_token", data.access_token);

      // ✅ ログイン成功後はエコボードにリダイレクト
      router.push("/ecoboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("エラーが発生しました");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-300 via-blue-300 to-teal-300">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-teal-600 mb-2">
          We Planet
        </h1>
        <p className="text-center text-gray-600 mb-6">
          みんなで地球を守ろう！
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          パスワード
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワードを入力"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        <div className="text-right mb-4">
          <a href="#" className="text-sm text-teal-600 hover:underline">
            パスワードを忘れた方はこちら
          </a>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium shadow hover:bg-blue-600 mb-4 flex items-center justify-center gap-2"
        >
          🌍 ログイン
        </button>

        <div className="text-center text-gray-400 mb-4">または</div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/ecoboard" })} // ✅ Googleログインもエコボードに遷移
          className="w-full bg-red-500 text-white py-2 rounded-lg font-medium shadow hover:bg-red-600 mb-6 flex items-center justify-center gap-2"
        >
          🔍 Googleでログイン
        </button>

        <div className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 text-center p-4 rounded-lg shadow">
          <p className="text-sm mb-2 font-medium">✨ We Planetを始めよう！</p>
          <p className="text-xs text-gray-700 mb-3">
            家族みんなでエコ活動を楽しみながら、地球を守る仲間になりませんか？
          </p>
          <button
            onClick={() => (window.location.href = "/signup")}
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium shadow hover:bg-purple-700"
          >
            ✨ アカウント作成
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          ログイン・アカウント作成により、以下に同意したものとみなします<br />
          <a href="#" className="text-teal-600 hover:underline">利用規約</a> ・{" "}
          <a href="#" className="text-teal-600 hover:underline">プライバシーポリシー</a>
        </p>
      </div>
    </div>
  );
}
