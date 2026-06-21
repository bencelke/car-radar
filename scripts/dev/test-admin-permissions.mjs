import assert from "node:assert/strict";
import { describe, it } from "node:test";

function isFounderUser(profile) {
  if (!profile) return false;
  return profile.role === "founder" || profile.adminRole === "founder";
}

function isAdminUser(profile) {
  if (!profile) return false;
  return (
    profile.isAdmin === true ||
    profile.role === "admin" ||
    profile.role === "founder" ||
    profile.adminRole === "founder" ||
    profile.adminRole === "admin"
  );
}

describe("admin permissions", () => {
  it("recognizes founder profiles", () => {
    const boris = {
      role: "founder",
      isAdmin: true,
      adminRole: "founder",
      title: "Founder",
    };
    assert.equal(isFounderUser(boris), true);
    assert.equal(isAdminUser(boris), true);
  });

  it("rejects normal users", () => {
    const user = { role: "user", isAdmin: false };
    assert.equal(isFounderUser(user), false);
    assert.equal(isAdminUser(user), false);
  });
});
