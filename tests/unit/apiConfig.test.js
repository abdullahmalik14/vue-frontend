import { describe, expect, it } from "vitest";
import { buildApiUrl, getApiBaseUrl } from "@/config/apiConfig.js";

describe("apiConfig", () => {
  it("buildApiUrl returns full URL when base is provided via context", () => {
    const url = buildApiUrl("/api/charts/566", {
      apiBaseUrl: "https://node-build-prod.uy4sdjn4f7.com",
    });

    expect(url).toBe("https://node-build-prod.uy4sdjn4f7.com/api/charts/566");
  });

  it("buildApiUrl strips trailing slash from base URL", () => {
    const url = buildApiUrl("/events", {
      apiBaseUrl: "https://node-build-prod.uy4sdjn4f7.com/",
    });

    expect(url).toBe("https://node-build-prod.uy4sdjn4f7.com/events");
  });

  it("getApiBaseUrl prefers context override", () => {
    expect(getApiBaseUrl({ apiBaseUrl: "https://example.com" })).toBe(
      "https://example.com",
    );
  });

  it("buildApiUrl supports query strings in the path", () => {
    const url = buildApiUrl("/api/charts/566?nocache=1", {
      apiBaseUrl: "https://node-build-prod.uy4sdjn4f7.com",
    });

    expect(url).toBe(
      "https://node-build-prod.uy4sdjn4f7.com/api/charts/566?nocache=1",
    );
  });

  it("never returns a same-origin relative /api path when base is set", () => {
    const url = buildApiUrl("/api/charts/566?nocache=1", {
      apiBaseUrl: "https://node-build-prod.uy4sdjn4f7.com",
    });

    expect(url.startsWith("/api/")).toBe(false);
    expect(url).toContain("node-build-prod");
  });
});
