"use client";

import { useMemo, useState } from "react";

import { GarageModCard } from "@/components/garage/GarageModCard";
import { GarageModForm } from "@/components/garage/GarageModForm";
import {
  GarageModFilters,
  type GarageModCategoryFilterId,
  type GarageModFilterId,
} from "@/components/garage/GarageModFilters";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { GarageMod } from "@/lib/types";
import type { CreateGarageModInput } from "@/lib/repositories/garage-mods";

type GarageModListProps = {
  mods: GarageMod[];
  onCreate: (input: CreateGarageModInput) => Promise<void>;
  onUpdate: (modId: string, patch: Partial<GarageMod>) => Promise<void>;
  onDelete: (modId: string) => Promise<void>;
  carId: string;
  ownerUid: string;
};

export function GarageModList({
  mods,
  onCreate,
  onUpdate,
  onDelete,
  carId,
  ownerUid,
}: GarageModListProps) {
  const { t } = useLocale();
  const [filter, setFilter] = useState<GarageModFilterId>("all");
  const [categoryFilter, setCategoryFilter] =
    useState<GarageModCategoryFilterId>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GarageMod | null>(null);

  const visible = useMemo(() => {
    return mods.filter((m) => {
      if (filter !== "all" && m.status !== filter) return false;
      if (categoryFilter !== "all" && m.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [categoryFilter, filter, mods]);

  return (
    <div className="space-y-3">
      <GarageModFilters
        statusFilter={filter}
        categoryFilter={categoryFilter}
        onStatusChange={setFilter}
        onCategoryChange={setCategoryFilter}
      />
      <Button
        type="button"
        size="sm"
        className="border border-[#EF4444]/40 bg-[#EF4444]/15"
        onClick={() => {
          setEditing(null);
          setShowForm(true);
        }}
      >
        {t.garage.addMod}
      </Button>
      {showForm ? (
        <GarageModForm
          initial={editing ?? undefined}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={async (values) => {
            if (editing) {
              await onUpdate(editing.id, values);
            } else {
              await onCreate({
                ...values,
                carId,
                ownerUid,
              });
            }
            setShowForm(false);
            setEditing(null);
          }}
        />
      ) : null}
      <ul className="space-y-2">
        {visible.map((mod) => (
          <li key={mod.id}>
            <GarageModCard
              mod={mod}
              onEdit={() => {
                setEditing(mod);
                setShowForm(true);
              }}
              onDelete={() => void onDelete(mod.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
