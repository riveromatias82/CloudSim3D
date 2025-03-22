import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}

const VARIANT_CLASS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-cyan-400/90 text-slate-950 hover:bg-cyan-300 disabled:bg-slate-700 disabled:text-slate-400",
  secondary:
    "bg-slate-800 text-slate-100 border border-slate-600 hover:border-cyan-400/70 hover:text-cyan-200",
  ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-slate-800",
};

export function Button({ variant = "secondary", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
