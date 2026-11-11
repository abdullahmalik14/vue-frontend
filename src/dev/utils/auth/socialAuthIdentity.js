import { getCurrentAuthMode } from '@/dev/utils/auth/authHandler.js';
import { authHandlerDev } from '@/dev/utils/auth/authHandlerDev.js';

/**
 * Complete Twitter OAuth identity → app session (dev shim popup flow only).
 */
export async function authenticateTwitterIdentity(twitterUserId, email, intent = 'login') {
  if (getCurrentAuthMode() !== 'dev') {
    throw new Error('Twitter popup login is only supported in dev mode. Use Auth0 social redirect.');
  }

  return authHandlerDev.loginWithSocial('twitter', {
    intent,
    profile: { id: twitterUserId, email },
  });
}

/**
 * Complete Telegram widget identity → app session (dev shim only).
 */
export async function authenticateTelegramIdentity(telegramUser, intent = 'login') {
  if (getCurrentAuthMode() !== 'dev') {
    throw new Error('Telegram widget login is only supported in dev mode. Use Auth0 social redirect.');
  }

  return authHandlerDev.loginWithSocial('telegram', {
    intent,
    profile: telegramUser,
  });
}

/**
 * Link a social provider ID to the current user profile metadata.
 *
 * @param {'twitter'|'telegram'} provider
 * @param {string|number} providerId
 */
export async function linkSocialProviderIdentity(provider, providerId) {
  const { authHandler } = await import('@/dev/utils/auth/authHandler.js');
  const attributeKey = provider === 'twitter' ? 'custom:twitter_id' : 'custom:telegram_id';

  await authHandler.updateProfileAttributes({
    [attributeKey]: String(providerId),
  });
}

/**
 * Unlink a social provider from the current user profile metadata.
 *
 * @param {'twitter'|'telegram'} provider
 */
export async function unlinkSocialProviderIdentity(provider) {
  const { authHandler } = await import('@/dev/utils/auth/authHandler.js');
  const attributeKey = provider === 'twitter' ? 'custom:twitter_id' : 'custom:telegram_id';

  await authHandler.updateProfileAttributes({
    [attributeKey]: '',
  });
}
