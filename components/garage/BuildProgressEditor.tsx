"use client";

import { useState } from "react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { BuildProgressUpdate } from "@/lib/types";

type BuildProgressEditorProps = {
  onAdd: (input: {
    title: string;
    body?: string;
    type: BuildProgressUpdate["type"];
    horsepowerSnapshot?: number;
  }) => Promise<void>;
};

export function BuildProgressEditor({ onAdd }: BuildProgressEditorProps) {
  const { t } = useLocale();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="rounded-xl border border-white/[0.08] bg-[#0B1118]/60 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setBusy(true);
        void onAdd({
          title: title.trim(),
          body: body.trim() || undefined,
          type: "general",
          horsepowerSnapshot: hp ? Number(hp) : undefined,
        })
          .then(() => {
            setTitle("");
            setBody("");
            setHp("");
          })
          .finally(() => setBusy(false));
      }}
    >
      <p className="text-xs font-semibold text-[#F8FAFC]">
        {t.garage.addProgressUpdate}
      </p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t.garage.progressTitle}
        className="mt-2 w-full rounded-lg border border-white/[0.08] bg-[#151B24] px-3 py-2 text-sm text-[#F8FAFC]"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t.garage.progressBody}
        rows={2}
        className="mt-2 w-full rounded-lg border border-white/[0.08] bg-[#151B24] px-3 py-2 text-sm text-[#F8FAFC]"
      />
      <input
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        placeholder={t.garage.horsepower}
        inputMode="numeric"
        className="mt-2 w-full rounded-lg border border-white/[0.08] bg-[#151B24] px-3 py-2 text-sm text-[#F8FAFC]"
      />
      <Button
        type="submit"
        size="sm"
        disabled={busy || !title.trim()}
        className="mt-2 border border-[#3B82F6]/40 bg-[#3B82F6]/15"
      >
        {t.garage.addProgressUpdate}
      </Button>
    </form>
  );
}
