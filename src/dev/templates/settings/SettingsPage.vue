<template>
    <DashboardSharedTwoColLayout>
    <div>
        <!-- main-wrapper -->
        <div
            :style="settingsBackgroundStyle">
            <!-- container -->
            <div class="flex min-h-screen z-[0] lg:gap-4 lg:h-screen">
                <!-- sidebar -->
                <div data-sidebar
                    class="flex flex-col w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] bg-[linear-gradient(0deg,rgba(255,255,255,0.01),rgba(255,255,255,0.01)),linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.5)_100%)] shadow-[0_0_30px_#0000000D,0_30px_50px_#FFFFFF1A_inset] lg:w-[26.6875rem]">
                    <DashProfileSettings user-role="creator" />
                        </div>

                <!-- tab-container: hidden by default on small screens so sidebar/nav can show; lg always flex -->
                <div data-tab-container
                    class="fixed top-0 left-0 w-full h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] hidden flex-col z-[1] bg-[#EAECF0] lg:static lg:flex lg:flex-1 lg:bg-transparent [&.dark]:bg-[#222526]">
                    <!-- bg-wrapper -->
                    <div
                        class="relative before:content-[''] before:fixed before:inset-0 before:pointer-events-none before:bg-cover before:bg-center before:bg-no-repeat before:bg-[image:var(--settings-mobile-bg)] before:z-[-1] sm:before:bg-[image:var(--settings-desktop-bg)] lg:before:hidden"
                        :style="settingsBackgroundStyle">
                        <!-- tab (account-information) -->
                        <div data-tab="account-information"
                            class="hidden [&.tab-active]:flex flex-col z-[2] md:gap-2">
                            <!-- title-container -->
                            <div
                                class="flex justify-between items-center gap-2.5 px-2 py-4 md:px-4 md:pt-3 md:pb-2 lg:py-3">
                                <Heading :text="t('settings.page.tabs.accountInformation')" tag="h2" theme="custom" no-wrap class="text-lg font-semibold text-[#667085] md:text-2xl dark:text-[#9e9589]" />

                                <DashboardPrimaryButton
                                    :text="t('settings.page.actions.back')"
                                    theme="settingsBack"
                                    :leftIcon="assets.arrowBack"
                                    customClass="lg:hidden"
                                    :addAttributes="{ 'data-back-button': true }"
                                />

                                <div data-save-cancel-buttons-container class="flex items-center gap-2 md:gap-6">
                                    <DashboardPrimaryButton
                                        :text="t('settings.page.actions.cancel')"
                                        theme="settingsCancel"
                                        :addAttributes="{ 'data-cancel-button': true }"
                                    />

                                    <DashboardPrimaryButton
                                        :text="t('settings.page.actions.save')"
                                        theme="settingsSave"
                                        :addAttributes="{ 'data-save-button': true }"
                                    />
                                </div>
                            </div>

                            <!-- content-container -->
                            <div class="flex flex-col pb-6 lg:pb-0" style="gap: var(--dashboard-sections-gap, 0.5rem);">
                                <!-- user-information -->
                                <DashboardSharedSectionLayout>
                                    <!-- input-container -->

                                    <DashboardTextInput v-model="username" :labelText="t('settings.page.account.username')" showLabel
                                        :placeholder="t('settings.page.account.usernamePlaceholder')"
                                        :description="t('settings.page.account.usernameHelp')" />


                                    <!-- input-container -->

                                    <DashboardTextInput v-model="email" :labelText="t('settings.page.account.email')" showLabel
                                        :placeholder="t('settings.page.account.emailPlaceholder')" />

                                    <!-- input-group -->
                                    <div class="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                        <!-- input-container -->

                                        <DashboardTextInput v-model="firstName" :labelText="t('settings.page.account.firstName')" showLabel
                                            :placeholder="t('settings.page.account.firstNamePlaceholder')" />

                                        <!-- input-container -->
                                        <DashboardTextInput v-model="lastName" :labelText="t('settings.page.account.lastName')" showLabel
                                            :placeholder="t('settings.page.account.lastNamePlaceholder')" />

                                    </div>
                                </DashboardSharedSectionLayout>

                                <!-- choose-language (F-04) -->
                                <DashboardSharedSectionLayout>
                                    <SettingsLanguageField
                                        @locale-changed="onSettingsLocaleChanged"
                                        @locale-change-error="onSettingsLocaleError"
                                    />
                                </DashboardSharedSectionLayout>

                                <!-- link-x-account -->
                                <DashboardSharedSectionLayout>
                                    <!-- title -->
                                    <section class="flex flex-col gap-2">
                                        <Heading :text="t('settings.page.account.linkXTitle')" tag="h3" theme="custom" no-wrap class="text-xl leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]" />
                                        <Paragraph :text="t('settings.page.account.linkXBody')" no-wrap font-size="" font-weight="" font-color="" class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb7af]" />
                                    </section>

                                    <!-- button-container -->
                                    <TwoPieceButton 
                                        variant="link-x" 
                                        :text="t('settings.page.account.linkXCta')" 
                                    >
                                        <template #icon>
                                            <img :src="assets.linkX" :alt="t('settings.page.alt.x')" class="w-6 h-6 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(83%)_sepia(37%)_saturate(2897%)_hue-rotate(81deg)_brightness(94%)_contrast(103%)]">
                                        </template>
                                    </TwoPieceButton>
                                </DashboardSharedSectionLayout>

                                <!-- promote yourself -->
                                <DashboardSharedSectionLayout>
                                    <!-- title -->
                                    <div class="flex flex-col gap-2">
                                        <div class="flex justify-between items-start">
                                            <Heading :text="t('settings.page.account.promoteTitle')" tag="h3" theme="custom" no-wrap class="text-lg font-semibold text-[#9F8009] dark:text-[#f6d75f]" />
                                            <div class="flex justify-center items-center gap-1 py-[0.3125rem] shrink-0">
                                                <img :src="assets.premiumStars" :alt="t('settings.page.alt.stars')"
                                                    class="w-4 h-4">
                                                <span
                                                    class="text-xs leading-normal font-medium text-transparent bg-clip-text bg-[linear-gradient(90deg,#D8AF0D_-35.59%,#9F8009_100%)]">{{ t('settings.page.account.promotePremium') }}</span>
                                            </div>
                                        </div>

                                        <Paragraph :text="t('settings.page.account.promoteBody')" no-wrap font-size="" font-weight="" font-color="" class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb7af]" />
                                    </div>

                                    <!-- button-container -->
                                    <TwoPieceButton 
                                        variant="premium-upgrade" 
                                        :text="t('settings.page.account.upgradeCta')" 
                                        textClass="text-lg font-medium text-white"
                                    >
                                        <template #icon>
                                            <img :src="assets.premiumStar" :alt="t('settings.page.alt.star')" class="w-6 h-6">
                                        </template>
                                    </TwoPieceButton>
                                </DashboardSharedSectionLayout>
                            </div>
                        </div>

                        <!-- tab (change-password) -->
                        <div data-tab="change-password" class="hidden [&.tab-active]:flex flex-col z-[2] md:gap-2">
                            <!-- title-container -->
                            <div
                                class="flex justify-between items-center gap-2.5 px-2 py-4 md:px-4 md:pt-3 md:pb-2 lg:py-3">
                                <Heading :text="t('settings.page.tabs.changePassword')" tag="h2" theme="custom" no-wrap class="text-lg font-semibold text-[#667085] md:text-2xl dark:text-[#9e9589]" />

                                <DashboardPrimaryButton
                                    :text="t('settings.page.actions.back')"
                                    theme="settingsBack"
                                    :leftIcon="assets.arrowBack"
                                    customClass="lg:hidden"
                                    :addAttributes="{ 'data-back-button': true }"
                                />

                                <div data-save-cancel-buttons-container class="flex items-center gap-2 md:gap-6">
                                    <DashboardPrimaryButton
                                        :text="t('settings.page.actions.cancel')"
                                        theme="settingsCancel"
                                        :addAttributes="{ 'data-cancel-button': true }"
                                    />

                                    <DashboardPrimaryButton
                                        :text="t('settings.page.actions.save')"
                                        theme="settingsSave"
                                        :addAttributes="{ 'data-save-button': true }"
                                    />
                                </div>
                            </div>

                            <!-- content-container -->
                            <DashboardSharedSectionLayout>
                                <!-- input-old-password -->
                                <DashboardTextInput v-model="oldPassword" :labelText="t('settings.page.password.password')" showLabel
                                    :placeholder="t('settings.page.password.oldPlaceholder')" />

                                <!-- input-new-password -->
                                <DashboardTextInput v-model="newPassword" :labelText="t('settings.page.password.password')" showLabel
                                    :placeholder="t('settings.page.password.newPlaceholder')" />

                                <!-- input-container -->
                                <DashboardTextInput v-model="confirmNewPassword" :labelText="t('settings.page.password.confirmLabel')" showLabel
                                    :placeholder="t('settings.page.password.confirmPlaceholder')" />
                            </DashboardSharedSectionLayout>
                        </div>

                        <!-- tab (privacy-security) -->
                        <div data-tab="privacy-security" class="hidden [&.tab-active]:flex flex-col z-[2] md:gap-2">
                            <!-- title-container -->
                            <div
                                class="flex justify-between items-center gap-2.5 px-2 py-4 md:px-4 md:pt-3 md:pb-2 lg:py-3">
                                <Heading :text="t('settings.page.tabs.privacySecurity')" tag="h2" theme="custom" no-wrap class="text-lg font-semibold text-[#667085] md:text-2xl dark:text-[#9e9589]" />

                                <DashboardPrimaryButton
                                    :text="t('settings.page.actions.back')"
                                    theme="settingsBack"
                                    :leftIcon="assets.arrowBack"
                                    customClass="lg:hidden"
                                    :addAttributes="{ 'data-back-button': true }"
                                />
                            </div>

                            <!-- content-container -->
                            <DashboardSharedSectionLayout>
                                <!-- log-out-all -->
                                <div class="flex justify-between items-center gap-4">
                                    <div class="flex gap-1">
                                        <Heading :text="t('settings.page.privacy.activeDevice')" tag="h3" theme="custom" no-wrap class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9589]" />
                                        <span
                                            class="text-[0.625rem] leading-normal font-medium tracking-[0.0156rem] text-[#667085] dark:text-[#9e9589]">5</span>
                                    </div>

                                    <button
                                        class="flex justify-center items-center gap-2 px-2 py-1 bg-[#FF4405] dark:bg-[#c93300]">
                                        <img :src="assets.devicePower" :alt="t('settings.page.alt.power')"
                                            class="w-4 h-4">
                                        <span
                                            class="text-xs leading-normal font-semibold tracking-[0.01875rem] text-white dark:text-[#e8e6e3]">{{ t('settings.page.privacy.logoutAll') }}</span>
                                    </button>
                                </div>

                                <!-- log-out-one-by-one -->
                                <div class="flex flex-col gap-2">
                                    <!-- device -->
                                    <div
                                        class="w-full flex justify-between items-center gap-4 p-4 shadow-[0px_0px_10px_0px_#0000001A] bg-white/70 dark:bg-[#181a1b]/70">
                                        <!-- device-info -->
                                        <div class="flex items-center gap-4">
                                            <div
                                                class="flex justify-center items-center w-10 h-10 rounded-full bg-[#EAECF0] dark:bg-[#222526]">
                                                <img :src="assets.devicePhone" :alt="t('settings.page.alt.phone')"
                                                    class="w-6 h-6">
                                            </div>

                                            <div class="flex flex-col gap-1.5">
                                                <div class="flex items-center gap-2">
                                                    <span
                                                        class="text-sm font-medium text-black dark:text-[#e8e6e3]">{{ t('settings.page.privacy.deviceName') }}</span>
                                                    <div
                                                        class="w-0.5 h-0.5 rounded-full bg-[#667085] dark:bg-[#535c6d]">
                                                    </div>
                                                    <span
                                                        class="text-sm font-medium text-black dark:text-[#e8e6e3]">{{ t('settings.page.privacy.browserName') }}</span>
                                                </div>

                                                <Paragraph :text="t('settings.page.privacy.loggedInOn')" no-wrap font-size="" font-weight="" font-color="" class="text-xs leading-normal text-[#344054] dark:text-[#bdb7af]" />
                                            </div>
                                        </div>

                                        <!-- log-out button -->
                                        <button class="flex justify-center items-center gap-2 px-2 py-1">
                                            <img :src="assets.devicePower" :alt="t('settings.page.alt.power')"
                                                class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(41%)_sepia(72%)_saturate(5327%)_hue-rotate(357deg)_brightness(100%)_contrast(102%)]">

                                            <span
                                                class="text-xs leading-normal font-semibold tracking-[0.01875rem] text-[#FF4405] dark:text-[#ff571e]">{{ t('settings.page.privacy.logout') }}</span>
                                        </button>
                                    </div>

                                    <!-- device -->
                                    <div
                                        class="w-full flex justify-between items-center gap-4 p-4 shadow-[0px_0px_10px_0px_#0000001A] bg-white/70 dark:bg-[#181a1b]/70">
                                        <!-- device-info -->
                                        <div class="flex items-center gap-4">
                                            <div
                                                class="flex justify-center items-center w-10 h-10 rounded-full bg-[#EAECF0] dark:bg-[#222526]">
                                                <img :src="assets.devicePhone" :alt="t('settings.page.alt.phone')"
                                                    class="w-6 h-6">
                                            </div>

                                            <div class="flex flex-col gap-1.5">
                                                <div class="flex items-center gap-2">
                                                    <span
                                                        class="text-sm font-medium text-black dark:text-[#e8e6e3]">{{ t('settings.page.privacy.deviceName') }}</span>
                                                    <div
                                                        class="w-0.5 h-0.5 rounded-full bg-[#667085] dark:bg-[#535c6d]">
                                                    </div>
                                                    <span
                                                        class="text-sm font-medium text-black dark:text-[#e8e6e3]">{{ t('settings.page.privacy.browserName') }}</span>
                                                </div>

                                                <Paragraph :text="t('settings.page.privacy.loggedInOn')" no-wrap font-size="" font-weight="" font-color="" class="text-xs leading-normal text-[#344054] dark:text-[#bdb7af]" />
                                            </div>
                                        </div>

                                        <!-- log-out button -->
                                        <button class="flex justify-center items-center gap-2 px-2 py-1">
                                            <img :src="assets.devicePower" :alt="t('settings.page.alt.power')"
                                                class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(41%)_sepia(72%)_saturate(5327%)_hue-rotate(357deg)_brightness(100%)_contrast(102%)]">

                                            <span
                                                class="text-xs leading-normal font-semibold tracking-[0.01875rem] text-[#FF4405] dark:text-[#ff571e]">{{ t('settings.page.privacy.logout') }}</span>
                                        </button>
                                    </div>

                                    <!-- device -->
                                    <div
                                        class="w-full flex justify-between items-center gap-4 p-4 shadow-[0px_0px_10px_0px_#0000001A] bg-white/70 dark:bg-[#181a1b]/70">
                                        <!-- device-info -->
                                        <div class="flex items-center gap-4">
                                            <div
                                                class="flex justify-center items-center w-10 h-10 rounded-full bg-[#EAECF0] dark:bg-[#222526]">
                                                <img :src="assets.devicePhone" :alt="t('settings.page.alt.phone')"
                                                    class="w-6 h-6">
                                            </div>

                                            <div class="flex flex-col gap-1.5">
                                                <div class="flex items-center gap-2">
                                                    <span
                                                        class="text-sm font-medium text-black dark:text-[#e8e6e3]">{{ t('settings.page.privacy.deviceName') }}</span>
                                                    <div
                                                        class="w-0.5 h-0.5 rounded-full bg-[#667085] dark:bg-[#535c6d]">
                                                    </div>
                                                    <span
                                                        class="text-sm font-medium text-black dark:text-[#e8e6e3]">{{ t('settings.page.privacy.browserName') }}</span>
                                                </div>

                                                <Paragraph :text="t('settings.page.privacy.loggedInOn')" no-wrap font-size="" font-weight="" font-color="" class="text-xs leading-normal text-[#344054] dark:text-[#bdb7af]" />
                                            </div>
                                        </div>

                                        <!-- log-out button -->
                                        <button class="flex justify-center items-center gap-2 px-2 py-1">
                                            <img :src="assets.devicePower" :alt="t('settings.page.alt.power')"
                                                class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(41%)_sepia(72%)_saturate(5327%)_hue-rotate(357deg)_brightness(100%)_contrast(102%)]">

                                            <span
                                                class="text-xs leading-normal font-semibold tracking-[0.01875rem] text-[#FF4405] dark:text-[#ff571e]">{{ t('settings.page.privacy.logout') }}</span>
                                        </button>
                                    </div>

                                    <!-- device -->
                                    <div
                                        class="w-full flex justify-between items-center gap-4 p-4 shadow-[0px_0px_10px_0px_#0000001A] bg-white/70 dark:bg-[#181a1b]/70">
                                        <!-- device-info -->
                                        <div class="flex items-center gap-4">
                                            <div
                                                class="flex justify-center items-center w-10 h-10 rounded-full bg-[#EAECF0] dark:bg-[#222526]">
                                                <img :src="assets.devicePhone" :alt="t('settings.page.alt.phone')"
                                                    class="w-6 h-6">
                                            </div>

                                            <div class="flex flex-col gap-1.5">
                                                <div class="flex items-center gap-2">
                                                    <span
                                                        class="text-sm font-medium text-black dark:text-[#e8e6e3]">{{ t('settings.page.privacy.deviceName') }}</span>
                                                    <div
                                                        class="w-0.5 h-0.5 rounded-full bg-[#667085] dark:bg-[#535c6d]">
                                                    </div>
                                                    <span
                                                        class="text-sm font-medium text-black dark:text-[#e8e6e3]">{{ t('settings.page.privacy.browserName') }}</span>
                                                </div>

                                                <Paragraph :text="t('settings.page.privacy.loggedInOn')" no-wrap font-size="" font-weight="" font-color="" class="text-xs leading-normal text-[#344054] dark:text-[#bdb7af]" />
                                            </div>
                                        </div>

                                        <!-- log-out button -->
                                        <button class="flex justify-center items-center gap-2 px-2 py-1">
                                            <img :src="assets.devicePower" :alt="t('settings.page.alt.power')"
                                                class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(41%)_sepia(72%)_saturate(5327%)_hue-rotate(357deg)_brightness(100%)_contrast(102%)]">

                                            <span
                                                class="text-xs leading-normal font-semibold tracking-[0.01875rem] text-[#FF4405] dark:text-[#ff571e]">{{ t('settings.page.privacy.logout') }}</span>
                                        </button>
                                    </div>
                                </div>
                            </DashboardSharedSectionLayout>
                        </div>

                        <!-- tab (shipping-address) -->
                        <div data-tab="shipping-address" class="hidden [&.tab-active]:flex flex-col z-[2] md:gap-2">
                            <!-- title-container -->
                            <div
                                class="flex justify-between items-center gap-2.5 px-2 py-4 md:px-4 md:pt-3 md:pb-2 lg:py-3">
                                <Heading :text="t('settings.page.tabs.shippingAddress')" tag="h2" theme="custom" no-wrap class="text-lg font-semibold text-[#667085] md:text-2xl dark:text-[#9e9589]" />

                                <DashboardPrimaryButton
                                    :text="t('settings.page.actions.back')"
                                    theme="settingsBack"
                                    :leftIcon="assets.arrowBack"
                                    customClass="lg:hidden"
                                    :addAttributes="{ 'data-back-button': true }"
                                />

                                <div data-save-cancel-buttons-container class="flex items-center gap-2 md:gap-6">
                                    <DashboardPrimaryButton
                                        :text="t('settings.page.actions.cancel')"
                                        theme="settingsCancel"
                                        :addAttributes="{ 'data-cancel-button': true }"
                                    />

                                    <DashboardPrimaryButton
                                        :text="t('settings.page.actions.save')"
                                        theme="settingsSave"
                                        :addAttributes="{ 'data-save-button': true }"
                                    />
                                </div>
                            </div>

                            <!-- content-container -->
                            <div class="flex flex-col pb-6 lg:pb-0" style="gap: var(--dashboard-sections-gap, 0.5rem);">
                                <!-- personal-information-container -->
                                <DashboardSharedSectionLayout>
                                    <Heading :text="t('settings.page.shipping.personalInformation')" tag="h3" theme="custom" no-wrap class="text-xl leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]" />

                                    <!-- input-group -->
                                    <div class="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                        <!-- input-container -->
                                        <DashboardTextInput v-model="firstName" :labelText="t('settings.page.account.firstName')" showLabel
                                            :placeholder="t('settings.page.account.firstNamePlaceholder')" />

                                        <!-- input-container -->
                                        <DashboardTextInput v-model="lastName" :labelText="t('settings.page.account.lastName')" showLabel
                                            :placeholder="t('settings.page.account.lastNamePlaceholder')" />


                                    </div>

                                    <!-- input-group -->
                                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                        <!-- input-container -->
                                        <DashboardTextInput v-model="email" :labelText="t('settings.page.account.email')" showLabel
                                            :placeholder="t('settings.page.shipping.emailPlaceholder')" />

                                        <!-- input-container -->
                                        <DashboardTextInput v-model="phoneNumber" :labelText="t('settings.page.shipping.phoneNumber')"
                                            showLabel :placeholder="t('settings.page.shipping.phonePlaceholder')" />
                                    </div>
                                </DashboardSharedSectionLayout>

                                <!-- shipping-address-container -->
                                <DashboardSharedSectionLayout>
                                    <Heading :text="t('settings.page.tabs.shippingAddress')" tag="h3" theme="custom" no-wrap class="text-xl leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]" />

                                    <!-- input-container -->

                                    <!-- input-field -->
                                    <DashboardTextInput v-model="company" :labelText="t('settings.page.shipping.company')" optionalLabel
                                        :optionalLabelText="t('settings.page.shipping.optional')" showLabel :placeholder="t('settings.page.shipping.companyPlaceholder')" />

                                    <!-- input-container -->
                                    <DashboardTextInput v-model="addressLine1" :labelText="t('settings.page.shipping.addressLine1')" showLabel
                                        :placeholder="t('settings.page.shipping.addressLine1Placeholder')" />

                                    <!-- input-container -->
                                    <DashboardTextInput v-model="addressLine2" :labelText="t('settings.page.shipping.addressLine2')" showLabel
                                        :placeholder="t('settings.page.shipping.addressLine2Placeholder')" />



                                    <!-- input-group -->
                                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                        <!-- input-container -->
                                        <DashboardTextInput v-model="postalCode" :labelText="t('settings.page.shipping.postalCode')" showLabel
                                            :placeholder="t('settings.page.shipping.postalCodePlaceholder')" />

                                        <!-- input-container -->
                                        <DashboardTextInput v-model="city" :labelText="t('settings.page.shipping.city')" showLabel
                                            :placeholder="t('settings.page.shipping.cityPlaceholder')" />

                                    </div>

                                    <!-- dropdown-group -->
                                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                        <!-- dropdown-wrapper -->
                                        <div class="flex flex-col gap-1.5 w-full">
                                            <div class="flex flex-col gap-1.5">
                                                <label for="state"
                                                    class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">
                                                    {{ t('settings.page.shipping.state') }}
                                                </label>
                                                <UnifiedSelect v-model="shippingState" :options="stateOptions"
                                                    variant="dashboard" name="state-select" required />
                                            </div>
                                        </div>

                                        <!-- dropdown-wrapper -->
                                        <div class="flex flex-col gap-1.5 w-full">
                                            <div class="flex flex-col gap-1.5">
                                                <label for="country"
                                                    class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">
                                                    {{ t('settings.page.shipping.country') }}
                                                </label>
                                                <UnifiedSelect v-model="shippingCountry" :options="countryOptions"
                                                    variant="dashboard" name="country-select" required />
                                            </div>
                                        </div>
                                    </div>
                                </DashboardSharedSectionLayout>
                            </div>
                        </div>

                        <!-- tab (payout-details) -->
                        <div data-tab="payout-details" class="hidden [&.tab-active]:flex flex-col z-[2] md:gap-2">
                            <!-- title-container -->
                            <div
                                class="flex justify-between items-center gap-2.5 px-2 py-4 md:px-4 md:pt-3 md:pb-2 lg:py-3">
                                <Heading :text="t('settings.page.tabs.payoutDetails')" tag="h2" theme="custom" no-wrap class="text-lg font-semibold text-[#667085] md:text-2xl dark:text-[#9e9589]" />

                                <DashboardPrimaryButton
                                    :text="t('settings.page.actions.back')"
                                    theme="settingsBack"
                                    :leftIcon="assets.arrowBack"
                                    customClass="lg:hidden"
                                    :addAttributes="{ 'data-back-button': true }"
                                />

                                <div data-save-cancel-buttons-container class="flex items-center gap-2 md:gap-6">
                                    <DashboardPrimaryButton
                                        :text="t('settings.page.actions.cancel')"
                                        theme="settingsCancel"
                                        :addAttributes="{ 'data-cancel-button': true }"
                                    />

                                    <DashboardPrimaryButton
                                        :text="t('settings.page.actions.save')"
                                        theme="settingsSave"
                                        :addAttributes="{ 'data-save-button': true }"
                                    />
                                </div>
                            </div>

                            <!-- content-container -->
                            <div class="flex flex-col pb-6 lg:pb-0" style="gap: var(--dashboard-sections-gap, 0.5rem);">
                                <!-- beneficiary-information -->
                                <DashboardSharedSectionLayout>
                                    <!-- title -->
                                    <section class="flex flex-col gap-2">
                                        <Heading :text="t('settings.page.payout.beneficiaryTitle')" tag="h3" theme="custom" no-wrap class="text-xl leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]" />
                                        <Paragraph :text="t('settings.page.payout.beneficiaryBody')" no-wrap font-size="" font-weight="" font-color="" class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb7af]" />
                                    </section>

                                    <!-- input-container -->
                                    <DashboardTextInput v-model="beneficiaryName" :labelText="t('settings.page.payout.beneficiaryName')"
                                        showLabel :placeholder="t('settings.page.payout.beneficiaryNamePlaceholder')" />

                                    <!-- input-container -->
                                    <DashboardTextInput v-model="beneficiaryStreet" :labelText="t('settings.page.payout.beneficiaryStreet')"
                                        showLabel :placeholder="t('settings.page.payout.beneficiaryStreetPlaceholder')" />


                                    <!-- input-container -->
                                    <DashboardTextInput v-model="beneficiaryCity" :labelText="t('settings.page.payout.beneficiaryCity')"
                                        showLabel :placeholder="t('settings.page.payout.beneficiaryCityPlaceholder')" />

                                    <!-- input-container -->
                                    <DashboardTextInput v-model="beneficiaryPostalCode"
                                        :labelText="t('settings.page.payout.beneficiaryPostalCode')" showLabel
                                        :placeholder="t('settings.page.payout.beneficiaryPostalPlaceholder')" />
                                </DashboardSharedSectionLayout>

                                <!-- bank-information -->
                                <DashboardSharedSectionLayout>
                                    <!-- title -->
                                    <section class="flex flex-col gap-2">
                                        <Heading :text="t('settings.page.payout.bankTitle')" tag="h3" theme="custom" no-wrap class="text-2xl leading-normal font-bold text-[#0C111D] dark:text-[#dbd8d3]" />
                                        <Paragraph :text="t('settings.page.payout.bankBody')" no-wrap font-size="" font-weight="" font-color="" class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb7af]" />
                                    </section>

                                    <!-- input-container -->
                                    <DashboardTextInput v-model="beneficiaryAccount"
                                        :labelText="t('settings.page.payout.beneficiaryAccount')" showLabel
                                        :placeholder="t('settings.page.payout.beneficiaryAccountPlaceholder')" showTooltip
                                        :tooltipText="t('settings.page.payout.beneficiaryAccountTooltip')"
                                        tooltipPlacement="top" />

                                    <!-- dropdown-wrapper -->
                                    <div class="flex flex-col gap-1.5 w-full">
                                        <!-- dropdown-field -->
                                        <div class="flex flex-col gap-1.5">
                                            <label for="country"
                                                class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">
                                                    {{ t('settings.page.shipping.country') }}
                                            </label>
                                            <UnifiedSelect v-model="beneficiaryCountry" :options="countryOptions"
                                                variant="dashboard" name="beneficiary-country-select" required />
                                        </div>
                                    </div>

                                    <!-- input-container -->
                                    <DashboardTextInput v-model="swiftCode" :labelText="t('settings.page.payout.swiftCode')" showLabel
                                        :placeholder="t('settings.page.payout.swiftPlaceholder')" />

                                    <!-- input-container -->
                                    <DashboardTextInput v-model="intermediarySwift"
                                        :labelText="t('settings.page.payout.intermediarySwift')" showLabel
                                        :placeholder="t('settings.page.payout.swiftPlaceholder')"
                                        :description="t('settings.page.payout.intermediaryHelp')" />

                                </DashboardSharedSectionLayout>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
    </DashboardSharedTwoColLayout>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue';
import DashboardSharedSectionLayout from '@/dev/templates/dashboard/shared/DashboardSharedSectionLayout.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import UnifiedSelect from '@/components/ui/dropdowns/select/UnifiedSelect.vue';
import TwoPieceButton from '@/components/ui/buttons/TwoPieceButton.vue';
import SettingsLanguageField from '@/components/ui/nav/language/SettingsLanguageField.vue';
import DashProfileSettings from '@/dev/components/ui/nav/dashboard/DashProfileSettings.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import { useSettingsAssets } from '@/dev/composables/useSettingsAssets.js';

const { t } = useI18n();
const { assets } = useSettingsAssets();

const settingsBackgroundStyle = computed(() => ({
  '--settings-mobile-bg': assets.value.mobileGradientBg ? `url(${assets.value.mobileGradientBg})` : 'none',
  '--settings-desktop-bg': assets.value.gradientBg ? `url(${assets.value.gradientBg})` : 'none',
}));

function onSettingsLocaleChanged(payload) {
  if (import.meta.env.DEV) {
    console.log('[Settings] locale-changed', payload);
  }
}

function onSettingsLocaleError(payload) {
  console.warn('[Settings] locale-change-error', payload);
}

const countryOptions = computed(() => [
    { label: t('settings.page.options.countryUnitedStates'), value: 'united-states-us' },
    { label: t('settings.page.options.countryHongKong'), value: 'hong-kong' },
    { label: t('settings.page.options.countryAustralia'), value: 'australia' },
    { label: t('settings.page.options.countryBangladesh'), value: 'bangladesh' },
]);

const stateOptions = computed(() => [
    { label: t('settings.page.options.stateGeorgia'), value: 'georgia' },
    { label: t('settings.page.options.stateFlorida'), value: 'florida' },
    { label: t('settings.page.options.stateHawaii'), value: 'hawaii' },
    { label: t('settings.page.options.stateDhaka'), value: 'dhaka' },
]);

const oldPassword = ref("");
const newPassword = ref("");
const confirmNewPassword = ref("");
const beneficiaryAccount = ref("");
const swiftCode = ref("");
const intermediarySwift = ref("");
const beneficiaryCity = ref("");
const beneficiaryPostalCode = ref("");
const beneficiaryStreet = ref("");
const beneficiaryCountry = ref("united-states-us");
const shippingState = ref("georgia");
const shippingCountry = ref("united-states-us");
const beneficiaryName = ref("");
const company = ref("");
const addressLine1 = ref("");
const addressLine2 = ref("");
const postalCode = ref("");
const city = ref("");
const phoneNumber = ref("");
const firstName = ref("");
const lastName = ref("");
const email = ref("");
const username = ref("");
const displayName = ref("");
const bio = ref("");
const location = ref("");
const website = ref("");

onMounted(() => {
    // ==================== HANDLE TAB SWITCHING ====================

    const tabButtons = document.querySelectorAll("[data-tab-button]");
    const tabs = document.querySelectorAll("[data-tab]");
    const sidebar = document.querySelector("[data-sidebar]");
    const tabContainer = document.querySelector("[data-tab-container]");
    const backButtons = document.querySelectorAll("[data-back-button]");
    const BREAKPOINT = 1010; // lg

    // Removes active classes from all tabs and tab buttons
    const deactivateAll = () => {
        tabs.forEach(tab => tab.classList.remove("tab-active"));
        tabButtons.forEach(btn => btn.classList.remove("active"));
    };

    /**
     * Activates a specific tab by name.
     * @param {string} tabName - Value of the data-tab / data-tab-button attribute.
     */
    const activateTab = tabName => {
        deactivateAll();
        const tab = document.querySelector(`[data-tab="${tabName}"]`);
        const btn = document.querySelector(`[data-tab-button="${tabName}"]`);
        if (tab) tab.classList.add("tab-active");
        if (btn) btn.classList.add("active");
        updateLayout();
    };

    /**
     * Adjusts the layout based on viewport width and active tab state.
     */
    const updateLayout = () => {
        const activeTab = document.querySelector("[data-tab].tab-active");
        const isMobile = window.innerWidth < BREAKPOINT;

        if (!isMobile) {
            sidebar.classList.remove("hidden");
            tabContainer.classList.remove("hidden");
            tabContainer.classList.add("flex");
            if (!activeTab) activateTab("account-information");
        } else if (activeTab) {
                sidebar.classList.add("hidden");
                tabContainer.classList.remove("hidden");
            tabContainer.classList.add("flex");
            } else {
                sidebar.classList.remove("hidden");
                tabContainer.classList.add("hidden");
            tabContainer.classList.remove("flex");
        }
    };

    // Tab buttons: activate the corresponding tab
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => activateTab(btn.dataset.tabButton));
    });

    // Back buttons: only in mobile view, deactivate all tabs
    backButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (window.innerWidth < BREAKPOINT) {
                deactivateAll();
                updateLayout();
            }
        });
    });

    // On mobile, start with no active tab so the sidebar is visible.
    if (window.innerWidth < BREAKPOINT) {
        deactivateAll();
    }
    updateLayout();

    window.addEventListener("resize", updateLayout);

    // Legacy dropdown logic removed in favor of UnifiedSelect

    // ==================== HANDLE TAB INPUT VALUE CHANGE ====================

    /**
     * Initializes the edit-mode toggle for a given tab.
     * @param {HTMLElement} tab - The tab container element with [data-tab] attribute.
     */
    function initTabEditButtons(tab) {
        const backBtn = tab.querySelector('[data-back-button]');
        const saveCancelContainer = tab.querySelector('[data-save-cancel-buttons-container]');
        const cancelBtn = tab.querySelector('[data-cancel-button]');
        const saveBtn = tab.querySelector('[data-save-button]');

        if (!backBtn || !saveCancelContainer || !cancelBtn || !saveBtn) return;

        const formFields = tab.querySelectorAll('input, select');
        let initialValues = new Map();

        function captureInitialValues() {
            initialValues.clear();
            formFields.forEach(field => initialValues.set(field, field.value));
        }

        function isUpdated() {
            for (let [field, initialVal] of initialValues.entries()) {
                if (field.value !== initialVal) return true;
            }
            return false;
        }

        function updateButtons() {
            if (isUpdated()) {
                backBtn.classList.add('hidden');
                saveCancelContainer.classList.remove('hidden');
            } else {
                backBtn.classList.remove('hidden');
                saveCancelContainer.classList.add('hidden');
            }
        }

        formFields.forEach(field => {
            field.addEventListener('input', updateButtons);
            field.addEventListener('change', updateButtons);
        });

        cancelBtn.addEventListener('click', () => {
            for (let [field, initialVal] of initialValues.entries()) {
                if (field.value !== initialVal) {
                    field.value = initialVal;
                    if (field.tagName === 'SELECT') {
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            }
            updateButtons();
        });

        saveBtn.addEventListener('click', () => {
            captureInitialValues();
            updateButtons();
        });

        captureInitialValues();
        updateButtons();
    }

    // Apply to all tabs
    document.querySelectorAll('[data-tab]').forEach(tab => initTabEditButtons(tab));
});
</script>