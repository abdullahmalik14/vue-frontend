import { onMounted, onUnmounted, ref } from 'vue';

/** iPhone CSS width is ~390–430; iPad mini is 744. Keep phones below this. */
const PHONE_MAX_WIDTH = 699;
const PHONE_VIEWPORT_QUERY = `(max-width: ${PHONE_MAX_WIDTH}px)`;

function getUserAgent() {
  return typeof navigator === 'undefined' ? '' : navigator.userAgent || '';
}

function isTabletUserAgent() {
  const ua = getUserAgent();
  if (/iPad/i.test(ua)) return true;
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return true;
  if (/Tablet/i.test(ua)) return true;
  // iPadOS 13+ reports as Macintosh.
  return (
    typeof navigator !== 'undefined'
    && navigator.platform === 'MacIntel'
    && Number(navigator.maxTouchPoints) > 1
  );
}

function isPhoneUserAgent() {
  const ua = getUserAgent();
  if (isTabletUserAgent()) return false;
  if (/iPhone|iPod/i.test(ua)) return true;
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return true;
  return /webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

function getIsMobileMd() {
  if (typeof window === 'undefined') return false;

  // Named DevTools devices and real hardware: trust UA, not screen.width.
  // screen.width in an iframe is often the desktop monitor (or CSS × DPR),
  // which incorrectly treated iPhone 17 (402px) as a tablet.
  if (isTabletUserAgent()) return false;
  if (isPhoneUserAgent()) return true;

  const viewportWidth = window.innerWidth || 0;
  // iframe can report 0 before the first layout; don't treat that as a phone
  // or Orders Received is v-if'd out until a click/resize remounts it.
  if (viewportWidth <= 0) return false;

  return viewportWidth <= PHONE_MAX_WIDTH;
}

export function useMobileMd() {
  const isMobile = ref(getIsMobileMd());
  let mediaQuery = null;

  function apply() {
    isMobile.value = getIsMobileMd();
  }

  onMounted(() => {
    apply();
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', apply);

    if (typeof window.matchMedia === 'function') {
      mediaQuery = window.matchMedia(PHONE_VIEWPORT_QUERY);
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', apply);
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(apply);
      }
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', apply);
      window.removeEventListener('orientationchange', apply);
    }
    if (!mediaQuery) return;
    if (typeof mediaQuery.removeEventListener === 'function') {
      mediaQuery.removeEventListener('change', apply);
    } else if (typeof mediaQuery.removeListener === 'function') {
      mediaQuery.removeListener(apply);
    }
  });

  return { isMobile };
}
