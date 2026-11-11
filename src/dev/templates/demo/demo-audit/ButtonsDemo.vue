<template>
  <section class="flex flex-col gap-8">
    <DemoSectionHeader :title="t('demo.page.sections.allButtons')" />
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">

      <div class="flex flex-col gap-3 min-w-0 w-full max-w-md">
        <DashboardPrimaryButton :text="t('auth.login.button')" variant="authPink" size="lg" type="submit" />
        <ShowCodeToggle :code="code.authLoginSubmit" />
      </div>

      <div class="flex flex-col gap-3 min-w-0 w-full max-w-md">
        <DashboardPrimaryButton
          :text="t('auth.login.continueWithX')"
          variant="authTransparent"
          size="lg"
          :leftIcon="twitterIconUrl"
          leftIconClass="w-8 h-8"
        />
        <ShowCodeToggle :code="code.authContinueX" />
      </div>

      <div class="flex flex-col gap-3 min-w-0 w-full max-w-md">
        <DashboardPrimaryButton
          :text="t('auth.login.continueWithTelegram')"
          variant="authTransparent"
          size="lg"
          :leftIcon="telegramIconUrl"
          leftIconClass="w-8 h-8"
        />
        <ShowCodeToggle :code="code.authContinueTelegram" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton :text="t('cookies.accept')" variant="authPink" size="lg" />
        <ShowCodeToggle :code="code.cookiesAccept" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('settings.page.actions.back')"
          theme="settingsBack"
          :leftIcon="settingsAssets.arrowBack"
          :addAttributes="{ 'data-back-button': true }"
        />
        <ShowCodeToggle :code="code.settingsBack" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('settings.page.actions.cancel')"
          theme="settingsCancel"
          :addAttributes="{ 'data-cancel-button': true }"
        />
        <ShowCodeToggle :code="code.settingsCancel" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('settings.page.actions.save')"
          theme="settingsSave"
          :addAttributes="{ 'data-save-button': true }"
        />
        <ShowCodeToggle :code="code.settingsSave" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <TwoPieceButton variant="link-x" :text="t('settings.page.account.linkXCta')">
          <template #icon>
            <img
              :src="settingsAssets.linkX"
              :alt="t('settings.page.alt.x')"
              class="w-6 h-6 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(83%)_sepia(37%)_saturate(2897%)_hue-rotate(81deg)_brightness(94%)_contrast(103%)]"
            />
          </template>
        </TwoPieceButton>
        <ShowCodeToggle :code="code.settingsLinkX" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <TwoPieceButton
          variant="premium-upgrade"
          :text="t('settings.page.account.upgradeCta')"
          textClass="text-lg font-medium text-white"
        >
          <template #icon>
            <img :src="settingsAssets.premiumStar" :alt="t('settings.page.alt.star')" class="w-6 h-6" />
          </template>
        </TwoPieceButton>
        <ShowCodeToggle :code="code.settingsPremium" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton :text="t('cart.syncLive')" theme="cartSyncLive" />
        <ShowCodeToggle :code="code.cartSyncLive" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton :text="t('cart.save')" theme="cartSave" />
        <ShowCodeToggle :code="code.cartSave" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton :text="t('cart.apply')" theme="cartApply" />
        <ShowCodeToggle :code="code.cartApply" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton :text="t('cart.remove')" theme="cartRemove" />
        <ShowCodeToggle :code="code.cartRemove" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0 w-full max-w-xs">
        <DashboardPrimaryButton :text="t('cart.addNbaCard')" theme="cartAddPrimary" />
        <ShowCodeToggle :code="code.cartAddPrimary" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0 w-full max-w-xs">
        <DashboardPrimaryButton :text="t('cart.addVintageShirt')" theme="cartAddSecondary" />
        <ShowCodeToggle :code="code.cartAddSecondary" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton :text="t('cart.checkout')" theme="cartCheckout" :rightIcon="checkoutArrowUrl" />
        <ShowCodeToggle :code="code.cartCheckout" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton :text="t('cart.typeStandard')" theme="cartTypeActive" />
        <ShowCodeToggle :code="code.cartTypeActive" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton :text="t('cart.typeDefault')" theme="cartTypeInactive" />
        <ShowCodeToggle :code="code.cartTypeInactive" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <button type="button" class="flex justify-center items-center gap-0.5 outline-none cursor-pointer">
          <img :src="planAssets.pen" :alt="t('plan.detail.alt.pen')" class="w-5 h-5" />
          <span class="text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]">{{ t('plan.detail.edit') }}</span>
        </button>
        <ShowCodeToggle :code="code.planEdit" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <button type="button" class="flex justify-center items-center gap-0.5 outline-none cursor-pointer">
          <img :src="planAssets.trash" :alt="t('plan.detail.alt.trash')" class="w-5 h-5" />
          <span class="text-sm font-medium text-[#FF0066] dark:text-[#ff1a76]">{{ t('plan.detail.remove') }}</span>
        </button>
        <ShowCodeToggle :code="code.planRemove" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('plan.detail.addDiscount')"
          theme="planAddDiscount"
          :leftIcon="planAssets.plusBlueSquare || planAssets.plusSquare"
        />
        <ShowCodeToggle :code="code.planAddDiscount" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('plan.sharing.sendInvite')"
          variant="simpleBtn"
          type="button"
          :leftIcon="planAssets.send"
          leftIconClass="w-6 h-6 group-hover/button:[filter:brightness(0)_saturate(100%)_invert(74%)_sepia(36%)_saturate(5644%)_hue-rotate(95deg)_brightness(111%)_contrast(94%)]"
          btnBg="#07f468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#07f468"
        />
        <ShowCodeToggle :code="code.planSendInvite" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('payout.processing.defaults.actionUploadAddressProof')"
          theme="payoutFail"
          :rightIcon="payoutAssets.arrowUpRight"
        />
        <ShowCodeToggle :code="code.payoutFail" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('payout.balanceAside.withdrawNow')"
          theme="payoutBalanceWithdraw"
          :leftIcon="payoutAssets.creditCardDownload"
        />
        <ShowCodeToggle :code="code.payoutBalanceWithdraw" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          theme="payoutSettingsSave"
          :text="t('payout.settings.step3.save')"
          :leftIcon="tickCircleUrl || ''"
        />
        <ShowCodeToggle :code="code.payoutSettingsSave" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <TwoPieceButton
          variant="link-x"
          tag="button"
          type="button"
          :text="t('payoutCosmo.page.withdrawToBank')"
          rootClass="pb-1 filter drop-shadow-[5px_4px_0px_white] group enabled:hover:drop-shadow-[5px_4px_0px_theme('colors.cosmo.pink')] w-max md:pb-0 transition-all duration-300"
          contentWrapperClass="flex justify-center items-center gap-2.5 pl-2 pr-6 h-10 [clip-path:polygon(calc(100%-1rem)_0%,100%_100%,0%_100%,0%_0%)] bg-cosmo-pink text-white group-hover:bg-white group-hover:text-cosmo-pink transition-all duration-300"
          textClass="text-lg font-medium text-white group-hover:text-cosmo-pink transition-colors duration-300"
          :dataAttrs="{ 'data-action': 'open-saved-bank' }"
        >
          <template #icon>
            <PayoutCdnIcon :src="payoutAssets.bank" class="h-6 w-6" />
          </template>
        </TwoPieceButton>
        <ShowCodeToggle :code="code.cosmoWithdrawBank" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <TwoPieceButton
          variant="link-x"
          tag="button"
          type="button"
          :text="t('payoutCosmo.page.addBankAccount')"
          rootClass="pb-1 filter drop-shadow-[5px_4px_0px_black] group enabled:hover:drop-shadow-[5px_4px_0px_theme('colors.cosmo.mint')] w-max md:pb-0 transition-all duration-300"
          contentWrapperClass="flex justify-center items-center gap-2.5 pl-2 pr-6 h-10 [clip-path:polygon(calc(100%-1rem)_0%,100%_100%,0%_100%,0%_0%)] bg-cosmo-mint text-cosmo-mintInk group-hover:bg-black group-hover:text-cosmo-mint transition-all duration-300"
          textClass="text-lg font-medium text-cosmo-mintInk group-hover:text-cosmo-mint transition-colors duration-300"
          :dataAttrs="{ 'data-action': 'open-new-bank' }"
        >
          <template #icon>
            <PayoutCdnIcon :src="payoutAssets.plus" class="h-6 w-6" />
          </template>
        </TwoPieceButton>
        <ShowCodeToggle :code="code.cosmoAddBank" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('payoutCosmo.page.manageCard')"
          theme="cosmoManageCard"
          type="button"
          :addAttributes="{ 'data-element': 'manage-card' }"
        >
          <template #leftIcon>
            <PayoutCdnIcon :src="payoutAssets.addCard" class="h-[18px] w-[18px]" />
          </template>
        </DashboardPrimaryButton>
        <ShowCodeToggle :code="code.cosmoManageCard" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('payoutCosmo.page.verification')"
          theme="cosmoVerification"
          type="button"
          :addAttributes="{ 'data-action': 'open-onboarding' }"
        >
          <template #leftIcon>
            <PayoutCdnIcon :src="payoutAssets.checkCircle" class="h-[18px] w-[18px]" />
          </template>
        </DashboardPrimaryButton>
        <ShowCodeToggle :code="code.cosmoVerification" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0 w-full max-w-md">
        <DashboardPrimaryButton
          text="Proceed Payment"
          theme="checkoutProceed"
          :rightIcon="guestProceedArrowUrl"
          :rightIconClass="guestProceedArrowClass"
        />
        <ShowCodeToggle :code="code.checkoutProceed" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0 w-full max-w-md">
        <DashboardPrimaryButton
          text="Proceed Payment"
          variant="disableBtn"
          :disabled="true"
          :rightIcon="guestProceedArrowUrl"
          rightIconClass="w-6 h-6 brightness-0 invert opacity-30"
        />
        <ShowCodeToggle :code="code.checkoutDisabled" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          text="Continue with X (Twitter)"
          variant="actionGreen"
          leftIcon="https://i.ibb.co.com/HTj6TpFh/x.webp"
          leftIconClass="w-6 h-6 group-hover/xbtn:[filter:brightness(0)_saturate(100%)_invert(3%)_sepia(58%)_saturate(1835%)_hue-rotate(205deg)_brightness(93%)_contrast(94%)]"
        />
        <ShowCodeToggle :code="code.guestContinueX" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton text="Cancel" theme="guestAddressCancel" />
        <ShowCodeToggle :code="code.guestAddressCancel" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton text="Update" theme="guestAddressUpdate" />
        <ShowCodeToggle :code="code.guestAddressUpdate" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0 w-full max-w-md">
        <DashboardPrimaryButton class="w-full" text="AGREE & PROCEED" theme="proceedAgree" />
        <ShowCodeToggle :code="code.proceedAgree" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0 w-full max-w-md">
        <DashboardPrimaryButton
          :text="t('checkout.tip.confirmTip')"
          theme="confirmTip"
          class="self-stretch w-full"
          :wrapper-overrides="[
            { target: 'wrapper1', addClass: 'w-full self-stretch' },
            { target: 'wrapper2', addClass: 'w-full' },
          ]"
        />
        <ShowCodeToggle :code="code.confirmTip" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('mediaUploader.empty.uploadCta')"
          theme="mediaUploadCta"
          type="button"
          :leftIcon="plusIconUrl"
        />
        <ShowCodeToggle :code="code.mediaUploadCta" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('mediaUploader.library.filterPopup.selectAll')"
          theme="mediaFilterSelectTight"
          type="button"
          :leftIcon="selectAllIconUrl"
        />
        <ShowCodeToggle :code="code.mediaFilterSelectTight" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('mediaUploader.library.filterPopup.selectAll')"
          theme="mediaFilterSelectWide"
          type="button"
          :leftIcon="selectAllIconUrl"
        />
        <ShowCodeToggle :code="code.mediaFilterSelectWide" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0 w-full max-w-xs">
        <DashboardPrimaryButton
          :text="t('mediaUploader.library.filterPopup.reset')"
          theme="mediaFilterReset"
          type="button"
          btnBg="transparent"
          btnHoverBg="#FF4405"
          btnText="#FF4405"
          btnHoverText="#FFFFFF"
          :leftIcon="resetIconUrl"
        />
        <ShowCodeToggle :code="code.mediaFilterReset" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0 w-full max-w-xs">
        <DashboardPrimaryButton
          :text="t('mediaUploader.library.filterPopup.apply')"
          theme="mediaFilterApply"
          type="button"
          :leftIcon="applyIconUrl"
        />
        <ShowCodeToggle :code="code.mediaFilterApply" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('mediaUploader.shell.next')"
          variant="polygonLeft"
          :rightIcon="nextIconUrl"
          :rightIconClass="mediaPolygonNextIconClass"
          btnBg="#07f468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#07f468"
        />
        <ShowCodeToggle :code="code.mediaNext" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('mediaUploader.submit.submitButton')"
          variant="polygonLeft"
          :rightIcon="nextIconUrl"
          :rightIconClass="mediaSubmitIconClass"
          btnBg="#07f468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#07f468"
        />
        <ShowCodeToggle :code="code.mediaSubmit" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton :text="t('mediaUploader.addTier.cancel')" theme="addTierCancel" />
        <ShowCodeToggle :code="code.addTierCancel" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('mediaUploader.addTier.save')"
          theme="addTierSave"
          btnBg="#07F468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#07F468"
        />
        <ShowCodeToggle :code="code.addTierSave" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('mediaUploader.subscription.addTier')"
          theme="mediaAddTierPanel"
          :leftIcon="addTierIconUrl"
          btnBg="#000"
          btnHoverBg="#07f468"
          btnText="#07f468"
          btnHoverText="black"
        />
        <ShowCodeToggle :code="code.mediaAddTierPanel" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          theme="analyticsRefresh"
          :text="t('dashboard.analytics.page.refresh')"
          :leftIcon="analyticsRefreshIconUrl || ''"
          :wrapperOverrides="wrapperOverridesNoClass"
        />
        <ShowCodeToggle :code="code.analyticsRefresh" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          theme="analyticsTrend"
          :text="t('dashboard.analytics.page.trend')"
          :rightIcon="analyticsTrendExpandUrl || ''"
          :wrapperOverrides="wrapperOverridesNoClass"
        />
        <ShowCodeToggle :code="code.analyticsTrend" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('profileSettings.editProfile')"
          theme="dashProfileEdit"
          :rightIcon="editIconUrl"
        />
        <ShowCodeToggle :code="code.dashProfileEdit" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          theme="quoteRefresh"
          text="New Quote"
          :leftIcon="quoteRefreshUrl || ''"
          :wrapperOverrides="wrapperOverridesNoClass"
        />
        <ShowCodeToggle :code="code.quoteRefresh" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          theme="homeNavLogin"
          type="button"
          :text="t('home.nav.login')"
          :wrapperOverrides="wrapperOverridesNoClass"
        />
        <ShowCodeToggle :code="code.homeNavLogin" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          theme="homeNavSignUp"
          type="button"
          :text="t('home.nav.signUp')"
          :wrapperOverrides="wrapperOverridesNoClass"
        />
        <ShowCodeToggle :code="code.homeNavSignUp" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0 w-full max-w-md">
        <DashboardPrimaryButton
          theme="homeCreatorJoin"
          type="button"
          :text="t('home.signupForm.joinAsCreator')"
          :wrapperOverrides="wrapperOverridesNoClass"
        />
        <ShowCodeToggle :code="code.homeCreatorJoin" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          theme="homeFanSignUp"
          type="button"
          :text="t('home.signupForm.signUpAsFan')"
          :wrapperOverrides="wrapperOverridesNoClass"
        />
        <ShowCodeToggle :code="code.homeFanSignUp" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          theme="homeDitchDesktop"
          type="button"
          :text="t('home.ditch.cta')"
          :wrapperOverrides="wrapperOverridesNoClass"
        />
        <ShowCodeToggle :code="code.homeDitchDesktop" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          theme="homeDitchMobile"
          type="button"
          :text="t('home.ditch.cta')"
          :wrapperOverrides="wrapperOverridesNoClass"
        />
        <ShowCodeToggle :code="code.homeDitchMobile" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0 w-full max-w-lg">
        <DashboardPrimaryButton
          theme="faqQuestion"
          type="button"
          :text="t('home.faq.items.1.question')"
          :wrapperOverrides="wrapperOverridesNoClass"
          :rightIcon="faqChevronIconUrl || ''"
        />
        <ShowCodeToggle :code="code.faqQuestion" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0 w-full max-w-md">
        <DashboardPrimaryButton
          text="NEW EVENTS"
          theme="calendarNewEvents"
          :leftIcon="calendarPlusIconUrl"
        />
        <ShowCodeToggle :code="code.calendarNewEvents" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          text="Next"
          variant="polygonLeft"
          :rightIcon="bookingNextIconUrl"
          :rightIconClass="mediaPolygonNextIconClass"
          btnBg="#07f468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#07f468"
        />
        <ShowCodeToggle :code="code.bookingNext" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          text="PUBLISH SCHEDULE"
          variant="polygonLeft"
          :leftIcon="bookingPublishIconUrl"
          :leftIconClass="bookingPublishIconClass"
        />
        <ShowCodeToggle :code="code.bookingPublish" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          text="add-on service"
          theme="bookingAddon"
          :leftIcon="calendarPlusIconUrl"
        />
        <ShowCodeToggle :code="code.bookingAddon" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          type="button"
          theme="xRepostPreviewEdit"
          :text="t('dashboard.xRepost.postPreview.edit')"
          :leftIcon="xRepostAssets.editDraft"
        />
        <ShowCodeToggle :code="code.xRepostPreviewEdit" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          type="button"
          theme="xRepostPreviewDiscard"
          :text="t('dashboard.xRepost.postPreview.discardEdit')"
          :leftIcon="xRepostAssets.close"
        />
        <ShowCodeToggle :code="code.xRepostPreviewDiscard" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          type="button"
          theme="xRepostPreviewSave"
          :text="t('dashboard.xRepost.postPreview.saveEdit')"
          :leftIcon="xRepostAssets.savePost"
        />
        <ShowCodeToggle :code="code.xRepostPreviewSave" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          type="button"
          theme="xRepostSaveDraft"
          :text="t('dashboard.xRepost.postPreview.saveDraft')"
          :leftIcon="xRepostAssets.uploadDraft"
        />
        <ShowCodeToggle :code="code.xRepostSaveDraft" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          type="button"
          theme="xRepostSavePost"
          :text="t('dashboard.xRepost.postPreview.savePost')"
          :leftIcon="xRepostAssets.savePost"
        />
        <ShowCodeToggle :code="code.xRepostSavePost" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <TwoPieceButton
          variant="link-x"
          tag="button"
          type="button"
          :text="t('dashboard.xRepost.addNew')"
          content-wrapper-class="flex justify-center items-center gap-2.5 px-3 h-10 min-w-[134px] bg-[#07F468] group-hover:bg-black transition-all duration-300"
          text-class="text-sm font-medium text-black group-hover:text-[#07F468] transition-colors duration-300"
        >
          <template #icon>
            <img
              src="/images/plus-green-square.png"
              alt=""
              width="20"
              height="20"
              class="h-5 w-5 brightness-0 transition-all duration-300 group-hover:[filter:brightness(0)_saturate(100%)_invert(77%)_sepia(61%)_saturate(638%)_hue-rotate(88deg)_brightness(101%)_contrast(92%)]"
            />
          </template>
        </TwoPieceButton>
        <ShowCodeToggle :code="code.xRepostAddNew" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <TwoPieceButton
          tag="button"
          variant="link-x"
          rootClass="filter drop-shadow-[4px_3px_0px_#000000] group hover:drop-shadow-[4px_3px_0px_#FF439D] block w-max appearance-button"
          contentWrapperClass="flex justify-center items-center gap-2.5 pl-2 pr-[20.5px] min-h-[2rem] [clip-path:polygon(calc(100%-12.5px)_0%,100%_100%,0%_100%,0%_0%)] bg-[linear-gradient(135deg,#F093FB_0%,#FF439D_100%)] group-hover:[background:black]"
          textClass="text-lg font-medium text-black group-hover:text-[#FF439D]"
          :text="t('editProfile.page.gallery.unlockVideos')"
        />
        <ShowCodeToggle :code="code.editProfileUnlockVideos" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <TwoPieceButton
          tag="button"
          variant="link-x"
          rootClass="filter drop-shadow-[4px_3px_0px_#000000] group hover:drop-shadow-[4px_3px_0px_#FF439D] block w-max appearance-button mt-4"
          contentWrapperClass="flex justify-center items-center gap-2.5 pl-2 pr-[20.5px] min-h-[2rem] [clip-path:polygon(calc(100%-12.5px)_0%,100%_100%,0%_100%,0%_0%)] bg-[linear-gradient(135deg,#F093FB_0%,#FF439D_100%)] group-hover:[background:black]"
          textClass="text-lg font-medium text-black group-hover:text-[#FF439D]"
          :text="t('editProfile.page.social.unlockLinks')"
        />
        <ShowCodeToggle :code="code.editProfileUnlockLinks" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <TwoPieceButton
          variant="link-x"
          tag="button"
          :text="t('thankYou.dashboardHome')"
          textClass="text-[18px] font-medium uppercase text-[#000000] group-hover:text-[#07F468] transition-colors duration-300"
          type="button"
        >
          <template #icon>
            <img
              v-if="thankYouHomeIconUrl"
              :src="thankYouHomeIconUrl"
              alt=""
              class="w-[18px] h-[18px] brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(83%)_sepia(37%)_saturate(2897%)_hue-rotate(81deg)_brightness(94%)_contrast(103%)]"
            />
          </template>
        </TwoPieceButton>
        <ShowCodeToggle :code="code.thankYouMediaHome" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <TwoPieceButton
          variant="link-x"
          tag="button"
          :text="t('thankYouSubscription.dashboardHome')"
          textClass="text-[18px] font-medium uppercase text-[#000000] group-hover:text-[#07F468] transition-colors duration-300"
          rootClass="pb-1 pl-[5px] filter drop-shadow-[-5px_4px_0px_#000] group enabled:hover:drop-shadow-[-5px_4px_0px_#07F468] w-max transition-all duration-300"
          contentWrapperClass="flex justify-center items-center gap-2.5 pl-6 pr-2 h-10 [clip-path:polygon(1rem_0%,100%_0%,100%_100%,0%_100%)] bg-[#07F468] group-hover:bg-black transition-all duration-300"
          type="button"
        >
          <template #icon>
            <img
              v-if="thankYouHomeIconUrl"
              :src="thankYouHomeIconUrl"
              alt=""
              class="h-[18px] w-[18px] brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(83%)_sepia(37%)_saturate(2897%)_hue-rotate(81deg)_brightness(94%)_contrast(103%)]"
            />
          </template>
        </TwoPieceButton>
        <ShowCodeToggle :code="code.thankYouSubHome" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <TwoPieceButton
          variant="two-piece"
          tag="button"
          type="button"
          skewPosition="right"
          :text="t('paymentFailed.tryAgain')"
          rootClass="group relative isolate inline-flex w-max cursor-pointer no-underline"
          mainClass="relative z-10 flex h-10 items-center gap-2 bg-black px-4 text-[#07F468] transition-colors duration-300 group-hover:bg-[#07F468] group-hover:text-black"
          skewClass="pointer-events-none absolute left-1 top-1 z-0 h-full w-full bg-[#07F468] transition-colors duration-300 group-hover:bg-black"
          textClass="text-[18px] font-semibold uppercase tracking-wide text-[#07F468] transition-colors duration-300 group-hover:text-black"
        >
          <template #icon>
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M13 8H3M3 8l4-4M3 8l4 4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </template>
        </TwoPieceButton>
        <ShowCodeToggle :code="code.paymentFailedTryAgain" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <TwoPieceButton
          tag="div"
          variant="two-piece"
          skewPosition="right"
          rootClass="no-underline"
          mainClass="w-40 px-4 py-2 bg-[#FF0066] flex flex-col justify-center items-center"
          text="SEE OPTIONS"
          textClass="self-stretch justify-center text-white text-base font-bold font-['Poppins'] leading-6"
          skewClass="w-3.5 self-stretch shrink-0 -ml-1 bg-[url('/images/pinkUnion.png')] bg-contain bg-center bg-no-repeat"
        />
        <ShowCodeToggle :code="code.profileCallSeeOptions" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <TwoPieceButton
          tag="div"
          variant="two-piece"
          skewPosition="right"
          rootClass="no-underline"
          mainClass="w-40 px-4 py-2 bg-[#FF0066] flex flex-col justify-center items-center"
          text="VIEW EVENTS"
          textClass="self-stretch justify-center text-white text-base font-bold font-['Poppins'] leading-6"
          skewClass="w-3.5 self-stretch shrink-0 -ml-1 bg-[url('/images/pinkUnion.png')] bg-contain bg-center bg-no-repeat"
        />
        <ShowCodeToggle :code="code.profileCallViewEvents" />
      </div>

      <div class="flex flex-col items-start gap-3 min-w-0">
        <DashboardPrimaryButton
          :text="t('booking.tipSetToMax')"
          theme="tipLimitAction"
          :rightIcon="tipLimitChevronUrl || ''"
          :wrapperOverrides="tipLimitWrapperOverrides"
        />
        <ShowCodeToggle :code="code.tipLimitAction" />
      </div>

    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import TwoPieceButton from '@/components/ui/buttons/TwoPieceButton.vue';
import PayoutCdnIcon from '@/dev/components/payout/cosmo/PayoutCdnIcon.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { useSettingsAssets } from '@/dev/composables/useSettingsAssets.js';
import { usePlanAssets } from '@/composables/usePlanAssets.js';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';
import { useXRepostAssets } from '@/dev/composables/useXRepostAssets.js';
const code = {
  authLoginSubmit: `<DashboardPrimaryButton :text="t('auth.login.button')" variant="authPink" size="lg" type="submit" />`,
  authContinueX: `<DashboardPrimaryButton
          :text="t('auth.login.continueWithX')"
          variant="authTransparent"
          size="lg"
          :leftIcon="twitterIconUrl"
          leftIconClass="w-8 h-8"
        />`,
  authContinueTelegram: `<DashboardPrimaryButton
          :text="t('auth.login.continueWithTelegram')"
          variant="authTransparent"
          size="lg"
          :leftIcon="telegramIconUrl"
          leftIconClass="w-8 h-8"
        />`,
  cookiesAccept: `<DashboardPrimaryButton :text="t('cookies.accept')" variant="authPink" size="lg" />`,
  settingsBack: `<DashboardPrimaryButton
          :text="t('settings.page.actions.back')"
          theme="settingsBack"
          :leftIcon="settingsAssets.arrowBack"
          customClass="lg:hidden"
          :addAttributes="{ 'data-back-button': true }"
        />`,
  settingsCancel: `<DashboardPrimaryButton
          :text="t('settings.page.actions.cancel')"
          theme="settingsCancel"
          :addAttributes="{ 'data-cancel-button': true }"
        />`,
  settingsSave: `<DashboardPrimaryButton
          :text="t('settings.page.actions.save')"
          theme="settingsSave"
          :addAttributes="{ 'data-save-button': true }"
        />`,
  settingsLinkX: `<TwoPieceButton variant="link-x" :text="t('settings.page.account.linkXCta')">
          <template #icon>
            <img
              :src="settingsAssets.linkX"
              :alt="t('settings.page.alt.x')"
              class="w-6 h-6 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(83%)_sepia(37%)_saturate(2897%)_hue-rotate(81deg)_brightness(94%)_contrast(103%)]"
            />
          </template>
        </TwoPieceButton>`,
  settingsPremium: `<TwoPieceButton
          variant="premium-upgrade"
          :text="t('settings.page.account.upgradeCta')"
          textClass="text-lg font-medium text-white"
        >
          <template #icon>
            <img :src="settingsAssets.premiumStar" :alt="t('settings.page.alt.star')" class="w-6 h-6" />
          </template>
        </TwoPieceButton>`,
  cartSyncLive: `<DashboardPrimaryButton :text="t('cart.syncLive')" theme="cartSyncLive" />`,
  cartSave: `<DashboardPrimaryButton :text="t('cart.save')" theme="cartSave" />`,
  cartApply: `<DashboardPrimaryButton :text="t('cart.apply')" theme="cartApply" />`,
  cartRemove: `<DashboardPrimaryButton :text="t('cart.remove')" theme="cartRemove" />`,
  cartAddPrimary: `<DashboardPrimaryButton :text="t('cart.addNbaCard')" theme="cartAddPrimary" />`,
  cartAddSecondary: `<DashboardPrimaryButton :text="t('cart.addVintageShirt')" theme="cartAddSecondary" />`,
  cartCheckout: `<DashboardPrimaryButton :text="t('cart.checkout')" theme="cartCheckout" :rightIcon="checkoutArrowUrl" />`,
  cartTypeActive: `<DashboardPrimaryButton :text="t('cart.typeStandard')" theme="cartTypeActive" />`,
  cartTypeInactive: `<DashboardPrimaryButton :text="t('cart.typeDefault')" theme="cartTypeInactive" />`,
  planEdit: `<button type="button" class="flex justify-center items-center gap-0.5 outline-none cursor-pointer">
          <img :src="planAssets.pen" :alt="t('plan.detail.alt.pen')" class="w-5 h-5" />
          <span class="text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]">{{ t('plan.detail.edit') }}</span>
        </button>`,
  planRemove: `<button type="button" class="flex justify-center items-center gap-0.5 outline-none cursor-pointer">
          <img :src="planAssets.trash" :alt="t('plan.detail.alt.trash')" class="w-5 h-5" />
          <span class="text-sm font-medium text-[#FF0066] dark:text-[#ff1a76]">{{ t('plan.detail.remove') }}</span>
        </button>`,
  planAddDiscount: `<DashboardPrimaryButton
          :text="t('plan.detail.addDiscount')"
          theme="planAddDiscount"
          :leftIcon="planAssets.plusBlueSquare || planAssets.plusSquare"
        />`,
  planSendInvite: `<DashboardPrimaryButton
          :text="t('plan.sharing.sendInvite')"
          variant="simpleBtn"
          type="button"
          :leftIcon="planAssets.send"
          leftIconClass="w-6 h-6 group-hover/button:[filter:brightness(0)_saturate(100%)_invert(74%)_sepia(36%)_saturate(5644%)_hue-rotate(95deg)_brightness(111%)_contrast(94%)]"
          btnBg="#07f468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#07f468"
        />`,
  payoutFail: `<DashboardPrimaryButton
          :text="t('payout.processing.defaults.actionUploadAddressProof')"
          theme="payoutFail"
          :rightIcon="payoutAssets.arrowUpRight"
        />`,
  payoutBalanceWithdraw: `<DashboardPrimaryButton
          :text="t('payout.balanceAside.withdrawNow')"
          theme="payoutBalanceWithdraw"
          :leftIcon="payoutAssets.creditCardDownload"
        />`,
  payoutSettingsSave: `<DashboardPrimaryButton
          theme="payoutSettingsSave"
          :text="t('payout.settings.step3.save')"
          :leftIcon="tickCircleUrl || ''"
        />`,
  cosmoWithdrawBank: `<TwoPieceButton
          variant="link-x"
          tag="button"
          type="button"
          :text="t('payoutCosmo.page.withdrawToBank')"
          rootClass="pb-1 filter drop-shadow-[5px_4px_0px_white] group enabled:hover:drop-shadow-[5px_4px_0px_theme('colors.cosmo.pink')] w-max md:pb-0 transition-all duration-300"
          contentWrapperClass="flex justify-center items-center gap-2.5 pl-2 pr-6 h-10 [clip-path:polygon(calc(100%-1rem)_0%,100%_100%,0%_100%,0%_0%)] bg-cosmo-pink text-white group-hover:bg-white group-hover:text-cosmo-pink transition-all duration-300"
          textClass="text-lg font-medium text-white group-hover:text-cosmo-pink transition-colors duration-300"
          :dataAttrs="{ 'data-action': 'open-saved-bank' }"
        >
          <template #icon>
            <PayoutCdnIcon :src="payoutAssets.bank" class="h-6 w-6" />
          </template>
        </TwoPieceButton>`,
  cosmoAddBank: `<TwoPieceButton
          variant="link-x"
          tag="button"
          type="button"
          :text="t('payoutCosmo.page.addBankAccount')"
          rootClass="pb-1 filter drop-shadow-[5px_4px_0px_black] group enabled:hover:drop-shadow-[5px_4px_0px_theme('colors.cosmo.mint')] w-max md:pb-0 transition-all duration-300"
          contentWrapperClass="flex justify-center items-center gap-2.5 pl-2 pr-6 h-10 [clip-path:polygon(calc(100%-1rem)_0%,100%_100%,0%_100%,0%_0%)] bg-cosmo-mint text-cosmo-mintInk group-hover:bg-black group-hover:text-cosmo-mint transition-all duration-300"
          textClass="text-lg font-medium text-cosmo-mintInk group-hover:text-cosmo-mint transition-colors duration-300"
          :dataAttrs="{ 'data-action': 'open-new-bank' }"
        >
          <template #icon>
            <PayoutCdnIcon :src="payoutAssets.plus" class="h-6 w-6" />
          </template>
        </TwoPieceButton>`,
  cosmoManageCard: `<DashboardPrimaryButton
          :text="t('payoutCosmo.page.manageCard')"
          theme="cosmoManageCard"
          type="button"
          :addAttributes="{ 'data-element': 'manage-card' }"
        >
          <template #leftIcon>
            <PayoutCdnIcon :src="payoutAssets.addCard" class="h-[18px] w-[18px]" />
          </template>
        </DashboardPrimaryButton>`,
  cosmoVerification: `<DashboardPrimaryButton
          :text="t('payoutCosmo.page.verification')"
          theme="cosmoVerification"
          type="button"
          :addAttributes="{ 'data-action': 'open-onboarding' }"
        >
          <template #leftIcon>
            <PayoutCdnIcon :src="payoutAssets.checkCircle" class="h-[18px] w-[18px]" />
          </template>
        </DashboardPrimaryButton>`,
  checkoutProceed: `<DashboardPrimaryButton
          text="Proceed Payment"
          theme="checkoutProceed"
          :rightIcon="guestProceedArrowUrl"
          :rightIconClass="guestProceedArrowClass"
        />`,
  checkoutDisabled: `<DashboardPrimaryButton
          text="Proceed Payment"
          variant="disableBtn"
          :disabled="true"
          :rightIcon="guestProceedArrowUrl"
          rightIconClass="w-6 h-6 brightness-0 invert opacity-30"
        />`,
  guestContinueX: `<DashboardPrimaryButton
          text="Continue with X (Twitter)"
          variant="actionGreen"
          leftIcon="https://i.ibb.co.com/HTj6TpFh/x.webp"
          leftIconClass="w-6 h-6 group-hover/xbtn:[filter:brightness(0)_saturate(100%)_invert(3%)_sepia(58%)_saturate(1835%)_hue-rotate(205deg)_brightness(93%)_contrast(94%)]"
        />`,
  guestAddressCancel: `<DashboardPrimaryButton text="Cancel" theme="guestAddressCancel" />`,
  guestAddressUpdate: `<DashboardPrimaryButton text="Update" theme="guestAddressUpdate" />`,
  proceedAgree: `<DashboardPrimaryButton class="w-full" text="AGREE & PROCEED" theme="proceedAgree" />`,
  confirmTip: `<!-- CheckoutBeforeTipPopup.vue -->\n<DashboardPrimaryButton\n  :text="t('checkout.tip.confirmTip')"\n  theme="confirmTip"\n  class="self-stretch w-full"\n  :wrapper-overrides="[\n    { target: 'wrapper1', addClass: 'w-full self-stretch' },\n    { target: 'wrapper2', addClass: 'w-full' },\n  ]"\n  :disabled="!selectedCount || !selectedAmount"\n  @click="confirmTip"\n/>`,
  mediaUploadCta: `<DashboardPrimaryButton
          :text="t('mediaUploader.empty.uploadCta')"
          theme="mediaUploadCta"
          type="button"
          :leftIcon="plusIconUrl"
        />`,
  mediaFilterSelectTight: `<DashboardPrimaryButton
          :text="t('mediaUploader.library.filterPopup.selectAll')"
          theme="mediaFilterSelectTight"
          type="button"
          :leftIcon="selectAllIconUrl"
        />`,
  mediaFilterSelectWide: `<DashboardPrimaryButton
          :text="t('mediaUploader.library.filterPopup.selectAll')"
          theme="mediaFilterSelectWide"
          type="button"
          :leftIcon="selectAllIconUrl"
        />`,
  mediaFilterReset: `<DashboardPrimaryButton
          :text="t('mediaUploader.library.filterPopup.reset')"
          theme="mediaFilterReset"
          type="button"
          btnBg="transparent"
          btnHoverBg="#FF4405"
          btnText="#FF4405"
          btnHoverText="#FFFFFF"
          :leftIcon="resetIconUrl"
        />`,
  mediaFilterApply: `<DashboardPrimaryButton
          :text="t('mediaUploader.library.filterPopup.apply')"
          theme="mediaFilterApply"
          type="button"
          :leftIcon="applyIconUrl"
        />`,
  mediaNext: `<DashboardPrimaryButton
          :text="t('mediaUploader.shell.next')"
          variant="polygonLeft"
          :rightIcon="nextIconUrl"
          :rightIconClass="mediaPolygonNextIconClass"
          btnBg="#07f468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#07f468"
        />`,
  mediaSubmit: `<DashboardPrimaryButton
          :text="t('mediaUploader.submit.submitButton')"
          variant="polygonLeft"
          :rightIcon="nextIconUrl"
          :rightIconClass="mediaSubmitIconClass"
          btnBg="#07f468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#07f468"
        />`,
  addTierCancel: `<DashboardPrimaryButton :text="t('mediaUploader.addTier.cancel')" theme="addTierCancel" />`,
  addTierSave: `<DashboardPrimaryButton
          :text="t('mediaUploader.addTier.save')"
          theme="addTierSave"
          btnBg="#07F468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#07F468"
        />`,
  mediaAddTierPanel: `<DashboardPrimaryButton
          :text="t('mediaUploader.subscription.addTier')"
          theme="mediaAddTierPanel"
          :leftIcon="addTierIconUrl"
          btnBg="#000"
          btnHoverBg="#07f468"
          btnText="#07f468"
          btnHoverText="black"
        />`,
  analyticsRefresh: `<DashboardPrimaryButton
          theme="analyticsRefresh"
          :text="t('dashboard.analytics.page.refresh')"
          :leftIcon="analyticsRefreshIconUrl || ''"
          :wrapperOverrides="wrapperOverridesNoClass"
        />`,
  analyticsTrend: `<DashboardPrimaryButton
          theme="analyticsTrend"
          :text="t('dashboard.analytics.page.trend')"
          :rightIcon="analyticsTrendExpandUrl || ''"
          :wrapperOverrides="wrapperOverridesNoClass"
        />`,
  dashProfileEdit: `<DashboardPrimaryButton
          :text="t('profileSettings.editProfile')"
          theme="dashProfileEdit"
          :rightIcon="editIconUrl"
        />`,
  quoteRefresh: `<DashboardPrimaryButton
          theme="quoteRefresh"
          text="New Quote"
          :leftIcon="quoteRefreshUrl || ''"
          :wrapperOverrides="wrapperOverridesNoClass"
        />`,
  homeNavLogin: `<DashboardPrimaryButton
          theme="homeNavLogin"
          type="button"
          :text="t('home.nav.login')"
          :wrapperOverrides="wrapperOverridesNoClass"
        />`,
  homeNavSignUp: `<DashboardPrimaryButton
          theme="homeNavSignUp"
          type="button"
          :text="t('home.nav.signUp')"
          :wrapperOverrides="wrapperOverridesNoClass"
        />`,
  homeCreatorJoin: `<DashboardPrimaryButton
          theme="homeCreatorJoin"
          type="button"
          :text="t('home.signupForm.joinAsCreator')"
          :wrapperOverrides="wrapperOverridesNoClass"
        />`,
  homeFanSignUp: `<DashboardPrimaryButton
          theme="homeFanSignUp"
          type="button"
          :text="t('home.signupForm.signUpAsFan')"
          :wrapperOverrides="wrapperOverridesNoClass"
        />`,
  homeDitchDesktop: `<DashboardPrimaryButton
          theme="homeDitchDesktop"
          type="button"
          :text="t('home.ditch.cta')"
          :wrapperOverrides="wrapperOverridesNoClass"
          customClass="hidden xl:flex"
        />`,
  homeDitchMobile: `<DashboardPrimaryButton
          theme="homeDitchMobile"
          type="button"
          :text="t('home.ditch.cta')"
          :wrapperOverrides="wrapperOverridesNoClass"
          customClass="xl:hidden"
        />`,
  faqQuestion: `<DashboardPrimaryButton
          theme="faqQuestion"
          type="button"
          :text="t('home.faq.items.1.question')"
          :wrapperOverrides="wrapperOverridesNoClass"
          :rightIcon="faqChevronIconUrl || ''"
        />`,
  calendarNewEvents: `<DashboardPrimaryButton
          text="NEW EVENTS"
          theme="calendarNewEvents"
          :leftIcon="calendarPlusIconUrl"
        />`,
  bookingNext: `<DashboardPrimaryButton
          text="Next"
          variant="polygonLeft"
          :rightIcon="bookingNextIconUrl"
          :rightIconClass="mediaPolygonNextIconClass"
          btnBg="#07f468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#07f468"
        />`,
  bookingPublish: `<DashboardPrimaryButton
          text="PUBLISH SCHEDULE"
          variant="polygonLeft"
          :leftIcon="bookingPublishIconUrl"
          :leftIconClass="bookingPublishIconClass"
        />`,
  bookingAddon: `<DashboardPrimaryButton
          text="add-on service"
          theme="bookingAddon"
          :leftIcon="calendarPlusIconUrl"
        />`,
  xRepostPreviewEdit: `<DashboardPrimaryButton
          type="button"
          theme="xRepostPreviewEdit"
          :text="t('dashboard.xRepost.postPreview.edit')"
          :leftIcon="xRepostAssets.editDraft"
        />`,
  xRepostPreviewDiscard: `<DashboardPrimaryButton
          type="button"
          theme="xRepostPreviewDiscard"
          :text="t('dashboard.xRepost.postPreview.discardEdit')"
          :leftIcon="xRepostAssets.close"
        />`,
  xRepostPreviewSave: `<DashboardPrimaryButton
          type="button"
          theme="xRepostPreviewSave"
          :text="t('dashboard.xRepost.postPreview.saveEdit')"
          :leftIcon="xRepostAssets.savePost"
        />`,
  xRepostSaveDraft: `<DashboardPrimaryButton
          type="button"
          theme="xRepostSaveDraft"
          :text="t('dashboard.xRepost.postPreview.saveDraft')"
          :leftIcon="xRepostAssets.uploadDraft"
        />`,
  xRepostSavePost: `<DashboardPrimaryButton
          type="button"
          theme="xRepostSavePost"
          :text="t('dashboard.xRepost.postPreview.savePost')"
          :leftIcon="xRepostAssets.savePost"
        />`,
  xRepostAddNew: `<TwoPieceButton
          variant="link-x"
          tag="button"
          type="button"
          :text="t('dashboard.xRepost.addNew')"
          content-wrapper-class="flex justify-center items-center gap-2.5 px-3 h-10 min-w-[134px] bg-[#07F468] group-hover:bg-black transition-all duration-300"
          text-class="text-sm font-medium text-black group-hover:text-[#07F468] transition-colors duration-300"
        >
          <template #icon>
            <img
              src="/images/plus-green-square.png"
              alt=""
              width="20"
              height="20"
              class="h-5 w-5 brightness-0 transition-all duration-300 group-hover:[filter:brightness(0)_saturate(100%)_invert(77%)_sepia(61%)_saturate(638%)_hue-rotate(88deg)_brightness(101%)_contrast(92%)]"
            />
          </template>
        </TwoPieceButton>`,
  editProfileUnlockVideos: `<TwoPieceButton
          tag="button"
          variant="link-x"
          rootClass="filter drop-shadow-[4px_3px_0px_#000000] group hover:drop-shadow-[4px_3px_0px_#FF439D] block w-max appearance-button"
          contentWrapperClass="flex justify-center items-center gap-2.5 pl-2 pr-[20.5px] min-h-[2rem] [clip-path:polygon(calc(100%-12.5px)_0%,100%_100%,0%_100%,0%_0%)] bg-[linear-gradient(135deg,#F093FB_0%,#FF439D_100%)] group-hover:[background:black]"
          textClass="text-lg font-medium text-black group-hover:text-[#FF439D]"
          :text="t('editProfile.page.gallery.unlockVideos')"
        />`,
  editProfileUnlockLinks: `<TwoPieceButton
          tag="button"
          variant="link-x"
          rootClass="filter drop-shadow-[4px_3px_0px_#000000] group hover:drop-shadow-[4px_3px_0px_#FF439D] block w-max appearance-button mt-4"
          contentWrapperClass="flex justify-center items-center gap-2.5 pl-2 pr-[20.5px] min-h-[2rem] [clip-path:polygon(calc(100%-12.5px)_0%,100%_100%,0%_100%,0%_0%)] bg-[linear-gradient(135deg,#F093FB_0%,#FF439D_100%)] group-hover:[background:black]"
          textClass="text-lg font-medium text-black group-hover:text-[#FF439D]"
          :text="t('editProfile.page.social.unlockLinks')"
        />`,
  thankYouMediaHome: `<TwoPieceButton
          variant="link-x"
          tag="button"
          :text="t('thankYou.dashboardHome')"
          textClass="text-[18px] font-medium uppercase text-[#000000] group-hover:text-[#07F468] transition-colors duration-300"
          type="button"
        >
          <template #icon>
            <img
              v-if="thankYouHomeIconUrl"
              :src="thankYouHomeIconUrl"
              alt=""
              class="w-[18px] h-[18px] brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(83%)_sepia(37%)_saturate(2897%)_hue-rotate(81deg)_brightness(94%)_contrast(103%)]"
            />
          </template>
        </TwoPieceButton>`,
  thankYouSubHome: `<TwoPieceButton
          variant="link-x"
          tag="button"
          :text="t('thankYouSubscription.dashboardHome')"
          textClass="text-[18px] font-medium uppercase text-[#000000] group-hover:text-[#07F468] transition-colors duration-300"
          rootClass="pb-1 pl-[5px] filter drop-shadow-[-5px_4px_0px_#000] group enabled:hover:drop-shadow-[-5px_4px_0px_#07F468] w-max transition-all duration-300"
          contentWrapperClass="flex justify-center items-center gap-2.5 pl-6 pr-2 h-10 [clip-path:polygon(1rem_0%,100%_0%,100%_100%,0%_100%)] bg-[#07F468] group-hover:bg-black transition-all duration-300"
          type="button"
        >
          <template #icon>
            <img
              v-if="thankYouHomeIconUrl"
              :src="thankYouHomeIconUrl"
              alt=""
              class="h-[18px] w-[18px] brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(83%)_sepia(37%)_saturate(2897%)_hue-rotate(81deg)_brightness(94%)_contrast(103%)]"
            />
          </template>
        </TwoPieceButton>`,
  paymentFailedTryAgain: `<TwoPieceButton
          variant="two-piece"
          tag="button"
          type="button"
          skewPosition="right"
          :text="t('paymentFailed.tryAgain')"
          rootClass="group relative isolate inline-flex w-max cursor-pointer no-underline"
          mainClass="relative z-10 flex h-10 items-center gap-2 bg-black px-4 text-[#07F468] transition-colors duration-300 group-hover:bg-[#07F468] group-hover:text-black"
          skewClass="pointer-events-none absolute left-1 top-1 z-0 h-full w-full bg-[#07F468] transition-colors duration-300 group-hover:bg-black"
          textClass="text-[18px] font-semibold uppercase tracking-wide text-[#07F468] transition-colors duration-300 group-hover:text-black"
        >
          <template #icon>
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M13 8H3M3 8l4-4M3 8l4 4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </template>
        </TwoPieceButton>`,
  profileCallSeeOptions: `<TwoPieceButton
          tag="div"
          variant="two-piece"
          skewPosition="right"
          rootClass="no-underline"
          mainClass="w-40 px-4 py-2 bg-[#FF0066] flex flex-col justify-center items-center"
          text="SEE OPTIONS"
          textClass="self-stretch justify-center text-white text-base font-bold font-['Poppins'] leading-6"
          skewClass="w-3.5 self-stretch shrink-0 -ml-1 bg-[url('/images/pinkUnion.png')] bg-contain bg-center bg-no-repeat"
        />`,
  profileCallViewEvents: `<TwoPieceButton
          tag="div"
          variant="two-piece"
          skewPosition="right"
          rootClass="no-underline"
          mainClass="w-40 px-4 py-2 bg-[#FF0066] flex flex-col justify-center items-center"
          text="VIEW EVENTS"
          textClass="self-stretch justify-center text-white text-base font-bold font-['Poppins'] leading-6"
          skewClass="w-3.5 self-stretch shrink-0 -ml-1 bg-[url('/images/pinkUnion.png')] bg-contain bg-center bg-no-repeat"
        />`,
  tipLimitAction: `<DashboardPrimaryButton
          :text="t('booking.tipSetToMax')"
          theme="tipLimitAction"
          :rightIcon="tipLimitChevronUrl || ''"
          :wrapperOverrides="tipLimitWrapperOverrides"
        />`,
};

const { t } = useI18n();
const { assets: settingsAssets } = useSettingsAssets();
const { assets: planAssets } = usePlanAssets();
const { assets: payoutAssets } = usePayoutAssets();
const { assets: xRepostAssets } = useXRepostAssets();


const { url: twitterIconUrl } = useAssetUrl('icon.social.x');
const { url: telegramIconUrl } = useAssetUrl('icon.social.telegram');
const { url: checkoutArrowUrl } = useAssetUrl('cart.demo.checkoutArrow');
const { url: tickCircleUrl } = useAssetUrl('icon.tick.circle');
const { url: plusIconUrl } = useAssetUrl('mediaUploader.icon.addTier');
const { url: selectAllIconUrl } = useAssetUrl('mediaUploader.icon.filterSelectAll');
const { url: resetIconUrl } = useAssetUrl('mediaUploader.icon.filterReset');
const { url: applyIconUrl } = useAssetUrl('mediaUploader.icon.filterApply');
const { url: nextIconUrl } = useAssetUrl('mediaUploader.icon.next');
const { url: addTierIconUrl } = useAssetUrl('mediaUploader.icon.addTier');
const { url: analyticsRefreshIconUrl } = useAssetUrl('dashboard.analytics.refreshIcon');
const { url: analyticsTrendExpandUrl } = useAssetUrl('dashboard.analytics.trendExpand');
const { url: editIconUrl } = useAssetUrl('icon.profileSettings.editArrow');
const { url: quoteRefreshUrl } = useAssetUrl('dashboard.quote.refresh');
const { url: faqChevronIconUrl } = useAssetUrl('home.faq.chevron');
const { url: thankYouHomeIconUrl } = useAssetUrl('thankyou.dashboardHome');
const { url: tipLimitChevronUrl } = useAssetUrl('icon.notification.chevronLeft');

const guestProceedArrowUrl = 'https://i.ibb.co.com/NdmC2BjP/arrow-right.webp';
const guestProceedArrowClass =
  'w-6 h-6 brightness-0 opacity-100 contrast-[200%] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(66%)_sepia(68%)_saturate(2102%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] transition-all duration-200';

const calendarPlusIconUrl = 'https://i.ibb.co.com/RpWmJkcb/plus.webp';
const bookingNextIconUrl = 'https://i.ibb.co/hx8ztZFf/svgviewer-png-output-8.webp';
const bookingPublishIconUrl = 'https://i.ibb.co/S74jfvBw/Icon-1.png';

const mediaPolygonNextIconClass =
  'w-6 h-6 transition duration-200 filter brightness-0 invert-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]';
const mediaSubmitIconClass =
  'w-5 h-5 transition duration-200 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]';
const bookingPublishIconClass =
  'w-6 h-6 transition duration-200 filter brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]';
const wrapperOverridesNoClass = [
  { target: 'wrapper1', removeClass: true },
  { target: 'wrapper2', removeClass: true },
];

const tipLimitWrapperOverrides = [
  { target: 'wrapper1', addClass: '!contents' },
  { target: 'wrapper2', addClass: '!contents' },
];
</script>
