import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, subtitle, actions, children, className = "" }: PanelProps) {
  return (
    <section
      className={`flex min-h-0 flex-col border border-slate-800 bg-slate-900/80 backdrop-blur-md ${className}`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
        </div>
        {actions}
      </header>
      <div className="panel-scroll min-h-0 flex-1 overflow-auto p-4">{children}</div>
    </section>
  );
}
