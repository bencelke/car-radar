import assert from "node:assert/strict";
import { describe, it } from "node:test";

function canSkipGarageStep(step) {
  return step === 2 || step === 3;
}

function validateRequiredIdentity(displayName) {
  const name = displayName.trim();
  if (!name) return "displayNameRequired";
  if (name.length < 2) return "displayNameTooShort";
  if (name.length > 50) return "displayNameTooLong";
  return null;
}

function parseGarageTags(raw) {
  const seen = new Set();
  const tags = [];
  for (const part of raw.split(",")) {
    const tag = part.trim().toLowerCase();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
  }
  return tags;
}

describe("garage onboarding schema", () => {
  it("canSkipGarageStep", () => {
    assert.equal(canSkipGarageStep(0), false);
    assert.equal(canSkipGarageStep(2), true);
    assert.equal(canSkipGarageStep(3), true);
  });

  it("requires display name", () => {
    assert.equal(validateRequiredIdentity("Alex"), null);
    assert.equal(validateRequiredIdentity(" "), "displayNameRequired");
  });

  it("parses tags", () => {
    assert.deepEqual(parseGarageTags("Turbo, lowered, turbo"), [
      "turbo",
      "lowered",
    ]);
  });
});
