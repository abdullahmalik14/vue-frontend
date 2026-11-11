import { ipUtility } from './ipHelper.js';

/**
 * Online/Offline Status Utility
 * Monitors network state. Do not use window.alert: Chrome fires a false
 * "offline" event on cross-origin iframes (WordPress embed + DevTools).
 */
export const networkUtility = {
    init() {
        console.log("🔌 [Network] Initializing monitor...");

        this.handleStatusChange(navigator.onLine);

        window.addEventListener("online", () => {
            console.log("✅ [Network] You are online");
            this.handleStatusChange(true);
        });

        window.addEventListener("offline", () => {
            if (navigator.onLine) return;
            console.log("❌ [Network] You are offline");
            this.handleStatusChange(false);
        });
    },

    handleStatusChange(isOnline) {
        if (isOnline) {
            if (!ipUtility.getCurrentIp()) {
                ipUtility.fetchIP();
            }
        } else {
            ipUtility.clearIp();
        }
    }
};

window.onlineStatus = {
    init: networkUtility.init.bind(networkUtility),
    isOnline: () => navigator.onLine
};
