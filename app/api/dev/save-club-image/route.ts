import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { isSafeDevSlug } from "@/lib/dev/safe-slug";

export const runtime = "nodejs";

const MAX_BYTES = 800 * 1024;
const ALLOWED_MIME = new Set(["image/webp", "image/jpeg", "image/png"]);

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
  const imageKind = String(formData.get("imageKind") ?? "").trim();
  const file = formData.get("file");

  if (!isSafeDevSlug(clubId) || imageKind !== "cover") {
    return NextResponse.json({ error: "Invalid clubId or imageKind" }, { status: 400 });
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

  const fileName = "cover.webp";
  const publicUrlPath = `/data/clubs/${clubId}/${fileName}`;
  const clubDir = path.join(process.cwd(), "public", "data", "clubs", clubId);
  const savedPath = path.join(clubDir, fileName);

  const resolvedDir = path.resolve(clubDir);
  const resolvedFile = path.resolve(savedPath);
  const clubsRoot = path.resolve(process.cwd(), "public", "data", "clubs");
  if (!resolvedFile.startsWith(resolvedDir + path.sep)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  if (!resolvedDir.startsWith(clubsRoot + path.sep) && resolvedDir !== clubsRoot) {
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
    sizeBytes: buffer.length,
  });
}
