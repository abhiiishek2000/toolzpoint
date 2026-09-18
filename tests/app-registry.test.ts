import { it, expect } from "vitest";
import { apps, getApp } from "../src/lib/app-registry";
it("has at least one published app with complete content", () => {
  expect(apps.length).toBeGreaterThanOrEqual(1);
  expect(new Set(apps.map((a) => a.slug)).size).toBe(apps.length);
  for (const a of apps) {
    expect(a.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(a.name.length).toBeGreaterThan(0);
    expect(a.tagline.length).toBeGreaterThan(0);
    expect(a.description.split(/\s+/).length).toBeGreaterThanOrEqual(30);
    expect(a.platforms.length).toBeGreaterThanOrEqual(1);
    expect(a.features.length).toBeGreaterThanOrEqual(3);
    expect(a.playStoreUrl).toContain(a.packageId);
    expect(a.privacyPolicyPath).toBe(`/apps/${a.slug}/privacy`);
    expect(a.termsPath).toBe(`/apps/${a.slug}/terms`);
    expect(a.googleSignIn.scopes.length).toBeGreaterThanOrEqual(1);
    for (const s of a.googleSignIn.scopes) {
      expect(s.scope.length).toBeGreaterThan(0);
      expect(s.reason.length).toBeGreaterThan(0);
    }
    for (const s of a.screenshots) {
      expect(s.src).toMatch(/^\/apps\//);
      expect(s.alt.length).toBeGreaterThan(0);
    }
  }
});
it("looks up published apps by slug only", () => {
  expect(getApp("cashyai")).toBeDefined();
  expect(getApp("missing")).toBeUndefined();
});
