import { ReactNode } from "react";
import { clsx } from "clsx";

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export default function SectionCard({ title, subtitle, children, className }: Props) {
  return (
    <div className={clsx("bg-white/90 backdrop-blur-sm shadow-card rounded-2xl p-5", className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <div className="text-lg font-bold text-slate-800">{title}</div>}
          {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
