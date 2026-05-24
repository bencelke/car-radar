import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { isSafeDevSlug } from "@/lib/dev/safe-slug";

export const runtime = "nodejs";

const MAX_BYTES = 500 * 1024;
const ALLOWED_MIME = new Set(["image/webp", "image/jpeg", "image/png"]);

function outputFileName(memberId: string): string {
  return `${memberId}.webp`;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const clubId = String(formData.get("clubId") ?? "").trim();
  const memberId = String(formData.get("memberId") ?? "").trim();
  const file = formData.get("file");

  if (!isSafeDevSlug(clubId) || !isSafeDevSlug(memberId)) {
    return NextResponse.json({ error: "Invalid clubId or memberId" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const mime = (file.type || "").toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json(
      { error: `File exceeds ${MAX_BYTES} bytes` },
      { status: 400 }
    );
  }

  const fileName = outputFileName(memberId);
  const publicUrlPath = `/data/clubs/${clubId}/images/${fileName}`;
  const imagesDir = path.join(
    process.cwd(),
    "public",
    "data",
    "clubs",
    clubId,
    "images"
  );
  const savedPath = path.join(imagesDir, fileName);

  const resolvedDir = path.resolve(imagesDir);
  const resolvedFile = path.resolve(savedPath);
  if (!resolvedFile.startsWith(resolvedDir + path.sep)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    await mkdir(resolvedDir, { recursive: true });
    await writeFile(resolvedFile, buffer);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    publicPath: publicUrlPath,
    savedPath: path.relative(process.cwd(), resolvedFile).replace(/\\/g, "/"),
    sizeBytes: buffer.length,
  });
}
