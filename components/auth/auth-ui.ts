/** Shared login page design tokens — spacing, typography, surfaces. */
export const authUi = {
  card: {
    shell:
      "rounded-[1.375rem] border border-white/[0.1] bg-[#0B1118]/88 shadow-[0_0_56px_-18px_rgba(59,130,246,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl sm:rounded-[1.625rem]",
    padding: "p-5 sm:p-7",
    width: "w-full max-w-[440px]",
  },
  type: {
    brandHeadline:
      "font-heading text-[1.75rem] font-bold leading-[1.1] tracking-tight text-[#F8FAFC] sm:text-[2.125rem] lg:text-[2.375rem]",
    brandSubcopy:
      "text-[0.9375rem] leading-[1.65] text-[#94A3B8] sm:text-base",
    cardHeading:
      "font-heading text-[1.625rem] font-semibold leading-[1.15] tracking-tight text-[#F8FAFC] sm:text-[1.875rem]",
    cardSubcopy: "text-[0.9375rem] leading-[1.6] text-[#94A3B8]",
    label:
      "block text-xs font-semibold uppercase tracking-[0.04em] text-[#94A3B8]",
    labelGap: "mb-2",
    helper: "text-[0.8125rem] leading-[1.55] text-[#64748B]",
    legal:
      "mx-auto max-w-[20rem] text-center text-[0.8125rem] leading-[1.55] text-[#64748B] sm:max-w-[22rem]",
    benefit: "text-[0.9375rem] font-medium leading-snug text-[#CBD5E1]",
  },
  input:
    "h-[3.125rem] w-full rounded-2xl border border-white/[0.08] bg-[#151B24]/80 px-3.5 text-[0.9375rem] text-[#F8FAFC] outline-none transition focus:border-[#3B82F6]/45 focus:ring-2 focus:ring-[#3B82F6]/15 disabled:opacity-60",
  button: {
    provider:
      "flex h-[3.125rem] min-h-[3.125rem] w-full items-center justify-center gap-3 rounded-2xl border px-4 text-[0.9375rem] font-semibold transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1118] disabled:opacity-60",
    primary:
      "h-[3.25rem] w-full border border-[#3B82F6]/45 bg-gradient-to-r from-[#3B82F6]/25 to-[#6366F1]/20 text-[0.9375rem] font-semibold text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:from-[#3B82F6]/35 hover:to-[#6366F1]/28",
    guest:
      "flex h-[3.125rem] min-h-[3.125rem] w-full items-center justify-center gap-2.5 rounded-2xl border border-white/[0.12] bg-transparent px-4 text-[0.9375rem] font-medium text-[#CBD5E1] transition hover:border-white/[0.18] hover:bg-white/[0.03] hover:text-[#F8FAFC] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1118] disabled:opacity-50",
  },
  benefitRow:
    "group flex items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-[#0B1118]/60 px-4 py-3.5 text-left transition hover:border-white/[0.12] hover:bg-[#0B1118]/75",
  benefitIcon:
    "flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-gradient-to-br from-[#EF4444]/12 to-[#3B82F6]/12 text-[#F8FAFC] transition group-hover:from-[#EF4444]/18 group-hover:to-[#3B82F6]/18",
  tabs: {
    shell: "flex gap-1 rounded-2xl border border-white/[0.07] bg-[#151B24]/55 p-1",
    item: "min-h-[2.75rem] flex-1 rounded-xl px-3 text-[0.875rem] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40",
    active: "bg-[#3B82F6]/18 text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
    inactive: "text-[#64748B] hover:text-[#CBD5E1]",
  },
} as const;
