<template>
  <BasePopup :model-value="modelValue" :popup-config="popupConfig" @update:model-value="handlePopupToggle">
    <div
      v-if="step"
      data-component="payout-cosmo-flow-popup"
      :data-state="step.view"
      class="relative flex h-full max-h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-primary-bg/90 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] md:w-[37.5rem] dark:bg-cosmo-shell/90"
    >
      <div class="pointer-events-none absolute inset-0 z-[-1] h-full w-full backdrop-blur-[50px]"></div>
      <div class="relative z-[1] flex h-full min-h-0 flex-1 flex-col overflow-hidden [background:linear-gradient(0deg,rgba(255,255,255,0.9),rgba(255,255,255,0.9)),linear-gradient(180deg,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_100%)] dark:[background:linear-gradient(0deg,rgba(27,29,30,0.94),rgba(27,29,30,0.94))]">
        <div
          class="pointer-events-none absolute inset-0 z-[-1] bg-cover bg-center bg-no-repeat opacity-[12.5%]"
          :style="{ backgroundImage: popupGradientStyle }"
        ></div>
        <div class="z-[3] h-2 w-full shrink-0 overflow-hidden bg-background-header-light dark:bg-background-header-dark">
          <div class="h-full bg-dark-text transition-all duration-300 dark:bg-platinum" :style="{ width: progressWidth }"></div>
        </div>
        <div class="flex shrink-0 items-center justify-between gap-2.5 px-4 py-3">
          <div class="min-w-0">
            <div class="text-xs font-medium uppercase tracking-wide text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.eyebrow') }}</div>
            <h2 class="text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ stepTitle }}</h2>
          </div>
          <button type="button" data-action="close-popup" :aria-label="t('payoutCosmo.popup.close')" class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-text-secondary dark:focus-visible:outline-cosmo-darkInk" @click="closePopup">
            <img :src="assets.closeAlt" :alt="t('payoutCosmo.alt.close')" class="h-full w-full [filter:brightness(0)_saturate(100%)_invert(73%)_sepia(11%)_saturate(425%)_hue-rotate(179deg)_brightness(87%)_contrast(89%)]">
          </button>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div class="relative mb-4 flex items-center gap-2">
              <button
              v-if="!isFirst"
              type="button"
              data-action="go-back"
              @click="goBack"
              :aria-label="t('payoutCosmo.popup.back')"
              class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-text-secondary dark:focus-visible:outline-cosmo-darkInk"
              >
                <img
                :src="assets.chevronLeft"
                :alt="t('payoutCosmo.alt.back')"
                class="h-full w-full [filter:brightness(0)_saturate(100%)_invert(46%)_sepia(8%)_saturate(955%)_hue-rotate(183deg)_brightness(91%)_contrast(88%)]"
                >
              </button>
            <div class="text-xs font-medium uppercase tracking-wide text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.step', { current: stepIndex + 1, total: steps.length }) }}</div>
          </div>

          <div v-if="step.requiresApi && !apiReady" data-element="loading" class="py-7 text-center">
            <div class="mx-auto mb-3 size-[34px] animate-[spin_0.7s_linear_infinite] rounded-full border-[3px] border-checkboxBorder border-t-dark-text dark:border-dark-border-primary dark:border-t-platinum"></div>
            <strong class="text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.loading') }}</strong>
            <div class="mt-1.5 text-xs text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.loadingNote') }}</div>
          </div>

        <template v-else>
          <div v-if="step.view === 'onboarding-welcome'">
            <div class="mb-2 text-lg font-medium text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.setupTitle') }}</div>
            <div class="mb-4 text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.setupBody') }}</div>
            <div :class="summaryPanelClass">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.youllNeed') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.youllNeedBody') }}</p>
            </div>
          </div>

          <div v-else-if="step.view === 'onboarding-details'">
            <div class="mb-2 text-lg font-medium text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.legalTitle') }}</div>
            <div class="mb-4 text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.legalBody') }}</div>
            <div class="grid grid-cols-1 gap-3 min-[681px]:grid-cols-2">
              <label class="grid gap-[7px]"><span class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.firstName') }}</span><input v-model="session.cardholder.firstName" :class="fieldControlClass"></label>
              <label class="grid gap-[7px]"><span class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.lastName') }}</span><input v-model="session.cardholder.lastName" :class="fieldControlClass"></label>
              <label class="grid gap-[7px]"><span class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.dateOfBirth') }}</span><input v-model="session.cardholder.dateOfBirth" :class="fieldControlClass"></label>
              <label class="grid gap-[7px]"><span class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.phone') }}</span><input v-model="session.cardholder.phone" :class="fieldControlClass"></label>
              <label class="grid gap-[7px] min-[681px]:col-span-2"><span class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.email') }}</span><input v-model="session.cardholder.email" :class="fieldControlClass"></label>
              <label class="grid gap-[7px] min-[681px]:col-span-2"><span class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.address') }}</span><input v-model="session.cardholder.address" :class="fieldControlClass"></label>
            </div>
          </div>

          <div v-else-if="step.view === 'onboarding-created'">
            <div class="rounded-sm border border-success bg-white/80 p-4 dark:border-cosmo-statusOkDark dark:bg-dark-bg-button/80">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.accountCreated') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.accountCreatedBefore') }}<strong>{{ session.creator_payout_accounts.san }}</strong>{{ t('payoutCosmo.popup.accountCreatedAfter') }}</p>
            </div>
            <div class="mt-3 rounded-sm bg-border-tab p-3 text-xs leading-normal text-light-text-quaternary dark:bg-cosmo-panel dark:text-dark-text-quaternary"><strong>{{ t('payoutCosmo.popup.failureBranch') }}</strong> {{ t('payoutCosmo.popup.failureBranchBody') }}</div>
          </div>

          <div v-else-if="step.view === 'onboarding-documents'">
            <div class="mb-2 text-lg font-medium text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.verifyTitle') }}</div>
            <div class="mb-4 text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.verifyBody') }}</div>
            <div class="grid grid-cols-1 gap-3 min-[681px]:grid-cols-2">
              <label class="grid gap-[7px]">
                <span class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.idType') }}</span>
                <select v-model="session.documents.idType" :class="fieldControlClass">
                  <option v-for="idType in session.documents.idTypes" :key="idType" class="text-cosmo-selectInk" :value="idType">{{ idTypeLabel(idType) }}</option>
                </select>
              </label>
              <label class="grid gap-[7px]"><span class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.idNumber') }}</span><input v-model="session.documents.idNumber" :class="fieldControlClass"></label>
              <div class="grid gap-[7px] min-[681px]:col-span-2">
                <label class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ documentLabel(session.documents.proofOfIdentity) }}</label>
                <ThumbnailUploader
                  :use-media-store="false"
                  :show-selected-name="false"
                  icon-variant="badge"
                  :title="t('payoutCosmo.popup.clickToUpload')"
                  :subtitle="t('payoutCosmo.popup.orDrag')"
                  :file-info="t('payoutCosmo.popup.fileInfo')"
                  accept="image/png, image/jpeg, application/pdf"
                  wrapper-class="cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-2 h-[7.875rem] w-full flex flex-col items-center justify-center hover:border-dark-text hover:bg-black/10 group relative dark:bg-white/5"
                  inner-wrapper-class="gap-1 w-full flex flex-col justify-center self-stretch border-2 border-dashed border-transparent"
                  full-area-click
                  @file-selected="onDocumentSelected(session.documents.proofOfIdentity, $event)"
                >
                  <template #icon>
                    <PayoutCdnIcon :src="assets.uploadCloud" class="h-5 w-5 text-black group-hover:text-success" />
                  </template>
                </ThumbnailUploader>
                <p v-if="session.documents.proofOfIdentity.fileName" class="text-center text-xs font-semibold text-success">{{ session.documents.proofOfIdentity.fileName }}</p>
              </div>
              <div class="grid gap-[7px] min-[681px]:col-span-2">
                <label class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ documentLabel(session.documents.proofOfAddress) }}</label>
                <ThumbnailUploader
                  :use-media-store="false"
                  :show-selected-name="false"
                  icon-variant="badge"
                  :title="t('payoutCosmo.popup.clickToUpload')"
                  :subtitle="t('payoutCosmo.popup.orDrag')"
                  :file-info="t('payoutCosmo.popup.fileInfo')"
                  accept="image/png, image/jpeg, application/pdf"
                  wrapper-class="cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-2 h-[7.875rem] w-full flex flex-col items-center justify-center hover:border-dark-text hover:bg-black/10 group relative dark:bg-white/5"
                  inner-wrapper-class="gap-1 w-full flex flex-col justify-center self-stretch border-2 border-dashed border-transparent"
                  full-area-click
                  @file-selected="onDocumentSelected(session.documents.proofOfAddress, $event)"
                >
                  <template #icon>
                    <PayoutCdnIcon :src="assets.uploadCloud" class="h-5 w-5 text-black group-hover:text-success" />
                  </template>
                </ThumbnailUploader>
                <p v-if="session.documents.proofOfAddress.fileName" class="text-center text-xs font-semibold text-success">{{ session.documents.proofOfAddress.fileName }}</p>
              </div>
            </div>
          </div>

          <div v-else-if="step.view === 'onboarding-submitted'">
            <div :class="summaryPanelClass">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.documentsSubmitted') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.documentsSubmittedBody') }}</p>
            </div>
          </div>

          <div v-else-if="step.view === 'onboarding-status'">
            <div class="rounded-sm border border-cosmo-statusPending bg-white/80 p-4 dark:border-cosmo-statusPendingDark dark:bg-dark-bg-button/80">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.verificationPending') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.verificationPendingBody') }}</p>
            </div>
            <div class="mt-3 rounded-sm bg-border-tab p-3 text-xs leading-normal text-light-text-quaternary dark:bg-cosmo-panel dark:text-dark-text-quaternary">
              <strong>{{ t('payoutCosmo.popup.rejected') }}</strong> {{ t('payoutCosmo.popup.rejectedBody') }}<br>
              <strong>{{ t('payoutCosmo.popup.approvedLabel') }}</strong> {{ t('payoutCosmo.popup.approvedBody') }}
            </div>
          </div>

          <div v-else-if="step.view === 'onboarding-approved'">
            <div class="rounded-sm border border-success bg-white/80 p-4 dark:border-cosmo-statusOkDark dark:bg-dark-bg-button/80">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.accountActive') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.accountActiveBody') }}</p>
            </div>
            <div :class="summaryPanelInkClass">
              <div class="flex justify-between gap-3.5 border-b border-border-notification-light dark:border-dark-gray-2 py-[9px]"><span>{{ t('payoutCosmo.popup.kyc') }}</span><strong class="text-right">{{ payloadLabel(session.creator_payout_accounts.kyc_status) }}</strong></div>
              <div class="flex justify-between gap-3.5 border-b border-border-notification-light dark:border-dark-gray-2 py-[9px]"><span>{{ t('payoutCosmo.popup.card') }}</span><strong class="text-right">{{ session.creator_payout_accounts.masked_pan }}</strong></div>
              <div class="flex justify-between gap-3.5 py-[9px]"><span>{{ t('payoutCosmo.popup.automaticPayout') }}</span><strong class="text-right">{{ payloadLabel(session.payout_schedule) }}</strong></div>
            </div>
          </div>

          <div v-else-if="step.view === 'weekly-calculate'">
            <div class="mb-2 text-lg font-medium text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.weeklyTitle') }}</div>
            <div class="mb-4 text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.weeklyBody') }}</div>
            <div :class="summaryPanelInkClass">
              <div class="flex justify-between gap-3.5 border-b border-border-notification-light dark:border-dark-gray-2 py-[9px]"><span>{{ t('payoutCosmo.popup.availableEarnings') }}</span><strong class="text-right">{{ formatMoney(session.ledger.availableEarnings) }}</strong></div>
              <div class="flex justify-between gap-3.5 border-b border-border-notification-light dark:border-dark-gray-2 py-[9px]"><span>{{ t('payoutCosmo.popup.pendingEarnings') }}</span><strong class="text-right">{{ formatMoney(session.ledger.pendingEarnings) }}</strong></div>
              <div class="flex justify-between gap-3.5 py-[9px]"><span>{{ t('payoutCosmo.popup.destination') }}</span><strong class="text-right">{{ t('payoutCosmo.popup.cosmoSan', { san: session.creator_payout_accounts.san }) }}</strong></div>
            </div>
          </div>

          <div v-else-if="step.view === 'weekly-record'">
            <div :class="summaryPanelClass">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.recordFirst') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.recordFirstBody') }}</p>
            </div>
          </div>
          
          <div v-else-if="step.view === 'weekly-loaded'">
            <div class="rounded-sm border border-success bg-white/80 p-4 dark:border-cosmo-statusOkDark dark:bg-dark-bg-button/80">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.walletLoadAccepted') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.walletLoadAcceptedBody') }}</p>
            </div>
            <div class="mt-3 rounded-sm bg-border-tab p-3 text-xs leading-normal text-light-text-quaternary dark:bg-cosmo-panel dark:text-dark-text-quaternary"><strong>{{ t('payoutCosmo.popup.failure') }}</strong> {{ t('payoutCosmo.popup.walletLoadFailureBody') }}</div>
          </div>

          <div v-else-if="step.view === 'weekly-complete'">
            <div :class="summaryPanelInkClass">
              <div class="flex justify-between gap-3.5 border-b border-border-notification-light dark:border-dark-gray-2 py-[9px]"><span>{{ t('payoutCosmo.popup.status') }}</span><strong class="text-right">{{ payloadLabel(session.creator_payouts.status) }}</strong></div>
              <div class="flex justify-between gap-3.5 border-b border-border-notification-light dark:border-dark-gray-2 py-[9px]"><span>{{ t('payoutCosmo.popup.amount') }}</span><strong class="text-right">{{ formatMoney(session.creator_payouts.amount) }}</strong></div>
              <div class="flex justify-between gap-3.5 py-[9px]"><span>{{ t('payoutCosmo.popup.providerTransaction') }}</span><strong class="text-right">{{ session.creator_payouts.provider_transaction_id }}</strong></div>
            </div>
          </div>

          <div v-else-if="step.view === 'weekly-refresh'">
            <div class="rounded-sm border border-success bg-white/80 p-4 dark:border-cosmo-statusOkDark dark:bg-dark-bg-button/80">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.walletRefreshed') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.walletRefreshedBody') }}</p>
            </div>
            <div :class="summaryPanelInkClass">
              <div class="flex justify-between gap-3.5 border-b border-border-notification-light dark:border-dark-gray-2 py-[9px]"><span>{{ t('payoutCosmo.popup.platformEarnings') }}</span><strong class="text-right">{{ formatMoney(session.platformEarningsAfterPayout) }}</strong></div>
              <div class="flex justify-between gap-3.5 py-[9px]"><span>{{ t('payoutCosmo.popup.walletBalance') }}</span><strong class="text-right">{{ formatMoney(session.walletBalanceAfterLoad) }}</strong></div>
            </div>
          </div>

          <div v-else-if="step.view === 'saved-loaded'">
            <div :class="summaryPanelClass">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.savedBanksLoaded') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.savedBanksLoadedBody') }}</p>
            </div>
          </div>

          <div v-else-if="step.view === 'saved-choose'">
            <button
              v-for="method in session.creator_withdrawal_methods"
              :key="method.id"
              type="button"
              data-action="select-saved-bank"
              :data-element="method.id"
              :data-state="method.id === session.selectedMethodId ? 'selected' : 'idle'"
              class="mb-2.5 block w-full cursor-pointer rounded-sm border bg-white/80 p-4 text-left text-dark-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-text dark:bg-dark-bg-button/80 dark:text-timberwolf dark:focus-visible:outline-white"
              :class="method.id === session.selectedMethodId ? 'border-dark-text dark:border-white' : 'border-border-notification-light dark:border-dark-border-primary'"
              @click="session.selectedMethodId = method.id"
            ><strong class="text-sm font-semibold">{{ methodName(method) }}</strong><small class="mt-1 block text-xs text-light-text-quaternary dark:text-dark-text-quaternary">{{ method.masked_account }} · {{ method.currency }}<template v-if="method.is_default">{{ t('payoutCosmo.popup.defaultSuffix') }}</template></small></button>
          </div>

          <div v-else-if="step.view === 'saved-amount' || step.view === 'new-amount'">
            <div class="grid grid-cols-1 gap-3 min-[681px]:grid-cols-2">
              <label class="grid gap-[7px] min-[681px]:col-span-2"><span class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.walletBalance') }}</span><input :class="fieldControlClass" :value="formatMoney(session.walletBalance)" disabled></label>
              <label class="grid gap-[7px] min-[681px]:col-span-2"><span class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.amountToBank') }}</span><input v-model="session.withdrawalAmount" :class="fieldControlClass"></label>
            </div>
          </div>

          <div v-else-if="step.view === 'saved-prepare'">
            <div :class="summaryPanelClass">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.balancePrepared') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.balancePreparedSavedBody') }}</p>
            </div>
          </div>

          <div v-else-if="step.view === 'new-prepare'">
            <div :class="summaryPanelClass">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.balancePrepared') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.balancePreparedNewBody') }}</p>
            </div>
          </div>

          <div v-else-if="step.view === 'saved-preview'">
            <div :class="summaryPanelInkClass">
              <div class="flex justify-between gap-3.5 border-b border-border-notification-light dark:border-dark-gray-2 py-[9px]"><span>{{ t('payoutCosmo.popup.bank') }}</span><strong class="text-right">{{ methodPreview(selectedMethod) }}</strong></div>
              <div class="flex justify-between gap-3.5 border-b border-border-notification-light dark:border-dark-gray-2 py-[9px]"><span>{{ t('payoutCosmo.popup.requested') }}</span><strong class="text-right">{{ formatMoney(session.withdrawalAmount) }}</strong></div>
              <div class="flex justify-between gap-3.5 py-[9px]"><span>{{ t('payoutCosmo.popup.providerFee') }}</span><strong class="text-right">{{ payloadLabel(session.preview.savedFeeLabel) }}</strong></div>
            </div>
            <div class="mt-3 rounded-sm bg-border-tab p-3 text-xs leading-normal text-light-text-quaternary dark:bg-cosmo-panel dark:text-dark-text-quaternary"><strong>{{ t('payoutCosmo.popup.failure') }}</strong> {{ t('payoutCosmo.popup.previewFailureBody') }}</div>
          </div>

          <div v-else-if="step.view === 'saved-confirm'">
            <div class="mb-2 text-lg font-medium text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.confirmWithdrawal') }}</div>
            <div :class="summaryPanelInkClass">
              <div class="flex justify-between gap-3.5 border-b border-border-notification-light dark:border-dark-gray-2 py-[9px]"><span>{{ t('payoutCosmo.popup.to') }}</span><strong class="text-right">{{ methodPreview(selectedMethod) }}</strong></div>
              <div class="flex justify-between gap-3.5 py-[9px]"><span>{{ t('payoutCosmo.popup.amount') }}</span><strong class="text-right">{{ formatMoney(session.withdrawalAmount) }}</strong></div>
            </div>
          </div>

          <div v-else-if="step.view === 'saved-submit' || step.view === 'new-submit'">
            <div class="rounded-sm border border-success bg-white/80 p-4 dark:border-cosmo-statusOkDark dark:bg-dark-bg-button/80">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.payoutSubmitted') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.payoutSubmittedBody') }}</p>
            </div>
          </div>

          <div v-else-if="step.view === 'saved-status'">
            <div class="rounded-sm border border-success bg-white/80 p-4 dark:border-cosmo-statusOkDark dark:bg-dark-bg-button/80">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.completed') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.savedCompletedBody') }}</p>
            </div>
            <div class="mt-3 rounded-sm bg-border-tab p-3 text-xs leading-normal text-light-text-quaternary dark:bg-cosmo-panel dark:text-dark-text-quaternary"><strong>{{ t('payoutCosmo.popup.failed') }}</strong> {{ t('payoutCosmo.popup.failedBody') }}</div>
          </div>

          <div v-else-if="step.view === 'new-start'">
            <div class="mb-2 text-lg font-medium text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.newBankTitle') }}</div>
            <div class="mb-4 text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.newBankBody') }}</div>
          </div>

          <div v-else-if="step.view === 'new-countries'">
            <div :class="summaryPanelClass">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.countriesLoaded') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.countriesLoadedBody') }}</p>
            </div>
            <div class="mt-3 rounded-sm bg-border-tab p-3 text-xs leading-normal text-light-text-quaternary dark:bg-cosmo-panel dark:text-dark-text-quaternary"><strong>{{ t('payoutCosmo.popup.unsupported') }}</strong> {{ t('payoutCosmo.popup.unsupportedBody') }}</div>
          </div>

          <div v-else-if="step.view === 'new-country'">
            <div class="grid grid-cols-1 gap-3 min-[681px]:grid-cols-2">
              <label class="grid gap-[7px] min-[681px]:col-span-2">
                <span class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.bankCountry') }}</span>
                <select v-model="session.selectedCountry" :class="fieldControlClass">
                  <option v-for="country in session.countries" :key="country.code" class="text-cosmo-selectInk" :value="country.code">{{ countryLabel(country) }}</option>
                </select>
              </label>
            </div>
          </div>

          <div v-else-if="step.view === 'new-fields'">
            <div :class="summaryPanelClass">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.fieldsLoaded') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.fieldsLoadedBody') }}</p>
            </div>
          </div>

          <div v-else-if="step.view === 'new-details'">
            <div class="grid grid-cols-1 gap-3 min-[681px]:grid-cols-2">
              <label v-for="field in bankFields" :key="field.key" class="grid gap-[7px]" :class="field.full ? 'min-[681px]:col-span-2' : ''">
                <span class="text-sm font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ fieldLabel(field) }}</span>
                <input v-model="field.value" :class="fieldControlClass">
              </label>
            </div>
          </div>

          <div v-else-if="step.view === 'new-beneficiary'">
            <div class="rounded-sm border border-success bg-white/80 p-4 dark:border-cosmo-statusOkDark dark:bg-dark-bg-button/80">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.bankSaved') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.bankSavedBody') }}</p>
            </div>
            <div class="mt-3 rounded-sm bg-border-tab p-3 text-xs leading-normal text-light-text-quaternary dark:bg-cosmo-panel dark:text-dark-text-quaternary"><strong>{{ t('payoutCosmo.popup.validationFailure') }}</strong> {{ t('payoutCosmo.popup.validationFailureBody') }}</div>
          </div>

          <div v-else-if="step.view === 'new-preview'">
            <div :class="summaryPanelInkClass">
              <div class="flex justify-between gap-3.5 border-b border-border-notification-light dark:border-dark-gray-2 py-[9px]"><span>{{ t('payoutCosmo.popup.bank') }}</span><strong class="text-right">{{ payloadLabel(session.newBeneficiary.preview_label) }}</strong></div>
              <div class="flex justify-between gap-3.5 border-b border-border-notification-light dark:border-dark-gray-2 py-[9px]"><span>{{ t('payoutCosmo.popup.amount') }}</span><strong class="text-right">{{ formatMoney(session.withdrawalAmount) }}</strong></div>
              <div class="flex justify-between gap-3.5 py-[9px]"><span>{{ t('payoutCosmo.popup.feesFx') }}</span><strong class="text-right">{{ payloadLabel(session.preview.newFeeLabel) }}</strong></div>
            </div>
          </div>

          <div v-else-if="step.view === 'new-confirm'">
            <div class="mb-2 text-lg font-medium text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.confirmNew') }}</div>
            <div :class="summaryPanelInkClass">
              <div class="flex justify-between gap-3.5 border-b border-border-notification-light dark:border-dark-gray-2 py-[9px]"><span>{{ t('payoutCosmo.popup.beneficiary') }}</span><strong class="text-right">{{ payloadLabel(session.newBeneficiary.confirm_label) }}</strong></div>
              <div class="flex justify-between gap-3.5 py-[9px]"><span>{{ t('payoutCosmo.popup.amount') }}</span><strong class="text-right">{{ formatMoney(session.withdrawalAmount) }}</strong></div>
            </div>
          </div>

          <div v-else-if="step.view === 'new-status'">
            <div class="rounded-sm border border-success bg-white/80 p-4 dark:border-cosmo-statusOkDark dark:bg-dark-bg-button/80">
              <h3 class="mb-1.5 text-sm font-semibold text-light-text-secondary dark:text-cosmo-darkInk">{{ t('payoutCosmo.popup.completed') }}</h3>
              <p class="text-sm leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.popup.newCompletedBody') }}</p>
            </div>
          </div>

        </template>
        </div>
        <div v-if="showNav" class="z-[3] flex shrink-0 items-center justify-end gap-2.5 ">
          <button
            type="button"
            class="inline-flex h-11 cursor-pointer items-center gap-2 border-0 pl-8 pr-4 text-lg font-semibold [clip-path:polygon(100%_0%,100%_100%,0%_100%,1.125rem_0%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-text dark:focus-visible:outline-platinum"
            :class="isLast ? 'bg-success text-black hover:bg-black hover:text-success dark:bg-cosmo-statusOkDark dark:text-platinum dark:hover:bg-dark-bg-button dark:hover:text-cosmo-statusOkGlow' : 'bg-black text-success hover:bg-success hover:text-black dark:bg-dark-bg-button dark:text-cosmo-statusOkGlow dark:hover:bg-cosmo-statusOkDark'"
            :data-action="isLast ? 'close-popup' : 'next-step'"
            @click="goNext"
          >
            {{ isLast ? t('payoutCosmo.popup.done') : t('payoutCosmo.popup.next') }}
            <PayoutCdnIcon :src="isLast ? assets.tickMark : assets.arrowRight" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import { createStepStateEngine } from '@/utils/stateEngine.js';
import PayoutCdnIcon from '@/dev/components/payout/cosmo/PayoutCdnIcon.vue';
import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';
import { payoutCosmoFlows } from '@/services/payout/payoutCosmoFlows.js';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';
import { createCosmoSession, formatMoney, MOCK_API_MS } from '@/services/payout/payoutCosmoPayloads.js';

const fieldControlClass = 'h-14 w-full border-b-[1.5px] border-checkboxBorder bg-white/75 px-4 text-base text-light-text-secondary outline outline-2 outline-offset-2 outline-transparent focus-visible:outline-light-text-secondary dark:border-dark-border-primary dark:bg-dark-bg-button/75 dark:text-cosmo-darkInk dark:focus-visible:outline-cosmo-darkInk';
const summaryPanelClass = 'rounded-sm border border-border-notification-light bg-white/80 p-4 dark:border-dark-border-primary dark:bg-dark-bg-button/80';
const summaryPanelInkClass = 'rounded-sm border border-border-notification-light bg-white/80 p-4 text-dark-text dark:border-dark-gray-2 dark:bg-dark-bg-button/80 dark:text-timberwolf';

const { assets } = usePayoutAssets();
const { t } = useI18n();
const popupGradientStyle = computed(() =>
  assets.value.popupGradient ? `url('${assets.value.popupGradient}')` : 'none',
);

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  flow: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const popupConfig = {
  actionType: 'slideIn',
  from: 'right',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldLockBodyScroll: true,
  scrollable: false,
  containerClass: '[&>div]:h-full [&>div]:min-h-0',
  width: { default: '100%', '>768': '37.5rem' },
  height: { default: '100%' },
};

const engine = ref(null);
const apiReady = ref(true);
const session = reactive(createCosmoSession());
let apiTimer = null;

const selectedMethod = computed(() => (
  session.creator_withdrawal_methods.find((method) => method.id === session.selectedMethodId)
  || session.creator_withdrawal_methods[0]
));
const bankFields = computed(() => session.acceptableFieldsByCountry[session.selectedCountry] || []);

const steps = computed(() => payoutCosmoFlows[props.flow] || []);
const stepIndex = computed(() => Math.max(0, (engine.value?.step || 1) - 1));
const step = computed(() => steps.value[stepIndex.value] || null);
const stepTitle = computed(() => {
  const current = step.value;
  if (!current) return '';
  const titles = {
    'onboarding-welcome': 'payoutCosmo.flow.onboardingWelcome',
    'onboarding-details': 'payoutCosmo.flow.onboardingDetails',
    'onboarding-created': 'payoutCosmo.flow.onboardingCreated',
    'onboarding-documents': 'payoutCosmo.flow.onboardingDocuments',
    'onboarding-submitted': 'payoutCosmo.flow.onboardingSubmitted',
    'onboarding-status': 'payoutCosmo.flow.onboardingStatus',
    'onboarding-approved': 'payoutCosmo.flow.onboardingApproved',
    'weekly-calculate': 'payoutCosmo.flow.weeklyCalculate',
    'weekly-record': 'payoutCosmo.flow.weeklyRecord',
    'weekly-loaded': 'payoutCosmo.flow.weeklyLoaded',
    'weekly-complete': 'payoutCosmo.flow.weeklyComplete',
    'weekly-refresh': 'payoutCosmo.flow.weeklyRefresh',
    'saved-loaded': 'payoutCosmo.flow.savedLoaded',
    'saved-choose': 'payoutCosmo.flow.savedChoose',
    'saved-amount': 'payoutCosmo.flow.savedAmount',
    'saved-prepare': 'payoutCosmo.flow.savedPrepare',
    'saved-preview': 'payoutCosmo.flow.savedPreview',
    'saved-confirm': 'payoutCosmo.flow.savedConfirm',
    'saved-submit': 'payoutCosmo.flow.savedSubmit',
    'saved-status': 'payoutCosmo.flow.savedStatus',
    'new-start': 'payoutCosmo.flow.newStart',
    'new-countries': 'payoutCosmo.flow.newCountries',
    'new-country': 'payoutCosmo.flow.newCountry',
    'new-fields': 'payoutCosmo.flow.newFields',
    'new-details': 'payoutCosmo.flow.newDetails',
    'new-beneficiary': 'payoutCosmo.flow.newBeneficiary',
    'new-amount': 'payoutCosmo.flow.newAmount',
    'new-prepare': 'payoutCosmo.flow.newPrepare',
    'new-preview': 'payoutCosmo.flow.newPreview',
    'new-confirm': 'payoutCosmo.flow.newConfirm',
    'new-submit': 'payoutCosmo.flow.newSubmit',
    'new-status': 'payoutCosmo.flow.newStatus',
  };
  const key = titles[current.view];
  return key ? t(key) : current.name;
});

function idTypeLabel(idType) {
  if (idType === 'Passport') return t('payoutCosmo.payload.passport');
  if (idType === 'Driver licence') return t('payoutCosmo.payload.driverLicence');
  return idType;
}

function documentLabel(document) {
  if (document?.documentType === 0) return t('payoutCosmo.payload.proofOfIdentity');
  if (document?.documentType === 1) return t('payoutCosmo.payload.proofOfAddress');
  return document?.label || '';
}

function countryLabel(country) {
  if (country?.code === 'AU') return t('payoutCosmo.payload.countryAu');
  if (country?.code === 'GB') return t('payoutCosmo.payload.countryGb');
  if (country?.code === 'US') return t('payoutCosmo.payload.countryUs');
  return country?.label || '';
}

function fieldLabel(field) {
  if (field?.key === 'accountHolder') return t('payoutCosmo.payload.accountHolder');
  if (field?.key === 'bsb') return t('payoutCosmo.payload.bsb');
  if (field?.key === 'accountNumber') return t('payoutCosmo.payload.accountNumber');
  return field?.label || '';
}

function methodName(method) {
  if (method?.id === 'method-cba') return t('payoutCosmo.payload.commonwealthBank');
  if (method?.id === 'method-anz') return t('payoutCosmo.payload.anz');
  return method?.display_name || '';
}

function methodPreview(method) {
  if (method?.id === 'method-cba') return t('payoutCosmo.payload.previewCommonwealth');
  if (method?.id === 'method-anz') return t('payoutCosmo.payload.previewAnz');
  return method?.preview_label || '';
}

function payloadLabel(value) {
  if (value === 'Approved') return t('payoutCosmo.payload.approved');
  if (value === 'Completed') return t('payoutCosmo.payload.completed');
  if (value === 'Friday') return t('payoutCosmo.payload.friday');
  if (value === 'Preview response') return t('payoutCosmo.payload.previewResponse');
  if (value === 'Provider preview') return t('payoutCosmo.payload.providerPreview');
  if (value === 'Saved') return t('payoutCosmo.payload.saved');
  if (value === 'New AU bank •••• 5678') return t('payoutCosmo.payload.previewNewAu');
  return value;
}
const progressWidth = computed(() => {
  if (!steps.value.length) return '0%';
  return `${((stepIndex.value + 1) / steps.value.length) * 100}%`;
});
const isFirst = computed(() => (engine.value?.step || 1) <= 1);
const isLast = computed(() => (engine.value?.step || 1) >= steps.value.length);
const showNav = computed(() => !step.value?.requiresApi || apiReady.value);

function clearApiTimer() {
  if (apiTimer != null) {
    clearTimeout(apiTimer);
    apiTimer = null;
  }
}

function presentStep() {
  clearApiTimer();
  const current = steps.value[(engine.value?.step || 1) - 1];
  if (!current?.requiresApi) {
    apiReady.value = true;
    return;
  }
  apiReady.value = false;
  apiTimer = setTimeout(() => {
    apiReady.value = true;
    apiTimer = null;
  }, MOCK_API_MS);
}

function openEngine() {
  if (!props.flow || !payoutCosmoFlows[props.flow]) return;
  engine.value = createStepStateEngine({
    flowId: `payoutCosmo-${props.flow}`,
    initialStep: 1,
    urlSync: 'none',
    persist: false,
  });
  engine.value.initialize({ fromUrl: false });
  presentStep();
}

watch(
  () => [props.modelValue, props.flow],
  ([open]) => {
    if (!open) {
      clearApiTimer();
      return;
    }
    openEngine();
  },
  { immediate: true },
);

watch(
  () => engine.value?.step,
  () => {
    if (!props.modelValue) return;
    presentStep();
  },
);

function onDocumentSelected(target, payload) {
  if (payload?.objectUrl) URL.revokeObjectURL(payload.objectUrl);
  target.fileName = payload?.file?.name || '';
}

function closePopup() {
  emit('update:modelValue', false);
}

function handlePopupToggle(open) {
  emit('update:modelValue', open);
}

async function goBack() {
  if (!engine.value || isFirst.value) return;
  await engine.value.goToStep(engine.value.step - 1);
}

async function goNext() {
  if (!engine.value) return;
  if (isLast.value) {
    closePopup();
    return;
  }
  await engine.value.goToStep(engine.value.step + 1);
}

onBeforeUnmount(clearApiTimer);
</script>
