"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

// =========================
// 設定
// =========================
// FastAPI サーバー接続用
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

// CSS変数用の型定義（重複削除）
interface CSSPropertiesWithVars extends React.CSSProperties {
  '--duration'?: string;
  '--delay'?: string;
  '--sway'?: string;
}

// FastAPI用の型定義
type Mission = {
  text: string;
  points: number;
  co2: number;
  mission_id?: number;
  description?: string;
  default_point?: number;
}

type TodayStatus = { lockedToday: boolean; date: string }
type CompleteResp = {
  ok: boolean;
  activity_id: number;
  mission: any;
  badge: any;
  lockedToday: boolean
}

// 当日ロック（フォールバック用）
const STORAGE_KEY = "missionDoneDate"
const todayKey = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

// むずかしさ星表示関数
function renderStars(point: number) {
  let numStars = 1
  if (point >= 40) numStars = 5
  else if (point >= 30) numStars = 4
  else if (point >= 20) numStars = 3
  else if (point >= 10) numStars = 2
  else numStars = 1

  return (
    <div className="flex items-center justify-center mb-2">
      <span className="font-bold mr-2">むずかしさ</span>
      {[...Array(numStars)].map((_, i) => (
        <span key={i} style={{ color: "#FFD600", fontSize: "1.3em" }}>★</span>
      ))}
      <span className="ml-2 text-sm text-gray-500">（{numStars} つ）</span>
    </div>
  )
}

export default function MissionPage() {
  const [showConfirmation, setShowConfirmation] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDecided, setShowDecided] = useState(false)
  const [currentMission, setCurrentMission] = useState<Mission | null>(null)
  const [showMission, setShowMission] = useState(false)
  const [result, setResult] = useState<"success" | null>(null)
  const [showCelebrateFx, setShowCelebrateFx] = useState(false)
  const [isLockedToday, setIsLockedToday] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [posting, setPosting] = useState(false)
  const [badgeName, setBadgeName] = useState<string | null>(null);
  const router = useRouter()
  const badges = [
    { id: 1, name: "🐼 パンダ" },
    { id: 2, name: "🦢 白鳥" },
    { id: 3, name: "🐢 カメ" },
  ];
  // デバッグ用: 当日ロックを解除
  const resetTodayLock = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setIsLockedToday(false);
      console.log("当日ロックをリセットしました");
    } catch (e) {
      console.error("ローカルストレージのリセットに失敗:", e);
    }
  };

  // 見た目・UI 共通クラス
  const feel = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 active:scale-[0.98] transition"

  // 抽選表示の安定化
  const CARD_MIN_H = 380
  const TITLE_BOX_H = "5.6rem"
  const INFO_MIN_H = 72

  // 紙吹雪（演出）
  const confettiPieces = useMemo(() => {
    const count = 48
    return new Array(count).fill(0).map((_, i) => {
      const left = Math.random() * 100
      const delay = Math.random() * 0.6
      const duration = 1.4 + Math.random() * 1.2
      const size = 8 + Math.floor(Math.random() * 10)
      const rotate = Math.random() * 360
      const hueColors = ["#F97316", "#FB923C", "#F59E0B", "#10B981", "#34D399", "#3B82F6", "#60A5FA", "#A78BFA"]
      const color = hueColors[i % hueColors.length]
      const sway = 20 + Math.random() * 40
      const bounce = Math.random() < 0.2
      return { left, delay, duration, size, rotate, color, sway, bounce, key: i }
    })
  }, [])

  // FastAPIからランダムミッション取得
  const fetchRandomMission = async (): Promise<Mission | null> => {
    try {
      const res = await fetch(`${API_BASE}/mission/today`, {
        headers: { "X-User-Id": "1" }
      })
      if (!res.ok) {
        const errorText = await res.text()
        console.error(`API Error ${res.status}: ${errorText}`)
        return null
      }
      const data = await res.json()
      return {
        text: data.title,
        description: data.description,
        points: data.default_point,
        default_point: data.default_point,
        co2: data.base_co2_reduction,
        mission_id: data.mission_id
      }
    } catch (e) {
      console.error("Failed to fetch random mission:", e)
      // APIが失敗した場合、ダミーデータを返す
      const dummyMissions = [
        { text: "エコバッグを もっていく", points: 25, co2: 150 },
        { text: "でんきを こまめに けす", points: 30, co2: 200 },
        { text: "みずを 大切に つかう", points: 20, co2: 120 },
        { text: "ごみを 分別 する", points: 35, co2: 180 },
        { text: "じてんしゃや あるいて いく", points: 40, co2: 300 }
      ]
      const dummyMission = dummyMissions[Math.floor(Math.random() * dummyMissions.length)]
      return {
        ...dummyMission,
        description: "このミッションで環境にやさしい行動をしよう！",
        default_point: dummyMission.points,
        mission_id: Math.floor(Math.random() * 1000)
      }
    }
  }

  // 初回：当日ロックをFastAPIから取得
  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          const res = await fetch(`${API_BASE}/api/mission/today-status?user_id=1`, { cache: "no-store" })
          if (res.ok) {
            const json: TodayStatus = await res.json()
            if (!cancelled) setIsLockedToday(json.lockedToday)
          } else {
            throw new Error(`HTTP ${res.status}`)
          }
        } catch (error) {
          console.warn("APIからの状態取得失敗、ローカルストレージを確認:", error)
          try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (!cancelled) setIsLockedToday(saved === todayKey())
          } catch {
            if (!cancelled) setIsLockedToday(false)
          }
        } finally {
          if (!cancelled) setLoadingStatus(false)
        }
      })()
    return () => { cancelled = true }
  }, [])

  // 抽選開始（FastAPI連携版）
  const startMissionAnimation = async () => {
    if (isLockedToday || loadingStatus) return
    setShowConfirmation(false)
    setIsAnimating(true)
    setShowMission(false)
    setShowDecided(false)
    setResult(null)

    // 最終的に表示するミッションを事前取得
    const finalMission = await fetchRandomMission()
    if (!finalMission) {
      console.error("Failed to get mission")
      return
    }

    const animationDuration = 4000
    const interval = 80
    let elapsed = 0

    const animationInterval = setInterval(() => {
      // アニメーション中はダミーデータでエフェクト表示
      const dummyMissions = [
        { text: "エコバッグを もっていく", points: 25, co2: 150 },
        { text: "でんきを こまめに けす", points: 30, co2: 200 },
        { text: "みずを 大切に つかう", points: 20, co2: 120 },
        { text: "ごみを 分別 する", points: 35, co2: 180 },
        { text: "じてんしゃや あるいて いく", points: 40, co2: 300 }
      ]
      const randomMission = dummyMissions[Math.floor(Math.random() * dummyMissions.length)]
      setCurrentMission(randomMission)
      elapsed += interval

      if (elapsed >= animationDuration) {
        clearInterval(animationInterval)
        setIsAnimating(false)
        setCurrentMission(finalMission) // 実際のミッションを設定
        setShowDecided(true)
        setTimeout(() => {
          setShowDecided(false)
          setShowMission(true)
        }, 2000)
      }
    }, interval)
  }

  const handleRerollFromResult = () => {
    startMissionAnimation()
  }

  const handleSuccess = async () => {
    if (isLockedToday || !currentMission || posting) return
    setShowCelebrateFx(true)
    try {
      setPosting(true)
      const res = await fetch(`${API_BASE}/mission/complete/${currentMission.mission_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": "1"
        },
      })

      if (res.ok) {
        const json = await res.json()
        setTimeout(() => {
          setShowCelebrateFx(false)
          setResult("success")
          setIsLockedToday(true)
          setBadgeName(json.badge?.name ?? null)   // バッジ名を表示
          try { localStorage.setItem(STORAGE_KEY, todayKey()) } catch { }
        }, 1200)
      } else {
        throw new Error(`HTTP ${res.status}`)
      }
    } catch (e) {
      console.error(e)
      setTimeout(() => {
        setShowCelebrateFx(false)
        setResult("success")
        setIsLockedToday(true)
        try { localStorage.setItem(STORAGE_KEY, todayKey()) } catch { }
      }, 1200)
    } finally { setPosting(false) }
  }

// … 👇 この先はあなたのUI部分（741行目まで）は一切変更不要なのでそのまま残しています …


  const getRandomBadge = () => badges[Math.floor(Math.random() * badges.length)]

  // カメラ機能
  const [camOn, setCamOn] = useState(false)
  const [shotDataUrl, setShotDataUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [badgeEmoji, setBadgeEmoji] = useState("🐼")
  const [badgeImgSrc, setBadgeImgSrc] = useState<string | null>(null)

  function drawRosette(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, colors: { base: string; ring: string }) {
    ctx.save()
    ctx.beginPath()
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2
      const rr = r + (i % 2 === 0 ? 10 : 0)
      const px = x + Math.cos(angle) * rr
      const py = y + Math.sin(angle) * rr
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fillStyle = colors.ring
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = colors.base
    ctx.fill()
    ctx.restore()
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  async function startCamera() {
    try {
      if (streamRef.current) return
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setShotDataUrl(null)
      setCamOn(true)
    } catch (e) {
      console.error(e)
      alert("カメラを つかえなかったよ（ブラウザの許可を たしかめてね）")
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
    setCamOn(false)
  }

  async function takeShot(currentMissionText?: string) {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const w = video.videoWidth || 1280
    const h = video.videoHeight || 720
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0, w, h)
    const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.1, w / 2, h / 2, Math.max(w, h) * 0.7)
    grad.addColorStop(0, "rgba(255,255,255,0)")
    grad.addColorStop(1, "rgba(0,0,0,0.25)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    const centerX = w - 160
    const centerY = h - 140
    drawRosette(ctx, centerX, centerY, 70, { base: "#FEF3C7", ring: "#F59E0B" })

    if (currentMissionText) {
      ctx.save()
      ctx.fillStyle = "#1F2937"
      ctx.textAlign = "center"
      ctx.font = "bold 18px system-ui, sans-serif"
      const maxWidth = 110
      const lines: string[] = []
      const chars = currentMissionText.split("")
      let line = ""
      for (const ch of chars) {
        const test = line + ch
        if (ctx.measureText(test).width > maxWidth && line !== "") {
          lines.push(line)
          line = ch
        } else {
          line = test
        }
      }
      if (line) lines.push(line)
      const display = lines.slice(0, 2)
      const startY = centerY - (display.length === 2 ? 10 : 0)
      display.forEach((ln, i) => ctx.fillText(ln, centerX, startY + i * 22))
      ctx.restore()
    }

    ctx.save()
    ctx.font = "bold 42px system-ui, sans-serif"
    ctx.fillStyle = "rgba(16,185,129,0.95)"
    ctx.fillText("🌟 できた！", 24, 56)
    ctx.restore()

    if (badgeImgSrc) {
      try {
        const img = await loadImage(badgeImgSrc)
        const size = 56
        ctx.drawImage(img, centerX - size / 2, centerY - 56 - 8, size, size)
      } catch (e) {
        console.error(e)
      }
    } else {
      ctx.save()
      ctx.font = "48px system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(badgeEmoji, centerX, centerY - 56)
      ctx.restore()
    }

    const url = canvas.toDataURL("image/png")
    setShotDataUrl(url)
  }

  function downloadShot() {
    if (!shotDataUrl) return
    const a = document.createElement("a")
    a.href = shotDataUrl
    a.download = "we-planet-shot.png"
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-green-400 to-blue-600">
      <Header currentPage="/mission" />

      <style jsx>{`
        .confetti { position: fixed; inset: 0; pointer-events: none; z-index: 50; overflow: hidden; }
        .confetti-piece { position: absolute; top: -16px; opacity: 0.95; border-radius: 3px; will-change: transform; animation-fill-mode: forwards; }
        @keyframes fallSway { 0% { transform: translate3d(0,-16px,0) rotate(0); } 60% { transform: translate3d(var(--sway),60vh,0) rotate(180deg); } 100% { transform: translate3d(calc(var(--sway) * -1),110vh,0) rotate(360deg); } }
        @keyframes fallSwayBounce { 0% { transform: translate3d(0,-16px,0) rotate(0); } 70% { transform: translate3d(var(--sway),100vh,0) rotate(300deg); } 85% { transform: translate3d(calc(var(--sway) * 0.6),85vh,0) rotate(320deg); } 100% { transform: translate3d(calc(var(--sway) * 0.3),110vh,0) rotate(360deg); } }
        .cele-overlay { position: fixed; inset: 0; z-index: 40; background: radial-gradient(ellipse at center, rgba(255,255,255,0.45), rgba(0,0,0,0.15)); animation: fadeIn 240ms ease-out; }
        .pop-stamps { position: fixed; inset: 0; z-index: 51; display: grid; place-items: center; pointer-events: none; }
        .stamp { font-size: clamp(48px, 12vw, 104px); filter: drop-shadow(0 6px 10px rgba(0,0,0,0.25)); opacity: 0; transform: scale(0.6) rotate(-6deg); animation: pop 400ms ease-out forwards; }
        .stamp.delay-1 { animation-delay: 120ms; transform: scale(0.6) rotate(6deg); }
        .stamp.delay-2 { animation-delay: 240ms; transform: scale(0.6) rotate(-12deg); }
        @keyframes pop { 0% { opacity: 0; transform: scale(0.6) rotate(var(--rot,-6deg)); } 70% { opacity: 1; transform: scale(1.08) rotate(var(--rot,-6deg)); } 100% { opacity: 1; transform: scale(1) rotate(var(--rot,-6deg)); } }
        @keyframes gentleBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .slot-bounce { animation: gentleBounce 1.2s ease-in-out infinite; }
        .slot-stage { position: relative; display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1.25rem; border-radius: 1rem; background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25)); box-shadow: inset 0 0 0 2px rgba(255,255,255,0.5), 0 12px 28px rgba(0,0,0,0.18); overflow: hidden; }
        .slot-stage::after { content: ""; position: absolute; top: -20%; left: -40%; width: 40%; height: 140%; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%); transform: skewX(-25deg); animation: sweep 1.6s ease-in-out infinite; }
        @keyframes sweep { 0% { left: -40%; } 100% { left: 120%; } }
        .float-stars { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
        .star { position: absolute; width: 10px; height: 10px; opacity: 0.8; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); animation: floatUp linear infinite; }
        @keyframes floatUp { 0% { transform: translateY(20px) scale(0.9); opacity: 0; } 15% { opacity: 0.9; } 100% { transform: translateY(-60px) scale(1); opacity: 0; } }
        .spark { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: radial-gradient(circle, #F59E0B 0%, #F97316 60%, rgba(0,0,0,0) 70%); animation: sparkOut 900ms ease-out forwards; }
        @keyframes sparkOut { 0% { transform: scale(0.4); opacity: 0; } 30% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
      `}</style>

      <div className="flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse" />
          <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-700" />
          <div className="absolute bottom-10 right-10 w-2 h-2 bg-white rounded-full animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-500" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-200" />
        </div>

        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-green-300 to-blue-400 rounded-full relative">
            <div className="absolute top-4 left-8 w-12 h-8 bg-green-500 rounded-full opacity-70" />
            <div className="absolute top-12 right-6 w-8 h-6 bg-green-500 rounded-full opacity-70" />
            <div className="absolute bottom-8 left-12 w-16 h-10 bg-green-500 rounded-full opacity-70" />
          </div>
        </div>

        <Card className="w-full max-w-lg bg-white/90 backdrop-blur-sm shadow-2xl border-0 mt-4 will-change-transform transform-gpu">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              きょうのミッションを えらぶよ！
            </h1>
          </div>

          <CardContent className="space-y-6">
            {/* 達成演出（紙吹雪） */}
            {showCelebrateFx && (
              <>
                <div className="cele-overlay" aria-hidden="true" />
                <div className="confetti" role="status" aria-live="polite" aria-label="お祝いの演出">
                  {confettiPieces.map((p) => (
                    <span
                      key={p.key}
                      className="confetti-piece"
                      style={{
                        left: `${p.left}vw`,
                        width: `${p.size}px`,
                        height: `${Math.round(p.size * 1.6)}px`,
                        backgroundColor: p.color,
                        animationName: p.bounce ? "fallSwayBounce" : "fallSway",
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                        transform: `rotate(${p.rotate}deg)`,
                        ["--sway" as any]: `${p.sway}px`,
                      } as CSSPropertiesWithVars}
                    />
                  ))}
                </div>
                <div className="pop-stamps" aria-hidden="true">
                  <div className="stamp" style={{ ["--rot" as any]: "-6deg" }}>🎉</div>
                  <div className="stamp delay-1" style={{ ["--rot" as any]: "6deg" }}>🌟</div>
                  <div className="stamp delay-2" style={{ ["--rot" as any]: "-12deg" }}>🏆</div>
                </div>
              </>
            )}

            {/* 確認（当日ロック） */}
            {showConfirmation && (
              <div className="text-center space-y-6">
                {loadingStatus ? (
                  <div className="text-white/90">よみこみちゅう…</div>
                ) : isLockedToday ? (
                  <>
                    <div className="bg-gradient-to-r from-emerald-100 to-green-100 p-6 rounded-xl border-2 border-emerald-200">
                      <h2 className="text-xl font-bold text-emerald-800 mb-2">今日は やったよ</h2>
                      <p className="text-sm text-emerald-700">また あした えらぼう！</p>
                    </div>
                    <div className="space-y-2">
                      <Button disabled className={`w-full h-16 text-xl font-bold rounded-xl bg-gray-300 text-gray-600 cursor-not-allowed ${feel}`}>
                        🎲 ルーレットは あした
                      </Button>
                      <Button variant="outline" onClick={resetTodayLock} className={`w-full h-12 text-sm font-semibold border-2 border-gray-300 hover:border-gray-400 ${feel}`}>
                        🔄 デバッグ: 当日ロックを リセット
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">ボタンを おしてね</h2>
                      <p className="text-sm text-gray-600">ルーレットを まわすと えらべるよ</p>
                    </div>
                    <Button onClick={startMissionAnimation} className={`w-full h-16 text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 ${feel}`}>
                      🎲 ルーレットを まわす
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* 抽選中 */}
            {isAnimating && (
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-xl border-2 border-orange-200 flex flex-col items-center justify-center relative overflow-hidden" style={{ minHeight: CARD_MIN_H }}>
                  <div className="float-stars">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const left = 10 + Math.random() * 80
                      const top = 20 + Math.random() * 60
                      const delay = Math.random() * 1.2
                      const dur = 1.8 + Math.random() * 1.2
                      const emoji = i % 2 === 0 ? "✨" : "⭐"
                      return (
                        <div key={i} className="star" style={{ left: `${left}%`, top: `${top}%`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
                          <span style={{ fontSize: 12 }}>{emoji}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="slot-stage mb-4 z-10">
                    <div className="slot-bounce leading-none select-none" style={{ fontSize: "min(18vw, 168px)", lineHeight: 1 }} aria-hidden="true">🎰</div>
                  </div>

                  <div className="mx-auto" style={{ height: TITLE_BOX_H, lineHeight: "1.6", display: "-webkit-box", WebkitBoxOrient: "vertical" as any, WebkitLineClamp: 3, overflow: "hidden", maxWidth: "28rem" }}>
                    <span className="text-2xl font-bold text-orange-800">{currentMission?.text ?? "えらび中…"}</span>
                  </div>

                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const left = 35 + Math.random() * 30
                      const top = 30 + Math.random() * 30
                      const delay = 200 * i + Math.random() * 200
                      return <span key={i} className="spark" style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}ms` }} />
                    })}
                  </div>

                  <p className="text-lg text-orange-700 mt-2 font-bold z-10">えらび中…</p>
                </div>
              </div>
            )}

            {/* 確定演出 */}
            {showDecided && (
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-8 rounded-xl border-4 border-green-300 relative overflow-hidden">
                  <div className="absolute inset-0">
                    <div className="absolute top-4 left-4 text-2xl animate-ping">🎉</div>
                    <div className="absolute top-4 right-4 text-2xl animate-ping delay-200">🎊</div>
                    <div className="absolute bottom-4 left-4 text-2xl animate-ping delay-400">🎈</div>
                    <div className="absolute bottom-4 right-4 text-2xl animate-ping delay-600">🎁</div>
                  </div>
                  <div className="text-6xl mb-4">🎯</div>
                  <h2 className="text-3xl font-bold text-green-700 mb-4">きまったよ！</h2>
                  <div className="text-6xl">🌟</div>
                </div>
              </div>
            )}

            {/* 抽選結果（description + むずかしさ追加） */}
            {showMission && !result && currentMission && (
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-xl border-2 border-orange-200" style={{ minHeight: 320 }}>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">今日のミッション</h2>
                  <div className="mb-4" style={{ height: TITLE_BOX_H, lineHeight: "1.6", display: "-webkit-box", WebkitBoxOrient: "vertical" as any, WebkitLineClamp: 3, overflow: "hidden" }}>
                    <span className="text-2xl font-bold text-orange-700">{currentMission.text}</span>
                  </div>
                  
                  {/* description表示 */}
                  {currentMission.description && (
                    <div className="text-center text-base text-gray-700 mb-3">{currentMission.description}</div>
                  )}
                  
                  {/* むずかしさ（★）表示 */}
                  {typeof currentMission.default_point === 'number' && (
                    <div className="text-center mb-3">{renderStars(currentMission.default_point)}</div>
                  )}

                  <div className="bg-white/80 p-4 rounded-lg border border-orange-300" style={{ minHeight: INFO_MIN_H }}>
                    <div className="flex justify-center items-center text-sm font-semibold gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-orange-600">⭐</span>
                        <span>{currentMission.points} ポイント</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleRerollFromResult} className={`flex-1 h-12 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 ${feel}`}>
                    🔄 ちがうのに する
                  </Button>
                  <Button onClick={handleSuccess} disabled={posting} className={`flex-1 h-12 text-lg font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-60 ${feel}`}>
                    ✅ できた！
                  </Button>
                </div>
              </div>
            )}

            {/* 達成画面 */}
            {result === "success" && currentMission && (
              <div className="space-y-4 text-center">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl border-2 border-green-200">
                  <h3 className="text-2xl font-bold text-green-700 mb-4">すごい！よくがんばったね！</h3>
                  <div className="space-y-2 text-lg font-semibold">
                    <p className="text-orange-600">⭐ {currentMission.points} ポイント</p>
                    <p className="text-emerald-700">🌲 今日は すぎの木 {currentMission.co2} 日ぶん お手伝い！</p>
                    <p className="text-purple-600">🏆 記念バッジ「{badgeName ?? "なし"}」</p>
                  </div>
                  <div className="mt-4 text-6xl">🐼</div>
                </div>

                {/* カメラ機能 */}
                <div className="mt-6 space-y-3">
                  {!camOn && !shotDataUrl && (
                    <Button onClick={startCamera} className={`w-full h-12 font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 ${feel}`} type="button">
                      📷 きねんしゃしんを とる
                    </Button>
                  )}

                  {(camOn || shotDataUrl) && (
                    <div className="rounded-xl border-2 border-emerald-200 bg-white/80 p-3">
                      <div className="mb-2 flex items-center gap-2 text-sm">
                        <span>🏅 バッジ:</span>
                        <button type="button" className="px-2 py-1 rounded border" onClick={() => { setBadgeEmoji("🐼"); setBadgeImgSrc(null) }}>🐼</button>
                        <button type="button" className="px-2 py-1 rounded border" onClick={() => { setBadgeEmoji("🦢"); setBadgeImgSrc(null) }}>🦢</button>
                        <button type="button" className="px-2 py-1 rounded border" onClick={() => { setBadgeEmoji("🐢"); setBadgeImgSrc(null) }}>🐢</button>
                      </div>

                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black/80">
                        {shotDataUrl ? (
                          <img src={shotDataUrl} alt="snapshot" className="w-full h-full object-contain" />
                        ) : (
                          <video ref={videoRef} playsInline muted className="w-full h-full object-contain" />
                        )}
                      </div>

                      <canvas ref={canvasRef} className="hidden" />

                      <div className="mt-3 flex gap-3">
                        {!shotDataUrl ? (
                          <>
                            <Button onClick={() => takeShot(currentMission?.text)} className={`flex-1 h-11 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white ${feel}`} type="button">
                              📸 シャッター
                            </Button>
                            <Button onClick={stopCamera} variant="outline" className={`h-11 px-4 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 ${feel}`} type="button">
                              ✖ とじる
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={downloadShot} className={`flex-1 h-11 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white ${feel}`} type="button">
                              ⬇ ほぞんする
                            </Button>
                            <Button onClick={() => { setShotDataUrl(null); startCamera() }} variant="outline" className={`h-11 px-4 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 ${feel}`} type="button">
                              🔁 とりなおす
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* リンク */}
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-xl border-2 border-blue-200">
                  <h4 className="text-lg font-bold text-blue-700 mb-3">もっと エコを がんばる？</h4>
                  <p className="text-sm text-blue-600 mb-3">省エネ ききに かえるのも いいね</p>
                  <div className="space-y-2">
                    <a href="https://home.tokyo-gas.co.jp/housing/index.html" target="_blank" rel="noopener noreferrer" className="block w-full">
                      <Button className={`w-full h-12 text-sm font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 ${feel}`}>
                        🔥 ガス機器の 相談
                      </Button>
                    </a>
                    <a href="https://www.tgrv.co.jp/reform/column/eco.html" target="_blank" rel="noopener noreferrer" className="block w-full">
                      <Button variant="outline" className={`w-full h-10 text-sm font-bold border-2 border-blue-300 hover:border-blue-400 text-blue-600 hover:text-blue-700 rounded-lg transform hover:scale-105 transition-all duration-200 bg-transparent ${feel}`}>
                        🏠 エコリフォームのポイント・相談
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-gray-200">
                  <Button onClick={() => router.push("/ecoboard")} className={`w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 ${feel}`}>
                    📊 成果を 見る
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
  