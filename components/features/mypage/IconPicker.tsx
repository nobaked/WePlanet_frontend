"use client";

import { useState } from "react";
import { clsx } from "clsx";

// 取得済みバッジをアイコン候補として並べる（名称のみ）
const CANDIDATES = [
  { id: "panda", label: "パンダ" },
  { id: "swan", label: "スワン" },
  { id: "turtle", label: "タートル" },
];

export default function IconPicker() {
  const [selected, setSelected] = useState("panda");

  return (
    <div>
      <div className="text-sm text-slate-500 mb-2">取得したバッジからアイコンを選択できます</div>
      <div className="grid grid-cols-3 gap-3">
        {CANDIDATES.map((c) => (
          <button
            key={c.id}
            className={clsx(
              "h-16 rounded-xl2 border bg-white text-slate-800 font-medium",
              selected === c.id ? "border-blue-400 ring-2 ring-blue-200" : "border-slate-200"
            )}
            onClick={() => setSelected(c.id)}
            type="button"
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="text-sm text-slate-500 mt-2">
        現在選択中: {CANDIDATES.find((x) => x.id === selected)?.label}
      </div>
    </div>
  );
}
