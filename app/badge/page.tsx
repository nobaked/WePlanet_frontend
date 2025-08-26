"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header"

interface Badge {
  badge_id: number;
  badge_name: string;
  description: string;
  category_name: string;
  badge_image: string;
  unlock_order: number;
  is_mystery?: boolean;
}

interface UserProgress {
  total_points: number;
  total_co2_reduction: number;
  current_badge_count: number;
  total_missions_completed: number;
}

interface BadgeDisplay {
  badge_id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  is_mystery: boolean;
  unlock_order: number;
}

export default function EcobadgePage() {
  const [hoveredBadge, setHoveredBadge] = useState<number | null>(null);
  const [badgeDisplays, setBadgeDisplays] = useState<BadgeDisplay[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const router = useRouter();

  // 一時的なユーザーID（実際のプロジェクトでは認証から取得）
  const userId = 1;

  useEffect(() => {
    fetchBadgeData();
    
    // ページがフォーカスされたときにデータを再取得
    const handleFocus = () => {
      fetchBadgeData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // ページの可視状態が変わったときにデータを再取得
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchBadgeData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 定期的にデータを更新
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBadgeData();
    }, 5000); // 5秒ごとにデータをチェック

    return () => clearInterval(interval);
  }, []);

  const fetchBadgeData = async () => {
    try {
      // ローディングは初回のみ表示
      if (badgeDisplays.length === 0) {
        setIsLoading(true);
      }
      
      // MySQLデータベースから並列でデータ取得
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";

      const [allBadgesRes, userProgressRes] = await Promise.all([
        fetch(`${API_BASE}/badge/badges?` + Date.now()), 
        fetch(`${API_BASE}/badge/user-progress/${userId}?` + Date.now())
      ]);

      if (allBadgesRes.ok && userProgressRes.ok) {
        const allBadges = await allBadgesRes.json();
        const userProgressData = await userProgressRes.json();

        setUserProgress(userProgressData);
        generateBadgeDisplays(allBadges, userProgressData);
        setIsOffline(false); // オンライン状態
      } else {
        throw new Error('API request failed');
      }
      
    } catch (error) {
      console.error('Error fetching badge data:', error);
      setIsOffline(true); // オフライン状態
      
      // エラー時のフォールバック処理
      handleOfflineMode();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineMode = () => {
    // ローカルストレージから進行状況を取得
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setUserProgress(progress);
      setEmergencyBadgeData(progress.current_badge_count);
    } else {
      // 初回アクセス時の緊急フォールバック
      const initialProgress = {
        total_points: 0,
        total_co2_reduction: 0,
        current_badge_count: 1,
        total_missions_completed: 0
      };
      setUserProgress(initialProgress);
      setEmergencyBadgeData(1);
    }
  };

  const generateBadgeDisplays = (allBadges: Badge[], userProgressData: UserProgress) => {
    // MySQLデータベースから取得したデータに基づいて表示を生成
    const currentBadgeCount = userProgressData.current_badge_count || 1;
    
    const displays: BadgeDisplay[] = allBadges.map(badge => {
      // バッジID が現在の取得数以下の場合は取得済みとして表示
      const isUnlocked = badge.badge_id <= currentBadgeCount;
      
      return {
        badge_id: badge.badge_id,
        name: isUnlocked ? badge.badge_name : "？？？",
        description: isUnlocked ? badge.description : "ミッションをクリアして解放しよう！",
        category: isUnlocked ? badge.category_name : "未知",
        image: isUnlocked ? badge.badge_image : "/images/mystery_badge.png",
        is_mystery: !isUnlocked,
        unlock_order: badge.unlock_order || badge.badge_id
      };
    });

    setBadgeDisplays(displays.sort((a, b) => a.unlock_order - b.unlock_order));
  };

  // 緊急時フォールバック用（MySQLが利用できない場合のみ）
  const setEmergencyBadgeData = (currentBadgeCount: number = 1) => {
    console.warn('🚨 Emergency fallback mode: Using hardcoded badge data');
    
    // 最小限のフォールバックデータ（緊急時のみ使用）
    const emergencyBadgeData = [
      {
        badge_id: 1,
        name: "ジャイアントパンダ",
        description: "竹林の減少により生息地が脅かされている愛らしい動物。中国の森林保護が重要です。",
        category: "絶滅危惧動物",
        image: "https://cdn1.genspark.ai/user-upload-image/gpt_image_generated/1a9d45bb-f698-4cd7-b252-dfa9266138d2",
        is_mystery: false,
        unlock_order: 1
      },
      {
        badge_id: 2,
        name: "？？？",
        description: "ミッションをクリアして解放しよう！",
        category: "未知",
        image: "/images/mystery_badge.png",
        is_mystery: true,
        unlock_order: 2
      },
      {
        badge_id: 3,
        name: "？？？",
        description: "ミッションをクリアして解放しよう！",
        category: "未知",
        image: "/images/mystery_badge.png",
        is_mystery: true,
        unlock_order: 3
      },
      {
        badge_id: 4,
        name: "？？？",
        description: "ミッションをクリアして解放しよう！",
        category: "未知",
        image: "/images/mystery_badge.png",
        is_mystery: true,
        unlock_order: 4
      },
      {
        badge_id: 5,
        name: "？？？",
        description: "ミッションをクリアして解放しよう！",
        category: "未知",
        image: "/images/mystery_badge.png",
        is_mystery: true,
        unlock_order: 5
      },
      {
        badge_id: 6,
        name: "？？？",
        description: "ミッションをクリアして解放しよう！",
        category: "未知",
        image: "/images/mystery_badge.png",
        is_mystery: true,
        unlock_order: 6
      },
      {
        badge_id: 7,
        name: "？？？",
        description: "ミッションをクリアして解放しよう！",
        category: "未知",
        image: "/images/mystery_badge.png",
        is_mystery: true,
        unlock_order: 7
      },
      {
        badge_id: 8,
        name: "？？？",
        description: "ミッションをクリアして解放しよう！",
        category: "未知",
        image: "/images/mystery_badge.png",
        is_mystery: true,
        unlock_order: 8
      }
    ];

    // 現在の進行状況に基づいてバッジを設定
    const displays: BadgeDisplay[] = emergencyBadgeData.map((badge, index) => {
      const isUnlocked = index < currentBadgeCount;
      return {
        ...badge,
        name: isUnlocked ? (index === 0 ? badge.name : "取得済みバッジ") : "？？？",
        description: isUnlocked ? (index === 0 ? badge.description : "エコ活動で獲得したバッジです") : "ミッションをクリアして解放しよう！",
        category: isUnlocked ? (index === 0 ? badge.category : "エコバッジ") : "未知",
        is_mystery: !isUnlocked
      };
    });
    
    setBadgeDisplays(displays);
  };

  const handleReset = async () => {
    if (confirm('進行状況をリセットしますか？全てのバッジが初期状態に戻ります。')) {
      try {
        // MySQLデータベースのリセットAPI呼び出し
        const response = await fetch(`/api/reset-progress/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          await fetchBadgeData();
          alert('リセットが完了しました！');
        } else {
          throw new Error('Reset failed');
        }
      } catch (error) {
        console.error('Error resetting progress:', error);
        
        // APIが利用できない場合はローカルリセット
        const initialProgress = {
          total_points: 0,
          total_co2_reduction: 0,
          current_badge_count: 1,
          total_missions_completed: 0
        };
        
        localStorage.setItem('userProgress', JSON.stringify(initialProgress));
        setUserProgress(initialProgress);
        setEmergencyBadgeData(1);
        alert('リセットが完了しました！（オフラインモード）');
      }
    }
  };

  // 手動更新ボタン
  const handleRefresh = () => {
    fetchBadgeData();
  };

  const getCategoryEmoji = (category: string): string => {
    const emojiMap: { [key: string]: string } = {
      "絶滅危惧動物": "🐾",
      "海洋生物・魚類": "🐟", 
      "希少植物": "🌿",
      "鳥類": "🦅",
      "未知": "❓",
      "エコバッジ": "🌍"
    };
    return emojiMap[category] || "🌍";
  };

  const getBadgeEmoji = (badgeId: number, isUnlocked: boolean): string => {
    if (!isUnlocked) return "❓";
    
    const emojiMap: { [key: number]: string } = {
      1: "🐼", // ジャイアントパンダ
      2: "🐢", // アオウミガメ  
      3: "🌳", // バオバブの木
      4: "🦢", // トキ
      5: "🐅", // アムールトラ
      6: "🦈", // ジンベエザメ
      7: "🌺", // ラフレシア
      8: "🦅"  // カリフォルニアコンドル
    };
    return emojiMap[badgeId] || "🌍";
  };

  if (isLoading && badgeDisplays.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-green-400 to-blue-600">
        <Header currentPage="/ecobadge" />
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>MySQLからバッジ情報を読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-green-400 to-blue-600">
      <Header currentPage="/ecobadge" />

      <div className="flex items-center justify-center p-4 relative">
        {/* Space background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-10 right-10 w-2 h-2 bg-white rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-200"></div>
        </div>

        {/* Earth illustration */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-green-300 to-blue-400 rounded-full relative">
            <div className="absolute top-4 left-8 w-12 h-8 bg-green-500 rounded-full opacity-70"></div>
            <div className="absolute top-12 right-6 w-8 h-6 bg-green-500 rounded-full opacity-70"></div>
            <div className="absolute bottom-8 left-12 w-16 h-10 bg-green-500 rounded-full opacity-70"></div>
          </div>
        </div>

        <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-lg mt-4">
          <div className="p-6 text-center">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🏆 エコバッジ
              </h1>
              
            </div>
            <p className="text-lg text-gray-600 font-medium">絶滅危惧種を守ろう！</p>

           

            {/* カーソル説明文 */}
            {!isOffline && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200 mt-4">
                <p className="text-sm text-blue-700 font-medium">💡 カーソルを合わせるとバッジの説明が表示されます</p>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Badge collection */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-700 text-center">バッジコレクション</h3>
              <div className="grid grid-cols-2 gap-3 relative">
                {badgeDisplays.map((badge, index) => (
                  <div
                    key={badge.badge_id}
                    className={`p-3 rounded-xl border-2 text-center shadow-lg relative cursor-pointer transform hover:scale-105 transition-all duration-200 ${
                      badge.is_mystery
                        ? "bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300"
                        : "bg-gradient-to-br from-green-100 to-emerald-100 border-green-300"
                    }`}
                    onMouseEnter={() => setHoveredBadge(index)}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    <div className="text-3xl mb-2">
                      {getBadgeEmoji(badge.badge_id, !badge.is_mystery)}
                    </div>
                    <h4 className={`font-bold text-sm mb-1 ${badge.is_mystery ? 'text-purple-700' : 'text-green-700'}`}>
                      {badge.name}
                    </h4>
                    <p className={`text-xs mb-2 leading-tight ${badge.is_mystery ? 'text-purple-600' : 'text-green-600'}`}>
                      環境保護に貢献
                    </p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {getCategoryEmoji(badge.category)} {badge.category}
                    </span>
                    <div className="mt-2">
                      <span className={`inline-block text-white text-xs px-2 py-1 rounded-full font-bold ${
                        badge.is_mystery ? 'bg-purple-500' : 'bg-green-500'
                      }`}>
                        {badge.is_mystery ? 'MYSTERY' : 'GET!'}
                      </span>
                    </div>

                    {badge.is_mystery && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                    )}
                  </div>
                ))}

                {/* 全体にオーバーレイするポップアップ */}
                {hoveredBadge !== null && !isOffline && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className={`w-80 p-5 rounded-xl shadow-2xl border-2 ${
                      badgeDisplays[hoveredBadge]?.is_mystery 
                        ? 'bg-purple-50 border-purple-300' 
                        : 'bg-white border-green-300'
                    } transform scale-100 animate-in fade-in duration-200`}>
                      <div className={`text-center ${
                        badgeDisplays[hoveredBadge]?.is_mystery ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        <div className={`font-bold mb-3 text-lg ${
                          badgeDisplays[hoveredBadge]?.is_mystery ? '' : 'text-green-700'
                        }`}>
                          {badgeDisplays[hoveredBadge]?.name}
                        </div>
                        <div className="text-sm leading-relaxed">
                          {badgeDisplays[hoveredBadge]?.description}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border-2 border-purple-200 text-center">
              <p className="text-lg font-bold text-purple-700">
                取得済み: {userProgress?.current_badge_count || 0} / {badgeDisplays.length} バッジ
              </p>
              <p className="text-sm text-purple-600 mb-2">
                残り{(badgeDisplays.length - (userProgress?.current_badge_count || 1))}個のミステリーバッジが待っています！
              </p>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${((userProgress?.current_badge_count || 0) / badgeDisplays.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* 全バッジ獲得時のリセットボタン */}
            {(userProgress?.current_badge_count || 1) >= badgeDisplays.length && badgeDisplays.length > 0 && (
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-xl border-2 border-orange-200 mb-4">
                  <p className="text-lg font-bold text-orange-700 mb-2">🎉 おめでとうございます！</p>
                  <p className="text-sm text-orange-600">全てのエコバッジを獲得しました！</p>
                  <p className="text-xs text-gray-500 mt-2">リセットボタンで再び最初から挑戦できます</p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  🔄 リセットして再チャレンジ
                </button>
              </div>
            )}

            {/* ミッション挑戦ボタンを削除（1日1回ルールのため） */}
          </div>
        </div>
      </div>
    </div>
  );
}