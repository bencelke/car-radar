import { AdminWorkspace } from "@/components/admin/AdminWorkspace";
import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { accentStyles } from "@/lib/config/accents";
import { adminCities, adminStats } from "@/lib/mock-data/car-radar";
import type { Submission } from "@/lib/types";
import { cn } from "@/lib/utils";

type AdminDashboardProps = {
  initialSubmissions: Submission[];
};

export function AdminDashboard({ initialSubmissions }: AdminDashboardProps) {
  const pendingCount = initialSubmissions.filter(
    (s) => s.status === "pending"
  ).length;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="hidden w-56 shrink-0 border-r border-white/[0.06] bg-[#0B1118]/80 p-4 lg:block">
        <p className="font-heading text-xs font-semibold uppercase tracking-widest text-[#64748B]">
          Admin
        </p>
        <nav className="mt-4 space-y-1">
          {["Overview", "Submissions", "Users", "Places", "Events", "Settings"].map(
            (item, i) => (
              <button
                key={item}
                type="button"
                className={cn(
                  "flex w-full rounded-lg px-3 py-2 text-left text-sm transition",
                  i <= 1
                    ? "bg-[#EF4444]/15 font-medium text-[#F8FAFC]"
                    : "text-[#64748B] hover:bg-[#151B24] hover:text-[#CBD5E1]"
                )}
              >
                {item}
                {item === "Submissions" && pendingCount > 0 ? (
                  <span className="ml-auto rounded-full bg-[#F97316]/20 px-1.5 text-[10px] text-[#F97316]">
                    {pendingCount}
                  </span>
                ) : null}
              </button>
            )
          )}
        </nav>
      </aside>

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-[#F8FAFC]">
            Admin Overview
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Platform metrics and submission moderation
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {adminStats.map((stat) => {
            const accent = accentStyles[stat.accent];
            return (
              <GlassPanel key={stat.label} className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
                  {stat.label}
                </p>
                <p className="mt-2 font-heading text-2xl font-bold text-[#F8FAFC]">
                  {stat.value}
                </p>
                {stat.change ? (
                  <p className={cn("mt-1 text-xs font-medium", accent.text)}>
                    {stat.change}
                  </p>
                ) : null}
              </GlassPanel>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <GlassPanel className="xl:col-span-2">
            <PanelHeader title="User Growth" />
            <div className="relative h-48 p-4 pt-0">
              <ChartPlaceholder />
            </div>
          </GlassPanel>

          <GlassPanel>
            <PanelHeader title="Top Categories" />
            <div className="flex items-center justify-center p-6">
              <DonutPlaceholder />
            </div>
          </GlassPanel>
        </div>

        <div className="mt-4">
          <GlassPanel>
            <PanelHeader title="Top Cities" />
            <ul className="space-y-3 p-4 pt-0">
              {adminCities.map((city) => (
                <li key={city.name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-[#CBD5E1]">{city.name}</span>
                    <span className="text-[#64748B]">{city.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#151B24]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#A855F7]"
                      style={{ width: `${city.percent}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>

        <AdminWorkspace
          initialSubmissions={initialSubmissions}
          pendingCount={pendingCount}
        />
      </div>
    </div>
  );
}

function ChartPlaceholder() {
  return (
    <svg
      viewBox="0 0 400 120"
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0)" />
        </linearGradient>
      </defs>
      <path
        d="M0,100 L40,85 L80,70 L120,75 L160,50 L200,55 L240,35 L280,40 L320,25 L360,30 L400,15 L400,120 L0,120 Z"
        fill="url(#chartFill)"
      />
      <path
        d="M0,100 L40,85 L80,70 L120,75 L160,50 L200,55 L240,35 L280,40 L320,25 L360,30 L400,15"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
      />
    </svg>
  );
}

function DonutPlaceholder() {
  const segments = [
    { color: "#EF4444", offset: 0 },
    { color: "#F97316", offset: 25 },
    { color: "#A855F7", offset: 50 },
    { color: "#3B82F6", offset: 75 },
  ];
  return (
    <div className="relative size-32">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        {segments.map((seg) => (
          <circle
            key={seg.color}
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={seg.color}
            strokeWidth="12"
            strokeDasharray={`${25 * 2.51} ${100 * 2.51}`}
            strokeDashoffset={-seg.offset * 2.51}
            opacity={0.85}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-[#64748B]">Categories</span>
      </div>
    </div>
  );
}
