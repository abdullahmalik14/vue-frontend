<template>
    <div class="min-h-screen bg-[#F9FAFBE5] md:bg-transparent dark:bg-background-dark-app relative isolate py-16 px-4 md:px-10 font-sans antialiased text-slate-900">
        <div
            v-if="dashboardBgUrl"
            class="fixed inset-0 pointer-events-none -z-10 bg-cover bg-no-repeat w-full h-full"
            :style="{ backgroundImage: `url(${dashboardBgUrl})` }"
        />
        <div class="flex flex-col gap-24 relative">

            <!-- PAGE TITLE -->
            <div class="text-center relative py-12">
                <div class="absolute inset-0 flex items-center justify-center -z-10 opacity-30">
                    <div class="w-96 h-96 bg-indigo-200 rounded-full blur-[100px] animate-pulse"></div>
                </div>
                <h1
                    class="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 tracking-tighter drop-shadow-sm mb-4">
                    {{ t('demo.page.title') }}
                </h1>

            </div>


            <!-- ===== SECTION: MediaCardVariants ===== -->
            <div class="flex flex-col gap-12">
                <div class="flex flex-col gap-4">
                    <Heading :text="t('demo.page.mediaCards.mediaCardV1Title')" tag="h1" theme="defaultPrimaryHeading"
                        class="!text-black" />
                    <Paragraph :text="t('demo.page.mediaCards.mediaCardV1Description')"
                        class="!text-slate-500" />
                </div>

                <!-- 1. Creator: My Media -->
                <section class="flex flex-col gap-6">
                    <Heading :text="t('demo.page.mediaCards.creatorMyMedia')" tag="h2" theme="defaultSecondaryHeading"
                        class="!text-black" />
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        <MediaCardV1 v-for="item in myMediaList" :key="item.id" :media="item" variant="default"
                            @menu-action="handleAction" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.myMedia" />
                </section>

                <!-- 2. Fan: Continue Watching -->
                <section class="flex flex-col gap-6">
                    <Heading :text="t('demo.page.mediaCards.continueWatching')" tag="h2" theme="defaultSecondaryHeading"
                        class="!text-black" />
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        <MediaCardV1 :media="myMediaList[0]" variant="resume" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.resume" />
                </section>

                <!-- 3. Fan: Latest Media -->
                <section class="flex flex-col gap-6">
                    <Heading :text="t('demo.page.mediaCards.latestMedia')" tag="h2" theme="defaultSecondaryHeading"
                        class="!text-black" />
                    <div class="flex items-start gap-4">
                        <MediaCardV1 :media="latestMediaItem" variant="latest" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.latest" />
                </section>

                <!-- 4. Fan: Purchased Media -->
                <section class="flex flex-col gap-6">
                    <Heading :text="t('demo.page.mediaCards.purchasedMedia')" tag="h2" theme="defaultSecondaryHeading"
                        class="!text-black" />
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        <MediaCardV1 :media="purchasedMediaItem" variant="purchased" @menu-action="handleAction" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.purchased" />
                </section>

                <!-- 5. Fan: Grid View (Zoom Effect) -->
                <section class="flex flex-col gap-6">
                    <Heading :text="t('demo.page.mediaCards.gridView')" tag="h2" theme="defaultSecondaryHeading" class="!text-black" />
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-2 xl:gap-4 w-full gap-y-[5.5rem] md:gap-y-[5rem] xl:gap-y-[5.5rem] relative isolate">
                        <div v-for="item in gridMediaList" :key="item.id" class="min-w-0">
                            <MediaCardV1 :media="item" variant="grid" @menu-action="handleAction" />
                        </div>
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.gridView" />
                </section>

                <div class="">
                    <Heading :text="t('demo.page.mediaCards.mediaCardV2Title')" tag="h1" theme="defaultPrimaryHeading"
                        class="!text-black" />
                    <Paragraph :text="t('demo.page.mediaCards.mediaCardV2Description')"
                        class="!text-slate-500 mt-2" />
                </div>

                <div class="flex flex-col gap-8">
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-12 gap-x-4 relative isolate">
                        <div class="flex flex-col gap-3">
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{{ t('demo.page.mediaCards.gallery') }}</span>
                            <MediaCardV2 :media="galleryCard" />
                            <ShowCodeToggle :code="demoSnippets.mediaV2.gallery" />
                        </div>
                        <div class="flex flex-col gap-3">
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{{ t('demo.page.mediaCards.image') }}</span>
                            <MediaCardV2 :media="imageCard" />
                            <ShowCodeToggle :code="demoSnippets.mediaV2.image" />
                        </div>
                        <div class="flex flex-col gap-3">
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{{ t('demo.page.mediaCards.video') }}</span>
                            <MediaCardV2 :media="videoCard" />
                            <ShowCodeToggle :code="demoSnippets.mediaV2.video" />
                    </div>
                </div>
            </div>

                <!-- ProfileWrapper media tab — MediaCardV2 grid (Subscribe or Buy) -->
                <section class="flex flex-col gap-6">
                    <Heading
                        :text="t('profile.mediaTabs.subscription')"
                        tag="h2"
                        theme="custom"
                        no-wrap
                        add-class="text-xl leading-normal font-medium text-[#0C111D] pl-4 border-l border-[#0C111D]"
                    />
                    <div class="overflow-visible">
                        <ul class="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-4">
                            <MediaCardV2
                                :media="profileMediaCard"
                                aspect-class="aspect-[2/1.1522]"
                            />
                        </ul>
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV2.profileMediaGrid" />
                </section>
                    </div>

            <!-- ===== SECTION: DashboardTextInput (real project usages only) ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader :title="t('demo.page.sections.dashboardTextInput')" />

                <div class="flex flex-col gap-4 w-full max-w-[40rem]">
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.username"
                            :labelText="t('settings.page.account.username')"
                            showLabel
                            :placeholder="t('settings.page.account.usernamePlaceholder')"
                            :description="t('settings.page.account.usernameHelp')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.username" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.email"
                            :labelText="t('settings.page.account.email')"
                            showLabel
                            :placeholder="t('settings.page.account.emailPlaceholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.email" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                            <DashboardTextInput
                                v-model="dti.firstName"
                                :labelText="t('settings.page.account.firstName')"
                                showLabel
                                :placeholder="t('settings.page.account.firstNamePlaceholder')"
                                class="min-w-0 flex-1"
                            />
                            <DashboardTextInput
                                v-model="dti.lastName"
                                :labelText="t('settings.page.account.lastName')"
                                showLabel
                                :placeholder="t('settings.page.account.lastNamePlaceholder')"
                                class="min-w-0 flex-1"
                            />
                    </div>
                        <ShowCodeToggle :code="demoSnippets.icd.nameRow" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.newPassword"
                            :labelText="t('settings.page.password.password')"
                            showLabel
                            :placeholder="t('settings.page.password.newPlaceholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.newPassword" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.confirmNewPassword"
                            :labelText="t('settings.page.password.confirmLabel')"
                            showLabel
                            :placeholder="t('settings.page.password.confirmPlaceholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.confirmNewPassword" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                            <DashboardTextInput
                                v-model="dti.shippingEmail"
                                :labelText="t('settings.page.account.email')"
                                showLabel
                                :placeholder="t('settings.page.shipping.emailPlaceholder')"
                                class="min-w-0 flex-1"
                            />
                            <DashboardTextInput
                                v-model="dti.phoneNumber"
                                :labelText="t('settings.page.shipping.phoneNumber')"
                                showLabel
                                :placeholder="t('settings.page.shipping.phonePlaceholder')"
                                class="min-w-0 flex-1"
                            />
                    </div>
                        <ShowCodeToggle :code="demoSnippets.icd.shippingContact" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.company"
                            :labelText="t('settings.page.shipping.company')"
                            optionalLabel
                            :optionalLabelText="t('settings.page.shipping.optional')"
                            showLabel
                            :placeholder="t('settings.page.shipping.companyPlaceholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.company" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.addressLine1"
                            :labelText="t('settings.page.shipping.addressLine1')"
                            showLabel
                            :placeholder="t('settings.page.shipping.addressLine1Placeholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.addressLine1" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.addressLine2"
                            :labelText="t('settings.page.shipping.addressLine2')"
                            showLabel
                            :placeholder="t('settings.page.shipping.addressLine2Placeholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.addressLine2" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                            <DashboardTextInput
                                v-model="dti.postalCode"
                                :labelText="t('settings.page.shipping.postalCode')"
                                showLabel
                                :placeholder="t('settings.page.shipping.postalCodePlaceholder')"
                                class="min-w-0 flex-1"
                            />
                            <DashboardTextInput
                                v-model="dti.city"
                                :labelText="t('settings.page.shipping.city')"
                                showLabel
                                :placeholder="t('settings.page.shipping.cityPlaceholder')"
                                class="min-w-0 flex-1"
                            />
                    </div>
                        <ShowCodeToggle :code="demoSnippets.icd.postalCity" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.beneficiaryName"
                            :labelText="t('settings.page.payout.beneficiaryName')"
                            showLabel
                            :placeholder="t('settings.page.payout.beneficiaryNamePlaceholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.beneficiaryName" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.beneficiaryStreet"
                            :labelText="t('settings.page.payout.beneficiaryStreet')"
                            showLabel
                            :placeholder="t('settings.page.payout.beneficiaryStreetPlaceholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.beneficiaryStreet" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.beneficiaryCity"
                            :labelText="t('settings.page.payout.beneficiaryCity')"
                            showLabel
                            :placeholder="t('settings.page.payout.beneficiaryCityPlaceholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.beneficiaryCity" />
                                </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.beneficiaryPostalCode"
                            :labelText="t('settings.page.payout.beneficiaryPostalCode')"
                            showLabel
                            :placeholder="t('settings.page.payout.beneficiaryPostalPlaceholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.beneficiaryPostalCode" />
                            </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.beneficiaryAccount"
                            :labelText="t('settings.page.payout.beneficiaryAccount')"
                            showLabel
                            :placeholder="t('settings.page.payout.beneficiaryAccountPlaceholder')"
                            showTooltip
                            :tooltipText="t('settings.page.payout.beneficiaryAccountTooltip')"
                            tooltipPlacement="top"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.beneficiaryAccount" />
                        </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.swiftCode"
                            :labelText="t('settings.page.payout.swiftCode')"
                            showLabel
                            :placeholder="t('settings.page.payout.swiftPlaceholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.swiftCode" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.intermediarySwift"
                            :labelText="t('settings.page.payout.intermediarySwift')"
                            showLabel
                            :placeholder="t('settings.page.payout.swiftPlaceholder')"
                            :description="t('settings.page.payout.intermediaryHelp')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.intermediarySwift" />
                                </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex w-full flex-col gap-4 sm:flex-row">
                            <DashboardTextInput
                                v-model="dti.displayName"
                                :labelText="t('editProfile.page.fields.displayName')"
                                showLabel
                                :placeholder="t('editProfile.page.fields.displayNamePlaceholder')"
                                class="min-w-0 flex-1"
                            />
                            <DashboardTextInput
                                v-model="dti.age"
                                :labelText="t('editProfile.page.fields.age')"
                                showLabel
                                :placeholder="t('editProfile.page.fields.agePlaceholder')"
                                class="min-w-0 flex-1"
                            />
                                </div>
                        <ShowCodeToggle :code="demoSnippets.icd.displayNameAge" />
                            </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.bio"
                            :labelText="t('editProfile.page.fields.bio')"
                            showLabel
                            type="textarea"
                            textAreaRows="4"
                            :placeholder="t('editProfile.page.fields.bioPlaceholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.bio" />
                        </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.tipMessage"
                            :showLabel="false"
                            type="textarea"
                            textAreaRows="4"
                            :placeholder="t('editProfile.page.tipping.tipPlaceholder')"
                            :maxLength="200"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.tipMessage" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            v-model="dti.postMessage"
                            :showLabel="false"
                            type="textarea"
                            textAreaRows="3"
                            :placeholder="t('editProfile.page.tipping.postMessagePlaceholder')"
                            :maxLength="72"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.postMessage" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex w-full flex-col gap-4 lg:flex-row">
                            <DashboardTextInput v-model="dti.twitter" :labelText="t('editProfile.page.social.twitter')" showLabel :placeholder="t('editProfile.page.social.twitterPlaceholder')" class="min-w-0 flex-1" />
                            <DashboardTextInput v-model="dti.instagram" :labelText="t('editProfile.page.social.instagram')" showLabel :placeholder="t('editProfile.page.social.instagramPlaceholder')" class="min-w-0 flex-1" />
                    </div>
                        <ShowCodeToggle :code="demoSnippets.icd.socialTwitterIg" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex w-full flex-col gap-4 lg:flex-row">
                            <DashboardTextInput v-model="dti.wishlist" :labelText="t('editProfile.page.social.wishlist')" showLabel :placeholder="t('editProfile.page.social.wishlistPlaceholder')" class="min-w-0 flex-1" />
                            <DashboardTextInput v-model="dti.additionalUrl1" :labelText="t('editProfile.page.social.additionalUrl1')" showLabel :placeholder="t('editProfile.page.social.additionalUrl1Placeholder')" class="min-w-0 flex-1" />
                    </div>
                        <ShowCodeToggle :code="demoSnippets.icd.socialWishlistUrl1" />
                        </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            id="input_free_tokens"
                            type="number"
                            v-model="dti.freeTokens"
                            rightSpan
                            :rightSpanText="t('mediaUploader.addTier.tokensPerMonth')"
                            :show-controls="false"
                            :showLabel="false"
                            :wrapper-class="dtiRangeErrors.freeTokens ? '!border-error !pr-0' : '!pr-0'"
                            :show-errors="dtiRangeErrors.freeTokens"
                            :errors="dtiRangeErrors.freeTokens ? [{ message: t('mediaUploader.addTier.rangeError') }] : []"
                            rightSpanClass="text-base font-semibold whitespace-nowrap !px-[1.125rem] text-[#344054] dark:text-[#bdb7af]"
                            inputClass="text-[#0C111D] font-600 text-base"
                            errorMessageClass="text-[#FF4405] dark:text-[#ff571e]"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.freeTokens" />
                            </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            id="input_merch"
                            type="number"
                            v-model="dti.merchDiscount"
                            rightSpan
                            :rightSpanText="t('mediaUploader.addTier.percentOff')"
                            :show-controls="false"
                            :showLabel="false"
                            :wrapper-class="dtiRangeErrors.merchDiscount ? '!border-error !pr-0' : '!pr-0'"
                            :show-errors="dtiRangeErrors.merchDiscount"
                            :errors="dtiRangeErrors.merchDiscount ? [{ message: t('mediaUploader.addTier.rangeError') }] : []"
                            rightSpanClass="text-base font-semibold whitespace-nowrap !px-[1.125rem] text-[#344054] dark:text-[#bdb7af]"
                            inputClass="text-[#0C111D] font-600 text-base"
                            errorMessageClass="text-[#FF4405] dark:text-[#ff571e]"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.merchDiscount" />
                        </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            id="input_g"
                            type="textarea"
                            show-label
                            v-model="dti.mediaDescription"
                            textAreaRows="3"
                            label-text=""
                            :placeholder="t('mediaUploader.mediaDetails.descriptionPlaceholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.mediaDescription" />
                    </div>
                    <div class="flex flex-col gap-2 w-full sm:w-[380px]">
                        <Paragraph
                            :text="t('mediaUploader.publish.preorderPrice')"
                            font-size="text-[14px]"
                            font-weight="font-[400]"
                            font-color="text-text-quaternary"
                        />
                        <DashboardTextInput
                            id="input_preorder"
                            type="number"
                            v-model="dti.preOrderPrice"
                            :show-label="false"
                            rightSpan
                            :rightSpanText="t('mediaUploader.publish.preorderUsd')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.preorder" />
                                </div>
                    <div class="flex flex-col gap-2">
                        <DashboardTextInput
                            :placeholder="t('mediaUploader.addTier.tierNamePlaceholder')"
                            v-model="dti.tierName"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.tierName" />
                            </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex w-full flex-col gap-4 sm:flex-row sm:items-start">
                            <DashboardTextInput
                                id="tier_original_price"
                                type="number"
                                show-label
                                v-model="dti.tierOriginalPrice"
                                :label-text="t('mediaUploader.addTier.originalPrice')"
                                leftSpan
                                :leftSpanText="t('mediaUploader.addTier.usd')"
                                labelClass="text-gray-900 text-xs"
                                :show-controls="false"
                                class="min-w-0 flex-1"
                            />
                            <DashboardTextInput
                                id="tier_discount_price"
                                type="number"
                                show-label
                                v-model="dti.tierDiscountPrice"
                                :label-text="t('mediaUploader.addTier.discountedPrice')"
                                leftSpan
                                :leftSpanText="t('mediaUploader.addTier.usd')"
                                labelClass="text-gray-900 text-xs"
                                :show-controls="false"
                                class="min-w-0 flex-1"
                            />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.icd.tierPrices" />
                    </div>
                    <div class="flex flex-col gap-2 bg-[#272727] p-4">
                        <CheckoutNotes :show-avatars="true" v-model="dti.orderNotes" />
                        <ShowCodeToggle :code="demoSnippets.icd.orderNotes" />
                        
                    </div>
                    <div class="flex flex-col gap-2 bg-[#272727] p-4">
                        <CheckoutNotes :show-avatars="false" v-model="dti.orderNotesPlain" />
                        <ShowCodeToggle :code="demoSnippets.icd.orderNotesPlain" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <PlanInviteFansBar
                            v-model="dti.invitedPerformers"
                            :results="dti.invitePerformersList"
                            :max-items="5"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.planInviteFansBar" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <PlanCopyInviteLink :link="dti.inviteLink" />
                        <ShowCodeToggle :code="demoSnippets.icd.planCopyInviteLink" />
                            </div>
                    <div class="flex flex-col gap-2 max-w-xl">
                        <DashboardTextInput
                            :model-value="dti.tipNotes"
                            theme="tipCheckoutNotes"
                            :show-label="false"
                            :placeholder="t('checkout.tip.notesPlaceholder')"
                            right-span
                            :right-span-text="t('checkout.tip.charactersLeft', { count: Math.max(0, 300 - (dti.tipNotes?.length || 0)) })"
                            right-span-class="!text-[10px] !font-normal !leading-4 tracking-tight text-[#F9FAFB] opacity-70 whitespace-nowrap"
                            :right-icon="tipFaceSmileUrl"
                            right-icon-class="!opacity-100 [filter:brightness(0)_saturate(100%)_invert(72%)_sepia(64%)_saturate(483%)_hue-rotate(85deg)_brightness(101%)_contrast(101%)]"
                            @update:model-value="(val) => (dti.tipNotes = String(val || '').slice(0, 300))"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.tipCheckoutNotes" />
                        </div>
                    <div class="flex flex-col gap-2 bg-[#272727] p-4 max-w-xl">
                        <DashboardTextInput
                            v-model="dti.tipCustomAmount"
                            theme="tipCheckoutNotes"
                            type="number"
                            :show-label="false"
                            :show-controls="false"
                            :placeholder="t('checkout.tip.customAmountPlaceholder')"
                        />
                        <ShowCodeToggle :code="demoSnippets.icd.tipCustomAmount" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: Heading (distinct real styles only) ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader :title="t('demo.page.sections.heading')" />

                <div class="flex flex-col gap-6 w-full">
                    <!-- AuthLogin.vue — AuthHeading (white tracking) -->
                    <div class="flex flex-col gap-2">
                        <Heading :text="t('auth.login.button')" tag="h2" theme="AuthHeading" />
                        <ShowCodeToggle :code="demoSnippets.heading.authLogin" />
                        </div>

                    <!-- ProfileWrapper.vue — profileFeed -->
                    <div class="flex flex-col gap-2">
                        <Heading :text="t('profile.feed.monthMarch')" tag="h2" theme="profileFeed" />
                        <ShowCodeToggle :code="demoSnippets.heading.profileFeed" />
                    </div>

                    <!-- HomeHeroIntro.vue — italic hero -->
                    <div class="flex flex-col gap-2">
                        <Heading :text="t('home.hero.title')" tag="h1" theme="homeHeroTitle" no-wrap />
                        <ShowCodeToggle :code="demoSnippets.heading.homeHero" />
                        </div>

                    <!-- HomeFeatureTextBlock.vue — #344054 feature -->
                    <div class="flex flex-col gap-2">
                        <Heading :text="t('home.about.features.communities.title')" tag="h3" theme="homeFeatureTitle" no-wrap />
                        <ShowCodeToggle :code="demoSnippets.heading.homeFeature" />
                    </div>

                    <!-- ServiceTabsSection — largest home section title -->
                    <div class="flex flex-col gap-2">
                        <Heading :text="t('home.services.title')" tag="h2" theme="homeSectionTitleServices" no-wrap />
                        <ShowCodeToggle :code="demoSnippets.heading.homeSectionTitleServices" />
                        </div>

                    <!-- DitchMiddleman — white section title -->
                    <div class="flex flex-col gap-2">
                        <Heading :text="t('home.ditch.title')" tag="h2" theme="homeDitchTitle" no-wrap />
                        <ShowCodeToggle :code="demoSnippets.heading.homeDitchTitle" />
                    </div>

                    <!-- SettingsPage — gray tab -->
                    <div class="flex flex-col gap-2">
                        <Heading :text="t('settings.page.tabs.accountInformation')" tag="h2" theme="custom" no-wrap class="text-lg font-semibold text-[#667085] md:text-2xl dark:text-[#9e9589]" />
                        <ShowCodeToggle :code="demoSnippets.heading.settingsTab" />
                        </div>

                    <!-- SettingsPage — gold promote -->
                    <div class="flex flex-col gap-2">
                        <Heading :text="t('settings.page.account.promoteTitle')" tag="h3" theme="custom" no-wrap class="text-lg font-semibold text-[#9F8009] dark:text-[#f6d75f]" />
                        <ShowCodeToggle :code="demoSnippets.heading.settingsPromote" />
                    </div>

                    <!-- SettingsPage — bold #0C111D -->
                    <div class="flex flex-col gap-2">
                        <Heading :text="t('settings.page.payout.bankTitle')" tag="h3" theme="custom" no-wrap class="text-2xl leading-normal font-bold text-[#0C111D] dark:text-[#dbd8d3]" />
                        <ShowCodeToggle :code="demoSnippets.heading.settingsBank" />
                        </div>

                    <!-- EditProfilePage — page title #475467 -->
                    <div class="flex flex-col gap-2">
                        <Heading tag="h1" theme="custom" no-wrap add-class="text-sm font-semibold text-[#475467] md:text-3xl md:leading-[2.375rem] md:font-medium dark:text-[#b1aba0]" :text="t('editProfile.page.title')" />
                        <ShowCodeToggle :code="demoSnippets.heading.editProfileTitle" />
                    </div>

                    <!-- EditProfilePage — field label bold sm -->
                    <div class="flex flex-col gap-2">
                        <Heading tag="h3" theme="custom" no-wrap add-class="text-sm font-bold text-[#667085] dark:text-[#9e9589]" :text="t('editProfile.page.gallery.title')" />
                        <ShowCodeToggle :code="demoSnippets.heading.editProfileField" />
                        </div>

                    <!-- PlanDetail.vue — heading + tooltip icon -->
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2">
                            <Heading tag="h3" theme="custom" no-wrap add-class="text-base font-semibold text-[#0C111D] md:text-lg dark:text-[#dbd8d3]" :text="t('mediaUploader.addTier.freeTokens')" />
                            <BaseTooltip>
                                <Paragraph theme="custom" no-wrap add-class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]" :text="t('mediaUploader.addTier.freeTokensTooltip')" />
                            </BaseTooltip>
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.planField" />
                    </div>

                    <!-- MediaUploaderStepPreviewSettings — quaternary form label -->
                    <div class="flex flex-col gap-2">
                        <Heading tag="h4" theme="custom" no-wrap add-class="text-text-quaternary text-sm font-[700] leading-normal not-italic" :text="t('mediaUploader.preview.thumbnailSettings')" />
                        <ShowCodeToggle :code="demoSnippets.heading.mediaUploaderForm" />
                        </div>

                    <!-- MediaUploader.vue — primary-text -->
                    <div class="flex flex-col gap-2">
                        <Heading tag="h3" theme="custom" no-wrap add-class="text-sm font-semibold leading-5 text-primary-text dark:text-text" :text="t('mediaUploader.shell.uploadMedia')" />
                        <ShowCodeToggle :code="demoSnippets.heading.mediaUploaderShell" />
                    </div>

                    <!-- MediaFilterPopup.vue — medium-text -->
                    <div class="flex flex-col gap-2">
                        <Heading :text="t('mediaUploader.library.filterPopup.title')" tag="h2" theme="custom" no-wrap add-class="text-lg font-medium text-medium-text dark:text-timberwolf" />
                        <ShowCodeToggle :code="demoSnippets.heading.mediaFilterPopup" />
                        </div>

                    <!-- PublishDatePicker.vue — black font-normal -->
                    <div class="flex flex-col gap-2">
                        <Heading tag="h2" theme="custom" no-wrap add-class="text-black text-sm font-normal not-italic leading-none [text-wrap:balance]" :text="t('mediaUploader.publishDatePicker.defaultLabel')" />
                        <ShowCodeToggle :code="demoSnippets.heading.publishDatePicker" />
                    </div>

                    <!-- MediaUploaderPage.vue — dark-gray empty title -->
                    <div class="flex flex-col gap-2">
                        <Heading :text="t('mediaUploader.empty.title')" tag="h1" theme="custom" no-wrap add-class="shrink-0 text-[1.875rem] leading-normal font-medium text-dark-gray dark:text-beige-text" />
                        <ShowCodeToggle :code="demoSnippets.heading.mediaEmptyTitle" />
                    </div>

                    <!-- ProfileMediaTabHeading.vue — border accent + View All count (ProfileWrapper) -->
                    <div class="flex flex-col gap-2">
                        <div class="flex gap-3.5">
                            <Heading :text="t('profile.mediaTabs.payToView')" tag="h2" theme="custom" no-wrap add-class="text-xl leading-normal font-medium text-[#e9e5d3] pl-4 border-l border-[#e9e5d3]" />
                            <div class="flex items-center gap-1">
                                <span class="text-sm font-medium text-[#07F468]">{{ t('profile.labels.viewAll') }}</span>
                                <span class="text-sm leading-normal text-[#07F468] self-start">11</span>
                        </div>
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.profileMediaTab" />
                    </div>

                    <!-- CheckoutBeforeTipPopup — popup title (two lines); demo left like other Heading samples — popup keeps text-center -->
                    <div class="flex flex-col gap-2">
                        <Heading
                            tag="h2"
                            theme="custom"
                            no-wrap
                            :text="t('checkout.tip.title')"
                            add-class="text-left text-[#0C111D] text-3xl font-semibold leading-9 whitespace-pre-line dark:text-[#F9FAFB]"
                        />
                        <ShowCodeToggle :code="demoSnippets.heading.tipTitle" />
                    </div>

                    <!-- CheckoutBeforeTipPopup — choose models -->
                    <div class="flex flex-col gap-2">
                        <Heading
                            tag="h3"
                            theme="custom"
                            no-wrap
                            :text="t('checkout.tip.chooseModels')"
                            add-class="text-left text-[#344054] text-base font-semibold leading-6 dark:text-[#EAECF0]"
                        />
                        <ShowCodeToggle :code="demoSnippets.heading.tipChooseModels" />
                        </div>

                    <!-- CheckoutBeforeTipPopup — select tip below -->
                    <div class="flex flex-col gap-2">
                        <Heading
                            tag="h3"
                            theme="custom"
                            no-wrap
                            :text="t('checkout.tip.selectTipBelow')"
                            add-class="text-left text-[#0C111D] text-base font-semibold leading-6 dark:text-[#F9FAFB]"
                        />
                        <ShowCodeToggle :code="demoSnippets.heading.tipSelectBelow" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: Validation icon + message (real project lists) ===== -->
            <ValidationIconMessageDemo />

            <!-- ===== SECTION: Paragraph (distinct real styles only) ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader :title="t('demo.page.sections.paragraph')" />

                <div class="flex flex-col gap-6 w-full">
                    <!-- HomeHeroIntro.vue — italic tagline -->
                    <div class="flex flex-col gap-2">
                        <Paragraph :text="t('home.hero.tagline')" theme="homeHeroTagline" no-wrap />
                        <ShowCodeToggle :code="demoSnippets.paragraph.homeHeroTagline" />
                        </div>

                    <!-- HomeHeroIntro.vue — hero body -->
                    <div class="flex flex-col gap-2">
                        <Paragraph :text="t('home.hero.description')" theme="homeHeroBody" no-wrap />
                        <ShowCodeToggle :code="demoSnippets.paragraph.homeHeroBody" />
                    </div>

                    <!-- HomeFeatureTextBlock.vue — #344054 -->
                    <div class="flex flex-col gap-2">
                        <Paragraph :text="t('home.about.features.communities.description')" theme="homeFeatureBody" no-wrap />
                        <ShowCodeToggle :code="demoSnippets.paragraph.homeFeatureBody" />
                        </div>

                    <!-- ServiceTabsSection — centered subtitle -->
                    <div class="flex flex-col gap-2">
                        <Paragraph :text="t('home.services.subtitle')" theme="homeSectionSubtitleServices" no-wrap />
                        <ShowCodeToggle :code="demoSnippets.paragraph.homeSectionSubtitleServices" />
                    </div>

                    <!-- ServiceTabsSection — panel body #101828 -->
                    <div class="flex flex-col gap-2">
                        <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.mediaMerch.ecosystem.body')" />
                        <ShowCodeToggle :code="demoSnippets.paragraph.homeServicePanelBody" />
                        </div>

                    <!-- DitchMiddleman — white subtitle -->
                    <div class="flex flex-col gap-2">
                        <Paragraph :text="t('home.ditch.subtitle')" theme="homeDitchSubtitle" no-wrap />
                        <ShowCodeToggle :code="demoSnippets.paragraph.homeDitchSubtitle" />
                    </div>

                    <!-- SettingsPage — body #344054 xs -->
                    <div class="flex flex-col gap-2">
                        <Paragraph :text="t('settings.page.account.linkXBody')" no-wrap font-size="" font-weight="" font-color="" class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb7af]" />
                        <ShowCodeToggle :code="demoSnippets.paragraph.settingsBody" />
                        </div>

                    <!-- EditProfilePage — helper #667085 -->
                    <div class="flex flex-col gap-2">
                        <Paragraph theme="custom" no-wrap add-class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]" :text="t('editProfile.page.gallery.empty')" />
                        <ShowCodeToggle :code="demoSnippets.paragraph.editProfileEmpty" />
                    </div>

                    <!-- EditProfilePage — formats #475467 -->
                    <div class="flex flex-col gap-2">
                        <Paragraph theme="custom" no-wrap add-class="text-xs leading-normal text-[#475467] dark:text-[#b1aba0]" :text="t('editProfile.page.gallery.formats')" />
                        <ShowCodeToggle :code="demoSnippets.paragraph.editProfileFormats" />
                        </div>

                    <!-- EditProfilePage — tooltip white semibold -->
                    <div class="flex flex-col gap-2">
                        <Paragraph theme="custom" no-wrap add-class="text-xs leading-normal font-semibold text-white dark:text-[#e8e6e3]" :text="t('editProfile.page.tipping.usernameTooltip')" />
                        <ShowCodeToggle :code="demoSnippets.paragraph.editProfileTooltip" />
                    </div>

                    <!-- MediaUploader — quaternary label -->
                    <div class="flex flex-col gap-2">
                        <Paragraph :text="t('mediaUploader.publish.preorderPrice')" font-size="text-[14px]" font-weight="font-[400]" font-color="text-text-quaternary" />
                        <ShowCodeToggle :code="demoSnippets.paragraph.mediaPreorder" />
                        </div>

                    <!-- MediaUploaderPage — dark-gray empty -->
                    <div class="flex flex-col gap-2">
                        <Paragraph :text="t('mediaUploader.empty.description')" theme="custom" no-wrap add-class="text-base font-normal text-center text-dark-gray dark:text-beige-text" />
                        <ShowCodeToggle :code="demoSnippets.paragraph.mediaEmpty" />
                    </div>

                    <!-- PlanPublishSetting — #0C111D -->
                    <div class="flex flex-col gap-2">
                        <Paragraph theme="custom" no-wrap add-class="text-base text-[#0C111D] dark:text-[#dbd8d3]" :text="t('plan.publish.description')" />
                        <ShowCodeToggle :code="demoSnippets.paragraph.planPublish" />
                        </div>

                    <!-- MediaOrderSummaryList.vue — #07F468 -->
                    <div class="flex flex-col gap-2">
                        <Paragraph theme="custom" no-wrap class="inline text-[16px] font-semibold leading-6 text-[#07F468]" :text="t('thankYou.price')" />
                        <ShowCodeToggle :code="demoSnippets.paragraph.thankYouPrice" />
                    </div>

                    <!-- CheckoutBeforeTipPopup — charge line gray -->
                    <div class="flex flex-col gap-2">
                        <Paragraph
                            theme="custom"
                            no-wrap
                            :text="t('checkout.tip.chargePrefix')"
                            add-class="text-[#667085] text-sm font-normal tracking-tight dark:text-[#98A2B3]"
                        />
                        <ShowCodeToggle :code="demoSnippets.paragraph.tipChargeGray" />
                        </div>

                    <!-- CheckoutBeforeTipPopup — charge amount green -->
                    <div class="flex flex-col gap-2">
                        <Paragraph
                            theme="custom"
                            no-wrap
                            :text="t('checkout.tip.amount5')"
                            add-class="text-[#07F468] text-sm font-normal tracking-tight"
                        />
                        <ShowCodeToggle :code="demoSnippets.paragraph.tipChargeGreen" />
                    </div>

                    <!-- DashboardTextInput left span — AddTierPopup USD$ -->
                    <div class="flex flex-col gap-2">
                        <Paragraph :text="t('mediaUploader.addTier.usd')" fontSize="text-base" fontWeight="font-semibold" fontColor="" layoutClass="whitespace-nowrap" />
                        <ShowCodeToggle :code="demoSnippets.paragraph.leftSpan" />
                        </div>

                    <!-- DashboardTextInput left span — PayoutSettingsStep2 -->
                    <div class="flex flex-col gap-2">
                        <Paragraph :text="t('payout.settings.step2.usdPrefix')" class="!font-normal text-base text-[#344054] dark:text-[#bdb8af] pr-2" fontSize="text-base" fontWeight="font-semibold" fontColor="" layoutClass="whitespace-nowrap" />
                        <ShowCodeToggle :code="demoSnippets.paragraph.leftSpanPayout" />
                    </div>

                    <!-- DashboardTextInput right span — AddTierPopup % off -->
                    <div class="flex flex-col gap-2">
                        <Paragraph :text="t('mediaUploader.addTier.percentOff')" class="text-sm font-semibold whitespace-nowrap text-medium-text dark:text-medium-beige" fontSize="text-base" fontWeight="font-medium" fontColor="" layoutClass="whitespace-nowrap" />
                        <ShowCodeToggle :code="demoSnippets.paragraph.rightSpan" />
                        </div>

                    <!-- DashboardTextInput right span — preorder USD, no extra class -->
                    <div class="flex flex-col gap-2">
                        <Paragraph :text="t('mediaUploader.publish.preorderUsd')" fontSize="text-base" fontWeight="font-medium" fontColor="" layoutClass="whitespace-nowrap" />
                        <ShowCodeToggle :code="demoSnippets.paragraph.rightSpanUsd" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: CheckboxGroup ===== -->
            <CheckboxGroupDemo />

            <!-- ===== SECTION: CheckboxSwitch ===== -->
            <CheckboxSwitchDemo />

            <!-- ===== SECTION: NotificationCard ===== -->
            <NotificationCardDemo />

            <!-- ===== SECTION: RadioGroup ===== -->
            <RadioGroupDemo />

            <!-- ===== SECTION: SubscriptionPlanCard ===== -->
            <SubscriptionPlanCardDemo />

            <!-- ===== SECTION: SubscriptionCard ===== -->
            <SubscriptionCardsDemo />

            <!-- ===== SECTION: Payment Methods ===== -->
            <PaymentMethodsDemo />

            <!-- ===== SECTION: ThumbnailUploader ===== -->
            <ThumbnailUploaderDemo />

            <!-- ===== SECTION: Tabs ===== -->
            <TabsDemo />

            <!-- ===== SECTION: TierCard ===== -->
            <TierCardsDemo />

            <!-- ===== SECTION: EventCard ===== -->
            <EventCardsDemo />

            <!-- ===== SECTION: Spinner ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader :title="t('demo.page.sections.spinner')" />
                <LoadingSpinnerDemo />
            </section>

            <!-- ===== SECTION: Buttons (real project usages) ===== -->
            <ButtonsDemo />

            <!-- ===== SECTION: Other Components ===== -->
            <section class="flex flex-col gap-10">
                <DemoSectionHeader :title="t('demo.page.sections.otherComponents')" />
                <CalendarChatDemo />
                <section class="flex flex-col gap-6">
                <UploadingProgressBar :progress="uploadProgressDemo" :image-src="uploadPreviewDemoUrl" />
                <ShowCodeToggle :code="uploadProgressBarSnippet" />
            </section>
            <section class="flex flex-col gap-6">
                <CloudflareSuccess />
                <ShowCodeToggle :code="cloudflareSuccessSnippet" />
            </section>
            <section class="flex flex-col gap-6">
                <Cookies />
                <ShowCodeToggle :code="demoSnippets.cookies.default" />
            </section>
                <ActionMenuDropdownDemo />
                <CartComponentsDemo />
                <CheckoutSectionHeadersDemo />
            <PlanPageDemo />
                <MediaUploaderComponentsDemo />
            <SettingsComponentsDemo />
            <EditProfileComponentsDemo />
            <ProfileSectionComponentsDemo />
                <TipComponentsDemo />
            </section>

                    </div>
                </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

// Components
import MediaCardV1 from '@/components/ui/media/media-cards/MediaCardV1.vue';
import MediaCardV2 from '@/components/ui/media/media-cards/MediaCardV2.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import CheckoutNotes from '@/dev/components/checkout/reusable/CheckoutNotes.vue';
import PlanInviteFansBar from '@/dev/components/plan/parts/PlanInviteFansBar.vue';
import PlanCopyInviteLink from '@/dev/components/plan/parts/PlanCopyInviteLink.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import BaseTooltip from '@/dev/components/plan/parts/BaseTooltip.vue';
// import SubscriptionCard from '@/dev/components/profile/SubscriptionCard.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import CheckboxGroupDemo from '@/dev/templates/demo/demo-audit/CheckboxGroupDemo.vue';
import CheckboxSwitchDemo from '@/dev/templates/demo/demo-audit/CheckboxSwitchDemo.vue';
import NotificationCardDemo from '@/dev/templates/demo/demo-audit/NotificationCardDemo.vue';
import RadioGroupDemo from '@/dev/templates/demo/demo-audit/RadioGroupDemo.vue';
import CalendarChatDemo from '@/dev/templates/demo/demo-audit/CalendarChatDemo.vue';
import SettingsComponentsDemo from '@/dev/templates/demo/demo-audit/SettingsComponentsDemo.vue';
import EditProfileComponentsDemo from '@/dev/templates/demo/demo-audit/EditProfileComponentsDemo.vue';
import UploadingProgressBar from '@/components/ui/progress/UploadingProgressBar.vue';
import CloudflareSuccess from '@/dev/components/ui/badge/dashboard/CloudflareSuccess.vue';
import ThumbnailUploaderDemo from '@/dev/templates/demo/demo-audit/ThumbnailUploaderDemo.vue';
import MediaUploaderComponentsDemo from '@/dev/templates/demo/demo-audit/MediaUploaderComponentsDemo.vue';
import TabsDemo from '@/dev/templates/demo/demo-audit/TabsDemo.vue';
import ActionMenuDropdownDemo from '@/dev/templates/demo/demo-audit/ActionMenuDropdownDemo.vue';
import LoadingSpinnerDemo from '@/dev/templates/demo/demo-audit/LoadingSpinnerDemo.vue';
import SubscriptionCardsDemo from '@/dev/templates/demo/demo-audit/SubscriptionCardsDemo.vue';
import PaymentMethodsDemo from '@/dev/templates/demo/demo-audit/PaymentMethodsDemo.vue';
import CheckoutSectionHeadersDemo from '@/dev/templates/demo/demo-audit/CheckoutSectionHeadersDemo.vue';
import PlanPageDemo from '@/dev/templates/demo/demo-audit/PlanPageDemo.vue';
import TierCardsDemo from '@/dev/templates/demo/demo-audit/TierCardsDemo.vue';
import EventCardsDemo from '@/dev/templates/demo/demo-audit/EventCardsDemo.vue';
import ProfileSectionComponentsDemo from '@/dev/templates/demo/demo-audit/ProfileSectionComponentsDemo.vue';
import ButtonsDemo from '@/dev/templates/demo/demo-audit/ButtonsDemo.vue';
import ValidationIconMessageDemo from '@/dev/templates/demo/demo-audit/ValidationIconMessageDemo.vue';

const { t } = useI18n();
const uploadProgressDemo = ref(45);
const { url: uploadPreviewDemoUrl } = useAssetUrl('profile.uploadPreview');
const { url: tipFaceSmileUrl } = useAssetUrl('checkout.demo.faceSmile');
const uploadProgressBarSnippet = `import UploadingProgressBar from '@/components/ui/progress/UploadingProgressBar.vue';

<UploadingProgressBar
  v-if="isUploading"
  :progress="uploadProgress"
  :imageSrc="tempUploadSrc"
/>

<!-- Same as EditProfilePage.vue -->`;
const cloudflareSuccessSnippet = `import CloudflareSuccess from '@/dev/components/ui/badge/dashboard/CloudflareSuccess.vue';

<CloudflareSuccess />`;
const { url: dashboardBgUrl } = useAssetUrl('dashboard.bg.gradient');
const { url: demoPosterUrl } = useAssetUrl('media.demo.poster');
const { url: demoSampleBgUrl } = useAssetUrl('media.demo.sampleBg');
const { url: demoAvatarUrl } = useAssetUrl('media.demo.avatar');
const { url: demoSampleVideoUrl } = useAssetUrl('media.demo.sampleVideo');
import CartComponentsDemo from '@/dev/templates/demo/demo-audit/CartComponentsDemo.vue';
import TipComponentsDemo from '@/dev/templates/demo/demo-audit/TipComponentsDemo.vue';
import Cookies from '@/components/ui/badge/dashboard/Cookies.vue';
const vals = reactive({
    // DashboardTextInput
    icd1: '', icd2: '', icd3: '', icd4: '', icd5: '', icd6: '',
    icd7: '', icd8: '', icd9: '', icd10: '', icd11: '', icd12: '',
    // BaseInput
    bi1: '', bi2: '', bi3: 'Readonly Text', bi4: 5, bi5: '', bi6: '', bi7: '', bi8: 'bad@', bi9: 'good@email.com', bi10: '',
    // AuthTextInput
    ia1: '', ia2: '', ia3: '', ia4: '', ia5: '', ia6: '', ia7: 'disabled text', ia8: '', ia9: '', ia10: '',
    // CodeInput
    ci1: '', ci2: '', ci3: '', ci4: '', ci5: '', ci6: '',
});

// ===== Media demo data (assetMap + i18n ? no hardcoded URLs) =====
const myMediaList = computed(() => [
    {
        id: 1,
        type: 'video',
        videoUrl: demoSampleVideoUrl.value,
        poster: demoPosterUrl.value,
        title: t('mediaCard.demo.titles.walkInPark'),
        duration: '14:55',
        timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
        likes: 0,
        views: 4,
        creatorName: t('mediaCard.demo.creators.creatorAllen'),
        avatar: demoAvatarUrl.value,
    },
]);

const latestMediaItem = computed(() => ({
    id: 3,
    type: 'video',
    videoUrl: demoSampleVideoUrl.value,
    poster: demoPosterUrl.value,
    title: t('mediaCard.demo.titles.mySecondComingSoon'),
    duration: '14:55',
    timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
    likes: 0,
    views: 4,
    creatorName: t('mediaCard.demo.creators.creatorAllen'),
    avatar: demoAvatarUrl.value,
}));

const purchasedMediaItem = computed(() => ({
    id: 4,
    type: 'video',
    videoUrl: demoSampleVideoUrl.value,
    poster: demoPosterUrl.value,
    title: t('mediaCard.demo.titles.walkInParkToday'),
    duration: '14:55',
    timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
    likes: 0,
    views: 4,
    creatorName: t('mediaCard.demo.creators.mistressJessica'),
    avatar: demoAvatarUrl.value,
}));

const gridMediaList = computed(() => [
    {
        id: 101,
        type: 'image',
        poster: demoSampleBgUrl.value,
        title: t('mediaCard.demo.titles.walkInParkMorning'),
        duration: '',
        timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
        likes: 0,
        views: 4,
        creatorName: t('mediaCard.demo.creators.mistressJessica'),
        avatar: demoAvatarUrl.value,
    },
    {
        id: 102,
        type: 'video',
        videoUrl: demoSampleVideoUrl.value,
        poster: demoSampleBgUrl.value,
        title: t('mediaCard.demo.titles.walkInParkMorning'),
        duration: '14:55',
        timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
        likes: 0,
        views: 4,
        creatorName: t('mediaCard.demo.creators.mistressJessica'),
        avatar: demoAvatarUrl.value,
    },
    {
        id: 103,
        type: 'gallery',
        poster: demoSampleBgUrl.value,
        title: t('mediaCard.demo.titles.walkInParkMorning'),
        duration: '',
        timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
        likes: 0,
        views: 4,
        galleryCount: 7,
        creatorName: t('mediaCard.demo.creators.mistressJessica'),
        avatar: demoAvatarUrl.value,
    },
]);

const galleryCard = computed(() => ({
    id: 1,
    type: 'gallery',
    poster: demoSampleBgUrl.value,
    title: t('mediaCard.titles.walkInParkMorning'),
    timeAgo: t('mediaCard.timeAgo.fiveMonths'),
    likes: 0,
    views: 4,
    galleryCount: 7,
    isLocked: true,
    showTag: true,
    tagText: t('mediaCard.tags.subscriberExclusive'),
    tagColor: 'green',
}));

const imageCard = computed(() => ({
    id: 2,
    type: 'image',
    poster: demoSampleBgUrl.value,
    title: t('mediaCard.titles.walkInParkMorning'),
    timeAgo: t('mediaCard.timeAgo.fiveMonths'),
    likes: 0,
    views: 4,
    isLocked: false,
    showTag: true,
    tagText: t('mediaCard.tags.subscribeOrBuy'),
    tagColor: 'pink',
}));

const videoCard = computed(() => ({
    id: 3,
    type: 'video',
    videoUrl: demoSampleVideoUrl.value,
    poster: demoPosterUrl.value,
    title: t('mediaCard.titles.walkInParkMorning'),
    duration: '14:55',
    timeAgo: t('mediaCard.timeAgo.fiveMonths'),
    likes: 0,
    views: 4,
    isLocked: true,
    showTag: false,
    tagText: '',
    tagColor: 'green',
}));

/** ProfileWrapper.vue media-tab — same MediaCardV2 shape */
const profileMediaCard = computed(() => ({
    type: 'video',
    poster: demoSampleBgUrl.value,
    videoUrl: demoSampleVideoUrl.value,
    duration: '14:09',
    timeAgo: t('profile.mediaTabs.timeAgo'),
    likes: '0',
    views: '0',
    title: t('profile.mediaTabs.title'),
    showTag: true,
    tagText: t('profile.labels.subscribeOrBuy'),
    tagColor: 'pink',
            id: 1,
}));

const demoSnippets = {
    mediaV1: {
        myMedia: `<!-- Template -->\n<MediaCardV1 \n  v-for="item in myMediaList" \n  :key="item.id" \n  :media="item" \n  variant="default" \n  @menu-action="handleAction" \n/>\n\n<!-- Script Data -->\nconst { url: demoPosterUrl } = useAssetUrl('media.demo.poster');\nconst { url: demoAvatarUrl } = useAssetUrl('media.demo.avatar');\nconst { url: demoSampleVideoUrl } = useAssetUrl('media.demo.sampleVideo');\n\nconst myMediaList = computed(() => [{\n  id: 1,\n  type: 'video',\n  videoUrl: demoSampleVideoUrl.value,\n  poster: demoPosterUrl.value,\n  title: t('mediaCard.demo.titles.walkInPark'),\n  duration: '14:55',\n  timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  creatorName: t('mediaCard.demo.creators.creatorAllen'),\n  avatar: demoAvatarUrl.value,\n}]);\n\nconst handleAction = (action) => {\n  console.log("Action triggered:", action);\n};`,
        resume: `<!-- Template -->\n<MediaCardV1 \n  :media="myMediaList[0]" \n  variant="resume" \n/>`,
        latest: `<!-- Template -->\n<MediaCardV1 \n  :media="latestMediaItem" \n  variant="latest" \n/>\n\n<!-- Script Data -->\nconst latestMediaItem = computed(() => ({\n  id: 3,\n  type: 'video',\n  videoUrl: demoSampleVideoUrl.value,\n  poster: demoPosterUrl.value,\n  title: t('mediaCard.demo.titles.mySecondComingSoon'),\n  duration: '14:55',\n  timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  creatorName: t('mediaCard.demo.creators.creatorAllen'),\n  avatar: demoAvatarUrl.value,\n}));`,
        purchased: `<!-- Template -->\n<MediaCardV1 \n  :media="purchasedMediaItem" \n  variant="purchased" \n  @menu-action="handleAction" \n/>\n\n<!-- Script Data -->\nconst purchasedMediaItem = computed(() => ({\n  id: 4,\n  type: 'video',\n  videoUrl: demoSampleVideoUrl.value,\n  poster: demoPosterUrl.value,\n  title: t('mediaCard.demo.titles.walkInParkToday'),\n  duration: '14:55',\n  timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  creatorName: t('mediaCard.demo.creators.mistressJessica'),\n  avatar: demoAvatarUrl.value,\n}));`,
        gridView: `<!-- Template -->\n<div v-for="item in gridMediaList" :key="item.id" class="min-w-0">\n  <MediaCardV1\n    :media="item"\n    variant="grid"\n    @menu-action="handleAction"\n  />\n</div>\n\n<!-- Script Data -->\nconst { url: demoSampleBgUrl } = useAssetUrl('media.demo.sampleBg');\n\nconst gridMediaList = computed(() => [{\n  id: 101,\n  type: 'image',\n  poster: demoSampleBgUrl.value,\n  title: t('mediaCard.demo.titles.walkInParkMorning'),\n  timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  creatorName: t('mediaCard.demo.creators.mistressJessica'),\n  avatar: demoAvatarUrl.value,\n}, {\n  id: 102,\n  type: 'video',\n  videoUrl: demoSampleVideoUrl.value,\n  poster: demoSampleBgUrl.value,\n  title: t('mediaCard.demo.titles.walkInParkMorning'),\n  duration: '14:55',\n  timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  creatorName: t('mediaCard.demo.creators.mistressJessica'),\n  avatar: demoAvatarUrl.value,\n}]);`,
    },
    mediaV2: {
        gallery: `<!-- Template -->\n<MediaCardV2 :media="galleryCard" />\n\n<!-- Script Data -->\nconst { url: sampleBgUrl } = useAssetUrl('media.demo.sampleBg');\n\nconst galleryCard = computed(() => ({\n  id: 1,\n  type: 'gallery',\n  poster: sampleBgUrl.value,\n  title: t('mediaCard.titles.walkInParkMorning'),\n  timeAgo: t('mediaCard.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  galleryCount: 7,\n  isLocked: true,\n  showTag: true,\n  tagText: t('mediaCard.tags.subscriberExclusive'),\n  tagColor: 'green'\n}));`,
        image: `<!-- Template -->\n<MediaCardV2 :media="imageCard" />\n\n<!-- Script Data -->\nconst imageCard = computed(() => ({\n  id: 2,\n  type: 'image',\n  poster: sampleBgUrl.value,\n  title: t('mediaCard.titles.walkInParkMorning'),\n  timeAgo: t('mediaCard.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  isLocked: false,\n  showTag: true,\n  tagText: t('mediaCard.tags.subscribeOrBuy'),\n  tagColor: 'pink'\n}));`,
        video: `<!-- Template -->\n<MediaCardV2 :media="videoCard" />\n\n<!-- Script Data -->\nconst { url: posterUrl } = useAssetUrl('media.demo.poster');\nconst { url: sampleVideoUrl } = useAssetUrl('media.demo.sampleVideo');\n\nconst videoCard = computed(() => ({\n  id: 3,\n  type: 'video',\n  videoUrl: sampleVideoUrl.value,\n  poster: posterUrl.value,\n  title: t('mediaCard.titles.walkInParkMorning'),\n  duration: '14:55',\n  timeAgo: t('mediaCard.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  isLocked: true,\n  showTag: false,\n  tagText: '',\n  tagColor: 'green'\n}));`,
        profileMediaGrid: `import MediaCardV2 from '@/components/ui/media/media-cards/MediaCardV2.vue';

<!-- ProfileWrapper.vue — media tab -->
<ul class="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-4">
  <MediaCardV2
    v-for="(entry, index) in mediaGridCards"
    :key="index"
    :media="entry.card"
    aspect-class="aspect-[2/1.1522]"
  />
</ul>

<!-- card shape -->
{
  type: 'video',
  poster: item.image,
  videoUrl: item.video,
  duration: item.duration,
  timeAgo: item.timeAgo,
  likes: item.likes,
  views: item.views,
  title: item.title,
  showTag: true,
  tagText: t('profile.labels.subscribeOrBuy'),
  tagColor: 'pink',
}`,
    },
    heading: {
        authLogin: `<!-- AuthLogin.vue -->\n<Heading :text="t('auth.login.button')" tag="h2" theme="AuthHeading" />`,
        profileFeed: `<Heading :text="t('profile.feed.monthMarch')" tag="h2" theme="profileFeed" />`,
        homeHero: `<!-- HomeHeroIntro.vue -->\n<Heading :text="t('home.hero.title')" tag="h1" theme="homeHeroTitle" no-wrap />`,
        homeFeature: `<!-- HomeFeatureTextBlock.vue -->\n<Heading :text="t('home.about.features.communities.title')" tag="h3" theme="homeFeatureTitle" no-wrap />`,
        homeSectionTitleServices: `<!-- ServiceTabsSection.vue -->\n<Heading :text="t('home.services.title')" tag="h2" theme="homeSectionTitleServices" no-wrap />`,
        homeDitchTitle: `<!-- DitchMiddleman.vue -->\n<Heading :text="t('home.ditch.title')" tag="h2" theme="homeDitchTitle" no-wrap />`,
        settingsTab: `<!-- SettingsPage.vue -->\n<Heading\n  :text="t('settings.page.tabs.accountInformation')"\n  tag="h2"\n  theme="custom"\n  no-wrap\n  class="text-lg font-semibold text-[#667085] md:text-2xl dark:text-[#9e9589]"\n/>`,
        settingsPromote: `<!-- SettingsPage.vue -->\n<Heading\n  :text="t('settings.page.account.promoteTitle')"\n  tag="h3"\n  theme="custom"\n  no-wrap\n  class="text-lg font-semibold text-[#9F8009] dark:text-[#f6d75f]"\n/>`,
        settingsBank: `<!-- SettingsPage.vue -->\n<Heading\n  :text="t('settings.page.payout.bankTitle')"\n  tag="h3"\n  theme="custom"\n  no-wrap\n  class="text-2xl leading-normal font-bold text-[#0C111D] dark:text-[#dbd8d3]"\n/>`,
        editProfileTitle: `<!-- EditProfilePage.vue -->\n<Heading\n  tag="h1"\n  theme="custom"\n  no-wrap\n  add-class="text-sm font-semibold text-[#475467] md:text-3xl md:leading-[2.375rem] md:font-medium dark:text-[#b1aba0]"\n  :text="t('editProfile.page.title')"\n/>`,
        editProfileField: `<!-- EditProfilePage.vue -->\n<Heading\n  tag="h3"\n  theme="custom"\n  no-wrap\n  add-class="text-sm font-bold text-[#667085] dark:text-[#9e9589]"\n  :text="t('editProfile.page.gallery.title')"\n/>`,
        planField: `<!-- PlanDetail.vue -->\n<div class="flex items-center gap-2">\n  <Heading\n    tag="h3"\n    theme="custom"\n    no-wrap\n    add-class="text-base font-semibold text-[#0C111D] md:text-lg dark:text-[#dbd8d3]"\n    :text="t('mediaUploader.addTier.freeTokens')"\n  />\n  <BaseTooltip>\n    <Paragraph\n      theme="custom"\n      no-wrap\n      add-class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]"\n      :text="t('mediaUploader.addTier.freeTokensTooltip')"\n    />\n  </BaseTooltip>\n</div>`,
        mediaUploaderForm: `<!-- MediaUploaderStepPreviewSettings.vue -->\n<Heading\n  tag="h4"\n  theme="custom"\n  no-wrap\n  add-class="text-text-quaternary text-sm font-[700] leading-normal not-italic"\n  :text="t('mediaUploader.preview.thumbnailSettings')"\n/>`,
        mediaUploaderShell: `<!-- MediaUploader.vue -->\n<Heading\n  tag="h3"\n  theme="custom"\n  no-wrap\n  add-class="text-sm font-semibold leading-5 text-primary-text dark:text-text"\n  :text="t('mediaUploader.shell.uploadMedia')"\n/>`,
        mediaFilterPopup: `<!-- MediaFilterPopup.vue -->\n<Heading\n  :text="t('mediaUploader.library.filterPopup.title')"\n  tag="h2"\n  theme="custom"\n  no-wrap\n  add-class="text-lg font-medium text-medium-text dark:text-timberwolf"\n/>`,
        publishDatePicker: `<!-- PublishDatePicker.vue -->\n<Heading\n  tag="h2"\n  theme="custom"\n  no-wrap\n  add-class="text-black text-sm font-normal not-italic leading-none [text-wrap:balance]"\n  :text="t('mediaUploader.publishDatePicker.defaultLabel')"\n/>`,
        mediaEmptyTitle: `<!-- MediaUploaderPage.vue -->\n<Heading\n  :text="t('mediaUploader.empty.title')"\n  tag="h1"\n  theme="custom"\n  no-wrap\n  add-class="shrink-0 text-[1.875rem] leading-normal font-medium text-dark-gray dark:text-beige-text"\n/>`,
        profileMediaTab: `<div class="flex gap-3.5">\n  <Heading\n    :text="t('profile.mediaTabs.payToView')"\n    tag="h2"\n    theme="custom"\n    no-wrap\n    add-class="text-xl leading-normal font-medium text-[#e9e5d3] pl-4 border-l border-[#e9e5d3]"\n  />\n  <div class="flex items-center gap-1">\n    <span class="text-sm font-medium text-[#07F468]">{{ t('profile.labels.viewAll') }}</span>\n    <span class="text-sm leading-normal text-[#07F468] self-start">11</span>\n  </div>\n</div>`,
        tipTitle: `<!-- CheckoutBeforeTipPopup.vue -->\n<Heading\n  tag="h2"\n  theme="custom"\n  no-wrap\n  :text="t('checkout.tip.title')"\n  add-class="text-center text-[#F9FAFB] text-3xl font-semibold leading-9 whitespace-pre-line"\n/>`,
        tipChooseModels: `<!-- CheckoutBeforeTipPopup.vue -->\n<Heading\n  tag="h3"\n  theme="custom"\n  no-wrap\n  :text="t('checkout.tip.chooseModels')"\n  add-class="text-center text-[#EAECF0] text-base font-semibold leading-6"\n/>`,
        tipSelectBelow: `<!-- CheckoutBeforeTipPopup.vue -->\n<Heading\n  tag="h3"\n  theme="custom"\n  no-wrap\n  :text="t('checkout.tip.selectTipBelow')"\n  add-class="text-center text-[#F9FAFB] text-base font-semibold leading-6"\n/>`,
    },
    paragraph: {
        homeHeroTagline: `<!-- HomeHeroIntro.vue -->\n<Paragraph :text="t('home.hero.tagline')" theme="homeHeroTagline" no-wrap />`,
        homeHeroBody: `<!-- HomeHeroIntro.vue -->\n<Paragraph :text="t('home.hero.description')" theme="homeHeroBody" no-wrap />`,
        homeFeatureBody: `<!-- HomeFeatureTextBlock.vue -->\n<Paragraph :text="t('home.about.features.communities.description')" theme="homeFeatureBody" no-wrap />`,
        homeSectionSubtitleServices: `<!-- ServiceTabsSection.vue -->\n<Paragraph :text="t('home.services.subtitle')" theme="homeSectionSubtitleServices" no-wrap />`,
        homeServicePanelBody: `<!-- ServiceTabsSection.vue -->\n<Paragraph\n  theme="custom"\n  no-wrap\n  add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]"\n  :text="t('home.services.panels.mediaMerch.ecosystem.body')"\n/>`,
        homeDitchSubtitle: `<!-- DitchMiddleman.vue -->\n<Paragraph :text="t('home.ditch.subtitle')" theme="homeDitchSubtitle" no-wrap />`,
        settingsBody: `<!-- SettingsPage.vue -->\n<Paragraph\n  :text="t('settings.page.account.linkXBody')"\n  no-wrap\n  font-size=""\n  font-weight=""\n  font-color=""\n  class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb7af]"\n/>`,
        editProfileEmpty: `<!-- EditProfilePage.vue -->\n<Paragraph\n  theme="custom"\n  no-wrap\n  add-class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]"\n  :text="t('editProfile.page.gallery.empty')"\n/>`,
        editProfileFormats: `<!-- EditProfilePage.vue -->\n<Paragraph\n  theme="custom"\n  no-wrap\n  add-class="text-xs leading-normal text-[#475467] dark:text-[#b1aba0]"\n  :text="t('editProfile.page.gallery.formats')"\n/>`,
        editProfileTooltip: `<!-- EditProfilePage.vue — tipping tooltip -->\n<Paragraph\n  theme="custom"\n  no-wrap\n  add-class="text-xs leading-normal font-semibold text-white dark:text-[#e8e6e3]"\n  :text="t('editProfile.page.tipping.usernameTooltip')"\n/>`,
        mediaPreorder: `<!-- MediaUploaderStepPublishAndSharing.vue -->\n<Paragraph\n  :text="t('mediaUploader.publish.preorderPrice')"\n  font-size="text-[14px]"\n  font-weight="font-[400]"\n  font-color="text-text-quaternary"\n/>`,
        mediaEmpty: `<!-- MediaUploaderPage.vue -->\n<Paragraph\n  :text="t('mediaUploader.empty.description')"\n  theme="custom"\n  no-wrap\n  add-class="text-base font-normal text-center text-dark-gray dark:text-beige-text"\n/>`,
        planPublish: `<!-- PlanPublishSetting.vue -->\n<Paragraph\n  theme="custom"\n  no-wrap\n  add-class="text-base text-[#0C111D] dark:text-[#dbd8d3]"\n  :text="t('plan.publish.description')"\n/>`,
        thankYouPrice: `<!-- MediaOrderSummaryList.vue -->\n<Paragraph\n  theme="custom"\n  no-wrap\n  class="inline text-[16px] font-semibold leading-6 text-[#07F468]"\n  :text="t('thankYou.price')"\n/>`,
        tipChargeGray: `<!-- CheckoutBeforeTipPopup.vue -->\n<Paragraph\n  theme="custom"\n  no-wrap\n  :text="t('checkout.tip.chargePrefix')"\n  add-class="text-[#98A2B3] text-sm font-normal tracking-tight"\n/>`,
        tipChargeGreen: `<!-- CheckoutBeforeTipPopup.vue -->\n<Paragraph\n  theme="custom"\n  no-wrap\n  :text="chargeAmountLabel"\n  add-class="text-[#07F468] text-sm font-normal tracking-tight"\n/>`,
        leftSpan: `<!-- DashboardTextInput.vue left span — AddTierPopup.vue -->\n<Paragraph\n  :text="t('mediaUploader.addTier.usd')"\n  fontSize="text-base"\n  fontWeight="font-semibold"\n  fontColor=""\n  layoutClass="whitespace-nowrap"\n/>`,
        leftSpanPayout: `<!-- DashboardTextInput.vue left span — PayoutSettingsStep2.vue -->\n<Paragraph\n  :text="t('payout.settings.step2.usdPrefix')"\n  class="!font-normal text-base text-[#344054] dark:text-[#bdb8af] pr-2"\n  fontSize="text-base"\n  fontWeight="font-semibold"\n  fontColor=""\n  layoutClass="whitespace-nowrap"\n/>`,
        rightSpan: `<!-- DashboardTextInput.vue right span — AddTierPopup.vue -->\n<Paragraph\n  :text="t('mediaUploader.addTier.percentOff')"\n  class="text-sm font-semibold whitespace-nowrap text-medium-text dark:text-medium-beige"\n  fontSize="text-base"\n  fontWeight="font-medium"\n  fontColor=""\n  layoutClass="whitespace-nowrap"\n/>`,
        rightSpanUsd: `<!-- DashboardTextInput.vue right span — MediaUploaderStepPublishAndSharing.vue -->\n<Paragraph\n  :text="t('mediaUploader.publish.preorderUsd')"\n  fontSize="text-base"\n  fontWeight="font-medium"\n  fontColor=""\n  layoutClass="whitespace-nowrap"\n/>`,
    },
    icd: {
        username: `const username = ref('carrot_popxoxo123');\n\n<DashboardTextInput\n  v-model="username"\n  :labelText="t('settings.page.account.username')"\n  showLabel\n  :placeholder="t('settings.page.account.usernamePlaceholder')"\n  :description="t('settings.page.account.usernameHelp')"\n/>`,
        email: `const email = ref('');\n\n<DashboardTextInput\n  v-model="email"\n  :labelText="t('settings.page.account.email')"\n  showLabel\n  :placeholder="t('settings.page.account.emailPlaceholder')"\n/>`,
        nameRow: `const firstName = ref('Carrot');\nconst lastName = ref('Pop');\n\n<div class="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">\n  <DashboardTextInput v-model="firstName" :labelText="t('settings.page.account.firstName')" showLabel :placeholder="t('settings.page.account.firstNamePlaceholder')" class="min-w-0 flex-1" />\n  <DashboardTextInput v-model="lastName" :labelText="t('settings.page.account.lastName')" showLabel :placeholder="t('settings.page.account.lastNamePlaceholder')" class="min-w-0 flex-1" />\n</div>`,
        newPassword: `const newPassword = ref('••••••••');\n\n<DashboardTextInput\n  v-model="newPassword"\n  :labelText="t('settings.page.password.password')"\n  showLabel\n  :placeholder="t('settings.page.password.newPlaceholder')"\n/>`,
        confirmNewPassword: `const confirmNewPassword = ref('••••••••');\n\n<DashboardTextInput\n  v-model="confirmNewPassword"\n  :labelText="t('settings.page.password.confirmLabel')"\n  showLabel\n  :placeholder="t('settings.page.password.confirmPlaceholder')"\n/>`,
        shippingContact: `const email = ref('');\nconst phoneNumber = ref('');\n\n<div class="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">\n  <DashboardTextInput v-model="email" :labelText="t('settings.page.account.email')" showLabel :placeholder="t('settings.page.shipping.emailPlaceholder')" class="min-w-0 flex-1" />\n  <DashboardTextInput v-model="phoneNumber" :labelText="t('settings.page.shipping.phoneNumber')" showLabel :placeholder="t('settings.page.shipping.phonePlaceholder')" class="min-w-0 flex-1" />\n</div>`,
        company: `const company = ref('Code Linden');\n\n<DashboardTextInput\n  v-model="company"\n  :labelText="t('settings.page.shipping.company')"\n  optionalLabel\n  :optionalLabelText="t('settings.page.shipping.optional')"\n  showLabel\n  :placeholder="t('settings.page.shipping.companyPlaceholder')"\n/>`,
        addressLine1: `const addressLine1 = ref('123 Creator Ave');\n\n<DashboardTextInput\n  v-model="addressLine1"\n  :labelText="t('settings.page.shipping.addressLine1')"\n  showLabel\n  :placeholder="t('settings.page.shipping.addressLine1Placeholder')"\n/>`,
        addressLine2: `const addressLine2 = ref('Suite 4');\n\n<DashboardTextInput\n  v-model="addressLine2"\n  :labelText="t('settings.page.shipping.addressLine2')"\n  showLabel\n  :placeholder="t('settings.page.shipping.addressLine2Placeholder')"\n/>`,
        postalCity: `const postalCode = ref('90210');\nconst city = ref('Los Angeles');\n\n<div class="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">\n  <DashboardTextInput v-model="postalCode" :labelText="t('settings.page.shipping.postalCode')" showLabel :placeholder="t('settings.page.shipping.postalCodePlaceholder')" class="min-w-0 flex-1" />\n  <DashboardTextInput v-model="city" :labelText="t('settings.page.shipping.city')" showLabel :placeholder="t('settings.page.shipping.cityPlaceholder')" class="min-w-0 flex-1" />\n</div>`,
        beneficiaryName: `const beneficiaryName = ref('Carrot Pop');\n\n<DashboardTextInput\n  v-model="beneficiaryName"\n  :labelText="t('settings.page.payout.beneficiaryName')"\n  showLabel\n  :placeholder="t('settings.page.payout.beneficiaryNamePlaceholder')"\n/>`,
        beneficiaryStreet: `const beneficiaryStreet = ref('123 Creator Ave');\n\n<DashboardTextInput\n  v-model="beneficiaryStreet"\n  :labelText="t('settings.page.payout.beneficiaryStreet')"\n  showLabel\n  :placeholder="t('settings.page.payout.beneficiaryStreetPlaceholder')"\n/>`,
        beneficiaryCity: `const beneficiaryCity = ref('Los Angeles');\n\n<DashboardTextInput\n  v-model="beneficiaryCity"\n  :labelText="t('settings.page.payout.beneficiaryCity')"\n  showLabel\n  :placeholder="t('settings.page.payout.beneficiaryCityPlaceholder')"\n/>`,
        beneficiaryPostalCode: `const beneficiaryPostalCode = ref('90210');\n\n<DashboardTextInput\n  v-model="beneficiaryPostalCode"\n  :labelText="t('settings.page.payout.beneficiaryPostalCode')"\n  showLabel\n  :placeholder="t('settings.page.payout.beneficiaryPostalPlaceholder')"\n/>`,
        beneficiaryAccount: `const beneficiaryAccount = ref('1234567890');\n\n<DashboardTextInput\n  v-model="beneficiaryAccount"\n  :labelText="t('settings.page.payout.beneficiaryAccount')"\n  showLabel\n  :placeholder="t('settings.page.payout.beneficiaryAccountPlaceholder')"\n  showTooltip\n  :tooltipText="t('settings.page.payout.beneficiaryAccountTooltip')"\n  tooltipPlacement="top"\n/>`,
        swiftCode: `const swiftCode = ref('CHASUS33');\n\n<DashboardTextInput\n  v-model="swiftCode"\n  :labelText="t('settings.page.payout.swiftCode')"\n  showLabel\n  :placeholder="t('settings.page.payout.swiftPlaceholder')"\n/>`,
        intermediarySwift: `const intermediarySwift = ref('BOFAUS3N');\n\n<DashboardTextInput\n  v-model="intermediarySwift"\n  :labelText="t('settings.page.payout.intermediarySwift')"\n  showLabel\n  :placeholder="t('settings.page.payout.swiftPlaceholder')"\n  :description="t('settings.page.payout.intermediaryHelp')"\n/>`,
        displayNameAge: `const displayName = ref('Carrot Pop');\nconst age = ref('28');\n\n<div class="flex w-full flex-col gap-4 sm:flex-row">\n  <DashboardTextInput v-model="displayName" :labelText="t('editProfile.page.fields.displayName')" showLabel :placeholder="t('editProfile.page.fields.displayNamePlaceholder')" class="min-w-0 flex-1" />\n  <DashboardTextInput v-model="age" :labelText="t('editProfile.page.fields.age')" showLabel :placeholder="t('editProfile.page.fields.agePlaceholder')" class="min-w-0 flex-1" />\n</div>`,
        bio: `const bio = ref('Welcome to my page.');\n\n<DashboardTextInput\n  v-model="bio"\n  :labelText="t('editProfile.page.fields.bio')"\n  showLabel\n  type="textarea"\n  textAreaRows="4"\n  :placeholder="t('editProfile.page.fields.bioPlaceholder')"\n/>`,
        tipMessage: `const tipMessage = ref('Thanks for the tip!');\n\n<DashboardTextInput\n  v-model="tipMessage"\n  :showLabel="false"\n  type="textarea"\n  textAreaRows="4"\n  :placeholder="t('editProfile.page.tipping.tipPlaceholder')"\n  :maxLength="200"\n/>`,
        postMessage: `const postMessage = ref('Just received a tip');\n\n<DashboardTextInput\n  v-model="postMessage"\n  :showLabel="false"\n  type="textarea"\n  textAreaRows="3"\n  :placeholder="t('editProfile.page.tipping.postMessagePlaceholder')"\n  :maxLength="72"\n/>`,
        socialTwitterIg: `const twitter = ref('@carrot_pop');\nconst instagram = ref('@carrot.pop');\n\n<div class="flex w-full flex-col gap-4 lg:flex-row">\n  <DashboardTextInput v-model="twitter" :labelText="t('editProfile.page.social.twitter')" showLabel :placeholder="t('editProfile.page.social.twitterPlaceholder')" class="min-w-0 flex-1" />\n  <DashboardTextInput v-model="instagram" :labelText="t('editProfile.page.social.instagram')" showLabel :placeholder="t('editProfile.page.social.instagramPlaceholder')" class="min-w-0 flex-1" />\n</div>`,
        socialWishlistUrl1: `const wishlist = ref('https://wishlist.example.com/carrot');\nconst additionalUrl1 = ref('https://example.com/link');\n\n<div class="flex w-full flex-col gap-4 lg:flex-row">\n  <DashboardTextInput v-model="wishlist" :labelText="t('editProfile.page.social.wishlist')" showLabel :placeholder="t('editProfile.page.social.wishlistPlaceholder')" class="min-w-0 flex-1" />\n  <DashboardTextInput v-model="additionalUrl1" :labelText="t('editProfile.page.social.additionalUrl1')" showLabel :placeholder="t('editProfile.page.social.additionalUrl1Placeholder')" class="min-w-0 flex-1" />\n</div>`,
        freeTokens: `import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';\n\nconst freeTokens = ref('100');\nconst freeTokensConfig = computed(() => ({\n  scope: 'addTier',\n  id: 'freeTokens',\n  validation: {\n    required: false,\n    rules: [\n      { type: 'minNum', param: 1, message: t('mediaUploader.addTier.rangeError') },\n      { type: 'maxNum', param: 99, message: t('mediaUploader.addTier.rangeError') },\n    ],\n  },\n  validateOnMount: true,\n  validateOnInput: true,\n}));\n\nonMounted(() => {\n  interactionsEngine.register(freeTokensConfig.value, freeTokens.value, null);\n});\nwatch(freeTokens, (val) => {\n  interactionsEngine.processFieldChange(freeTokensConfig.value, val);\n});\n\nconst freeTokensFieldState = computed(() => interactionsEngine.getFieldState(freeTokensConfig.value));\nconst freeTokensError = computed(() => {\n  if (freeTokens.value === '' || freeTokens.value == null) return false;\n  if (!Number.isFinite(Number(freeTokens.value))) return false;\n  return !!freeTokensFieldState.value && !freeTokensFieldState.value.isValid;\n});\nconst freeTokensErrorMessage = computed(\n  () => freeTokensFieldState.value?.failedRules?.[0]?.message || t('mediaUploader.addTier.rangeError'),\n);\n\n<DashboardTextInput\n  id="input_free_tokens"\n  type="number"\n  v-model="freeTokens"\n  rightSpan\n  :rightSpanText="t('mediaUploader.addTier.tokensPerMonth')"\n  :show-controls="false"\n  :showLabel="false"\n  :wrapper-class="freeTokensError ? '!border-error !pr-0' : '!pr-0'"\n  :show-errors="freeTokensError"\n  :errors="freeTokensError ? [{ message: freeTokensErrorMessage }] : []"\n  rightSpanClass="text-base font-semibold whitespace-nowrap !px-[1.125rem] text-[#344054] dark:text-[#bdb7af]"\n  inputClass="text-[#0C111D] font-600 text-base"\n  errorMessageClass="text-[#FF4405] dark:text-[#ff571e]"\n/>`,
        merchDiscount: `import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';\n\nconst merchDiscount = ref('100');\nconst merchConfig = computed(() => ({\n  scope: 'addTier',\n  id: 'merchDiscount',\n  validation: {\n    required: false,\n    rules: [\n      { type: 'minNum', param: 1, message: t('mediaUploader.addTier.rangeError') },\n      { type: 'maxNum', param: 99, message: t('mediaUploader.addTier.rangeError') },\n    ],\n  },\n  validateOnMount: true,\n  validateOnInput: true,\n}));\n\nonMounted(() => {\n  interactionsEngine.register(merchConfig.value, merchDiscount.value, null);\n});\nwatch(merchDiscount, (val) => {\n  interactionsEngine.processFieldChange(merchConfig.value, val);\n});\n\nconst merchFieldState = computed(() => interactionsEngine.getFieldState(merchConfig.value));\nconst merchError = computed(() => {\n  if (merchDiscount.value === '' || merchDiscount.value == null) return false;\n  if (!Number.isFinite(Number(merchDiscount.value))) return false;\n  return !!merchFieldState.value && !merchFieldState.value.isValid;\n});\nconst merchErrorMessage = computed(\n  () => merchFieldState.value?.failedRules?.[0]?.message || t('mediaUploader.addTier.rangeError'),\n);\n\n<DashboardTextInput\n  id="input_merch"\n  type="number"\n  v-model="merchDiscount"\n  rightSpan\n  :rightSpanText="t('mediaUploader.addTier.percentOff')"\n  :show-controls="false"\n  :showLabel="false"\n  :wrapper-class="merchError ? '!border-error !pr-0' : '!pr-0'"\n  :show-errors="merchError"\n  :errors="merchError ? [{ message: merchErrorMessage }] : []"\n  rightSpanClass="text-base font-semibold whitespace-nowrap !px-[1.125rem] text-[#344054] dark:text-[#bdb7af]"\n  inputClass="text-[#0C111D] font-600 text-base"\n  errorMessageClass="text-[#FF4405] dark:text-[#ff571e]"\n/>`,
        mediaDescription: `const description = ref('Behind the scenes from today.');\n\n<DashboardTextInput\n  id="input_g"\n  type="textarea"\n  show-label\n  v-model="description"\n  textAreaRows="3"\n  label-text=""\n  :placeholder="t('mediaUploader.mediaDetails.descriptionPlaceholder')"\n/>`,
        preorder: `const preOrderPrice = ref('4.99');\n\n<div class="sm:w-[380px]">\n  <Paragraph :text="t('mediaUploader.publish.preorderPrice')" font-size="text-[14px]" font-weight="font-[400]" font-color="text-text-quaternary" />\n  <DashboardTextInput id="input_preorder" type="number" v-model="preOrderPrice" :show-label="false" rightSpan :rightSpanText="t('mediaUploader.publish.preorderUsd')" />\n</div>`,
        tierName: `const tierName = ref('VIP Access');\n\n<DashboardTextInput\n  :placeholder="t('mediaUploader.addTier.tierNamePlaceholder')"\n  v-model="tierName"\n/>`,
        tierPrices: `const originalPrice = ref('29.99');\nconst discountPrice = ref('19.99');\n\n<div class="flex w-full flex-col gap-4 sm:flex-row sm:items-start">\n  <DashboardTextInput id="tier_original_price" type="number" show-label v-model="originalPrice" :label-text="t('mediaUploader.addTier.originalPrice')" leftSpan :leftSpanText="t('mediaUploader.addTier.usd')" labelClass="text-gray-900 text-xs" :show-controls="false" class="min-w-0 flex-1" />\n  <DashboardTextInput id="tier_discount_price" type="number" show-label v-model="discountPrice" :label-text="t('mediaUploader.addTier.discountedPrice')" leftSpan :leftSpanText="t('mediaUploader.addTier.usd')" labelClass="text-gray-900 text-xs" :show-controls="false" class="min-w-0 flex-1" />\n</div>`,
        orderNotes: `import CheckoutNotes from '@/dev/components/checkout/reusable/CheckoutNotes.vue';\n\nconst orderNotes = ref('');\n\n<!-- GuestPurchaseFlowPopup.vue / PurchaseFlowSubscriptionOrderPopup.vue -->\n<CheckoutNotes :show-avatars="true" v-model="orderNotes" />`,
        orderNotesPlain: `import CheckoutNotes from '@/dev/components/checkout/reusable/CheckoutNotes.vue';\n\nconst orderNotes = ref('');\n\n<!-- CheckoutNotes.vue — avatar row off -->\n<CheckoutNotes :show-avatars="false" v-model="orderNotes" />`,
        planInviteFansBar: `import PlanInviteFansBar from '@/dev/components/plan/parts/PlanInviteFansBar.vue';\n\nconst invitedPerformers = ref([]);\nconst performersList = [\n  { id: 1, name: t('plan.sharing.mock.userOneName'), username: t('plan.sharing.mock.userOneUsername') },\n  { id: 2, name: t('plan.sharing.mock.userTwoName'), username: t('plan.sharing.mock.userTwoUsername') },\n];\n\n<!-- PlanSharing.vue -->\n<PlanInviteFansBar\n  v-model="invitedPerformers"\n  :results="performersList"\n  :max-items="5"\n/>`,
        planCopyInviteLink: `import PlanCopyInviteLink from '@/dev/components/plan/parts/PlanCopyInviteLink.vue';\n\nconst inviteLink = computed(() => t('plan.sharing.mock.inviteLink'));\n\n<!-- PlanSharing.vue -->\n<PlanCopyInviteLink :link="inviteLink" />`,
        tipCheckoutNotes: `import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';\nimport { useAssetUrl } from '@/composables/useAssetUrl.js';\n\nconst notes = ref('');\nconst NOTES_MAX = 300;\nconst { url: faceSmileUrl } = useAssetUrl('checkout.demo.faceSmile');\nconst charsLeftLabel = computed(() =>\n  t('checkout.tip.charactersLeft', {\n    count: Math.max(0, NOTES_MAX - (notes.value?.length || 0)),\n  }),\n);\n\n<!-- CheckoutBeforeTipPopup.vue -->\n<DashboardTextInput\n  :model-value="notes"\n  theme="tipCheckoutNotes"\n  :show-label="false"\n  :placeholder="t('checkout.tip.notesPlaceholder')"\n  right-span\n  :right-span-text="charsLeftLabel"\n  right-span-class="!text-[10px] !font-normal !leading-4 tracking-tight text-[#F9FAFB] opacity-70 whitespace-nowrap"\n  :right-icon="faceSmileUrl"\n  right-icon-class="!opacity-100 [filter:brightness(0)_saturate(100%)_invert(72%)_sepia(64%)_saturate(483%)_hue-rotate(85deg)_brightness(101%)_contrast(101%)]"\n  @update:model-value="onNotesInput"\n/>`,
        tipCustomAmount: `import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';\n\nconst customAmount = ref('');\n\n<!-- CheckoutBeforeTipPopup.vue -->\n<DashboardTextInput\n  v-model="customAmount"\n  theme="tipCheckoutNotes"\n  type="number"\n  :show-label="false"\n  :show-controls="false"\n  :placeholder="t('checkout.tip.customAmountPlaceholder')"\n/>`,
    },
    cart: {
        default: `<!-- Template -->\n<Cart />\n\n<!-- Interaction Logic (Custom Events) -->\n// To add an item via console or script:\nwindow.dispatchEvent(new CustomEvent('cart:add', {\n  detail: {\n    item: {\n      title: "NBA Hoops Card",\n      productId: "nba123",\n      qty: 1,\n      price: 12.23,\n      originalPrice: 20.00,\n      shipping: 12.23,\n      seller: "Princess Carrot Pop",\n      image: checkout.demo.featuredMediaBg (useAssetUrl),\n      promoCodes: ["PROMOCODE2025", "MEMBER BENEFIT"]\n    }\n  }\n}));`,
    },
    cookies: {
        default: `<!-- Template -->\n<Cookies />\n\n<!-- Script -->\nimport Cookies from '@/components/ui/badge/dashboard/Cookies.vue';`,
    },
};


const handleAction = (action) => {
    console.log("Menu clicked:", action);
}

// DashboardTextInput — live models seeded to match Show Code (range demos intentionally out of range)
const dti = reactive({
    username: 'carrot_popxoxo123',
    email: 'mscarrot_pops@gmail.com',
    firstName: 'Carrot',
    lastName: 'Pop',
    newPassword: '••••••••',
    confirmNewPassword: '••••••••',
    shippingEmail: 'mscarrot_pops@gmail.com',
    phoneNumber: '+1 310 555 0199',
    company: 'Code Linden',
    addressLine1: '123 Creator Ave',
    addressLine2: 'Suite 4',
    postalCode: '90210',
    city: 'Los Angeles',
    beneficiaryName: 'Carrot Pop',
    beneficiaryStreet: '123 Creator Ave',
    beneficiaryCity: 'Los Angeles',
    beneficiaryPostalCode: '90210',
    beneficiaryAccount: '1234567890',
    swiftCode: 'CHASUS33',
    intermediarySwift: 'BOFAUS3N',
    displayName: 'Carrot Pop',
    age: '28',
    bio: 'Welcome to my page.',
    tipMessage: 'Thanks for the tip!',
    postMessage: 'Just received a tip',
    twitter: '@carrot_pop',
    instagram: '@carrot.pop',
    wishlist: 'https://wishlist.example.com/carrot',
    additionalUrl1: 'https://example.com/link',
    freeTokens: '100',
    merchDiscount: '100',
    mediaDescription: 'Behind the scenes from today.',
    preOrderPrice: '4.99',
    tierName: 'VIP Access',
    tierOriginalPrice: '29.99',
    tierDiscountPrice: '19.99',
    orderNotes: 'Leave at the front desk',
    orderNotesPlain: 'Gift wrap please',
    invitedPerformers: [],
    invitePerformersList: [
        { id: 1, name: t('plan.sharing.mock.userOneName'), username: t('plan.sharing.mock.userOneUsername') },
        { id: 2, name: t('plan.sharing.mock.userTwoName'), username: t('plan.sharing.mock.userTwoUsername') },
    ],
    inviteLink: t('plan.sharing.mock.inviteLink'),
    tipNotes: '',
    tipCustomAmount: '',
});

// Range warnings via interactionsEngine (same pattern as PlanDetail / AddTierPopup)
const DTI_SCOPE = 'demoDashboardTextInput';
const dtiRangeErrorMessage = computed(() => t('mediaUploader.addTier.rangeError'));

function buildDtiRangeConfig(fieldId) {
    return computed(() => ({
        scope: DTI_SCOPE,
        id: fieldId,
        validation: {
            required: false,
            rules: [
                { type: 'minNum', param: 1, message: dtiRangeErrorMessage.value },
                { type: 'maxNum', param: 99, message: dtiRangeErrorMessage.value },
            ],
        },
        validateOnMount: true,
        validateOnInput: true,
    }));
}

const dtiRangeFields = {
    freeTokens: { key: 'freeTokens', config: buildDtiRangeConfig('demoFreeTokens') },
    merchDiscount: { key: 'merchDiscount', config: buildDtiRangeConfig('demoMerchDiscount') },
};

function isDtiRangeInvalid(rawValue, fieldState) {
    if (rawValue === '' || rawValue === null || rawValue === undefined) return false;
    if (!Number.isFinite(Number(rawValue))) return false;
    return !!fieldState && !fieldState.isValid;
}

const dtiRangeErrors = reactive({
    freeTokens: false,
    merchDiscount: false,
});

function refreshDtiRangeError(errorKey, modelKey, configRef) {
    const state = interactionsEngine.getFieldState(configRef.value);
    dtiRangeErrors[errorKey] = isDtiRangeInvalid(dti[modelKey], state);
}

onMounted(() => {
    Object.entries(dtiRangeFields).forEach(([errorKey, { key, config }]) => {
        interactionsEngine.register(config.value, dti[key], null);
        refreshDtiRangeError(errorKey, key, config);
        watch(
            () => dti[key],
            (val) => {
                interactionsEngine.processFieldChange(config.value, val);
                refreshDtiRangeError(errorKey, key, config);
            },
        );
    });
});

onBeforeUnmount(() => {
    interactionsEngine.clearScope(DTI_SCOPE);
});

const demoTabsModel = ref('Daily');

</script>
