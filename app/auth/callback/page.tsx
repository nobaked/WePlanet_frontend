"use client";
// 必要なインポート
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic';

function CallbackComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("access_token", token);
      router.push("/mypage");
    } else {
      router.push("/login");
    }
  }, [router, searchParams]);

  return <div>ログイン処理中です…</div>;
}

// ssr: false を指定して動的に読み込む
export default dynamic(() => Promise.resolve(CallbackComponent), { ssr: false });
