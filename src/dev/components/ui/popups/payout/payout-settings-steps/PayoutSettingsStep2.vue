<template>
    <!-- popup-container -->
    <div class="flex flex-col min-h-[100dvh] relative md:pt-4">
        <!-- header -->
        <div class="flex justify-between items-center gap-2.5 px-4 py-2 md:py-4">
            <div class="flex items-center gap-1 md:gap-2">
                <img v-if="engine.state.currentMode === 'auto-withdraw'" :src="assets.autoCycle" :alt="t('payout.alt.autoCycle')" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(24%)_sepia(17%)_saturate(891%)_hue-rotate(179deg)_brightness(92%)_contrast(92%)] md:w-6 md:h-6">
                <img v-else-if="engine.state.currentMode === 'change-card'" :src="assets.settingsAlt" :alt="t('payout.alt.settings')" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(24%)_sepia(17%)_saturate(891%)_hue-rotate(179deg)_brightness(92%)_contrast(92%)] md:w-6 md:h-6">
                <img v-else :src="assets.addCard" :alt="t('payout.alt.addCard')" class="w-4 h-4 md:w-6 md:h-6 [filter:brightness(0)_saturate(100%)_invert(24%)_sepia(17%)_saturate(891%)_hue-rotate(179deg)_brightness(92%)_contrast(92%)]">
                <h2 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">
                    {{ engine.state.currentMode === 'auto-withdraw' ? t('payout.settings.step2.titleAutoWithdraw') : engine.state.currentMode === 'change-card' ? t('payout.settings.step2.titleChangeCard') : t('payout.settings.step2.titleAddMethod') }}
                </h2>
            </div>

            <button @click="emit('close')" class="flex justify-center items-center w-6 h-6">
                <img :src="assets.close" :alt="t('payout.alt.close')" class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(73%)_sepia(11%)_saturate(425%)_hue-rotate(179deg)_brightness(87%)_contrast(89%)]">
            </button>
        </div>

        <!-- back-button -->
        <button @click="goBack" class="max-md:hidden flex justify-center items-center gap-1 w-max px-4 pb-2">
            <img :src="assets.chevronLeft" :alt="t('payout.alt.chevronLeft')" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(46%)_sepia(8%)_saturate(955%)_hue-rotate(183deg)_brightness(91%)_contrast(88%)]">
            <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">{{ t('payout.settings.step2.back') }}</span>
        </button>

        <!-- content -->
        <div class="flex flex-col gap-6 px-2 pt-4 pb-4 md:px-4 xl:px-6 xl:pt-2">
            <p v-if="engine.state.currentMode === 'auto-withdraw'" class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ t('payout.settings.step2.autoWithdrawIntro') }}</p>
        
            <!-- dropdown-section -->
            <div v-if="engine.state.currentMode === 'auto-withdraw'" data-dropdown-section class="flex flex-col gap-2 group/dropdown-section" :class="withdrawMethod">
                <label for="payout-method" class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ t('payout.settings.step2.autoWithdrawLabel') }}</label>
                
                <!-- select-dropdown -->
                <BasePlanDropdown
                    v-model="withdrawMethod"
                    :options="withdrawOptions"
                    widthClass="w-full lg:max-w-[20rem]"
                    unstyled
                >   
                    <template #trigger="{ label, isOpen }">
                        <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3 rounded-t-sm border-b-[1.5px] border-[#0C111D] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#857c6d]">
                            <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                            {{ label }}
                            </span>
                            <img class="select-arrow h-4 w-4 transition-transform duration-200" :class="{ 'rotate-180': isOpen }"
                            :src="assets.down" :alt="t('payout.alt.down')" />
                        </div>
                    </template>
                    
                    <template #options-container="{ options, selectOption, modelValue, isOpen, isUpwards }">
                        <div class="dash-options-container max-md:!fixed max-md:!inset-0 max-md:!flex max-md:!items-end max-md:bg-white/60 max-md:bg-[#181a1b]/60 max-md:backdrop-blur-[2.5px] absolute left-auto right-0 z-[9999] w-full transition-[opacity,transform] duration-200 ease-out" 
                             :class="[
                                isOpen ? 'scale-100 opacity-100 pointer-events-auto h-auto' : 'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden',
                                isUpwards ? 'bottom-[calc(100%+0.5rem)] top-auto origin-bottom [transform-origin:50%_100%]' : 'top-[calc(100%+0.5rem)] origin-top [transform-origin:50%_0]'
                             ]">
                            <div class="flex flex-col gap-1 max-md:w-full max-md:!shadow-[0px_0px_12px_0px_#00000033] backdrop-blur-[50px] shadow-[0px_3px_6px_0px_#00000033] bg-white/90 dark:bg-[#181a1b]/90 max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">
                                <div v-for="option in options" :key="option.value" @click.stop="selectOption(option)" class="option flex items-center justify-center gap-[0.625rem] border-b border-[#EAECF0] group hover:bg-[#F9FAFB] dark:border-[#353a3c] dark:hover:bg-[#1b1d1e]" :class="{'bg-[#F9FAFB] dark:bg-[#1b1d1e]': modelValue === option.value}">
                                    <div class="option-inner-container flex flex-col flex-1 gap-1 px-2 py-3 md:p-4">
                                        <span class="text-base font-medium text-[#0C111D] capitalize text-balance dark:text-[#dbd8d3]">{{ option.label }}</span>
                                        <p class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">{{ option.desc }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </BasePlanDropdown>

                <p class="group-[.every-month]/dropdown-section:inline group-[.by-earning-target]/dropdown-section:hidden text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb8af]">{{ t('payout.settings.step2.everyMonthHelp') }}</p>
            </div>

            <!-- earning-target-section -->
            <div v-if="engine.state.currentMode === 'auto-withdraw'" data-earning-target-section class="flex flex-col gap-6 group/earning-target-section" :class="withdrawMethod">
                <!-- every-month-content -->
                <div class="flex flex-col gap-2 group-[.every-month]/earning-target-section:flex group-[.by-earning-target]/earning-target-section:hidden">
                <!-- title-section -->
                <div class="flex justify-between items-center gap-2">
                    <h3 class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ t('payout.settings.step2.earningTargets') }}</h3>

                    <span class="text-xs leading-normal italic text-[#667085] md:text-base dark:text-[#9e9589]">{{ t('payout.settings.step2.optional') }}</span>
                </div>

                <p class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb8af]">{{ t('payout.settings.step2.earningTargetsEveryMonthHelp') }}</p>
                
                <div class="w-full lg:max-w-[20rem]">
                    <DashboardTextInput
                        type="number"
                        v-model="targetAmount"
                        :placeholder="t('payout.settings.step2.enterAmount')"
                        :leftSpan="true"
                        :leftSpanText="t('payout.settings.step2.usdPrefix')"
                        leftSpanClass="!font-normal text-base text-[#344054] dark:text-[#bdb8af] pr-2"
                        wrapperClass="rounded-t-sm !px-3 !py-2 !h-auto !shadow-[0px_1px_2px_0px_#1018280D] dark:!border-[#3b4043]"
                        inputClass="text-base text-[#101828] placeholder:text-[#667085] dark:placeholder:text-[#9e9589] dark:text-[#d6d3cd] !p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                    />
                </div>
                </div>

                <!-- by-earning-target-content -->
                <div class="flex flex-col gap-2 group-[.every-month]/earning-target-section:hidden group-[.by-earning-target]/earning-target-section:flex">
                <!-- title-section -->
                <div class="flex justify-between items-center gap-2">
                    <h3 class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ t('payout.settings.step2.earningTargets') }}</h3>
                </div>

                <p class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb8af]">{{ t('payout.settings.step2.earningTargetsByTargetHelp') }}</p>
                
                <div class="w-full lg:max-w-[20rem]">
                    <DashboardTextInput
                        type="number"
                        v-model="targetAmount"
                        :placeholder="t('payout.settings.step2.enterAmount')"
                        :leftSpan="true"
                        :leftSpanText="t('payout.settings.step2.usdPrefix')"
                        leftSpanClass="!font-normal text-base text-[#344054] dark:text-[#bdb8af] pr-2"
                        wrapperClass="rounded-t-sm !px-3 !py-2 !h-auto !shadow-[0px_1px_2px_0px_#1018280D] dark:!border-[#3b4043]"
                        inputClass="text-base text-[#101828] placeholder:text-[#667085] dark:placeholder:text-[#9e9589] dark:text-[#d6d3cd] !p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                    />
                </div>
                </div>
            </div>

            <!-- payout-method-section -->
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-4" v-if="engine.state.currentMode === 'auto-withdraw'">
                    <h3 class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ t('payout.settings.step2.payoutMethod') }}</h3>
    
                    <!-- payout-method-dropdown -->
                    <BasePlanDropdown
                        v-model="selectedPayoutMethodValue"
                        :options="payoutOptions"
                        widthClass="w-full"
                        unstyled
                    >
                        <template #trigger="{ selectedOption, isOpen }">
                            <div data-payout-select-trigger-default class="flex items-center gap-2 p-3 rounded-t-sm border-b-[1.5px] border-[#0C111D] bg-white/50 md:h-[5.5rem] dark:bg-[#181a1b]/50 dark:border-[#857c6d]" v-if="!selectedOption">
                                <div class="flex items-center gap-2 flex-1">
                                    <img :src="assets.plusSquare" :alt="t('payout.alt.plusSquare')" class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(5%)_sepia(8%)_saturate(4414%)_hue-rotate(184deg)_brightness(90%)_contrast(96%)]">
                                    <span class="text-lg font-semibold text-[#101828] dark:text-[#d6d3cd]">{{ t('payout.settings.step2.addNew') }}</span>
                                </div>
                                <img class="select-arrow h-4 w-4 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(64%)_sepia(15%)_saturate(311%)_hue-rotate(179deg)_brightness(99%)_contrast(85%)]" :class="{ 'rotate-180': isOpen }" :src="assets.down" :alt="t('payout.alt.down')" />
                            </div>
    
                            <div data-payout-select-trigger-option class="flex items-center gap-2 p-3 rounded-t-sm border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 md:h-[5.5rem] dark:bg-[#181a1b]/50 dark:border-[#3b4043]" v-else>
                                <div class="flex flex-col gap-2 flex-1 min-w-0">
                                    <!-- option__top -->
                                    <div class="flex justify-between items-center gap-2">
                                    <span data-payout-trigger-title class="text-lg font-medium truncate text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">{{ selectedOption.title }}</span>
                                    <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                        <div class="w-4 h-4">
                                        <img :src="selectedOption.icon" :alt="t('payout.alt.icon')" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                        </div>
    
                                        <span class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">{{ t('payout.settings.step2.usaBankPrefix') }} <span data-payout-trigger-bank> {{ selectedOption.bank }}</span></span>
                                    </div>
                                    </div>
    
                                    <!-- option__bottom -->
                                    <div data-payout-trigger-bottom class="flex justify-between items-center gap-2">
                                    <span data-payout-trigger-pays-text class="text-sm text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">{{ t('payout.settings.step2.paysIn') }} <span data-payout-trigger-currency class="text-sm font-medium text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">{{ selectedOption.paysIn }}</span></span>
                                    <span data-payout-trigger-fee class="text-sm text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">{{ selectedOption.fee }}</span>
                                    </div>
                                </div>
    
                                <img class="select-arrow h-4 w-4 shrink-0 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(64%)_sepia(15%)_saturate(311%)_hue-rotate(179deg)_brightness(99%)_contrast(85%)]" :class="{ 'rotate-180': isOpen }" :src="assets.down" :alt="t('payout.alt.down')" />
                            </div>
                        </template>
                        
                        <template #options-container="{ options, selectOption, modelValue, isOpen }">
                            <div data-payout-select-options class="max-md:!fixed max-md:!inset-0 max-md:!flex max-md:!items-end absolute left-auto right-0 bottom-[calc(100%+0.5rem)] top-auto origin-bottom [transform-origin:50%_100%] z-[9999] w-full transition-[opacity,transform] duration-200 ease-out" 
                                 :class="isOpen ? 'scale-100 opacity-100 pointer-events-auto h-auto' : 'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden'">
                                <div class="flex flex-col max-md:w-full max-md:!shadow-[0px_0px_12px_0px_#00000033] shadow-[0px_3px_6px_0px_#00000033] bg-white/90 dark:bg-[#181a1b]/90">
                                    <!-- option loop -->
                                    <div v-for="option in options" :key="option.value" @click.stop="selectOption(option)" data-payout-option class="flex flex-col gap-2 flex-1 px-2 py-3 border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 group/option md:p-4 dark:border-[#3b4043] dark:bg-[#181a1b]/50 hover:bg-black/5 hover:dark:bg-white/5 cursor-pointer [&.selected]:bg-black/90 [&.selected]:border-white dark:[&.selected]:bg-[#181a1b]/90 dark:[&.selected]:border-[#303436]" :class="{'selected': modelValue === option.value}">
                                    <!-- option__top -->
                                    <div class="flex justify-between items-center gap-2">
                                        <span data-payout-option-title class="text-lg font-medium truncate text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">{{ option.title }}</span>
                                        <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                            <div class="w-4 h-4">
                                            <img :src="option.icon" :alt="t('payout.alt.icon')" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                            </div>
    
                                            <span data-payout-option-bank class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">{{ option.bank }}</span>
                                        </div>
                                    </div>
    
                                    <!-- option__bottom -->
                                    <div data-payout-option-bottom class="flex justify-between items-center gap-2">
                                        <span data-payout-option-pays-text class="truncate text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">{{ t('payout.settings.step2.paysIn') }} <span data-payout-option-currency class="text-sm font-medium text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">{{ option.paysIn }}</span></span>
                                        <span data-payout-option-fee class="text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">{{ option.fee }}</span>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </BasePlanDropdown>
                </div>

                <div class="flex flex-col gap-6 mb-2" v-if="engine.state.currentMode === 'add-method' || (engine.state.currentMode === 'auto-withdraw' && !selectedPayoutMethodValue)">
                                <div class="flex flex-col gap-4">
                                    <h3 class="text-base font-medium text-[#344054] dark:text-[#bdb8af]">{{ t('payout.settings.step2.whereToSend') }}</h3>
                                
                                <!-- select-dropdown -->
                                    <div data-payout-country-dropdown class="select-dropdown relative flex w-full [&.disabled]:opacity-50 [&.disabled]:cursor-not-allowed">
                                        <div class="dropdown-select w-full cursor-pointer border-none" @click.stop="toggleCountryDropdown">
                                            <div class="payout-select__trigger w-full h-[3.5rem] flex justify-between items-center gap-2 p-4 border-b-[1.5px] border-[#D0D5DD] bg-white/75 dark:bg-[#181a1b]/75 dark:border-[#3b4043]">
                                                <div class="flex items-center gap-2">
                                                    <img :src="assets.globe" :alt="t('payout.alt.globe')" class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(78%)_sepia(17%)_saturate(268%)_hue-rotate(179deg)_brightness(81%)_contrast(86%)]">
                                                    <span data-selected-dropdown-text class="text-base flex-grow text-balance text-[#667085] dark:text-[#9e9589]" :class="{ 'text-[#101828] dark:text-[#d6d3cd]': selectedCountry }">{{ selectedCountry ? selectedCountry.label : t('payout.settings.step2.selectCountry') }}</span>
                                                </div>
                                                <img class="select-arrow h-5 w-5 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(78%)_sepia(17%)_saturate(268%)_hue-rotate(179deg)_brightness(81%)_contrast(86%)]" :class="{ 'rotate-180': isCountryDropdownOpen }" :src="assets.chevronDown" :alt="t('payout.alt.chevronDown')" />
                                            </div>
                                            <div class="payout-options-container max-md:!fixed max-md:!flex max-md:!flex-col max-md:!justify-end max-md:!inset-0 max-md:!bg-white/60 max-md:!backdrop-blur-[2.5px] max-md:!shadow-[0px_-2px_4px_0px_#0000001A] absolute left-auto right-0 top-[calc(100%+1.5px)] z-[9999] w-full origin-top transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0] overflow-hidden" :class="isCountryDropdownOpen ? 'scale-100 opacity-100 pointer-events-auto shadow-[0px_3px_6px_0px_#00000033] h-auto' : 'scale-95 opacity-0 pointer-events-none shadow-[0px_0px_10px_-34px_#0000001A] h-0'" @click.stop>
                                                <div class="flex flex-col gap-2 max-md:gap-1 max-md:shadow-[0px_0px_12px_0px_#00000033] bg-white dark:bg-[#181a1b]">
                                                    <div class="flex items-center gap-2 p-4 border-b border-[#D0D5DD]/50 max-md:py-3 dark:border-[#3b4043]/50">
                                                        <img :src="assets.search" :alt="t('payout.alt.search')" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(25%)_sepia(27%)_saturate(547%)_hue-rotate(179deg)_brightness(89%)_contrast(94%)]">
                                                        <DashboardTextInput
                                                            v-model="countrySearchQuery"
                                                            type="text"
                                                            :placeholder="t('payout.settings.step2.searchCountry')"
                                                            wrapperClass="!h-auto !border-none !bg-transparent !p-0 !shadow-none"
                                                            inputClass="text-base text-[#667085] dark:text-[#9e9589] !p-0"
                                                        />
                                                    </div>
                                                    <div class="flex flex-col gap-2 max-md:gap-1 max-md:h-[10.75rem] h-[15.5rem] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">
                                                        <div v-for="country in filteredCountries" :key="country.value" @click="selectCountry(country)" :class="{ 'bg-[#F2F4F7] dark:bg-[#222526]': selectedCountry?.value === country.value }" class="option flex items-center justify-center gap-[0.625rem] cursor-pointer group hover:bg-white dark:hover:bg-[#181a1b]">
                                                            <div class="option-inner-container flex items-center flex-1 gap-2 p-4 max-md:py-2">
                                                                <span class="text-base font-medium text-[#0C111D] text-balance dark:text-[#dbd8d3]">{{ country.label }}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- options-section -->
                                <div v-if="selectedCountry" class="flex flex-col gap-4">
                                    <h3 class="text-base font-medium text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">{{ t('payout.settings.step2.optionsAvailable') }}</h3>

                                    <!-- options-container -->
                                    <div data-option-container class="flex flex-col gap-2">
                                        <!-- option loop -->
                                        <div v-for="option in availableCountryPayoutOptions" :key="option.id" @click="togglePayoutOption(option.id)" data-option class="flex flex-col gap-2 px-4 py-3 rounded-sm backdrop-blur-[5px] border-[1.5px] border-[#D0D5DD] bg-white/50 group/option [&.option-selected]:bg-black/90 [&.option-selected]:border-white cursor-pointer md:py-4 dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[&.option-selected]:bg-[#181a1b]/90 dark:[&.option-selected]:border-[#303436] transition-colors" :class="{'option-selected': selectedPayoutCountryOption === option.id}">
                                            <!-- option__top -->
                                            <div class="flex justify-between items-center gap-2">
                                            <span class="text-lg font-medium text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">{{ option.type }}</span>
                                            <div class="flex items-center gap-1 flex-wrap px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                                <div class="w-4 h-4">
                                                <img :src="option.icon" :alt="t('payout.alt.bank')" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                                </div>

                                                <span class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">{{ option.bank }}</span>
                                            </div>
                                            </div>

                                            <!-- option__bottom -->
                                            <div class="flex justify-between items-center gap-2">
                                            <span class="text-sm text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">{{ t('payout.settings.step2.paysIn') }} <span class="text-sm font-medium text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">{{ option.paysIn }}</span></span>
                                            <span class="text-sm text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">{{ option.fee }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
            </div>
        </div>

        <!-- change-card-design-section -->
        <div v-if="engine.state.currentMode === 'change-card'" class="flex flex-col gap-6 px-2 pt-4 pb-4 md:px-4 xl:px-6 xl:pt-2">
            <!-- card-container -->
            <div class="flex justify-center items-center w-[calc(100%+1rem)] -ml-2 sm:w-full sm:ml-0 sm:py-4 md:py-0">
                <!-- card -->
                <div data-card class="flex flex-col gap-2.5 w-full group/card sm:w-max"
                     :class="[
                        cardMode === 'premium' ? 'card-premium-design' : '',
                        cardMode === 'avatar' ? 'card-user-avatar' : '',
                        cardMode === 'initial' ? 'card-user-initial' : ''
                     ]">
                    <!-- card-outer-wrapper -->
                    <div class="w-full h-[12.875rem] min-h-[12.875rem] relative shadow-[0_0_8px_0_rgba(0,0,0,0.25)] overflow-hidden z-0 sm:w-[23.4375rem] sm:min-w-[23.4375rem] md:w-[26.875rem] md:min-w-[26.875rem] md:h-[14.75rem] md:rounded-lg">
                    <!-- card-background-wrapper -->
                    <div data-premium-bg class="hidden group-[.card-premium-design]/card:flex absolute -top-0.5 -left-0.5 flex justify-center items-center w-[calc(100%+4px)] h-[calc(100%+4px)] bg-cover bg-center bg-no-repeat z-0 pointer-events-none" :style="{ backgroundImage: `url(${cardPremiumBg})` }"></div>

                    <!-- card-user-avatar-wrapper -->
                    <div data-avatar-bg class="hidden group-[.card-user-avatar]/card:flex absolute -top-0.5 -left-0.5 flex justify-center items-center w-[calc(100%+4px)] h-[calc(100%+4px)] bg-cover bg-center bg-no-repeat z-0 pointer-events-none" :style="{ backgroundColor: cardColor }">
                        <img :src="assets.cardUserAvatar" :alt="t('payout.alt.payoutCardUserAvatar')" class="h-[115%] blur-[4px] ml-4">
                    </div>

                    <!-- card-user-initial-wrapper -->
                    <div data-initial-bg class="hidden group-[.card-user-initial]/card:flex absolute -top-0.5 -left-0.5 flex justify-center items-center w-[calc(100%+4px)] h-[calc(100%+4px)] bg-cover bg-center bg-no-repeat z-0 pointer-events-none" :style="{ backgroundColor: cardColor }">
                        <span class="text-[11.875rem] leading-[7.7225rem] font-bold text-white blur-[4px] opacity-60 md:text-[15.625rem] dark:text-[#e8e6e3]">{{ t('payout.mock.userInitials') }}</span>
                        <img :src="assets.cardUserInitialNoise" :alt="t('payout.alt.payoutCardUserInitialNoise')" class="absolute inset-0 w-full h-full z-[1] opacity-80 pointer-events-none">
                    </div>

                    <!-- card-border-wrapper -->
                    <div class="hidden absolute top-0 left-0 md:flex justify-center items-center w-full h-full border-solid border-2 [border-image-slice:2] [border-image-source:linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(222,222,222,0.25)_100%)] rounded-lg z-[100] pointer-events-none"></div>

                    <!-- card-contents-wrapper -->
                    <div class="flex flex-col w-full h-full relative z-[2]">
                        <!-- card-contents-container -->
                        <div class="flex flex-col h-full justify-between">
                        <!-- card-content__top -->
                        <div class="flex flex-col w-full px-4 pt-4 md:px-5 md:pt-5">
                            <div class="flex justify-between items-start gap-5">
                                <!-- card-content__top--text-container -->
                                <div class="flex flex-col h-9 md:h-auto">
                                    <span class="text-sm font-bold tracking-[-0.056rem] text-white group-[.card-user-initial]/card:text-black md:text-lg md:text-black">{{ t('payout.settings.step1.ourWebsite') }}</span>
                                    <span class="hidden group-[.card-premium-design]/card:inline text-sm font-bold text-white group-[.card-user-initial]/card:text-black md:text-base md:text-black">{{ t('payout.settings.step1.premium') }}</span>
                                    <span class="group-[.card-premium-design]/card:hidden text-sm font-bold text-white group-[.card-user-initial]/card:text-black md:text-base md:text-black">{{ t('payout.settings.step1.standard') }}</span>
                                </div>

                                <!-- card-logo-icon -->
                                <div class="flex justify-center items-center w-9 h-9">
                                    <img :src="assets.cardLogo" :alt="t('payout.alt.ourWebsiteLogo')" class="w-full h-full opacity-80 group-[.card-user-initial]/card:opacity-100 group-[.card-user-initial]/card:[filter:brightness(0)_saturate(100)] md:opacity-100 md:[filter:brightness(0)_saturate(100)]"/>
                                </div>
                            </div>
                        </div>

                        <!-- card-content__bottom -->
                        <div class="flex flex-col w-full px-4 py-3 gap-0.5 sm:gap-1 md:px-5">
                            <span class="text-sm font-medium text-[#F2F4F7] group-[.card-user-initial]/card:text-[#182230] md:text-[#344054]">{{ t('payout.settings.step1.balance') }}</span>

                            <div class="flex justify-between items-center gap-1">
                            <div class="flex items-center gap-1">
                                <span class="text-2xl font-medium tracking-[-0.045rem] text-white group-[.card-user-initial]/card:text-black md:text-4xl md:leading-[2.75rem] md:text-black">$</span>
                                <span class="text-2xl font-medium tracking-[-0.045rem] text-white group-[.card-user-initial]/card:text-black md:text-4xl md:leading-[2.75rem] md:text-black">
                                  {{ isBalanceVisible ? t('payout.mock.availableBalanceValue') : '********' }}
                                </span>
                                <img v-if="isBalanceVisible" @click="isBalanceVisible = false" :src="assets.eye" :alt="t('payout.alt.eye')" class="w-6 h-6 cursor-pointer group-[.card-user-initial]/card:[filter:brightness(0)_saturate(100)] md:[filter:brightness(0)_saturate(100)]"/>
                                <EyeSlashIcon v-else @click="isBalanceVisible = true" class="w-6 h-6 cursor-pointer text-white group-[.card-user-initial]/card:text-black md:text-black" />
                            </div>

                            <!-- credit-card-download-icon -->
                            <div class="flex justify-center items-center w-[1.875rem] h-[1.875rem] rounded bg-white/80 group-[.card-user-initial]/card:bg-[#182230] md:bg-[#182230]">
                                <img :src="assets.download" :alt="t('payout.alt.download')" class="w-[1.125rem] h-[1.125rem] [filter:brightness(0)_saturate(100)] group-[.card-user-initial]/card:[filter:_brightness(0)_saturate(100%)_invert(94%)_sepia(0%)_saturate(7500%)_hue-rotate(124deg)_brightness(115%)_contrast(105%)] md:[filter:_brightness(0)_saturate(100%)_invert(94%)_sepia(0%)_saturate(7500%)_hue-rotate(124deg)_brightness(115%)_contrast(105%)]"/>
                            </div>
                            </div>
                        </div>

                        <!-- card-blur-bottom-section -->
                        <div class="flex justify-center items-center gap-5 h-max md:h-full px-4 md:px-5 py-4 bg-black/10 backdrop-blur-[2px]">
                            <div class="flex justify-between items-start w-full h-full drop-shadow-[0_0_10px_-34px_rgba(0,0,0,0.75)]">
                            <div class="flex flex-col">
                                <span class="text-xs leading-normal text-white group-[.card-user-initial]/card:text-[#182230]">{{ t('payout.settings.step1.name') }}</span>
                                <span class="text-sm leading-normal font-medium text-white group-[.card-user-initial]/card:text-black">{{ t('payout.mock.displayName') }}</span>
                            </div>

                            <div class="flex flex-col">
                                <div class="flex justify-end items-center gap-1">
                                <span class="text-xs leading-normal text-right text-[#F2F4F7] group-[.card-user-initial]/card:text-[#182230] md:text-white">{{ t('payout.settings.step1.lastWithdrawn') }}</span>
                                <span class="text-xs leading-normal text-right text-[#F2F4F7] group-[.card-user-initial]/card:text-[#182230] md:text-white">{{ t('payout.mock.lastWithdrawnDate') }}</span>
                                </div>

                                <div class="flex">
                                <a href="" class="flex items-center gap-0.5">
                                    <img :src="assets.history" :alt="t('payout.alt.history')" class="w-[1.125rem] h-[1.125rem] group-[.card-user-initial]/card:[filter:brightness(0)_saturate(100%)_invert(9%)_sepia(8%)_saturate(3448%)_hue-rotate(176deg)_brightness(95%)_contrast(90%)]"/>
                                    <span class="text-sm leading-normal font-medium text-right underline text-[#F2F4F7] group-[.card-user-initial]/card:text-[#182230] md:text-white">{{ t('payout.settings.step1.transactionHistory') }}</span>
                                </a>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            <!-- tab-button-container -->
            <div class="flex justify-center items-center mt-4">
                <div class="flex items-center rounded-[0.3125rem] overflow-hidden border border-[#D0D5DD] bg-[#F9FAFB]/50 dark:border-[#3b4043] dark:bg-[#1b1d1e]/50">
                    <button @click="cardMode = 'premium'" class="flex justify-center items-center gap-1 p-2 border-r border-[#D0D5DD] group/tab-button dark:border-[#3b4043]" :class="cardMode === 'premium' ? 'bg-white dark:bg-[#181a1b] tab-active' : ''">
                        <span class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]" :class="cardMode === 'premium' ? 'font-semibold' : ''">{{ t('payout.settings.step2.premiumDesign') }}</span>
                    </button>

                    <button @click="cardMode = 'avatar'" class="flex justify-center items-center gap-1 p-2 border-r border-[#D0D5DD] group/tab-button dark:border-[#3b4043]" :class="cardMode === 'avatar' ? 'bg-white dark:bg-[#181a1b] tab-active' : ''">
                        <span class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]" :class="cardMode === 'avatar' ? 'font-semibold' : ''">{{ t('payout.settings.step2.userAvatar') }}</span>
                    </button>

                    <button @click="cardMode = 'initial'" class="flex justify-center items-center gap-1 p-2 group/tab-button" :class="cardMode === 'initial' ? 'bg-white dark:bg-[#181a1b] tab-active' : ''">
                        <span class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]" :class="cardMode === 'initial' ? 'font-semibold' : ''">{{ t('payout.settings.step2.userInitial') }}</span>
                    </button>
                </div>
            </div>

            <!-- tab-content-container -->
            <div class="flex flex-col mt-4">
                <!-- premium-designs -->
                <div v-if="cardMode === 'premium'" class="flex justify-center items-center gap-4">
                    <button v-for="bg in premiumBackgrounds" :key="bg" @click="cardPremiumBg = bg" class="flex justify-center items-center rounded-full p-1 cursor-pointer group/tab-item" :class="cardPremiumBg === bg ? 'border-[3px] border-[#98A2B3] dark:border-[#b0a993] tab-item-active' : ''">
                        <div class="flex justify-center items-center w-16 h-16 rounded-full overflow-hidden shadow-[0px_0px_8px_0px_#00000040]">
                            <img :src="bg" :alt="t('payout.alt.premiumDesign')" class="w-full h-full object-cover">
                        </div>
                    </button>
                </div>

                <!-- user-avatars-bg -->
                <div v-else class="flex justify-center items-center gap-2 flex-wrap mx-auto max-w-[33.3125rem] lg:max-w-none">
                    <button v-for="color in avatarColors" :key="color" @click="cardColor = color" class="flex justify-center items-center w-[3.125rem] h-[3.125rem] rounded-full group/tab-item sm:w-[4.625rem] sm:h-[4.625rem]" :class="cardColor === color ? 'border-[3px] border-[#98A2B3] dark:border-[#b0a993] tab-item-active' : ''">
                        <div class="w-[2.375rem] h-[2.375rem] rounded-full shadow-[0px_0px_8px_0px_#00000040] sm:w-16 sm:h-16" :style="{ backgroundColor: color }"></div>
                    </button>
                </div>
            </div>
        </div>

        
        <div class="flex justify-between items-center gap-2 w-full mt-auto pt-6 z-10" :class="{'pl-4': engine.state.currentMode === 'auto-withdraw'}">
            <div
              v-if="engine.state.currentMode === 'auto-withdraw'"
              data-payout-date
              class="min-w-0 flex-1 whitespace-nowrap overflow-hidden text-ellipsis pl-4 text-sm text-[#0C111D] dark:text-[#dbd8d3]"
            >
                <span>{{ t('payout.settings.step2.nextPayoutDate') }}</span>
                <span class="font-medium">
                  {{ showEarningTargetDate ? t('payout.settings.step2.whenEarningReaches', { amount: formattedTargetAmount }) : ` ${t('payout.mock.autoWithdrawNextDate')}` }}
                </span>
            </div>
            <!-- buttons -->
            <div class="flex items-center gap-2 shrink-0 justify-end">
                <DashboardPrimaryButton 
                    @click="saveSettings"
                    v-if="engine.state.currentMode === 'auto-withdraw' || engine.state.currentMode === 'change-card'"
                    class="ml-auto"
                    theme="payoutSettingsSave"
                    :text="t('payout.settings.step2.save')" 
                    :leftIcon="tickCircleUrl || ''"
                />

                <button @click="goToNextStep" v-if="engine.state.currentMode === 'add-method'" data-next-button="" class="absolute bottom-0 right-0 flex items-center gap-2.5 pl-[1.47625rem] pr-2 h-10 shadow-[0px_0px_16px_0px_#FFFFFF80] [clip-path:polygon(100%_0%,100%_100%,0%_100%,0.97625rem_0%)] bg-[#07F468] group/button hover:bg-black dark:bg-[#06c454] dark:hover:bg-[#181a1b]">
                    <span class="text-lg font-medium text-black group-hover/button:text-[#07F468] dark:text-[#e8e6e3] dark:group-hover/button:text-[#23f97b]">{{ t('payout.settings.step2.next') }}</span>
                    <img :src="assets.arrowLongRight" :alt="t('payout.alt.arrowLongRight')" class="w-6 h-6 [filter:brightness(0)_saturate(100%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(53%)_sepia(97%)_saturate(459%)_hue-rotate(93deg)_brightness(114%)_contrast(94%)]">
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';
import { ref, computed } from 'vue';
import EyeSlashIcon from "@heroicons/vue/24/outline/EyeSlashIcon";
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { assets } = usePayoutAssets();
const { url: tickCircleUrl } = useAssetUrl('icon.tick.circle');

const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const isBalanceVisible = ref(true);

const targetAmount = ref(props.engine.state.targetAmount || '');
const withdrawMethod = ref(props.engine.state.autoWithdrawMethod || 'every-month');

const hasTargetAmount = computed(() => {
  const raw = String(targetAmount.value ?? '').trim();
  if (!raw) return false;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0;
});

const showEarningTargetDate = computed(
  () => withdrawMethod.value === 'by-earning-target' || hasTargetAmount.value
);

const formattedTargetAmount = computed(() => {
  const num = Number(targetAmount.value);
  if (!Number.isFinite(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});

const goBack = () => {
    props.engine.goToStep(1);
};

const saveSettings = () => {
    if (props.engine.state.currentMode === 'change-card') {
        props.engine.setState('cardDesign', {
            mode: cardMode.value,
            premiumBg: cardPremiumBg.value,
            color: cardColor.value
        });
        props.engine.goToStep(1);
        return;
    }

    props.engine.setState('autoWithdrawMethod', withdrawMethod.value);
    props.engine.setState('targetAmount', targetAmount.value);
    props.engine.setState('selectedPayoutMethodValue', selectedPayoutMethodValue.value);
    props.engine.setState('isAutoWithdrawSetup', true);
    props.engine.goToStep(1);
};

const goToNextStep = () => {
    if (!selectedPayoutCountryOption.value) {
        return;
    }
    
    const selected = availableCountryPayoutOptions.value.find(o => o.id === selectedPayoutCountryOption.value);
    if (selected) {
        props.engine.setState('pendingPayoutMethod', {
            ...selected,
            country: selectedCountry.value?.label || t('payout.mock.countryUsa'),
            globeIcon: assets.value.globe
        });
    }
    props.engine.goToStep(3);
};

const withdrawOptions = computed(() => [
    { value: 'every-month', label: t('payout.settings.step2.withdrawEveryMonth'), desc: t('payout.settings.step2.withdrawEveryMonthDesc') },
    { value: 'by-earning-target', label: t('payout.settings.step2.withdrawByEarningTarget'), desc: t('payout.settings.step2.withdrawByEarningTargetDesc') }
]);

const payoutOptions = computed(() => [
    { value: 1, title: t('payout.mock.methodBankDeposit'), bank: t('payout.mock.methodBank'), paysIn: t('payout.mock.currencyEur'), fee: t('payout.mock.feeUsd345'), icon: assets.value.bank },
    { value: 2, title: t('payout.mock.methodBankDeposit'), bank: t('payout.mock.methodBank'), paysIn: t('payout.mock.currencyUsd'), fee: t('payout.mock.feeUsd345'), icon: assets.value.bank },
    { value: 3, title: t('payout.mock.methodBankWire'), bank: t('payout.mock.methodBank'), paysIn: t('payout.mock.currencyUsd'), fee: t('payout.mock.feeUsd345'), icon: assets.value.bank },
    { value: 4, title: t('payout.mock.methodBankWire'), bank: t('payout.mock.methodBank'), paysIn: t('payout.mock.currencyCzk'), fee: t('payout.mock.feeUsd345'), icon: assets.value.bank },
    { value: 5, title: t('payout.mock.methodUsdtEth'), bank: t('payout.mock.typeCrypto'), paysIn: t('payout.mock.currencyUsdt'), fee: t('payout.mock.feeUsd345'), icon: assets.value.crypto },
]);

const selectedPayoutMethodValue = ref(props.engine.state.selectedPayoutMethodValue || '');

const isCountryDropdownOpen = ref(false);
const selectedCountry = ref(null);
const countrySearchQuery = ref('');

const countryOptions = computed(() => [
    { value: 'australia', label: t('payout.mock.countryAustralia') },
    { value: 'china', label: t('payout.mock.countryChina') },
    { value: 'uk', label: t('payout.mock.countryUk') },
    { value: 'usa', label: t('payout.mock.countryUsa') },
    { value: 'singapore', label: t('payout.mock.countrySingapore') }
]);

const filteredCountries = computed(() => {
    if (!countrySearchQuery.value) return countryOptions.value;
    const lowerQuery = countrySearchQuery.value.toLowerCase();
    return countryOptions.value.filter(country => country.label.toLowerCase().includes(lowerQuery));
});

const selectCountry = (country) => {
    selectedCountry.value = country;
    isCountryDropdownOpen.value = false;
    selectedPayoutCountryOption.value = null;
    countrySearchQuery.value = '';
};

const toggleCountryDropdown = () => {
    isCountryDropdownOpen.value = !isCountryDropdownOpen.value;
};

const availableCountryPayoutOptions = computed(() => [
    { id: 1, type: t('payout.mock.methodBankDeposit'), bank: t('payout.mock.methodBank'), paysIn: t('payout.mock.currencyEur'), fee: t('payout.mock.feeUsd345'), icon: assets.value.bank },
    { id: 2, type: t('payout.mock.methodBankDeposit'), bank: t('payout.mock.methodBank'), paysIn: t('payout.mock.currencyUsd'), fee: t('payout.mock.feeUsd345'), icon: assets.value.bank },
    { id: 3, type: t('payout.mock.methodBankWire'), bank: t('payout.mock.methodBank'), paysIn: t('payout.mock.currencyUsd'), fee: t('payout.mock.feeUsd345'), icon: assets.value.bank },
    { id: 4, type: t('payout.mock.methodBankWire'), bank: t('payout.mock.methodBank'), paysIn: t('payout.mock.currencyCzk'), fee: t('payout.mock.feeUsd345'), icon: assets.value.bank },
    { id: 5, type: t('payout.mock.methodUsdtEth'), bank: t('payout.mock.typeCrypto'), paysIn: t('payout.mock.currencyUsdt'), fee: t('payout.mock.feeUsd345'), icon: assets.value.crypto }
]);

const selectedPayoutCountryOption = ref(null);

const togglePayoutOption = (id) => {
    if (selectedPayoutCountryOption.value === id) {
        selectedPayoutCountryOption.value = null;
    } else {
        selectedPayoutCountryOption.value = id;
    }
};

const cardMode = ref(props.engine.state.cardDesign?.mode || 'premium');
const cardPremiumBg = ref(props.engine.state.cardDesign?.premiumBg || '');
const cardColor = ref(props.engine.state.cardDesign?.color || '#F72485');

const premiumBackgrounds = computed(() => [
    assets.value.premiumDesign1,
    assets.value.premiumDesign2,
    assets.value.premiumDesign3,
    assets.value.premiumDesign4
]);

if (!cardPremiumBg.value) {
    cardPremiumBg.value = assets.value.premiumDesign1;
}

const avatarColors = [
    '#F72485', '#680EEB', '#3A0BA3', '#4361EE', '#55AACF', '#55CFCD', 
    '#4CC9F0', '#8569FA', '#AE4AEF', '#FF76DD', '#89FAD3', '#78F0F5'
];

</script>
