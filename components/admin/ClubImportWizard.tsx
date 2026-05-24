"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Download,
  FileUp,
  Link2,
  Loader2,
  Save,
  Upload,
  CloudUpload,
} from "lucide-react";

import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { importClubBundleToFirestore } from "@/lib/import/firestore-club-import";
import { importClubBundle } from "@/lib/mock-data/published-store";
import {
  buildClubImportBundle,
  clubImportBundleToJson,
  clubMembersToNormalizedCsv,
  downloadTextFile,
  googleSheetsToExportCsvUrl,
  parseClubMemberCsv,
  summarizeClubMemberImport,
  validateClubImportDetails,
  type ClubImportBundle,
  type ClubImportDetails,
  type ClubMemberRowPreview,
} from "@/lib/import/club-member-import";
import { cn } from "@/lib/utils";

type DataSourceMode = "paste" | "file" | "sheets";

const DEFAULT_DETAILS: ClubImportDetails = {
  clubId: "",
  clubName: "",
  city: "Wiesbaden",
  area: "Wiesbaden / Rhein-Main",
  country: "Germany",
  description: "",
  instagram: "",
  website: "",
  vehicleTypes: "BMW, Audi, Mini, Honda, Mixed",
  primaryBrands: "BMW, Audi, Mini, Honda",
  tags: "car-club",
};

const SAMPLE_CSV = `Instagram,Car Model,Photo,Location
_bambam_84,Audi RS6,,Wiesbaden, Germany
Die_bimmerboys,BMW E30,,Wiesbaden, Germany
pecke.r56,Mini R56,,Wiesbaden, Germany`;

export function ClubImportWizard() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { canUseAdminTools, blocked, AdminGuardFallback } = useAdminGuard();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [details, setDetails] = useState<ClubImportDetails>(DEFAULT_DETAILS);
  const [sourceMode, setSourceMode] = useState<DataSourceMode>("paste");
  const [csvText, setCsvText] = useState("");
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [detailErrors, setDetailErrors] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [previewed, setPreviewed] = useState(false);
  const [bundle, setBundle] = useState<ClubImportBundle | null>(null);
  const [previews, setPreviews] = useState<ClubMemberRowPreview[]>([]);
  const [sessionNote, setSessionNote] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [firestoreNote, setFirestoreNote] = useState<string | null>(null);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [importingFirestore, setImportingFirestore] = useState(false);

  const isDev = process.env.NODE_ENV === "development";
  const canFirestoreImport =
    isFirebaseConfigured && canUseAdminTools && Boolean(user);
  const summary = useMemo(
    () => (previewed ? summarizeClubMemberImport(previews) : null),
    [previewed, previews]
  );

  function patchDetails(patch: Partial<ClubImportDetails>) {
    setDetails((prev) => ({ ...prev, ...patch }));
    setPreviewed(false);
    setBundle(null);
    setPreviews([]);
    setSessionNote(null);
    setSaveNote(null);
    setSaveError(null);
  }

  function handleFileChange(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result ?? ""));
      setPreviewed(false);
      setFetchError(null);
    };
    reader.readAsText(file);
  }

  async function fetchGoogleSheetCsv() {
    setFetchError(null);
    const exportUrl = googleSheetsToExportCsvUrl(sheetsUrl);
    if (!exportUrl) {
      setFetchError(t.admin.clubImportInvalidSheetsUrl);
      return;
    }
    setFetching(true);
    try {
      const res = await fetch(exportUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (text.trim().startsWith("<!DOCTYPE") || text.includes("<html")) {
        throw new Error("HTML response");
      }
      setCsvText(text);
      setSourceMode("paste");
    } catch {
      setFetchError(t.admin.clubImportSheetsCorsBlocked);
    } finally {
      setFetching(false);
    }
  }

  function handlePreview() {
    const dErrors = validateClubImportDetails(details);
    setDetailErrors(dErrors);
    if (dErrors.length > 0) return;

    const parsed = parseClubMemberCsv(csvText);
    setParseErrors(parsed.parseErrors);
    const { bundle: nextBundle, previews: nextPreviews } = buildClubImportBundle(
      details,
      parsed.rows
    );
    setBundle(nextBundle);
    setPreviews(nextPreviews);
    setPreviewed(true);
    setSessionNote(null);
    setSaveNote(null);
    setSaveError(null);
  }

  function handleLoadSample() {
    setCsvText(SAMPLE_CSV);
    setPreviewed(false);
  }

  function handleDownloadJson() {
    if (!bundle) return;
    downloadTextFile(
      `${details.clubId.trim()}.json`,
      clubImportBundleToJson(bundle),
      "application/json"
    );
  }

  function handleDownloadCsv() {
    if (!bundle) return;
    downloadTextFile(
      `${details.clubId.trim()}-members.csv`,
      clubMembersToNormalizedCsv(bundle.members),
      "text/csv"
    );
  }

  function handleSessionImport() {
    if (!bundle) return;
    importClubBundle(bundle.club, bundle.members);
    setSessionNote(t.admin.clubImportSessionDone);
    router.refresh();
  }

  async function handleImportFirestore() {
    if (!bundle || !user) return;
    setImportingFirestore(true);
    setFirestoreError(null);
    setFirestoreNote(null);
    try {
      const result = await importClubBundleToFirestore(bundle, { uid: user.uid });
      const parts = [
        result.clubSaved ? t.admin.firestoreImportClubOk : t.admin.firestoreImportClubFail,
        `${t.admin.firestoreImportMembersOk}: ${result.membersSaved}`,
      ];
      if (result.membersSkipped > 0) {
        parts.push(`${t.admin.firestoreImportSkipped}: ${result.membersSkipped}`);
      }
      setFirestoreNote(parts.join(" · "));
      if (result.errors.length > 0) {
        setFirestoreError(result.errors.slice(0, 3).join("; "));
      }
      router.refresh();
    } catch (e) {
      setFirestoreError(e instanceof Error ? e.message : String(e));
    } finally {
      setImportingFirestore(false);
    }
  }

  async function handleSaveLocally() {
    if (!bundle || !isDev) return;
    setSaving(true);
    setSaveError(null);
    setSaveNote(null);
    try {
      const res = await fetch("/api/dev/save-club-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: details.clubId.trim(),
          bundle,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        diskPath?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Save failed");
      }
      setSaveNote(data.diskPath ?? t.admin.clubImportSavedLocally);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  function issueLabel(code: string): string {
    switch (code) {
      case "missing_instagram":
        return "Missing Instagram";
      case "missing_car_model":
        return "Missing car model";
      case "missing_location":
        return t.admin.clubImportWarnMissingLocation;
      case "missing_photo":
        return t.admin.clubImportWarnMissingPhoto;
      case "unknown_car_make":
        return t.admin.clubImportWarnUnknownMake;
      default:
        return code;
    }
  }

  if (blocked) return <AdminGuardFallback />;

  return (
    <div className="space-y-4">
      <GlassPanel>
        <PanelHeader title={t.admin.clubImportTitle} />
        <div className="space-y-4 p-4 lg:p-5">
        <p className="text-sm text-[#94A3B8]">{t.admin.clubImportSubtitle}</p>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            {t.admin.clubImportClubDetails}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[10px] text-[#64748B]">Club ID / slug *</span>
              <input
                value={details.clubId}
                onChange={(e) =>
                  patchDetails({ clubId: e.target.value.toLowerCase() })
                }
                placeholder="wbn"
                className="w-full rounded-lg border border-white/10 bg-[#0B1118] px-2 py-1.5 text-sm text-[#F8FAFC]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] text-[#64748B]">Club name *</span>
              <input
                value={details.clubName}
                onChange={(e) => patchDetails({ clubName: e.target.value })}
                placeholder="WBN"
                className="w-full rounded-lg border border-white/10 bg-[#0B1118] px-2 py-1.5 text-sm text-[#F8FAFC]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] text-[#64748B]">{t.common.city} *</span>
              <input
                value={details.city}
                onChange={(e) => patchDetails({ city: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B1118] px-2 py-1.5 text-sm text-[#F8FAFC]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] text-[#64748B]">Area</span>
              <input
                value={details.area}
                onChange={(e) => patchDetails({ area: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B1118] px-2 py-1.5 text-sm text-[#F8FAFC]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] text-[#64748B]">Country *</span>
              <input
                value={details.country}
                onChange={(e) => patchDetails({ country: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B1118] px-2 py-1.5 text-sm text-[#F8FAFC]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] text-[#64748B]">Instagram</span>
              <input
                value={details.instagram}
                onChange={(e) => patchDetails({ instagram: e.target.value })}
                placeholder="@clubhandle"
                className="w-full rounded-lg border border-white/10 bg-[#0B1118] px-2 py-1.5 text-sm text-[#F8FAFC]"
              />
            </label>
            <label className="col-span-full space-y-1 sm:col-span-2">
              <span className="text-[10px] text-[#64748B]">
                {t.common.description}
              </span>
              <textarea
                value={details.description}
                onChange={(e) => patchDetails({ description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-[#0B1118] px-2 py-1.5 text-sm text-[#F8FAFC]"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-[10px] text-[#64748B]">
                {t.clubs.vehicleTypes}
              </span>
              <input
                value={details.vehicleTypes}
                onChange={(e) => patchDetails({ vehicleTypes: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B1118] px-2 py-1.5 text-sm text-[#F8FAFC]"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-[10px] text-[#64748B]">
                {t.clubs.primaryBrands}
              </span>
              <input
                value={details.primaryBrands}
                onChange={(e) => patchDetails({ primaryBrands: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B1118] px-2 py-1.5 text-sm text-[#F8FAFC]"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-[10px] text-[#64748B]">{t.clubs.tags}</span>
              <input
                value={details.tags}
                onChange={(e) => patchDetails({ tags: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B1118] px-2 py-1.5 text-sm text-[#F8FAFC]"
              />
            </label>
          </div>
          {detailErrors.length > 0 ? (
            <ul className="space-y-1 text-xs text-red-300">
              {detailErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="mt-6 space-y-3 border-t border-white/[0.06] pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            {t.admin.clubImportDataSource}
          </h3>

          <div className="flex flex-wrap gap-1">
            {(
              [
                ["paste", t.admin.clubImportPasteCsv],
                ["file", t.admin.clubImportUploadCsv],
                ["sheets", t.admin.clubImportSheetsLink],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSourceMode(mode)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition",
                  sourceMode === mode
                    ? "bg-[#EF4444]/20 text-[#F8FAFC]"
                    : "text-[#64748B] hover:text-[#CBD5E1]"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {sourceMode === "file" ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="gap-1.5"
              >
                <FileUp className="size-3.5" />
                {t.admin.clubImportUploadCsv}
              </Button>
            </div>
          ) : null}

          {sourceMode === "sheets" ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <input
                  value={sheetsUrl}
                  onChange={(e) => {
                    setSheetsUrl(e.target.value);
                    setFetchError(null);
                  }}
                  placeholder="https://docs.google.com/spreadsheets/d/…"
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0B1118] px-2 py-1.5 text-sm text-[#F8FAFC]"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={fetching || !sheetsUrl.trim()}
                  onClick={() => void fetchGoogleSheetCsv()}
                  className="gap-1.5"
                >
                  {fetching ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Link2 className="size-3.5" />
                  )}
                  Fetch CSV
                </Button>
              </div>
              {fetchError ? (
                <p className="flex gap-2 text-xs text-amber-200/90">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                  {fetchError}
                </p>
              ) : null}
            </div>
          ) : null}

          {(sourceMode === "paste" || csvText) && (
            <textarea
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setPreviewed(false);
              }}
              rows={6}
              placeholder="Instagram,Car Model,Photo,Location"
              className="w-full rounded-lg border border-white/10 bg-[#0B1118] px-2 py-2 font-mono text-xs text-[#E2E8F0]"
            />
          )}

          <p className="text-[10px] leading-relaxed text-[#64748B]">
            {t.admin.clubImportEmbeddedImagesNote}{" "}
            {t.admin.clubImportAppsScriptHint} (
            <code className="text-[#93C5FD]">docs/google-sheets-club-export.md</code>
            )
          </p>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={handleLoadSample}>
              Load sample
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handlePreview}
              disabled={!canUseAdminTools || !csvText.trim()}
              className="gap-1.5"
            >
              <Upload className="size-3.5" />
              {t.admin.clubImportPreviewMembers}
            </Button>
          </div>
        </section>

        {previewed ? (
          <section className="mt-6 space-y-3 border-t border-white/[0.06] pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              {t.admin.clubImportMemberRows}
            </h3>

            {parseErrors.length > 0 ? (
              <ul className="text-xs text-amber-200/90">
                {parseErrors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            ) : null}

            {summary ? (
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="text-[#94A3B8]">
                  {t.admin.totalRows}: {summary.total}
                </span>
                <span className="text-[#22C55E]">
                  {t.admin.clubImportValidRows}: {summary.valid}
                </span>
                <span className="text-[#FACC15]">
                  {t.admin.clubImportWarnings}: {summary.warning}
                </span>
                <span className="text-[#F87171]">
                  {t.admin.clubImportErrors}: {summary.error}
                </span>
              </div>
            ) : null}

            <div className="max-h-72 overflow-auto rounded-lg border border-white/[0.06]">
              <table className="w-full min-w-[640px] text-left text-[10px]">
                <thead className="sticky top-0 bg-[#151B24] text-[#64748B]">
                  <tr>
                    <th className="px-2 py-1.5">#</th>
                    <th className="px-2 py-1.5">Handle</th>
                    <th className="px-2 py-1.5">Car</th>
                    <th className="px-2 py-1.5">Location</th>
                    <th className="px-2 py-1.5">Member ID</th>
                    <th className="px-2 py-1.5">Image</th>
                    <th className="px-2 py-1.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previews.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className="border-t border-white/[0.04] text-[#CBD5E1]"
                    >
                      <td className="px-2 py-1.5">{row.rowNumber}</td>
                      <td className="px-2 py-1.5">
                        <div>{row.displayName}</div>
                        <div className="text-[#64748B]">{row.instagramUrl}</div>
                      </td>
                      <td className="px-2 py-1.5">{row.carName}</td>
                      <td className="px-2 py-1.5">
                        {row.city}, {row.country}
                      </td>
                      <td className="max-w-[120px] truncate px-2 py-1.5 font-mono">
                        {row.memberId}
                      </td>
                      <td className="max-w-[140px] truncate px-2 py-1.5 font-mono text-[#64748B]">
                        {row.imageUrl}
                      </td>
                      <td className="px-2 py-1.5">
                        <span
                          className={cn(
                            "rounded px-1 py-0.5 font-semibold uppercase",
                            row.status === "valid" && "bg-[#22C55E]/15 text-[#86EFAC]",
                            row.status === "warning" &&
                              "bg-[#FACC15]/15 text-[#FDE047]",
                            row.status === "error" && "bg-red-500/15 text-red-300"
                          )}
                        >
                          {row.status}
                        </span>
                        {(row.errors.length > 0 || row.warnings.length > 0) && (
                          <ul className="mt-0.5 text-[9px] text-[#64748B]">
                            {[...row.errors, ...row.warnings].map((i, idx) => (
                              <li key={`${row.rowNumber}-${idx}`}>
                                {issueLabel(i.code)}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDownloadJson}
                disabled={!bundle || summary?.importable === 0}
                className="gap-1.5"
              >
                <Download className="size-3.5" />
                {t.admin.clubImportDownloadJson}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDownloadCsv}
                disabled={!bundle || summary?.importable === 0}
                className="gap-1.5"
              >
                <Download className="size-3.5" />
                {t.admin.clubImportDownloadCsv}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSessionImport}
                disabled={!bundle || summary?.importable === 0}
                className="gap-1.5"
              >
                {t.admin.clubImportSession}
              </Button>
              {isDev ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void handleSaveLocally()}
                  disabled={!bundle || saving || summary?.importable === 0}
                  className="gap-1.5"
                >
                  {saving ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  {t.admin.clubImportSaveLocally}
                </Button>
              ) : null}
            </div>

            {sessionNote ? (
              <p className="text-xs text-[#22C55E]">{sessionNote}</p>
            ) : null}
            {saveNote ? (
              <p className="break-all text-xs text-[#22C55E]">
                {t.admin.clubImportSavedLocally}: {saveNote}
              </p>
            ) : null}
            {saveError ? (
              <p className="text-xs text-red-300">{saveError}</p>
            ) : null}

            <div className="rounded-lg border border-white/[0.06] bg-[#151B24]/40 p-3 text-[10px] leading-relaxed text-[#94A3B8]">
              <p className="font-semibold text-[#CBD5E1]">
                {t.admin.clubImportLocalInstructionsTitle}
              </p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                <li>{t.admin.clubImportLocalStep1}</li>
                <li>{t.admin.clubImportLocalStep2}</li>
                <li>{t.admin.clubImportLocalStep3}</li>
                <li>{t.admin.clubImportLocalStep4}</li>
                <li>{t.admin.clubImportLocalStep5}</li>
              </ol>
            </div>

            <Button
              type="button"
              size="sm"
              disabled={
                !canFirestoreImport ||
                importingFirestore ||
                !bundle ||
                summary?.importable === 0
              }
              onClick={() => void handleImportFirestore()}
              className="gap-1.5 border border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[#BFDBFE]"
            >
              {importingFirestore ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CloudUpload className="size-3.5" />
              )}
              {t.admin.clubImportFirestore}
            </Button>
            {!isFirebaseConfigured ? (
              <p className="w-full text-[10px] text-[#64748B]">
                {t.admin.clubImportFirestoreTodo}
              </p>
            ) : null}
            {firestoreNote ? (
              <p className="w-full text-xs text-[#22C55E]">{firestoreNote}</p>
            ) : null}
            {firestoreError ? (
              <p className="w-full text-xs text-red-300">{firestoreError}</p>
            ) : null}
          </section>
        ) : null}
        </div>
      </GlassPanel>
    </div>
  );
}
