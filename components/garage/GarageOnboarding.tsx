"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Eye, Globe, Lock, Users } from "lucide-react";

import {
  GarageChoiceCard,
  GarageFieldGroup,
  GarageTextarea,
  GarageTextInput,
} from "@/components/garage/garage-form";
import { GarageOnboardingShell } from "@/components/garage/GarageOnboardingShell";
import { GaragePhotoStep } from "@/components/garage/GaragePhotoStep";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Dictionary } from "@/lib/i18n";
import { buildStageLabel } from "@/lib/garage/labels";
import {
  canSkipGarageStep,
  hasGarageBuildInput,
  isGarageCarValid,
  isGarageIdentityValid,
  isGarageReviewValid,
  parseGarageTags,
  sanitizeGarageBuildPatch,
  sanitizeGarageCarInput,
  sanitizeGarageIdentity,
  validateGarageBuild,
  validateGarageCar,
  validateGarageIdentity,
  type GarageBuildInput,
  type GarageCarInput,
  type GarageIdentityInput,
  type GarageOnboardingStepIndex,
  type GarageValidationMessageKey,
} from "@/lib/garage/garage-onboarding-schema";
import {
  createGarageForUser,
  getGarageByOwnerUid,
  publishGarage,
} from "@/lib/repositories/garages";
import {
  createPrimaryGarageCar,
  getGarageCarById,
  publishGarageCar,
  updateGarageCar,
} from "@/lib/repositories/garage-cars";
import type { BuildStage, GarageCar, GarageProfile, GarageVisibility } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatInstagramHandle } from "@/lib/utils/instagram";

type GarageOnboardingProps = {
  ownerUid: string;
  displayNameDefault: string;
  claimedMember?: {
    id: string;
    clubId: string;
    clubName?: string;
    displayName: string;
    instagramHandle?: string;
    city: string;
    country: string;
    area?: string;
  } | null;
  onComplete: (garage: GarageProfile, car: GarageCar) => void;
  onCancel: () => void;
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

const tagExamples = ["turbo", "lowered", "wheels", "exhaust", "track", "stance", "OEM+"];

function validationMessage(
  t: Dictionary,
  key: GarageValidationMessageKey | string | undefined
): string | undefined {
  if (!key) return undefined;
  const messages = t.garage.validation as Record<string, string>;
  return messages[key] ?? undefined;
}

function hasOptionalIdentityInput(input: GarageIdentityInput): boolean {
  return Boolean(
    input.instagramHandle?.trim() ||
      input.city?.trim() ||
      input.area?.trim() ||
      input.country?.trim()
  );
}

function hasOptionalCarInput(input: GarageCarInput): boolean {
  return Boolean(
    input.year?.trim() ||
      input.trim?.trim() ||
      input.generation?.trim() ||
      input.engine?.trim() ||
      input.drivetrain?.trim() ||
      input.transmission?.trim()
  );
}

export function GarageOnboarding({
  ownerUid,
  displayNameDefault,
  claimedMember,
  onComplete,
  onCancel,
}: GarageOnboardingProps) {
  const { t } = useLocale();
  const [step, setStep] = useState<GarageOnboardingStepIndex>(0);
  const [busy, setBusy] = useState(false);
  const [garageId, setGarageId] = useState<string | null>(null);
  const [carId, setCarId] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [showCarDetails, setShowCarDetails] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState<
    Partial<Record<GarageOnboardingStepIndex, boolean>>
  >({});

  const [displayName, setDisplayName] = useState(
    claimedMember?.displayName ?? displayNameDefault
  );
  const [instagramHandle, setInstagramHandle] = useState(
    claimedMember?.instagramHandle ?? ""
  );
  const [city, setCity] = useState(claimedMember?.city ?? "");
  const [area, setArea] = useState(claimedMember?.area ?? "");
  const [country, setCountry] = useState(claimedMember?.country ?? "");
  const [visibility, setVisibility] = useState<GarageVisibility>("public");

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [trim, setTrim] = useState("");
  const [generation, setGeneration] = useState("");
  const [engine, setEngine] = useState("");
  const [drivetrain, setDrivetrain] = useState("");
  const [transmission, setTransmission] = useState("");

  const [horsepower, setHorsepower] = useState("");
  const [torqueNm, setTorqueNm] = useState("");
  const [buildStage, setBuildStage] = useState<BuildStage | null>(null);
  const [buildSummary, setBuildSummary] = useState("");
  const [tags, setTags] = useState("");

  const identityInput: GarageIdentityInput = useMemo(
    () => ({ displayName, instagramHandle, city, area, country, visibility }),
    [displayName, instagramHandle, city, area, country, visibility]
  );

  const carInput: GarageCarInput = useMemo(
    () => ({
      make,
      model,
      year,
      trim,
      generation,
      engine,
      drivetrain,
      transmission,
    }),
    [make, model, year, trim, generation, engine, drivetrain, transmission]
  );

  const buildInput: GarageBuildInput = useMemo(
    () => ({ horsepower, torqueNm, buildStage, buildSummary, tags }),
    [horsepower, torqueNm, buildStage, buildSummary, tags]
  );

  const identityErrors = validateGarageIdentity(identityInput, {
    validateOptionalFields:
      hasOptionalIdentityInput(identityInput) || Boolean(submitAttempted[0]),
  });

  const carErrors = validateGarageCar(carInput, {
    validateOptionalFields:
      hasOptionalCarInput(carInput) || Boolean(submitAttempted[1]),
  });

  const buildErrors = validateGarageBuild(buildInput);

  const completedThrough = Math.max(0, step - 1);
  const badgeRequired = t.garage.fieldRequired;
  const badgeOptional = t.garage.fieldOptional;

  function markTouched(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function showError(
    field: string,
    errorKey: string | undefined
  ): string | undefined {
    if (!errorKey) return undefined;
    if (!touched[field] && !submitAttempted[step]) return undefined;
    return validationMessage(t, errorKey);
  }

  function advanceStep(next: GarageOnboardingStepIndex) {
    setSubmitAttempted((prev) => ({ ...prev, [step]: false }));
    setStep(next);
  }

  async function finishIdentity() {
    setSubmitAttempted((prev) => ({ ...prev, 0: true }));
    const errors = validateGarageIdentity(identityInput, {
      validateOptionalFields: hasOptionalIdentityInput(identityInput),
    });
    if (Object.keys(errors).length > 0) return;

    setBusy(true);
    try {
      const sanitized = sanitizeGarageIdentity(identityInput);
      const garage = await createGarageForUser(ownerUid, {
        displayName: sanitized.displayName,
        instagramHandle: sanitized.instagramHandle,
        city: sanitized.city,
        area: sanitized.area,
        country: sanitized.country,
        visibility: sanitized.visibility,
        memberProfileId: claimedMember?.id,
        clubId: claimedMember?.clubId,
        clubName: claimedMember?.clubName,
      });
      setGarageId(garage.id);
      advanceStep(1);
    } finally {
      setBusy(false);
    }
  }

  async function finishCar() {
    setSubmitAttempted((prev) => ({ ...prev, 1: true }));
    const errors = validateGarageCar(carInput, {
      validateOptionalFields: hasOptionalCarInput(carInput),
    });
    if (Object.keys(errors).length > 0 || !garageId) return;

    setBusy(true);
    try {
      const sanitized = sanitizeGarageCarInput(carInput);
      const car = await createPrimaryGarageCar({
        garageId,
        ownerUid,
        ...sanitized,
      });
      setCarId(car.id);
      advanceStep(2);
    } finally {
      setBusy(false);
    }
  }

  async function finishBuild() {
    setSubmitAttempted((prev) => ({ ...prev, 2: true }));
    if (Object.keys(buildErrors).length > 0) return;

    if (hasGarageBuildInput(buildInput) && carId) {
      setBusy(true);
      try {
        await updateGarageCar(carId, ownerUid, sanitizeGarageBuildPatch(buildInput));
      } finally {
        setBusy(false);
      }
    }

    advanceStep(3);
  }

  function skipStep() {
    if (!canSkipGarageStep(step)) return;
    advanceStep((step + 1) as GarageOnboardingStepIndex);
  }

  async function finishAndPublish() {
    if (!garageId || !carId) return;
    if (!isGarageReviewValid(identityInput, carInput)) return;

    setBusy(true);
    try {
      if (hasGarageBuildInput(buildInput)) {
        await updateGarageCar(carId, ownerUid, sanitizeGarageBuildPatch(buildInput));
      }

      let garage = (await getGarageByOwnerUid(ownerUid))!;
      let car = (await getGarageCarById(carId))!;

      if (visibility === "public") {
        car = await publishGarageCar(carId, ownerUid);
        garage = await publishGarage(ownerUid);
      }

      onComplete(garage, car);
    } finally {
      setBusy(false);
    }
  }

  function handleBack() {
    if (step === 0) {
      onCancel();
      return;
    }
    setStep((s) => Math.max(0, s - 1) as GarageOnboardingStepIndex);
  }

  function handleContinue() {
    switch (step) {
      case 0:
        void finishIdentity();
        break;
      case 1:
        void finishCar();
        break;
      case 2:
        void finishBuild();
        break;
      case 3:
        advanceStep(4);
        break;
      case 4:
        void finishAndPublish();
        break;
    }
  }

  const identityContinueEnabled = !busy && isGarageIdentityValid(identityInput);

  const carContinueEnabled = !busy && isGarageCarValid(carInput);

  const buildContinueEnabled = !busy && Object.keys(buildErrors).length === 0;

  const continueLabel =
    step === 4
      ? t.garage.createMyGarage
      : step === 3 && !photoUrl
        ? t.garage.skipPhoto
        : t.garage.continue;

  const continueDisabled =
    step === 0
      ? !identityContinueEnabled
      : step === 1
        ? !carContinueEnabled
        : step === 2
          ? !buildContinueEnabled
          : step === 4
            ? busy || !garageId || !carId || !isGarageReviewValid(identityInput, carInput)
            : busy;

  const stepMeta = [
    {
      title: t.garage.onboardingIdentityTitle,
      subtitle: t.garage.onboardingIdentitySubtitle,
    },
    {
      title: t.garage.onboardingCarTitle,
      subtitle: t.garage.onboardingCarSubtitle,
    },
    {
      title: t.garage.onboardingBuildTitle,
      subtitle: t.garage.onboardingBuildSubtitle,
    },
    {
      title: t.garage.onboardingPhotoTitle,
      subtitle: t.garage.onboardingPhotoSubtitle,
    },
    {
      title: t.garage.onboardingReviewTitle,
      subtitle: t.garage.onboardingReviewSubtitle,
    },
  ][step];

  const parsedTags = parseGarageTags(tags);
  const locationParts = [city, area, country].filter(Boolean);
  const vehicleLabel = [year, make, model].filter(Boolean).join(" ");
  const technicalParts = [trim, generation, engine, drivetrain, transmission].filter(
    Boolean
  );

  return (
    <GarageOnboardingShell
      step={step}
      completedThrough={completedThrough}
      title={stepMeta.title}
      subtitle={stepMeta.subtitle}
      onBack={handleBack}
      onContinue={handleContinue}
      continueLabel={continueLabel}
      continueDisabled={continueDisabled}
      busy={busy}
      showBack
      secondaryLabel={step === 2 ? t.garage.skipForNow : undefined}
      onSecondary={step === 2 ? skipStep : undefined}
    >
      {step === 0 ? (
        <div className="space-y-8">
          <GarageFieldGroup title={t.garage.onboardingPublicIdentity}>
            <div className="grid gap-4 sm:grid-cols-1">
              <GarageTextInput
                id="garage-display-name"
                label={t.garage.displayName}
                value={displayName}
                onChange={setDisplayName}
                onBlur={() => markTouched("displayName")}
                required
                requiredLabel={badgeRequired}
                optionalLabel={badgeOptional}
                error={showError("displayName", identityErrors.displayName)}
                autoComplete="name"
              />
              <GarageTextInput
                id="garage-instagram"
                label="Instagram"
                value={instagramHandle}
                onChange={setInstagramHandle}
                onBlur={() => markTouched("instagramHandle")}
                optionalLabel={badgeOptional}
                error={showError("instagramHandle", identityErrors.instagramHandle)}
                placeholder="@yourhandle"
              />
            </div>
          </GarageFieldGroup>

          <GarageFieldGroup
            title={t.garage.onboardingLocation}
            optional
            optionalLabel={badgeOptional}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <GarageTextInput
                id="garage-city"
                label={t.garage.city}
                value={city}
                onChange={setCity}
                onBlur={() => markTouched("city")}
                optionalLabel={badgeOptional}
                error={showError("city", identityErrors.city)}
                autoComplete="address-level2"
              />
              <GarageTextInput
                id="garage-area"
                label={t.garage.area}
                value={area}
                onChange={setArea}
                onBlur={() => markTouched("area")}
                optionalLabel={badgeOptional}
                error={showError("area", identityErrors.area)}
              />
              <div className="sm:col-span-2">
                <GarageTextInput
                  id="garage-country"
                  label={t.garage.country}
                  value={country}
                  onChange={setCountry}
                  onBlur={() => markTouched("country")}
                  optionalLabel={badgeOptional}
                  error={showError("country", identityErrors.country)}
                  autoComplete="country-name"
                />
              </div>
            </div>
          </GarageFieldGroup>

          <GarageFieldGroup title={t.garage.onboardingVisibility}>
            <div
              className="grid gap-3 sm:grid-cols-3"
              role="radiogroup"
              aria-label={t.garage.visibility}
            >
              <GarageChoiceCard
                selected={visibility === "public"}
                title={t.garage.public}
                description={t.garage.onboardingVisibilityPublic}
                icon={<Globe className="size-4" />}
                onSelect={() => setVisibility("public")}
              />
              <GarageChoiceCard
                selected={visibility === "club_only"}
                title={t.garage.clubOnly}
                description={t.garage.onboardingVisibilityClub}
                icon={<Users className="size-4" />}
                onSelect={() => setVisibility("club_only")}
              />
              <GarageChoiceCard
                selected={visibility === "private"}
                title={t.garage.private}
                description={t.garage.onboardingVisibilityPrivate}
                icon={<Lock className="size-4" />}
                onSelect={() => setVisibility("private")}
              />
            </div>
          </GarageFieldGroup>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-8">
          <GarageFieldGroup title={t.garage.onboardingVehicleSection}>
            <div className="grid gap-4 sm:grid-cols-2">
              <GarageTextInput
                id="car-make"
                label={t.garage.make}
                value={make}
                onChange={setMake}
                onBlur={() => markTouched("make")}
                required
                requiredLabel={badgeRequired}
                optionalLabel={badgeOptional}
                error={showError("make", carErrors.make)}
              />
              <GarageTextInput
                id="car-model"
                label={t.garage.model}
                value={model}
                onChange={setModel}
                onBlur={() => markTouched("model")}
                required
                requiredLabel={badgeRequired}
                optionalLabel={badgeOptional}
                error={showError("model", carErrors.model)}
              />
              <GarageTextInput
                id="car-year"
                label={t.garage.year}
                value={year}
                onChange={setYear}
                onBlur={() => markTouched("year")}
                optionalLabel={badgeOptional}
                error={showError("year", carErrors.year)}
              />
            </div>
          </GarageFieldGroup>

          <GarageFieldGroup
            title={t.garage.onboardingMoreDetails}
            optional
            optionalLabel={badgeOptional}
          >
            <button
              type="button"
              onClick={() => setShowCarDetails((open) => !open)}
              className="mb-3 inline-flex min-h-10 items-center gap-1.5 text-xs font-medium text-[#94A3B8] transition hover:text-[#E2E8F0]"
              aria-expanded={showCarDetails}
            >
              <ChevronDown
                className={cn(
                  "size-4 transition",
                  showCarDetails ? "rotate-180" : ""
                )}
              />
              {t.garage.onboardingMoreDetails}
            </button>
            {showCarDetails ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <GarageTextInput
                  id="car-trim"
                  label={t.garage.trim}
                  value={trim}
                  onChange={setTrim}
                  optionalLabel={badgeOptional}
                />
                <GarageTextInput
                  id="car-generation"
                  label={t.garage.generation}
                  value={generation}
                  onChange={setGeneration}
                  optionalLabel={badgeOptional}
                />
                <GarageTextInput
                  id="car-engine"
                  label={t.garage.engine}
                  value={engine}
                  onChange={setEngine}
                  optionalLabel={badgeOptional}
                />
                <GarageTextInput
                  id="car-drivetrain"
                  label={t.garage.drivetrain}
                  value={drivetrain}
                  onChange={setDrivetrain}
                  optionalLabel={badgeOptional}
                />
                <GarageTextInput
                  id="car-transmission"
                  label={t.garage.transmission}
                  value={transmission}
                  onChange={setTransmission}
                  optionalLabel={badgeOptional}
                />
              </div>
            ) : null}
          </GarageFieldGroup>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <GarageTextInput
              id="build-hp"
              label={t.garage.horsepower}
              value={horsepower}
              onChange={setHorsepower}
              onBlur={() => markTouched("horsepower")}
              type="number"
              optionalLabel={badgeOptional}
              error={showError("horsepower", buildErrors.horsepower)}
              helper={t.garage.horsepowerUnit.toUpperCase()}
            />
            <GarageTextInput
              id="build-torque"
              label={t.garage.torque}
              value={torqueNm}
              onChange={setTorqueNm}
              onBlur={() => markTouched("torqueNm")}
              type="number"
              optionalLabel={badgeOptional}
              error={showError("torqueNm", buildErrors.torqueNm)}
              helper="Nm"
            />
          </div>

          <GarageFieldGroup
            title={t.garage.buildStage}
            optional
            optionalLabel={badgeOptional}
          >
            <div className="flex flex-wrap gap-2">
              {buildStages.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() =>
                    setBuildStage((current) => (current === stage ? null : stage))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    buildStage === stage
                      ? "border-[#EF4444]/40 bg-[#EF4444]/15 text-[#FCA5A5]"
                      : "border-white/[0.08] bg-[#151B24]/50 text-[#94A3B8] hover:text-[#CBD5E1]"
                  )}
                >
                  {buildStageLabel(stage, t)}
                </button>
              ))}
            </div>
          </GarageFieldGroup>

          <GarageTextarea
            id="build-summary"
            label={t.garage.buildSummary}
            value={buildSummary}
            onChange={setBuildSummary}
            onBlur={() => markTouched("buildSummary")}
            optionalLabel={badgeOptional}
            error={showError("buildSummary", buildErrors.buildSummary)}
            helper={t.garage.onboardingSummaryHelper}
            maxLength={1000}
          />

          <GarageTextInput
            id="build-tags"
            label={t.garage.tags}
            value={tags}
            onChange={setTags}
            onBlur={() => markTouched("tags")}
            optionalLabel={badgeOptional}
            error={showError("tags", buildErrors.tags)}
            helper={t.garage.onboardingTagsHelper.replace(
              "{examples}",
              tagExamples.join(", ")
            )}
          />
        </div>
      ) : null}

      {step === 3 && carId ? (
        <GaragePhotoStep
          ownerUid={ownerUid}
          carId={carId}
          currentImageUrl={photoUrl}
          onPhotoUrlChange={setPhotoUrl}
          disabled={busy}
        />
      ) : null}

      {step === 4 ? (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#080C12]/80">
            <div className="aspect-[16/10] bg-[#151B24]">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-sm text-[#64748B]">
                  {t.garage.notAddedYet}
                </div>
              )}
            </div>
          </div>

          <ReviewSection title={t.garage.onboardingRequiredSection}>
            <ReviewRow label={t.garage.displayName} value={displayName.trim()} />
            <ReviewRow label={t.garage.make} value={make.trim()} />
            <ReviewRow label={t.garage.model} value={model.trim()} />
          </ReviewSection>

          <ReviewSection title={t.garage.onboardingOptionalSection}>
            <ReviewOptionalRow
              label="Instagram"
              value={
                instagramHandle.trim()
                  ? formatInstagramHandle(instagramHandle)
                  : undefined
              }
              emptyLabel={t.garage.notAddedYet}
            />
            <ReviewOptionalRow
              label={t.garage.onboardingLocation}
              value={locationParts.length > 0 ? locationParts.join(", ") : undefined}
              emptyLabel={t.garage.addLater}
            />
            <ReviewOptionalRow
              label={t.garage.year}
              value={year.trim() || undefined}
              emptyLabel={t.garage.addLater}
            />
            <ReviewOptionalRow
              label={t.garage.trim}
              value={trim.trim() || undefined}
              emptyLabel={t.garage.addLater}
            />
            <ReviewOptionalRow
              label={t.garage.onboardingTechnicalSection}
              value={technicalParts.length > 0 ? technicalParts.join(" · ") : undefined}
              emptyLabel={t.garage.addLater}
            />
            <ReviewOptionalRow
              label={t.garage.horsepower}
              value={
                horsepower.trim()
                  ? `${horsepower.trim()} ${t.garage.horsepowerUnit}`
                  : undefined
              }
              emptyLabel={t.garage.addLater}
            />
            <ReviewOptionalRow
              label={t.garage.torque}
              value={torqueNm.trim() ? `${torqueNm.trim()} Nm` : undefined}
              emptyLabel={t.garage.addLater}
            />
            <ReviewOptionalRow
              label={t.garage.buildStage}
              value={buildStage ? buildStageLabel(buildStage, t) : undefined}
              emptyLabel={t.garage.addLater}
            />
            <ReviewOptionalRow
              label={t.garage.buildSummary}
              value={buildSummary.trim() || undefined}
              emptyLabel={t.garage.addLater}
              className="sm:col-span-2"
            />
            <ReviewOptionalRow
              label={t.garage.tags}
              value={parsedTags.length > 0 ? parsedTags.join(", ") : undefined}
              emptyLabel={t.garage.addLater}
              className="sm:col-span-2"
            />
            <ReviewOptionalRow
              label={t.garage.onboardingStepPhoto}
              value={photoUrl ? t.garage.selectPhoto : undefined}
              emptyLabel={t.garage.addLater}
            />
            <ReviewRow
              label={t.garage.visibility}
              value={
                visibility === "public"
                  ? t.garage.public
                  : visibility === "club_only"
                    ? t.garage.clubOnly
                    : t.garage.private
              }
            />
            {vehicleLabel ? (
              <ReviewRow
                label={t.garage.onboardingVehicleSection}
                value={vehicleLabel}
                className="sm:col-span-2"
              />
            ) : null}
          </ReviewSection>

          <div className="flex flex-wrap gap-2">
            {[
              { label: t.garage.editProfileStep, target: 0 },
              { label: t.garage.editCarStep, target: 1 },
              { label: t.garage.editBuildStep, target: 2 },
              { label: t.garage.editPhotoStep, target: 3 },
            ].map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() => setStep(item.target as GarageOnboardingStepIndex)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#151B24]/60 px-3 text-xs text-[#94A3B8] transition hover:text-[#F8FAFC]"
              >
                <Eye className="size-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </GarageOnboardingShell>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
        {title}
      </h3>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function ReviewRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-[#151B24]/40 px-3 py-2.5",
        className
      )}
    >
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
        {label}
      </dt>
      <dd className="mt-1 text-[#E2E8F0]">{value}</dd>
    </div>
  );
}

function ReviewOptionalRow({
  label,
  value,
  emptyLabel,
  className,
}: {
  label: string;
  value?: string;
  emptyLabel: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-[#151B24]/40 px-3 py-2.5",
        className
      )}
    >
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1",
          value ? "text-[#E2E8F0]" : "text-[#64748B] italic"
        )}
      >
        {value ?? emptyLabel}
      </dd>
    </div>
  );
}
