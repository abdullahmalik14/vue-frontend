<template>
  <DashboardSharedTwoColLayout lock-viewport>
  <div data-component="payout-cosmo-page" class="h-full min-h-0 overflow-y-auto p-5">
    <header class="mb-5 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between md:gap-[18px]">
      <div class="flex items-center gap-3.5">
        <img :src="assets.personMark" alt="" aria-hidden="true" class="h-12 w-12 shrink-0 rounded-[13px] object-cover">
        <div>
          <h1 class="m-0 text-3xl font-medium leading-none tracking-[-0.045em] text-dark-gray dark:text-white md:text-4xl">{{ t('payoutCosmo.page.title') }}</h1>
          <div class="mt-[5px] text-[13px] text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.page.subtitle') }}</div>
        </div>
      </div>
      <div class="flex items-center gap-2.5">
        <select data-element="currency" :aria-label="t('payoutCosmo.page.ariaCurrency')" class="h-11 cursor-pointer rounded-xl border border-checkboxBorder bg-white px-3 font-bold text-dark-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-text dark:border-dark-border-primary dark:bg-dark-bg-button dark:text-white dark:focus-visible:outline-white">
          <option>{{ t('payoutCosmo.page.currencyUsd') }}</option>
        </select>
        <button type="button" data-element="notifications" :aria-label="t('payoutCosmo.page.ariaNotifications')" class="grid h-11 w-11 cursor-pointer place-items-center rounded-xl border border-checkboxBorder bg-white text-dark-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-text dark:border-dark-border-primary dark:bg-dark-bg-button dark:text-white dark:focus-visible:outline-white"><PayoutCdnIcon :src="assets.bell" class="h-[18px] w-[18px]" /></button>
        <button type="button" data-element="profile" :aria-label="t('payoutCosmo.page.ariaProfile')" class="grid h-11 w-11 cursor-pointer place-items-center rounded-xl border border-checkboxBorder bg-white text-dark-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-text dark:border-dark-border-primary dark:bg-dark-bg-button dark:text-white dark:focus-visible:outline-white"><img :src="assets.avatar" :alt="t('payoutCosmo.alt.avatar')" class="h-[18px] w-[18px] object-contain"></button>
      </div>
    </header>

    <section class="relative mb-[18px] overflow-hidden rounded-[30px] 
    flex justify-between lg:items-center gap-10 px-10 py-10 flex-col lg:flex-row
    [backdrop-filter:blur(25px)] bg-light-bg-container dark:bg-dark-bg-container transition-all duration-300 hover:shadow-[0px_0px_20px_0px_rgba(0,0,0,0.10)] hover:backdrop-blur-xl">
      <div class="flex-1">
        <div class="inline-flex items-center gap-2 uppercase text-xs font-medium text-cosmo-mint"><span class="h-2 w-2 rounded-full bg-cosmo-mint shadow-[0_0_0_4px_rgba(0,237,117,.12)]"></span>{{ t('payoutCosmo.page.verified') }}</div>
        <h1 class="mb-3.5 mt-3.5 max-w-[760px] text-[34px] font-semibold leading-[.98] tracking-[-0.055em] md:text-[44px] lg:text-[62px] text-light-text-secondary dark:text-dark-text-secondary ">{{ t('payoutCosmo.page.heroTitle') }}</h1>
        <div class="max-w-[760px] text-[15px] leading-relaxed  text-cosmo-body dark:text-cosmo-darkInk">{{ t('payoutCosmo.page.heroBody') }}</div>
        <div class="mt-[22px] flex flex-wrap gap-2.5">
          <TwoPieceButton
            variant="link-x"
            tag="button"
            type="button"
            :text="t('payoutCosmo.page.withdrawToBank')"
            root-class="pb-1 filter drop-shadow-[5px_4px_0px_white] group enabled:hover:drop-shadow-[5px_4px_0px_theme('colors.cosmo.pink')] w-max md:pb-0 transition-all duration-300"
            content-wrapper-class="flex justify-center items-center gap-2.5 pl-2 pr-6 h-10 [clip-path:polygon(calc(100%-1rem)_0%,100%_100%,0%_100%,0%_0%)] bg-cosmo-pink text-white group-hover:bg-white group-hover:text-cosmo-pink transition-all duration-300"
            text-class="text-lg font-medium text-white group-hover:text-cosmo-pink transition-colors duration-300"
            :data-attrs="{ 'data-action': 'open-saved-bank' }"
            @click="openFlow('saved')"
          >
            <template #icon>
              <PayoutCdnIcon :src="assets.bank" class="h-6 w-6" />
            </template>
          </TwoPieceButton>
          <TwoPieceButton
            variant="link-x"
            tag="button"
            type="button"
            :text="t('payoutCosmo.page.addBankAccount')"
            root-class="pb-1 filter drop-shadow-[5px_4px_0px_black] group enabled:hover:drop-shadow-[5px_4px_0px_theme('colors.cosmo.mint')] w-max md:pb-0 transition-all duration-300"
            content-wrapper-class="flex justify-center items-center gap-2.5 pl-2 pr-6 h-10 [clip-path:polygon(calc(100%-1rem)_0%,100%_100%,0%_100%,0%_0%)] bg-cosmo-mint text-cosmo-mintInk group-hover:bg-black group-hover:text-cosmo-mint transition-all duration-300"
            text-class="text-lg font-medium text-cosmo-mintInk group-hover:text-cosmo-mint transition-colors duration-300"
            :data-attrs="{ 'data-action': 'open-new-bank' }"
            @click="openFlow('new')"
          >
            <template #icon>
              <PayoutCdnIcon :src="assets.plus" class="h-6 w-6" />
            </template>
          </TwoPieceButton>
          <DashboardPrimaryButton
            :text="t('payoutCosmo.page.manageCard')"
            theme="cosmoManageCard"
            type="button"
            :add-attributes="{ 'data-element': 'manage-card' }"
          >
            <template #leftIcon>
              <PayoutCdnIcon :src="assets.addCard" class="h-[18px] w-[18px]" />
            </template>
          </DashboardPrimaryButton>
          <DashboardPrimaryButton
            :text="t('payoutCosmo.page.verification')"
            theme="cosmoVerification"
            type="button"
            :add-attributes="{ 'data-action': 'open-onboarding' }"
            @click="openFlow('onboarding')"
          >
            <template #leftIcon>
              <PayoutCdnIcon :src="assets.checkCircle" class="h-[18px] w-[18px]" />
            </template>
          </DashboardPrimaryButton>
        </div>
      </div>

      <div class="min-h-[290px] w-[500px] rounded-[26px] border border-cosmo-roseBorderCard bg-gradient-to-br from-cosmo-walletFrom to-cosmo-walletTo p-[26px]
       text-white shadow-[0_18px_34px_rgba(0,0,0,0.467)] max-[1200px]:w-[410px] 
       max-[980px]:bottom-6 max-[980px]:left-6 max-[980px]:right-auto 
       max-[980px]:top-auto max-[980px]:w-[min(500px,calc(100%-48px))]
        max-[680px]:bottom-3 max-[680px]:left-3 max-[680px]:min-h-[240px]
         max-[680px]:w-[calc(100%-24px)] max-[680px]:p-[18px]">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-[11px]">
            <img :src="assets.personMark" alt="" aria-hidden="true" class="h-[34px] w-[34px] shrink-0 rounded-[9px] object-cover">
            <div>
              <strong class="block text-[20px]">{{ t('payoutCosmo.page.fansocial') }}</strong>
              <small class="block text-[10px] uppercase tracking-[.12em] text-cosmo-mutedCard">{{ t('payoutCosmo.page.creatorWallet') }}</small>
            </div>
          </div>
          <img :src="assets.cardChip" alt="" aria-hidden="true" class="h-[37px] w-[50px] shrink-0 object-cover">
        </div>
        <div class="mb-[28px] mt-[58px] text-[30px] font-black tracking-[.12em] max-[680px]:mb-5 max-[680px]:mt-[42px] max-[680px]:text-[19px] max-[680px]:tracking-[.07em]">{{ t('payoutCosmo.page.maskedPan') }}</div>
        <div class="flex items-start justify-between">
          <div>
            <div class="text-[10px] uppercase tracking-[.12em] text-cosmo-mutedCard">{{ t('payoutCosmo.page.cardholder') }}</div>
            <div class="mt-[5px] font-black">{{ t('payoutCosmo.page.cardholderName') }}</div>
          </div>
          <div class="text-right">
            <div class="text-[10px] uppercase tracking-[.12em] text-cosmo-mutedCard">{{ t('payoutCosmo.page.walletBalance') }}</div>
            <strong class="mt-[5px] block text-[25px]">{{ t('payoutCosmo.page.walletBalanceValue') }}</strong>
            <div class="mt-[10px] inline-flex items-center gap-[6px] rounded-full border border-cosmo-chipOkBorder bg-cosmo-chipOkBg px-3 py-2 text-[11px] font-[850] text-cosmo-chipOkText"><PayoutCdnIcon :src="assets.tickMark" class="h-6 w-6" />{{ t('payoutCosmo.page.activeVirtualCard') }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-[18px] grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-4">
      <PayoutStatCard value-class="text-cosmo-pink" accent-class="border-t-cosmo-pink" :label="t('payoutCosmo.page.platformEarnings')" :value="t('payoutCosmo.page.platformEarningsValue')" :note="t('payoutCosmo.page.platformEarningsNote')" />
      <PayoutStatCard value-class="text-cosmo-mint" accent-class="border-t-cosmo-mint" :label="t('payoutCosmo.page.walletAvailable')" :value="t('payoutCosmo.page.walletAvailableValue')" :note="t('payoutCosmo.page.walletAvailableNote')" />
      <PayoutStatCard value-class="text-cosmo-gold" accent-class="border-t-cosmo-gold" :label="t('payoutCosmo.page.bankWithdrawals')" :value="t('payoutCosmo.page.bankWithdrawalsValue')" :note="t('payoutCosmo.page.bankWithdrawalsNote')" />
      <PayoutStatCard value-class="text-cosmo-purple" accent-class="border-t-cosmo-purple" :label="t('payoutCosmo.page.lifetimePayouts')" :value="t('payoutCosmo.page.lifetimePayoutsValue')" :note="t('payoutCosmo.page.lifetimePayoutsNote')" />
    </section>

    <section class="mb-[18px] grid grid-cols-1 gap-4 lg:grid-cols-[7fr_5fr]">
      <div class="rounded-3xl [backdrop-filter:blur(25px)] bg-light-bg-container dark:bg-dark-bg-container transition-all duration-300 hover:shadow-[0px_0px_20px_0px_rgba(0,0,0,0.10)] hover:backdrop-blur-xl p-[18px] text-white">
        <div class="mb-3.5 flex items-start justify-between gap-3">
          <div>
            <h2 class="m-0 text-[22px] font-black text-cosmo-ink">{{ t('payoutCosmo.page.quickActions') }}</h2>
            <p class="mt-1 text-[13px] text-cosmo-muted">{{ t('payoutCosmo.page.quickActionsNote') }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <PayoutQuickAction bg-class="bg-cosmo-actionSaved" :icon-src="assets.bank" action="open-saved-bank" :title="t('payoutCosmo.page.withdrawSavedBank')" :note="t('payoutCosmo.page.withdrawSavedBankNote')" @click="openFlow('saved')" />
          <PayoutQuickAction bg-class="bg-cosmo-actionNew" :icon-src="assets.plus" action="open-new-bank" :title="t('payoutCosmo.page.addNewBank')" :note="t('payoutCosmo.page.addNewBankNote')" @click="openFlow('new')" />
          <PayoutQuickAction bg-class="bg-cosmo-actionCard" :icon-src="assets.addCard" action="manage-card" :title="t('payoutCosmo.page.manageCard')" :note="t('payoutCosmo.page.manageCardNote')" />
          <PayoutQuickAction bg-class="bg-cosmo-actionVerify" :icon-src="assets.checkCircle" action="open-onboarding" :title="t('payoutCosmo.page.verification')" :note="t('payoutCosmo.page.verificationNote')" @click="openFlow('onboarding')" />
          <PayoutQuickAction bg-class="bg-cosmo-actionWeekly" :icon-src="assets.calendarClock" action="open-weekly" :title="t('payoutCosmo.page.weeklyPayout')" :note="t('payoutCosmo.page.weeklyPayoutNote')" @click="openFlow('weekly')" />
          <PayoutQuickAction bg-class="bg-cosmo-actionSupport" :icon-src="assets.lifeBuoy" action="payout-support" :title="t('payoutCosmo.page.payoutSupport')" :note="t('payoutCosmo.page.payoutSupportNote')" />
        </div>
      </div>

      <div class="rounded-3xl [backdrop-filter:blur(25px)] bg-light-bg-container dark:bg-dark-bg-container transition-all duration-300 hover:shadow-[0px_0px_20px_0px_rgba(0,0,0,0.10)] hover:backdrop-blur-xl p-[18px] text-white">
        <div class="mb-3.5 flex items-start justify-between gap-3">
          <div>
            <h2 class="m-0 text-[22px] font-black text-cosmo-ink">{{ t('payoutCosmo.page.savedBanks') }}</h2>
            <p class="mt-1 text-[13px] text-cosmo-muted">{{ t('payoutCosmo.page.savedBanksNote') }}</p>
          </div>
          <button type="button" data-action="open-new-bank" class="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-[9px] rounded-xl bg-white px-[18px] font-extrabold text-cosmo-inkSoft transition hover:-translate-y-px hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cosmo-inkSoft" @click="openFlow('new')"><PayoutCdnIcon :src="assets.plus" class="h-[18px] w-[18px]" />{{ t('payoutCosmo.page.add') }}</button>
        </div>
        <div class="grid gap-2.5">
          <PayoutQuickAction row-class="min-h-[74px] w-full rounded-2xl px-3 text-cosmo-inkSoft" bg-class="bg-cosmo-bankIdle" :icon-src="assets.bank" action="open-saved-bank" tile-class="bg-cosmo-inkSoft text-white" :title="t('payoutCosmo.page.commonwealthBank')" :note="t('payoutCosmo.page.commonwealthNote')" note-class="text-cosmo-mutedSoft" :badge="t('payoutCosmo.page.verifiedBadge')" @click="openFlow('saved')" />
          <PayoutQuickAction row-class="min-h-[74px] w-full rounded-2xl px-3 text-cosmo-inkSoft" bg-class="bg-cosmo-bankActive" :icon-src="assets.bank" action="open-saved-bank" tile-class="bg-cosmo-bankTile text-white" :title="t('payoutCosmo.page.anz')" :note="t('payoutCosmo.page.anzNote')" note-class="text-cosmo-mutedSoft" :badge="t('payoutCosmo.page.verifiedBadge')" @click="openFlow('saved')" />
        </div>
        <div class="mt-3 p-3 text-[13px] leading-snug text-cosmo-ink"><strong>{{ t('payoutCosmo.page.withdrawToBankLabel') }}</strong> {{ t('payoutCosmo.page.withdrawToBankBody') }}</div>
      </div>
    </section>

    <section class="mb-[18px]">
      <div class="mb-3 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 class="m-0 text-[22px] font-black text-cosmo-inkSoft">{{ t('payoutCosmo.page.activity') }}</h2>
          <p class="mt-1 text-[13px] text-cosmo-mutedSoft">{{ t('payoutCosmo.page.activityNote') }}</p>
        </div>
        <MyMediaTabs v-model="activeTab" :tabs="activityTabs" />
      </div>
      <FlexTable
        class="-mx-[20px]"
        :key="activeTab"
        :columns="columns"
        :rows="rows"
        :theme="tableTheme"
        :theme-mobile="tableThemeMobile"
        :show-mobile="true"
      >
        <template #header.date="{ col }">
          <div class="pl-6 pr-2.5 w-full">
            <span class="text-sm text-light-text-quaternary dark:text-dark-text-quaternary">{{ col.label }}</span>
          </div>
        </template>
        <template #header.period="{ col }">
          <div class="pl-6 pr-2.5 w-full">
            <span class="text-sm text-light-text-quaternary dark:text-dark-text-quaternary">{{ col.label }}</span>
          </div>
        </template>
        <template #header.reference="{ col }">
          <div class="pl-6 pr-2.5 w-full">
            <span class="text-sm text-light-text-quaternary dark:text-dark-text-quaternary">{{ col.label }}</span>
          </div>
        </template>
        <template #header.bank="{ col }">
          <div class="pl-6 pr-2.5 w-full">
            <span class="text-sm text-light-text-quaternary dark:text-dark-text-quaternary">{{ col.label }}</span>
          </div>
        </template>
        <template #header.account="{ col }">
          <div class="pl-6 pr-2.5 w-full">
            <span class="text-sm text-light-text-quaternary dark:text-dark-text-quaternary">{{ col.label }}</span>
          </div>
        </template>
        <template #header.type="{ col }">
          <div class="pl-6 pr-2.5 w-full">
            <span class="text-sm text-light-text-quaternary dark:text-dark-text-quaternary">{{ col.label }}</span>
          </div>
        </template>
        <template #header.merchant="{ col }">
          <div class="pl-6 pr-2.5 w-full">
            <span class="text-sm text-light-text-quaternary dark:text-dark-text-quaternary">{{ col.label }}</span>
          </div>
        </template>
        <template #header.amount="{ col }">
          <div class="pl-2.5 pr-6 w-full text-right">
            <span class="text-sm text-light-text-quaternary dark:text-dark-text-quaternary">{{ col.label }}</span>
          </div>
        </template>
        <template #header.fee="{ col }">
          <div class="pl-2.5 pr-6 w-full text-right">
            <span class="text-sm text-light-text-quaternary dark:text-dark-text-quaternary">{{ col.label }}</span>
          </div>
        </template>
        <template #header.status="{ col }">
          <div class="pl-0 pr-2.5 w-full flex justify-start">
            <span class="text-sm text-light-text-quaternary dark:text-dark-text-quaternary">{{ col.label }}</span>
          </div>
        </template>

        <template #cell.date="{ value }">
          <div class="pl-6 pr-3 w-full">
            <span class="text-xs leading-normal font-medium text-dark-text dark:text-timberwolf">{{ value }}</span>
          </div>
        </template>
        <template #cell.period="{ value }">
          <div class="pl-6 pr-3 w-full">
            <span class="text-xs leading-normal font-medium text-dark-text dark:text-timberwolf">{{ value }}</span>
          </div>
        </template>
        <template #cell.reference="{ value }">
          <div class="pl-6 pr-3 w-full">
            <span class="text-xs leading-normal font-medium text-dark-text dark:text-timberwolf">{{ value }}</span>
          </div>
        </template>
        <template #cell.bank="{ value }">
          <div class="pl-6 pr-3 w-full">
            <span class="text-xs leading-normal font-medium text-dark-text dark:text-timberwolf">{{ value }}</span>
          </div>
        </template>
        <template #cell.account="{ value }">
          <div class="pl-6 pr-3 w-full">
            <span class="text-xs leading-normal font-medium text-dark-text dark:text-timberwolf">{{ value }}</span>
          </div>
        </template>
        <template #cell.type="{ value }">
          <div class="pl-6 pr-3 w-full">
            <span class="text-xs leading-normal font-medium text-dark-text dark:text-timberwolf">{{ value }}</span>
          </div>
        </template>
        <template #cell.merchant="{ value }">
          <div class="pl-6 pr-3 w-full">
            <span class="text-xs leading-normal font-medium text-dark-text dark:text-timberwolf">{{ value }}</span>
          </div>
        </template>
        <template #cell.amount="{ value }">
          <div class="pl-3 pr-6 w-full text-right">
            <span class="text-xs leading-normal font-bold text-blue-accent dark:text-blue-accent-light">{{ value }}</span>
          </div>
        </template>
        <template #cell.fee="{ value }">
          <div class="pl-3 pr-6 w-full text-right">
            <span class="text-xs leading-normal font-medium text-dark-text dark:text-timberwolf">{{ value }}</span>
          </div>
        </template>
        <template #cell.status="{ row }">
          <div class="pl-0 pr-2.5 w-full flex items-center justify-start">
            <div class="flex h-6 shrink-0">
              <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px]"
                   :class="row.status === 'pending' ? 'bg-cosmo-statusPending dark:bg-cosmo-statusPendingDark' : 'bg-success dark:bg-cosmo-statusOkDark'">
                <img :src="row.status === 'pending' ? assets.clock : assets.tickMark"
                     :alt="row.statusLabel" class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
              </div>
              <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-dark-bg-button">
                <span class="text-xs leading-normal font-medium"
                      :class="row.status === 'pending' ? 'text-cosmo-statusPending dark:text-cosmo-statusPendingTextDark' : 'text-success dark:text-cosmo-statusOkGlow'">{{ row.statusLabel }}</span>
              </div>
            </div>
          </div>
        </template>

        <template #mobile-row="{ row }">
          <div class="flex justify-between gap-0.5 w-full">
            <div class="flex flex-col gap-1 w-[10.625rem] sm:gap-1.5 text-left">
              <span class="text-sm font-medium py-0.5 text-cosmo-inkMute dark:text-cosmo-darkInkSoft">{{ row.date }}</span>
              <div class="flex flex-col gap-0.5 sm:gap-1">
                <div v-for="col in mobileDetailColumns" :key="col.key" class="flex justify-between items-center gap-0.5">
                  <span class="text-xs leading-normal font-medium text-light-text-quaternary dark:text-dark-text-quaternary">{{ col.label }}</span>
                  <span class="text-xs leading-normal text-light-text-quaternary dark:text-dark-text-quaternary">{{ row[col.key] }}</span>
                </div>
              </div>
            </div>
            <div class="flex flex-col items-end gap-0.5 min-w-[9.4375rem] sm:gap-1.5">
              <div class="flex h-6">
                <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px]"
                     :class="row.status === 'pending' ? 'bg-cosmo-statusPending dark:bg-cosmo-statusPendingDark' : 'bg-success dark:bg-cosmo-statusOkDark'">
                  <img :src="row.status === 'pending' ? assets.clock : assets.tickMark"
                       :alt="row.statusLabel"
                       class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                </div>
                <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-dark-bg-button">
                  <span class="text-xs leading-normal font-medium"
                        :class="row.status === 'pending' ? 'text-cosmo-statusPending dark:text-cosmo-statusPendingTextDark' : 'text-success dark:text-cosmo-statusOkGlow'">{{ row.statusLabel }}</span>
                </div>
              </div>
              <div class="flex flex-col sm:gap-1 text-right">
                <span class="text-xs leading-normal font-medium text-right text-light-text-quaternary dark:text-dark-text-quaternary">{{ t('payoutCosmo.page.mobileAmount') }}</span>
                <span class="text-lg font-bold text-right -mt-1 text-blue-accent dark:text-blue-accent-light">{{ row.amount }}</span>
              </div>
            </div>
          </div>
        </template>
      </FlexTable>
    </section>

    <section class="rounded-3xl border border-cosmo-roseBorder bg-cosmo-inkDeep p-[18px] text-white">
      <h2 class="m-0 text-[22px] font-black">{{ t('payoutCosmo.page.flowsTitle') }}</h2>
      <p class="mt-1 text-[13px] text-cosmo-muted">{{ t('payoutCosmo.page.flowsNote') }}</p>
      <div class="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <button type="button" data-action="open-onboarding" class="flex min-h-[128px] cursor-pointer items-start gap-3 rounded-[18px] bg-cosmo-flowOnboard p-4 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" @click="openFlow('onboarding')">
          <PayoutCdnIcon :src="assets.checkCircle" class="mt-0.5 h-[22px] w-[22px]" />
          <span><strong class="block text-sm">{{ t('payoutCosmo.page.registerKyc') }}</strong><small class="mt-1 block text-xs leading-snug text-white/80">{{ t('payoutCosmo.page.registerKycNote') }}</small></span>
        </button>
        <button type="button" data-action="open-weekly" class="flex min-h-[128px] cursor-pointer items-start gap-3 rounded-[18px] bg-cosmo-flowWeekly p-4 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" @click="openFlow('weekly')">
          <PayoutCdnIcon :src="assets.walletCards" class="mt-0.5 h-[22px] w-[22px]" />
          <span><strong class="block text-sm">{{ t('payoutCosmo.page.weeklyToWallet') }}</strong><small class="mt-1 block text-xs leading-snug text-white/80">{{ t('payoutCosmo.page.weeklyToWalletNote') }}</small></span>
        </button>
        <button type="button" data-action="open-saved-bank" class="flex min-h-[128px] cursor-pointer items-start gap-3 rounded-[18px] bg-cosmo-flowSaved p-4 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" @click="openFlow('saved')">
          <PayoutCdnIcon :src="assets.bank" class="mt-0.5 h-[22px] w-[22px]" />
          <span><strong class="block text-sm">{{ t('payoutCosmo.page.withdrawSaved') }}</strong><small class="mt-1 block text-xs leading-snug text-white/80">{{ t('payoutCosmo.page.withdrawSavedNote') }}</small></span>
        </button>
        <button type="button" data-action="open-new-bank" class="flex min-h-[128px] cursor-pointer items-start gap-3 rounded-[18px] bg-cosmo-flowNew p-4 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" @click="openFlow('new')">
          <PayoutCdnIcon :src="assets.plus" class="mt-0.5 h-[22px] w-[22px]" />
          <span><strong class="block text-sm">{{ t('payoutCosmo.page.withdrawNew') }}</strong><small class="mt-1 block text-xs leading-snug text-white/80">{{ t('payoutCosmo.page.withdrawNewNote') }}</small></span>
        </button>
      </div>
    </section>

    <PayoutCosmoFlowPopup v-model="flowOpen" :flow="activeFlow" />
  </div>
  </DashboardSharedTwoColLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue';
import FlexTable from '@/components/ui/table/FlexTable.vue';
import PayoutCdnIcon from '@/dev/components/payout/cosmo/PayoutCdnIcon.vue';
import PayoutStatCard from '@/dev/components/payout/cosmo/PayoutStatCard.vue';
import PayoutQuickAction from '@/dev/components/payout/cosmo/PayoutQuickAction.vue';
import TwoPieceButton from '@/components/ui/buttons/TwoPieceButton.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import MyMediaTabs from '@/templates/media/media-creator/MyMediaTabs.vue';
import PayoutCosmoFlowPopup from '@/dev/components/payout/cosmo/PayoutCosmoFlowPopup.vue';
import { payoutCosmoFlows } from '@/services/payout/payoutCosmoFlows.js';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';
import { usePayoutCosmoTable } from '@/dev/composables/usePayoutCosmoTable.js';

const { assets } = usePayoutAssets();
const { t } = useI18n();

const flowOpen = ref(false);
const activeFlow = ref('');
const activeTab = ref('payouts');

const { activityTabs, columns, rows, mobileDetailColumns } = usePayoutCosmoTable(activeTab);

const tableTheme = {
  container: 'hidden md:flex flex-col w-full',
  header: 'hidden md:flex items-center w-full',
  headerRow: 'flex items-center w-full',
  headerCell: 'flex items-center min-h-[2.625rem] border-b border-light-text-quaternary dark:border-cosmo-tableBorderDark',
  row: 'flex items-center w-full min-h-[4.5rem] odd:bg-cosmo-tableOdd even:bg-cosmo-tableEven',
  cell: 'flex items-center h-full',
  footer: 'p-3 text-center',
};

const tableThemeMobile = {
  container: 'flex flex-col gap-1 sm:px-2 md:hidden',
  card: 'flex justify-center items-center p-2 rounded-sm backdrop-blur-[5px] border-[1.5px] border-checkboxBorder bg-white/50 sm:py-3 dark:border-dark-border-primary dark:bg-dark-bg-button/50',
  cardRow: '',
};

function openFlow(flowId) {
  if (!payoutCosmoFlows[flowId]) return;
  activeFlow.value = flowId;
  flowOpen.value = true;
}
</script>
