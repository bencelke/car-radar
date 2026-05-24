import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { isSafeDevSlug } from "@/lib/dev/safe-slug";
import type { Club, ClubMember } from "@/lib/types";

export const runtime = "nodejs";

type ClubJsonBundle = {
  club: Club;
  members: ClubMember[];
};

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { clubId?: string; bundle?: ClubJsonBundle };
  try {
    body = (await request.json()) as { clubId?: string; bundle?: ClubJsonBundle };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const clubId = String(body.clubId ?? "").trim();
  const bundle = body.bundle;

  if (!isSafeDevSlug(clubId)) {
    return NextResponse.json({ error: "Invalid clubId" }, { status: 400 });
  }

  if (!bundle?.club || !Array.isArray(bundle.members)) {
    return NextResponse.json({ error: "Missing club or members" }, { status: 400 });
  }

  if (bundle.club.id !== clubId) {
    return NextResponse.json({ error: "clubId does not match club.id" }, { status: 400 });
  }

  const clubDir = path.join(process.cwd(), "public", "data", "clubs", clubId);
  const imagesDir = path.join(clubDir, "images");
  const jsonFileName = `${clubId}.json`;
  const jsonPath = path.join(clubDir, jsonFileName);
  const gitkeepPath = path.join(imagesDir, ".gitkeep");

  const resolvedClubDir = path.resolve(clubDir);
  const resolvedJson = path.resolve(jsonPath);
  const resolvedGitkeep = path.resolve(gitkeepPath);
  const clubsRoot = path.resolve(process.cwd(), "public", "data", "clubs");

  if (
    !resolvedJson.startsWith(resolvedClubDir + path.sep) ||
    !resolvedGitkeep.startsWith(resolvedClubDir + path.sep)
  ) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  if (
    !resolvedClubDir.startsWith(clubsRoot + path.sep) &&
    resolvedClubDir !== clubsRoot
  ) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const payload = JSON.stringify(
    {
      club: { ...bundle.club, id: clubId, slug: bundle.club.slug || clubId },
      members: bundle.members,
    },
    null,
    2
  );

  try {
    await mkdir(resolvedClubDir, { recursive: true });
    await mkdir(path.dirname(resolvedGitkeep), { recursive: true });
    await writeFile(resolvedJson, payload, "utf8");
    await writeFile(resolvedGitkeep, "", "utf8");
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    publicJsonPath: `/data/clubs/${clubId}/${jsonFileName}`,
    diskPath: `public/data/clubs/${clubId}/${jsonFileName}`,
    memberCount: bundle.members.length,
  });
}
