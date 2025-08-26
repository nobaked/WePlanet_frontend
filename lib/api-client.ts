// lib/api-client.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";

/**
 * 共通APIフェッチ関数
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `API request failed: ${res.status} ${res.statusText} - ${text}`
    );
  }

  return res.json();
}

/**
 * /me エンドポイント専用の関数
 */
export async function fetchMe() {
  return apiFetch("/me");
}
