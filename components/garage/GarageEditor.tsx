"use client";

import { useCallback, useState } from "react";

import { BuildProgressTimeline } from "@/components/garage/BuildProgressTimeline";
import { GarageCarImageUploader } from "@/components/garage/GarageCarImageUploader";
import { GarageHero } from "@/components/garage/GarageHero";
import { GarageModList } from "@/components/garage/GarageModList";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { calculateGarageCompletion } from "@/lib/garage/calculate-garage-completion";
import { buildStageLabel } from "@/lib/garage/labels";
import {
  createBuildProgressUpdate,
  deleteBuildProgressUpdate,
  getBuildUpdates,
} from "@/lib/repositories/garage-updates";
import {
  createGarageMod,
  deleteGarageMod,
  getGarageMods,
  updateGarageMod,
  type CreateGarageModInput,
} from "@/lib/repositories/garage-mods";
import {
  publishGarage,
  unpublishGarage,
  updateGarage,
  linkMemberProfileToGarage,
} from "@/lib/repositories/garages";
import { publishGarageCar, updateGarageCar } from "@/lib/repositories/garage-cars";
import type {
  BuildProgressUpdate,
  BuildStage,
  GarageCar,
  GarageMod,
  GarageProfile,
  GarageVisibility,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type TabId = "overview" | "car" | "mods" | "progress" | "settings";

type GarageEditorProps = {
  garage: GarageProfile;
  car: GarageCar;
  initialMods: GarageMod[];
  initialUpdates: BuildProgressUpdate[];
  claimedMemberId?: string | null;
  onRefresh: () => void;
};

const buildStages: BuildStage[] = [
  "stock",
  "stage_1",
  "stage_2",
  "stage_3",
  "track",
  "show",
  "custom",
];

export function GarageEditor({
  garage,
  car,
  initialMods,
  initialUpdates,
  claimedMemberId,
  onRefresh,
}: GarageEditorProps) {
  const { t } = useLocale();
  const { user, isAdmin } = useAuth();
  const uid = user!.uid;
  const [tab, setTab] = useState<TabId>("overview");
  const [mods, setMods] = useState(initialMods);
  const [updates, setUpdates] = useState(initialUpdates);
  const [carState, setCarState] = useState(car);
  const [garageState, setGarageState] = useState(garage);
  const [busy, setBusy] = useState(false);

  const completion = calculateGarageCompletion({
    garage: garageState,
    car: carState,
    modCount: mods.length,
  });

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: t.garage.garageOverview },
    { id: "car", label: t.garage.carDetails },
    { id: "mods", label: t.garage.mods },
    { id: "progress", label: t.garage.buildProgress },
    { id: "settings", label: t.garage.profileSettings },
  ];

  const refreshMods = useCallback(async () => {
    setMods(await getGarageMods(carState.id));
  }, [carState.id]);

  const refreshUpdates = useCallback(async () => {
    setUpdates(await getBuildUpdates(carState.id));
  }, [carState.id]);

  async function saveCar(patch: Partial<GarageCar>) {
    setBusy(true);
    try {
      const updated = await updateGarageCar(carState.id, uid, patch, isAdmin);
      setCarState(updated);
    } finally {
      setBusy(false);
    }
  }

  async function saveGarage(patch: Partial<GarageProfile>) {
    setBusy(true);
    try {
      const updated = await updateGarage(uid, patch, isAdmin);
      setGarageState(updated);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
          {t.garage.myGarage}
        </p>
        <h1 className="font-heading text-xl font-bold text-[#F8FAFC]">
          {t.garage.myGarage}
        </h1>
      </div>

      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0B1118]/60 p-1">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium",
              tab === id
                ? "bg-[#3B82F6]/20 text-[#F8FAFC]"
                : "text-[#64748B] hover:text-[#CBD5E1]"
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <div className="space-y-4">
          {completion < 100 ? (
            <div className="rounded-xl border border-white/[0.08] bg-[#0B1118]/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    {t.garage.garageCompletion}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#E2E8F0]">
                    {t.garage.completeYourGarage}
                  </p>
                </div>
                <span className="text-lg font-bold tabular-nums text-[#93C5FD]">
                  {completion}%
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#A855F7] transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          ) : null}
          <GarageHero
            garage={garageState}
            car={carState}
            publicHref={
              garageState.status === "published"
                ? `/garage/${garageState.id}`
                : undefined
            }
          />
        </div>
      ) : null}

      {tab === "car" ? (
        <CarDetailsForm
          car={carState}
          busy={busy}
          onSave={saveCar}
          t={t}
          buildStages={buildStages}
        />
      ) : null}

      {tab === "mods" ? (
        <GarageModList
          mods={mods}
          carId={carState.id}
          ownerUid={uid}
          onCreate={async (input) => {
            await createGarageMod(input);
            await refreshMods();
          }}
          onUpdate={async (modId, patch) => {
            await updateGarageMod(modId, uid, patch, isAdmin);
            await refreshMods();
          }}
          onDelete={async (modId) => {
            await deleteGarageMod(modId, uid, isAdmin);
            await refreshMods();
          }}
        />
      ) : null}

      {tab === "progress" ? (
        <BuildProgressTimeline
          updates={updates}
          onAdd={async (input) => {
            await createBuildProgressUpdate({
              ...input,
              carId: carState.id,
              ownerUid: uid,
              type: input.type ?? "general",
            });
            await refreshUpdates();
          }}
          onDelete={async (id) => {
            await deleteBuildProgressUpdate(id, uid, isAdmin);
            await refreshUpdates();
          }}
        />
      ) : null}

      {tab === "settings" ? (
        <div className="space-y-4 rounded-xl border border-white/[0.08] bg-[#0B1118]/80 p-4">
          <GarageCarImageUploader
            ownerUid={uid}
            carId={carState.id}
            currentImageUrl={carState.primaryImageUrl}
            onUploaded={(url) => {
              setCarState((c) => ({ ...c, primaryImageUrl: url }));
              onRefresh();
            }}
          />
          <label className="block text-xs text-[#94A3B8]">
            {t.garage.visibility}
            <select
              value={garageState.visibility}
              onChange={(e) =>
                void saveGarage({
                  visibility: e.target.value as GarageVisibility,
                })
              }
              className="mt-1 h-9 w-full rounded-lg border border-white/[0.08] bg-[#151B24] px-2 text-sm"
            >
              <option value="public">{t.garage.public}</option>
              <option value="club_only">{t.garage.clubOnly}</option>
              <option value="private">{t.garage.private}</option>
            </select>
          </label>
          {claimedMemberId && !garageState.memberProfileId ? (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void linkMemberProfileToGarage(uid, claimedMemberId, isAdmin).then(
                  (g) => setGarageState(g)
                )
              }
            >
              {t.garage.connectMemberProfile}
            </Button>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {garageState.status === "published" ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void unpublishGarage(uid, isAdmin).then((g) => setGarageState(g))
                }
              >
                {t.garage.unpublishGarage}
              </Button>
            ) : (
              <Button
                type="button"
                className="border border-[#22C55E]/40 bg-[#22C55E]/15"
                onClick={() =>
                  void publishGarage(uid, isAdmin)
                    .then((g) => setGarageState(g))
                    .then(() => publishGarageCar(carState.id, uid, isAdmin))
                }
              >
                {t.garage.publishGarage}
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CarDetailsForm({
  car,
  busy,
  onSave,
  t,
  buildStages,
}: {
  car: GarageCar;
  busy: boolean;
  onSave: (patch: Partial<GarageCar>) => Promise<void>;
  t: ReturnType<typeof useLocale>["t"];
  buildStages: BuildStage[];
}) {
  const [make, setMake] = useState(car.make);
  const [model, setModel] = useState(car.model);
  const [year, setYear] = useState(car.year ?? "");
  const [horsepower, setHorsepower] = useState(
    car.horsepower != null ? String(car.horsepower) : ""
  );
  const [buildStage, setBuildStage] = useState(car.buildStage ?? "stock");
  const [buildSummary, setBuildSummary] = useState(car.buildSummary ?? "");

  return (
    <form
      className="space-y-3 rounded-xl border border-white/[0.08] bg-[#0B1118]/80 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave({
          make,
          model,
          year,
          horsepower: horsepower ? Number(horsepower) : undefined,
          buildStage,
          buildSummary,
        });
      }}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={make}
          onChange={(e) => setMake(e.target.value)}
          placeholder={t.garage.make}
          className="h-9 rounded-lg border border-white/[0.08] bg-[#151B24] px-3 text-sm"
        />
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={t.garage.model}
          className="h-9 rounded-lg border border-white/[0.08] bg-[#151B24] px-3 text-sm"
        />
      </div>
      <input
        value={year}
        onChange={(e) => setYear(e.target.value)}
        placeholder={t.garage.year}
        className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#151B24] px-3 text-sm"
      />
      <input
        value={horsepower}
        onChange={(e) => setHorsepower(e.target.value)}
        placeholder={t.garage.horsepower}
        type="number"
        className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#151B24] px-3 text-sm"
      />
      <select
        value={buildStage}
        onChange={(e) => setBuildStage(e.target.value as BuildStage)}
        className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#151B24] px-2 text-sm"
      >
        {buildStages.map((s) => (
          <option key={s} value={s}>
            {buildStageLabel(s, t)}
          </option>
        ))}
      </select>
      <textarea
        value={buildSummary}
        onChange={(e) => setBuildSummary(e.target.value)}
        placeholder={t.garage.buildSummary}
        rows={3}
        className="w-full rounded-lg border border-white/[0.08] bg-[#151B24] px-3 py-2 text-sm"
      />
      <Button type="submit" disabled={busy}>
        {t.garage.save}
      </Button>
    </form>
  );
}
