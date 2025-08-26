"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // URL パラメータから token を取得
    const token = searchParams.get("token");

    if (token) {
      // localStorage に保存
      localStorage.setItem("access_token", token);

      // マイページに遷移
      router.push("/mypage");
    } else {
      // token が無い場合はログインページへ
      router.push("/login");
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-lg">ログイン処理中です…</p>
    </div>
  );
}
