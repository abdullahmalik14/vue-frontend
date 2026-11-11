import { createAssetHandler } from '@/systems/assets/assetHandlerFactory.js';
import { getCurrentAuthMode } from './authHandler.js';

export function usesEmailLinkPasswordReset() {
  return getCurrentAuthMode() === 'auth0';
}

export function usesEmailLinkVerification() {
  return getCurrentAuthMode() === 'auth0';
}

export function getAuthPageAssetsConfig() {
  return [
    {
      name: 'auth-styles',
      url: '/css/auth.css',
      type: 'css',
      critical: true,
      priority: 'high',
    },
    {
      name: 'auth-bg',
      flag: 'auth.background',
      type: 'image',
      priority: 'normal',
    },
  ];
}

/**
 * Load shared auth page assets (Auth0/dev providers — no external auth SDK).
 *
 * @param {string} pageName
 * @returns {Promise<{ assetHandler: object, isReady: boolean }>}
 */
export async function loadAuthPageAssets(pageName) {
  const assetsConfig = getAuthPageAssetsConfig();
  const assetHandler = await createAssetHandler(assetsConfig, {
    name: pageName,
    debug: true,
  });

  await assetHandler
    .ensureAssetDependencies(
      assetsConfig.map((asset) => asset.name),
      { strict: false },
    )
    .catch(() => {});

  return { assetHandler, isReady: true };
}
