import { ReactNode } from "react";
import { clsx } from "clsx";

export default function ListItem({
  label,
  right,
  onClick,
  danger,
}: {
  label: string;
  right?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "w-full flex items-center justify-between px-4 h-12 rounded-xl2 border text-left",
        "bg-white hover:bg-slate-50 transition-colors",
        danger ? "border-red-200 text-red-700" : "border-slate-200 text-slate-800"
      )}
    >
      <span className="truncate">{label}</span>
      {right && <span className="ml-3 shrink-0 text-slate-500">{right}</span>}
    </button>
  );
}
