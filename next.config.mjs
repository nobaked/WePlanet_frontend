/** @type {import('next').NextConfig} */
const nextConfig = {
  // outputモードを 'standalone' に設定
  output: 'standalone',

  // experimental の設定を1つのオブジェクトにまとめる
  experimental: {
    // 既存の serverActions の設定
    serverActions: true,
    
    // outputStandalone の設定を追加
    outputStandalone: true,
  },
};

export default nextConfig;
