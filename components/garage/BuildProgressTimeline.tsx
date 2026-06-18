"use client";

import { BuildProgressEditor } from "@/components/garage/BuildProgressEditor";
import { BuildProgressItem } from "@/components/garage/BuildProgressItem";
import type { BuildProgressUpdate } from "@/lib/types";

type BuildProgressTimelineProps = {
  updates: BuildProgressUpdate[];
  onAdd: (input: {
    title: string;
    body?: string;
    type: BuildProgressUpdate["type"];
    horsepowerSnapshot?: number;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function BuildProgressTimeline({
  updates,
  onAdd,
  onDelete,
}: BuildProgressTimelineProps) {
  return (
    <div className="space-y-4">
      <BuildProgressEditor onAdd={onAdd} />

      <ol className="relative space-y-3 border-l border-white/[0.08] pl-4">
        {updates.map((update) => (
          <BuildProgressItem
            key={update.id}
            update={update}
            onDelete={(id) => void onDelete(id)}
          />
        ))}
      </ol>
    </div>
  );
}
