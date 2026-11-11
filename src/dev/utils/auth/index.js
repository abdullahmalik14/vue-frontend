// Export main auth handler (factory)

export { authHandler, getAuthHandler, useAuthHandler, getCurrentAuthMode } from './authHandler';



// Export specific handlers

export { authHandlerAuth0 } from './authHandlerAuth0';

export { authHandlerDev } from './authHandlerDev';

export {

  mapTokenClaimsToUser,

  buildMockTokenClaims,

  getAuth0ClaimNamespace,

} from './auth0ClaimMapper';



// Export auth utilities

export {

  normalizeProfileAttributes,

  buildOnboardingProfileAttributes,

  buildKycCompleteProfileAttributes,

  buildOnboardingLocalUpdates,

  buildKycLocalUpdates,

} from './authProfileAttributes';

export {

  getAuth0ConnectionForProvider,

  AUTH0_SOCIAL_CONNECTIONS,

} from './authSocialConfig';

export {

  initiateSocialLogin,

  initiateSocialPopup,

  applySocialAuthTokens,

  usesAuth0SocialRedirect,

  usesDevSocialMock,

} from './socialAuthBridge';

export {

  authenticateTwitterIdentity,

  authenticateTelegramIdentity,

  linkSocialProviderIdentity,

  unlinkSocialProviderIdentity,

} from './socialAuthIdentity';

export {

  loadAuthPageAssets,

  getAuthPageAssetsConfig,

} from './authPageAssets';

export {

  isLoggedIn,

  getUserRole,

  getUserProfile,

  hasUserPassedKyc,

  hasUserPassedOnboarding,

  getUserEmail,

  isUserRole,

  getUserAttribute

} from './authUtilities';

