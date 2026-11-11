import { describe, expect, it } from "vitest";

import {
  buildHostAuthenticatedIframeUrl,
  resolveHostJwtToken,
  resolveHostUidFallback,
} from "@/utils/hostIframeAuth.js";

const IFRAME_URL =
  "https://fansocial.app/wp-content/plugins/fansocial/templates/template-parts/dashboard/template-part-dashboard-overview-order-received-iframe.php";

function makeWindow({ userData, parentUserData, search = "", injectedJwt, crossOrigin = false } = {}) {
  const windowRef = {
    location: { search, href: `https://vue-build-prod.example.com/iframe/analytics${search}` },
  };

  if (injectedJwt !== undefined) windowRef.__fsHostJwt = injectedJwt;
  if (userData !== undefined) windowRef.userData = userData;

  if (crossOrigin) {
    Object.defineProperty(windowRef, "parent", {
      get() {
        throw new DOMException("Blocked a frame with origin from accessing a cross-origin frame.");
      },
    });
  } else if (parentUserData !== undefined) {
    windowRef.parent = { userData: parentUserData };
  }

  return windowRef;
}

describe("host iframe auth", () => {
  it("reads the JWT from a same-origin parent dashboard", () => {
    const windowRef = makeWindow({ parentUserData: { jwtToken: "parent-token" } });
    expect(resolveHostJwtToken({ windowRef })).toBe("parent-token");
  });

  it("prefers an injected token, then own userData, then the parent", () => {
    expect(
      resolveHostJwtToken({
        windowRef: makeWindow({
          injectedJwt: "injected",
          userData: { jwtToken: "own" },
          parentUserData: { jwtToken: "parent" },
        }),
      })
    ).toBe("injected");

    expect(
      resolveHostJwtToken({
        windowRef: makeWindow({ userData: { jwtToken: "own" }, parentUserData: { jwtToken: "parent" } }),
      })
    ).toBe("own");
  });

  it("falls back to the query string when the parent is cross-origin", () => {
    const windowRef = makeWindow({ search: "?creator=1407&fs_jwt=url-token", crossOrigin: true });
    expect(resolveHostJwtToken({ windowRef })).toBe("url-token");
  });

  it("returns an empty token instead of throwing on a cross-origin parent", () => {
    expect(resolveHostJwtToken({ windowRef: makeWindow({ crossOrigin: true }) })).toBe("");
  });

  it("appends fs_jwt without dropping existing query params", () => {
    const windowRef = makeWindow({ parentUserData: { jwtToken: "abc.def.ghi" } });
    const url = buildHostAuthenticatedIframeUrl(`${IFRAME_URL}?type=merch`, { windowRef });

    expect(url).toContain("type=merch");
    expect(url).toContain("fs_jwt=abc.def.ghi");
  });

  it("uses the uid + iframe_nonce fallback only when no JWT exists", () => {
    const withJwt = makeWindow({
      parentUserData: { jwtToken: "token", UID: "enc-uid", iframe_nonce: "nonce" },
    });
    const jwtUrl = buildHostAuthenticatedIframeUrl(IFRAME_URL, { windowRef: withJwt });
    expect(jwtUrl).toContain("fs_jwt=token");
    expect(jwtUrl).not.toContain("uid=");
    expect(jwtUrl).not.toContain("iframe_nonce=");

    const withoutJwt = makeWindow({ parentUserData: { UID: "enc-uid", iframe_nonce: "nonce" } });
    expect(resolveHostUidFallback({ windowRef: withoutJwt })).toEqual({
      uid: "enc-uid",
      iframeNonce: "nonce",
    });

    const fallbackUrl = buildHostAuthenticatedIframeUrl(IFRAME_URL, { windowRef: withoutJwt });
    expect(fallbackUrl).toContain("uid=enc-uid");
    expect(fallbackUrl).toContain("iframe_nonce=nonce");
  });

  it("leaves the URL untouched when nothing is resolvable", () => {
    expect(buildHostAuthenticatedIframeUrl(IFRAME_URL, { windowRef: makeWindow() })).toBe(IFRAME_URL);
    expect(buildHostAuthenticatedIframeUrl(IFRAME_URL, { windowRef: null })).toBe(IFRAME_URL);
  });
});
