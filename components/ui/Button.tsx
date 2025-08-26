import { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "google" | "secondary" | "outline"; // ← outline 追加
  full?: boolean;
};

export function Button({ variant = "primary", full, className, ...props }: Props) {
  const base =
    "h-12 px-5 rounded-xl shadow-card transition-transform duration-200 active:scale-[0.98] font-semibold";
  const styles = {
    primary:
      "text-white bg-gradient-to-r from-blue-500 via-green-400 to-blue-600 hover:scale-105",
    google: "text-white bg-red-500 hover:scale-105",
    secondary: "text-slate-800 bg-white hover:scale-105",
    outline: "text-slate-800 bg-white border border-gray-300 hover:bg-gray-50", // ← 追加
  }[variant];

  return (
    <button className={clsx(base, styles, full && "w-full", className)} {...props} />
  );
}
