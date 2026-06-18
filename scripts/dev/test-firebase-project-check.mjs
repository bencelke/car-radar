import assert from "node:assert/strict";
import { describe, it } from "node:test";

const EXPECTED = "carradar-bd6fb";

function trimOrNull(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function evaluateFirebaseProjectCheck(
  expected,
  envProjectId,
  initializedProjectId
) {
  const isMismatch =
    (envProjectId !== null && envProjectId !== expected) ||
    (initializedProjectId !== null && initializedProjectId !== expected) ||
    (envProjectId !== null &&
      initializedProjectId !== null &&
      envProjectId !== initializedProjectId);

  const isConfigured = Boolean(envProjectId) && Boolean(initializedProjectId);

  return {
    expectedProjectId: expected,
    envProjectId,
    initializedProjectId,
    isConfigured,
    isMismatch,
  };
}

function getFirebaseConfigState(check, hasRequiredEnv) {
  if (!hasRequiredEnv && !check.envProjectId) return "missing";
  if (hasRequiredEnv && !check.initializedProjectId) return "missing";
  if (!check.envProjectId) return "missing";
  if (!check.initializedProjectId) return "loading";
  if (check.isMismatch) return "mismatch";
  return "ready";
}

describe("evaluateFirebaseProjectCheck", () => {
  it("all match carradar-bd6fb → ready, no mismatch", () => {
    const check = evaluateFirebaseProjectCheck(
      EXPECTED,
      EXPECTED,
      EXPECTED
    );
    assert.equal(check.isMismatch, false);
    assert.equal(getFirebaseConfigState(check, true), "ready");
  });

  it("wrong env and initialized → mismatch", () => {
    const check = evaluateFirebaseProjectCheck(
      EXPECTED,
      "shiftit-1f973",
      "shiftit-1f973"
    );
    assert.equal(check.isMismatch, true);
    assert.equal(getFirebaseConfigState(check, true), "mismatch");
  });

  it("env set, initialized null → not mismatch", () => {
    const check = evaluateFirebaseProjectCheck(EXPECTED, EXPECTED, null);
    assert.equal(check.isMismatch, false);
    assert.notEqual(getFirebaseConfigState(check, true), "mismatch");
    const partialEnv = evaluateFirebaseProjectCheck(EXPECTED, EXPECTED, null);
    assert.equal(getFirebaseConfigState(partialEnv, false), "loading");
  });

  it("no env, no initialized → missing", () => {
    const check = evaluateFirebaseProjectCheck(EXPECTED, null, null);
    assert.equal(check.isMismatch, false);
    assert.equal(getFirebaseConfigState(check, false), "missing");
  });

  it("env matches, initialized wrong → mismatch", () => {
    const check = evaluateFirebaseProjectCheck(
      EXPECTED,
      EXPECTED,
      "shiftit-1f973"
    );
    assert.equal(check.isMismatch, true);
    assert.equal(getFirebaseConfigState(check, true), "mismatch");
  });

  it("trims accidental whitespace", () => {
    const env = trimOrNull(`  ${EXPECTED}  `);
    const init = trimOrNull(` ${EXPECTED}\n`);
    const check = evaluateFirebaseProjectCheck(EXPECTED, env, init);
    assert.equal(check.isMismatch, false);
    assert.equal(getFirebaseConfigState(check, true), "ready");
  });
});
