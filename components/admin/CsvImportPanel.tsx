"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, RotateCcw, Upload } from "lucide-react";

import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import {
  mapImportRowToSubmission,
  parseCarRadarCsv,
  summarizeImport,
  validateImportRows,
  type CsvImportRow,
  type ImportIssue,
  type ImportRowValidation,
} from "@/lib/import/csv-import";
import { createSubmission } from "@/lib/repositories/submissions";
import { cn } from "@/lib/utils";

type CsvImportPanelProps = {
  onImported?: () => void;
};

const SAMPLE_CSV_PATH = "/samples/car-radar-import-sample.csv";

export function CsvImportPanel({ onImported }: CsvImportPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState("");
  const [rows, setRows] = useState<CsvImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [previewed, setPreviewed] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const validations = useMemo(
    () => (previewed ? validateImportRows(rows) : []),
    [previewed, rows]
  );

  const summary = useMemo(
    () => (previewed ? summarizeImport(validations) : null),
    [previewed, validations]
  );

  const showMockNote =
    process.env.NODE_ENV === "development" && !isFirebaseConfigured;

  function translateIssue(issue: ImportIssue): string {
    switch (issue.code) {
      case "missing_required":
        return `${t.admin.importMissingRequired}${issue.field ? `: ${issue.field}` : ""}`;
      case "invalid_type":
        return t.admin.importInvalidType;
      case "invalid_coordinates":
        return t.admin.importInvalidCoordinates;
      case "no_social_link":
        return t.admin.importNoSocialLink;
      case "csv_status_ignored":
        return t.admin.importStatusIgnored;
      default:
        return issue.code;
    }
  }

  function handleFileChange(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result ?? ""));
      setPreviewed(false);
      setImportedCount(null);
      setImportError(null);
    };
    reader.readAsText(file);
  }

  function handlePreview() {
    const result = parseCarRadarCsv(csvText);
    setRows(result.rows);
    setParseErrors(result.parseErrors);
    setPreviewed(true);
    setImportedCount(null);
    setImportError(null);
  }

  function handleClear() {
    setCsvText("");
    setRows([]);
    setParseErrors([]);
    setPreviewed(false);
    setImportedCount(null);
    setImportError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleImport() {
    if (!previewed) return;
    setImporting(true);
    setImportError(null);
    let count = 0;
    try {
      for (let i = 0; i < rows.length; i++) {
        const validation = validations[i];
        if (!validation || validation.status === "error") continue;
        const input = mapImportRowToSubmission(rows[i]);
        const result = await createSubmission(input);
        if (result.success) count += 1;
      }
      setImportedCount(count);
      onImported?.();
      router.refresh();
    } catch {
      setImportError(t.admin.importFailed);
    } finally {
      setImporting(false);
    }
  }

  return (
    <GlassPanel className="mt-6 overflow-hidden">
      <PanelHeader title={t.admin.csvImportTitle} />
      <div className="space-y-4 p-4 lg:p-5">
        <p className="text-sm text-[#94A3B8]">{t.admin.csvImportSubtitle}</p>

        {showMockNote ? (
          <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-200/90">
            {t.admin.mockModeNote}
          </p>
        ) : null}

        <p className="text-xs text-[#64748B]">{t.admin.importPendingNote}</p>

        <a
          href={SAMPLE_CSV_PATH}
          download="car-radar-import-sample.csv"
          className="inline-flex text-xs font-medium text-[#3B82F6] hover:underline"
        >
          {t.admin.downloadSampleCsv}
        </a>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            className="border-white/[0.08] text-[#CBD5E1]"
            onClick={() => fileRef.current?.click()}
          >
            <FileUp className="mr-2 size-4" />
            {t.admin.uploadCsv}
          </Button>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
            {t.admin.pasteCsv}
          </label>
          <textarea
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setPreviewed(false);
              setImportedCount(null);
            }}
            rows={8}
            placeholder="name,type,category,country,city,..."
            className="w-full rounded-lg border border-white/[0.06] bg-[#151B24]/80 px-3 py-2 font-mono text-xs text-[#F8FAFC] outline-none focus:border-[#EF4444]/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="border border-[#EF4444]/50 bg-[#EF4444]/20 text-[#F8FAFC]"
            onClick={handlePreview}
            disabled={!csvText.trim()}
          >
            {t.admin.previewImport}
          </Button>
          <Button
            type="button"
            className="border border-emerald-500/50 bg-emerald-500/15 text-emerald-100"
            onClick={() => void handleImport()}
            disabled={!previewed || importing || (summary?.importable ?? 0) === 0}
          >
            <Upload className="mr-2 size-4" />
            {importing ? "…" : t.admin.importValidRows}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-[#94A3B8]"
            onClick={handleClear}
          >
            <RotateCcw className="mr-2 size-4" />
            {t.admin.clearImport}
          </Button>
        </div>

        {parseErrors.length > 0 ? (
          <ul className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {parseErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        ) : null}

        {summary && previewed ? (
          <div className="grid gap-2 rounded-lg border border-white/[0.06] bg-[#151B24]/50 p-3 text-xs sm:grid-cols-2 lg:grid-cols-5">
            <Stat label={t.admin.totalRows} value={summary.total} />
            <Stat label={t.admin.validRows} value={summary.valid} />
            <Stat label={t.admin.warningRows} value={summary.warning} />
            <Stat label={t.admin.errorRows} value={summary.error} />
            <Stat
              label={t.admin.importedCount}
              value={importedCount ?? "—"}
            />
          </div>
        ) : null}

        {importedCount != null ? (
          <p className="text-sm text-emerald-300">
            {t.admin.importedPendingNote} ({importedCount})
          </p>
        ) : null}

        {importError ? (
          <p className="text-sm text-red-300">{importError}</p>
        ) : null}

        {previewed && rows.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="border-b border-white/[0.06] bg-[#151B24]/80 text-[10px] uppercase tracking-wider text-[#64748B]">
                <tr>
                  <th className="px-3 py-2">{t.admin.importRow}</th>
                  <th className="px-3 py-2">{t.common.name}</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">{t.common.city}</th>
                  <th className="px-3 py-2">{t.admin.importIssue}</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {rows.map((row, index) => (
                  <PreviewRow
                    key={`${row.rowNumber}-${index}`}
                    row={row}
                    validation={validations[index]}
                    translateIssue={translateIssue}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </GlassPanel>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-[#64748B]">{label}</p>
      <p className="font-heading text-lg font-semibold text-[#F8FAFC]">
        {value}
      </p>
    </div>
  );
}

function PreviewRow({
  row,
  validation,
  translateIssue,
}: {
  row: CsvImportRow;
  validation?: ImportRowValidation;
  translateIssue: (issue: ImportIssue) => string;
}) {
  const status = validation?.status ?? "error";
  const statusClass =
    status === "valid"
      ? "text-emerald-400"
      : status === "warning"
        ? "text-amber-300"
        : "text-red-400";

  return (
    <tr className="text-[#CBD5E1]">
      <td className="px-3 py-2 text-[#64748B]">{row.rowNumber}</td>
      <td className="max-w-[140px] truncate px-3 py-2">{row.name || "—"}</td>
      <td className="px-3 py-2">{row.type || "—"}</td>
      <td className="px-3 py-2">{row.city || "—"}</td>
      <td className="max-w-[220px] px-3 py-2 text-[#94A3B8]">
        {validation?.issues.length
          ? validation.issues.map((issue, i) => (
              <span key={i} className="block">
                {translateIssue(issue)}
              </span>
            ))
          : "—"}
      </td>
      <td className={cn("px-3 py-2 font-medium capitalize", statusClass)}>
        {status}
      </td>
    </tr>
  );
}
