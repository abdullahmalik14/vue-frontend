<template>
    <BasePopup
        :modelValue="modelValue"
        :popupConfig="profileMerchPopupConfig"
        @update:modelValue="onPopupModelUpdate"
    >
        <!-- wrapper   -->
        <div ref="popupWrapper"
            class="bg-black/50 relative before:absolute before:inset-0 before:bg-[url('/images/ai-art.png')] before:bg-cover before:bg-center before:bg-no-repeat before:content-[''] before:z-[-1] dark:bg-[#181a1b]/50">
            <!-- bg-overlay -->
            <div
                class="absolute inset-0 w-full h-full  backdrop-blur-[40px] pointer-events-none z-[-1] dark:bg-[#181a1b]/5">
            </div>

            <!-- container -->
            <div class="flex flex-col min-h-screen lg:flex-row lg:h-screen lg:overflow-hidden">
                <!-- close-button -->
                <button
                    v-if="!isGalleryOpen"
                    class="fixed top-4 right-4 flex justify-center items-center w-8 h-8 z-50 drop-shadow-[0px_30px_-34px_#0000004D] cursor-pointer"
                    @click="emit('update:modelValue', false)">
                    <img src="https://i.ibb.co.com/DfT6Sg5g/x-close.webp" alt="x close"
                        class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(97%)_sepia(1%)_saturate(5636%)_hue-rotate(182deg)_brightness(95%)_contrast(81%)]">
                </button>

                <!-- splide-section -->
                <div class="h-full lg:w-1/2 lg:flex lg:flex-col lg:h-screen lg:overflow-hidden">
                    <Splide :options="mainOptions" ref="mainSplide"
                        class="splide bg-black/25 flex-1 min-h-0 dark:bg-[#181a1b]/25" aria-label="Main Gallery">
                        <SplideSlide v-for="(img, i) in images" :key="'main-' + i"
                            class="relative flex items-center justify-center" @mousedown="onMouseDown"
                            @mouseup="onMouseUp(i, $event)">
                            <img :src="img.src" :alt="'Image ' + (i + 1)"
                                class="w-full h-auto block cursor-zoom-in rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                        </SplideSlide>
                    </Splide>

                    <Splide :options="thumbOptions" ref="thumbSplide" class="pt-2 shrink-0" aria-label="Thumbnails">
                        <SplideSlide v-for="(img, i) in images" :key="'thumb-' + i"
                            class="aspect-square backdrop-blur-[10px] border ![border:1px_solid_transparent_!important;] transition-all duration-300 cursor-pointer [&.is-active]:[border:1px_solid_#F5F5F4_!important;] after:content-[''] after:absolute after:inset-0 after:bg-[#222222]/10 after:pointer-events-none dark:after:bg-[#2b2f31]/10 dark:[&.is-active]:[border:1px_solid_#333739_!important;]">
                            <img :src="img.thumb" :alt="'Thumb ' + (i + 1)" class="w-full h-full object-cover">
                        </SplideSlide>
                    </Splide>

                    <div ref="lgTrigger" class="hidden"></div>
                </div>

                <!-- text-section -->
                <div
                    class="flex flex-col lg:w-1/2 lg:h-screen lg:overflow-hidden">
                    <div class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] lg:gap-10 lg:p-6 lg:px-10">
                        <!-- text-section__header -->
                        <div class="flex flex-col gap-6">
                            <!-- title-section -->
                            <section class="flex flex-col gap-4 pt-3">
                                <!-- tag-link-section -->
                                <div class="flex items-center gap-1 flex-wrap">
                                    <a href="#"
                                        class="text-sm text-[#D0D5DD] hover:underline hover:text-[#07F468] dark:text-[#cfcac4] dark:hover:text-[#23f97b]">Seasonal
                                        Fruits</a>
                                    <span
                                        class="text-xs leading-normal tracking-[0.01875rem] text-[#D0D5DD] dark:text-[#cfcac4]">,</span>
                                    <a href="#"
                                        class="text-sm text-[#D0D5DD] hover:underline hover:text-[#07F468] dark:text-[#cfcac4] dark:hover:text-[#23f97b]">Mostly
                                        Eating</a>
                                    <span
                                        class="text-xs leading-normal tracking-[0.01875rem] text-[#D0D5DD] dark:text-[#cfcac4]">,</span>
                                    <a href="#"
                                        class="text-sm text-[#D0D5DD] hover:underline hover:text-[#07F468] dark:text-[#cfcac4] dark:hover:text-[#23f97b]">Fried
                                        Chicken</a>
                                </div>

                                <h1
                                    class="text-xl leading-normal font-semibold drop-shadow-[0px_0px_10px_#0000001A] text-[#F5F5F4] lg:text-3xl lg:leading-[2.375rem] dark:text-[#e1dfdb]">
                                    {{ merchTitle }}</h1>
                            </section>

                            <!-- tags-container -->
                            <div class="flex items-center gap-2">
                                <img src="https://i.ibb.co.com/ZRFYW4BD/tag-01.webp" alt="tag 01"
                                    class="w-4 h-4 min-w-[1rem]">

                                <div class="flex items-center gap-2 flex-wrap">
                                    <div
                                        v-for="tag in merchTags"
                                        :key="tag"
                                        class="flex justify-center items-center px-2 h-6 bg-[#0C111D] cursor-pointer dark:bg-[#0a0e17]"
                                    >
                                        <span class="text-sm font-medium text-[#F9FAFB] dark:text-[#dddad5]">{{ tag }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- likes-view-container -->
                            <div class="flex items-center gap-4 ">
                                <!-- likes -->
                                <div class="flex items-center gap-2">
                                    <img src="https://i.ibb.co.com/9kNrMyfz/heart.webp" alt="heart" class="w-4 h-4">
                                    <span class="text-base text-[#F2F4F7] dark:text-[#e1dfdb]">123</span>
                                </div>

                                <!-- views -->
                                <div class="flex items-center gap-2">
                                    <img src="https://i.ibb.co.com/0V8HcdXr/eye.webp" alt="eye" class="w-4 h-4">
                                    <span class="text-base text-[#F2F4F7] dark:text-[#e1dfdb]">2K</span>
                                </div>

                                <!-- merch -->
                                <div class="flex items-center gap-2">
                                    <img src="https://i.ibb.co.com/YTqCn1M0/shopping-cart-03.webp"
                                        alt="shopping cart 03" class="w-4 h-4">
                                    <span class="text-base text-[#F2F4F7] dark:text-[#e1dfdb]">15</span>
                                </div>
                            </div>

                            <!-- price-display -->
                            <div class="flex flex-col gap-2">
                                <div class="inline-flex items-center gap-2">
                                    <div
                                        class="flex items-end gap-0.5 bg-transparent"
                                        :class="{
                                            'drop-shadow-[0_0_40px_rgba(255,195,0,1)]': variant === 'pre-order' || variant === 'subscriber-pre-order',
                                            'drop-shadow-[0_0_27px_rgba(246,0,254,1)]': variant === 'regular' || variant === 'subscriber-grab',
                                        }"
                                    >
                                        <span class="text-xl font-semibold leading-8 text-white">{{ merchCurrency }}</span>
                                        <span
                                            class="text-base font-medium leading-5 text-white line-through"
                                        >{{ merchOldPrice }}</span>
                                        <span class="text-6xl font-semibold leading-[72px] text-white">{{ merchFinalPrice }}</span>
                                    </div>

                                    <!-- Badges next to price: yellow preorder / -% discount / left-stock (same column as -80%) -->
                                    <div
                                        v-if="showPriceSideBadges"
                                        class="inline-flex flex-col items-start justify-center gap-3 pt-px pb-2.5"
                                    >
                                        <template v-if="variant === 'pre-order' || variant === 'subscriber-pre-order'">
                                            <div
                                                class="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-yellow-500 to-yellow-700 px-1.5 py-1"
                                            >
                                                <img src="https://i.ibb.co.com/3m6JKJSh/clock.webp" alt="" class="h-4 w-4 shrink-0">
                                                <span class="text-xs font-semibold leading-none text-black">
                                                    {{ t('shops.merch.detail.preOrderDiscount') }}
                                                </span>
                                            </div>
                                            <div
                                                class="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-yellow-500 to-yellow-700 px-1.5 py-1"
                                            >
                                                <span class="text-xs font-semibold leading-none text-black">
                                                    {{ t('shops.merch.detail.officialRelease', { date: officialReleaseDate }) }}
                                                </span>
                                            </div>
                                        </template>

                                        <div
                                            v-else-if="merchDiscountPercent != null"
                                            class="inline-flex items-center justify-center bg-fuchsia-500 px-1.5 py-1 outline outline-2 outline-offset-[-1px] outline-fuchsia-500"
                                        >
                                            <span class="text-xs font-semibold leading-none text-black">
                                                {{ t('shops.merch.detail.discountPercent', { percent: merchDiscountPercent }) }}
                                            </span>
                                        </div>

                                        <div
                                            v-if="showStockBesidePrice"
                                            class="inline-flex m-0 items-center text-xs font-semibold leading-none text-white justify-center bg-orange-600 px-1.5 py-1"
                                        >
                                            {{
                                                merch?.unlimitedStock
                                                    ? t('shops.merch.detail.unlimitedStock')
                                                    : t('shops.merch.detail.leftInStock', { count: lowStockCount })
                                            }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- button-container: shopper CTAs only once the merch is live -->
                            <div
                                v-if="showShopperCtas"
                                ref="stickyContainer"
                                :class="['flex w-full group/button-container sticky bottom-0', isSticky ? 'is-sticky w-[calc(100%+1rem)] -ml-2 py-6 bg-[linear-gradient(0deg,rgba(255,255,255,0.01)_0%,rgba(255,255,255,0)_100%)] backdrop-blur-[50px]' : '']">

                                <!-- State: pre-order (Yellow) -->
                                <button v-if="variant === 'pre-order'"
                                    type="button"
                                    @click="openPurchase"
                                    class="relative flex-grow h-14 mx-3 group-[.is-sticky]/button-container:mx-5 border-[3px] border-[#FFFADD] bg-[rgba(242,242,3,0.7)] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[inset_0_0_1px_0_#FFF3A1,0_0_10px_0_#FFB909B2,0_5px_50px_0_#F2F20380,0px_0px_10px_0px_#F2F2030D] before:absolute before:inset-0 before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 lg:h-[4.5rem]">
                                    <div
                                        class="w-full h-full flex justify-center items-center gap-0.5 relative z-10 skew-x-[24deg]">
                                        <span
                                            class="text-xl leading-normal font-semibold align-middle text-[#F5F5F5] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap lg:text-3xl lg:leading-[2.375rem]">
                                            {{ t('shops.merch.detail.preOrderNow') }}
                                        </span>
                                    </div>
                                </button>

                                <!-- State: regular (Pink Buy Now + Add to Cart) — keep skew/parallelogram shape -->
                                <template v-else-if="variant === 'regular'">
                                    <button
                                        type="button"
                                        @click="openPurchase"
                                        class="relative flex-grow h-14 ml-3 group-[.is-sticky]/button-container:ml-5 border-[3px] border-[#FFE1FC] bg-[#F600FE]/50 [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[0_0_10px_0_#F600FEB2,0_5px_50px_0_#E803AE80,0_0_35px_0_#E803AE40,0_0_10px_0_#E803AE0D,inset_0_0_1px_0_#FF97F3E5] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 md:before:opacity-65 md:shadow-[0_0_10px_0_#F600FEB2,0_0_40px_0_#E803AE80_inset,0_5px_50px_0_#E803AE80,0_0_35px_0_#E803AE40,0_0_10px_0_#E803AE0D,0_0_1px_0_#FF97F3E5_inset] lg:h-[4.5rem]"
                                    >
                                        <div
                                            class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]"
                                        >
                                            <span
                                                class="text-xl leading-normal font-semibold align-middle text-[#F5F5F5] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap lg:text-3xl lg:leading-[2.375rem]"
                                            >
                                                {{ t('shops.merch.detail.buyNow') }}
                                            </span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        class="relative flex-grow h-14 -ml-[3px] mr-3 group-[.is-sticky]/button-container:mr-5 border-[3px] border-[#FFE1FC] bg-[#E0007880] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[0_0_10px_0_#F600FEB2,0_5px_50px_0_#E803AE80,0_0_35px_0_#E803AE40,0_0_10px_0_#E803AE0D,inset_0_0_1px_0_#FF97F3E5] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 md:before:opacity-65 md:shadow-[0_0_10px_0_#F600FEB2,0_0_40px_0_#E803AE80_inset,0_5px_50px_0_#E803AE80,0_0_35px_0_#E803AE40,0_0_10px_0_#E803AE0D,0_0_1px_0_#FF97F3E5_inset] lg:h-[4.5rem]"
                                    >
                                        <div
                                            class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]"
                                        >
                                            <span
                                                class="text-xl leading-normal font-semibold align-middle text-[#F5F5F5] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap lg:text-3xl lg:leading-[2.375rem]"
                                            >
                                                {{ t('shops.merch.detail.addToCart') }}
                                            </span>
                                        </div>
                                    </button>
                                </template>

                                <!-- State: subscriber-pre-order (Blue) -->
                                <button v-else-if="variant === 'subscriber-pre-order'"
                                    class="relative flex-grow h-14 mx-3 group-[.is-sticky]/button-container:mx-5 border-[3px] border-white bg-[#1EBBFFB2] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[inset_0_0_40px_0_#0D71FC80,inset_0_0_1px_0_#1B45FF,inset_0_0_10px_0_#1EBBFFB2,0_5px_50px_0_#0D71FC80,0_0_35px_0_#0D71FC40,0_0_10px_0_#0D71FC0D] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 lg:h-[4.5rem]">
                                    <div
                                        class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]">
                                        <span
                                            class="text-xl leading-normal font-semibold align-middle text-[#F5F5F5] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap lg:text-3xl lg:leading-[2.375rem]">Subscribe
                                            & Pre-order</span>
                                    </div>
                                </button>

                                <!-- State: subscriber-grab (Blue) -->
                                <button v-else-if="variant === 'subscriber-grab'"
                                    class="relative flex-grow h-14 mx-3 group-[.is-sticky]/button-container:mx-5 border-[3px] border-white bg-[#1EBBFFB2] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[inset_0_0_40px_0_#0D71FC80,inset_0_0_1px_0_#1B45FF,inset_0_0_10px_0_#1EBBFFB2,0_5px_50px_0_#0D71FC80,0_0_35px_0_#0D71FC40,0_0_10px_0_#0D71FC0D] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 lg:h-[4.5rem]">
                                    <div
                                        class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]">
                                        <span
                                            class="text-xl leading-normal font-semibold align-middle text-[#F5F5F5] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap lg:text-3xl lg:leading-[2.375rem]">Subscribe
                                            & Grab</span>
                                    </div>
                                </button>

                                <!-- State: out-of-stock (Red) — same skew shape, red colors -->
                                <button v-else-if="variant === 'out-of-stock'"
                                    type="button"
                                    class="relative flex-grow h-14 mx-3 group-[.is-sticky]/button-container:mx-5 border-[3px] border-[#FFE0E3] bg-[#FF44000D] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[0px_0px_40px_0px_#FC190D80_inset,0px_5px_50px_0px_#FC190D80,0px_0px_35px_0px_#FC190D40,0px_0px_10px_0px_#FC190D0D,0px_0px_1px_0px_#FFB6BC_inset] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-40 lg:h-[4.5rem]">
                                    <div
                                        class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]">
                                        <span
                                            class="text-xl leading-normal font-semibold align-middle text-[#F5F5F5] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap lg:text-3xl lg:leading-[2.375rem]">
                                            {{ t('shops.merch.detail.outOfStock') }}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- tab-section -->
                        <div class="flex flex-col gap-4" :class="showOwnerActions ? 'pb-4' : 'pb-20'">
                            <!-- tab-button-container -->
                            <div class="flex items-center gap-4">
                                <button @click="activeTab = 'product-details'"
                                    :class="['flex justify-center items-center p-2.5 w-max border-b transition-all cursor-pointer', activeTab === 'product-details' ? 'border-white opacity-100' : 'border-transparent opacity-50']">
                                    <span class="text-base text-white dark:text-[#e8e6e3]">Product
                                        Details</span>
                                </button>
                                <button @click="activeTab = 'shipping-policy'"
                                    :class="['flex justify-center items-center p-2.5 w-max border-b transition-all cursor-pointer', activeTab === 'shipping-policy' ? 'border-white opacity-100' : 'border-transparent opacity-50']">
                                    <span class="text-base text-white dark:text-[#e8e6e3]">Shipping
                                        Policy</span>
                                </button>
                            </div>

                            <!-- tab-container -->
                            <div class="flex flex-col">
                                <div v-if="activeTab === 'product-details'" class="flex flex-col gap-4">
                                    <p class="text-sm text-[#F5F5F4] dark:text-[#e1dfdb] whitespace-pre-wrap">{{ merchDescription }}</p>
                                </div>

                                <div v-else class="flex flex-col gap-4">
                                    <div
                                        v-if="merch?.shipInternationally"
                                        class="flex items-center gap-2"
                                    >
                                        <img src="https://i.ibb.co.com/7NBsK3xG/plane.webp" alt="plane" class="w-5 h-5">
                                        <p class="text-sm font-medium text-[#07F468] dark:text-[#23f97b]">This product
                                            ships internationally.</p>
                                    </div>

                                    <div class="hidden items-center gap-2">
                                        <img src="https://i.ibb.co.com/fV9JY4v2/marker-pin-06.webp" alt="marker pin 06"
                                            class="w-5 h-5">
                                        <p class="text-sm font-medium text-[#D7D3D0] dark:text-[#e1dfdb]">This product
                                            ships to Taiwan only.</p>
                                    </div>

                                    <div class="flex gap-4">
                                        <span
                                            class="w-[12.5rem] min-w-[12.5rem] text-sm text-[#F5F5F4] dark:text-[#e1dfdb]">Deliver
                                            from</span>
                                        <div class="flex gap-2 items-center grow flex-wrap">
                                            <span
                                                class="text-sm font-medium text-[#F5F5F4] dark:text-[#e1dfdb]">{{ originCountryLabel }}</span>
                                        </div>
                                    </div>

                                    <div class="flex flex-col gap-2">
                                        <span class="text-sm font-semibold text-[#F5F5F4] dark:text-[#e1dfdb]">Shipping
                                            Fee</span>

                                        <div class="flex gap-4">
                                            <span
                                                class="w-[12.5rem] min-w-[12.5rem] text-xs text-[#F5F5F4] dark:text-[#e1dfdb]">Domestic</span>
                                            <div class="flex gap-2 items-center grow flex-wrap">
                                                <span
                                                    class="text-sm font-medium text-[#F5F5F4] dark:text-[#e1dfdb]">{{ originCountryLabel }}</span>
                                            </div>
                                        </div>

                                        <div class="flex gap-4">
                                            <span
                                                class="w-[12.5rem] min-w-[12.5rem] text-xs text-[#F5F5F4] dark:text-[#e1dfdb]">International</span>
                                            <div class="flex gap-2 items-center grow flex-wrap">
                                                <span
                                                    class="text-sm font-medium text-[#F5F5F4] dark:text-[#e1dfdb]">USD$
                                                    123</span>
                                                <span
                                                    class="text-xs italic text-[#F5F5F4] dark:text-[#e1dfdb]">Applicable
                                                    to
                                                    all countries</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex flex-col gap-2">
                                        <span class="text-sm font-semibold text-[#F5F5F4] dark:text-[#e1dfdb]">Delivery
                                            &
                                            Processing Time</span>

                                        <div class="flex gap-4">
                                            <span
                                                class="w-[12.5rem] min-w-[12.5rem] text-xs text-[#F5F5F4] dark:text-[#e1dfdb]">International</span>
                                            <div class="flex gap-2 items-center grow flex-wrap">
                                                <span
                                                    class="text-sm font-medium text-[#F5F5F4] dark:text-[#e1dfdb]">14-30
                                                    days</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex flex-col gap-2">
                                        <span
                                            class="text-sm font-semibold text-[#F5F5F4] dark:text-[#e1dfdb]">Tracking</span>

                                        <p class="text-sm text-[#F5F5F4] dark:text-[#e1dfdb]">Once your order is
                                            shipped,
                                            you will receive a tracking number via email once Jenny has process your
                                            order.
                                        </p>
                                    </div>

                                    <div class="flex flex-col gap-2">
                                        <span class="text-sm font-semibold text-[#F5F5F4] dark:text-[#e1dfdb]">Customs
                                            and
                                            Duties</span>

                                        <p class="text-sm text-[#F5F5F4] dark:text-[#e1dfdb]">Please be aware that
                                            international shipments may be subject to customs inspections and import
                                            duties.
                                            These charges are the responsibility of the recipient and vary by country.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- button-container (fan view) -->
                        <div
                            v-if="!showOwnerActions"
                            class="flex justify-end items-end gap-2"
                        >
                            <button
                                v-for="icon in ['https://i.ibb.co.com/fGdzgLXp/share-06.webp', 'https://i.ibb.co.com/hFw7MBf2/icon.webp']"
                                :key="icon"
                                type="button"
                                class="inline-flex h-8 w-8 items-center justify-center gap-4 rounded-3xl bg-stone-200/5 p-2 outline outline-[0.5px] outline-offset-[-0.5px] outline-stone-200"
                            >
                                <img :src="icon" class="h-4 w-4" alt="">
                            </button>
                        </div>
                    </div>

                    <!-- Owner footer — flush to bottom of right column (hide while lightGallery open).
                         Out of stock: no bar bg / no action buttons — only share + menu. -->
                    <div
                        v-if="showOwnerActions && !isGalleryOpen"
                        class="relative z-20 flex h-16 w-full shrink-0 items-center justify-end gap-4 px-2 py-4"
                        :class="isOutOfStock ? 'bg-transparent' : 'bg-black/50 backdrop-blur-[50px]'"
                    >
                        <div
                            v-if="!isOutOfStock"
                            class="flex min-w-0 flex-1 items-center justify-between gap-3"
                        >
                            <div class="flex flex-wrap items-center gap-2">
                                <DashboardPrimaryButton
                                    theme="merchEditDetails"
                                    type="button"
                                    :text="t('shops.merch.detail.editDetails')"
                                    :leftIcon="editIconUrl"
                                    :disabled="isReviewing"
                                    :customClass="isReviewing ? '!bg-transparent disabled:!bg-transparent' : ''"
                                    @click="onEditDetails"
                                />

                                <div
                                    v-if="isReviewing"
                                    class="inline-flex h-10 min-w-24 items-center gap-2.5 bg-amber-400 px-2 py-2"
                                >
                                    <img
                                        v-if="reviewingIconUrl"
                                        :src="reviewingIconUrl"
                                        alt=""
                                        class="h-5 w-5 object-contain"
                                    >
                                    <span class="text-base font-medium leading-6 text-gray-900">
                                        {{ t('shops.merch.library.status.reviewing') }}
                                    </span>
                                </div>

                                <DashboardPrimaryButton
                                    v-else-if="canUnpublish"
                                    theme="merchUnpublish"
                                    type="button"
                                    :text="t('shops.merch.detail.unpublish')"
                                    :leftIcon="unpublishIconUrl"
                                    @click="unpublishConfirmOpen = true"
                                />

                                <DashboardPrimaryButton
                                    v-else-if="canPublish"
                                    theme="merchPublish"
                                    type="button"
                                    :text="t('shops.merch.detail.publish')"
                                    :leftIcon="publishedIconUrl"
                                    @click="emit('published')"
                                />
                            </div>

                            <p
                                v-if="isReviewing"
                                class="shrink text-right text-xs font-normal leading-4 text-amber-400"
                            >
                                {{ t('shops.merch.detail.reviewingHint') }}
                            </p>
                            <div
                                v-else-if="showPublishedMeta"
                                class="flex items-center gap-2 text-xs text-white"
                            >
                                <img
                                    v-if="publishedIconUrl"
                                    :src="publishedIconUrl"
                                    alt=""
                                    class="h-4 w-4 object-contain [filter:brightness(0)_saturate(100%)_invert(100%)]"
                                >
                                <span>{{ publishedLabel }}</span>
                            </div>
                        </div>

                        <div
                            data-merch-owner-menu
                            class="relative flex shrink-0 items-end gap-2"
                        >
                            <button
                                v-if="showShareIcon || isOutOfStock"
                                type="button"
                                class="inline-flex h-8 w-8 items-center justify-center gap-4 rounded-3xl bg-stone-200/5 p-2 outline outline-[0.5px] outline-offset-[-0.5px] outline-stone-200"
                            >
                                <img
                                    src="https://i.ibb.co.com/fGdzgLXp/share-06.webp"
                                    class="h-4 w-4"
                                    alt=""
                                >
                            </button>

                            <button
                                type="button"
                                class="inline-flex h-8 w-8 cursor-pointer items-center justify-center gap-4 rounded-3xl bg-stone-200/5 p-2 outline outline-[0.5px] outline-offset-[-0.5px] outline-stone-200"
                                :aria-expanded="ownerMenuOpen"
                                :aria-label="t('shops.merch.library.menu.deleteMerch')"
                                @click.stop="ownerMenuOpen = !ownerMenuOpen"
                            >
                                <img
                                    v-if="menuDotsUrl"
                                    :src="menuDotsUrl"
                                    alt=""
                                    class="h-4 w-4 object-contain [filter:brightness(0)_saturate(100%)_invert(92%)]"
                                >
                            </button>

                            <!-- Figma: menu opens above the ⋮ — kept inside popup (no teleport) -->
                            <div
                                v-if="ownerMenuOpen"
                                class="absolute bottom-full right-0 z-[30] rounded-md mb-2 min-w-[10.5rem] overflow-hidden bg-white/60 py-1 shadow-[0_4px_12px_rgba(0,0,0,0.18)] backdrop-blur-[12px]"
                                @click.stop
                            >
                                <div class="flex justify-center items-center px-1.5 py-px">
                                    <button
                                        type="button"
                                        class="flex items-center gap-2 rounded-md px-2.5 py-2 text-left"
                                        @click="onDeleteMenuClick"
                                    >
                                        <img
                                            v-if="deleteIconUrl"
                                            :src="deleteIconUrl"
                                            alt=""
                                            class="h-4 w-4 shrink-0 object-contain [filter:brightness(0)_saturate(100%)_invert(32%)_sepia(98%)_saturate(2000%)_hue-rotate(2deg)]"
                                        >
                                        <span class="text-sm font-medium leading-5 text-[#FF4405]">
                                            {{ t('shops.merch.library.menu.deleteMerch') }}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <MerchActionConfirmPopup
            v-model="unpublishConfirmOpen"
            overlay-class="merchDestructive"
            :title="t('shops.merch.detail.unpublishConfirm.title')"
            :message="t('shops.merch.detail.unpublishConfirm.message')"
            :back-label="t('shops.merch.detail.unpublishConfirm.back')"
            :confirm-label="t('shops.merch.detail.unpublishConfirm.confirm')"
            @confirm="emit('unpublished')"
        />
        <MerchActionConfirmPopup
            v-model="deleteConfirmOpen"
            overlay-class="merchDestructive"
            :title="t('shops.merch.detail.deleteConfirm.title')"
            :message="t('shops.merch.detail.deleteConfirm.message')"
            :back-label="t('shops.merch.detail.deleteConfirm.back')"
            :confirm-label="t('shops.merch.detail.deleteConfirm.confirm')"
            @confirm="emit('deleted')"
        />
    </BasePopup>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import '@splidejs/vue-splide/css/core';
import lightGallery from 'lightgallery';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import MerchActionConfirmPopup from '@/dev/components/ui/popups/shops/MerchActionConfirmPopup.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';

const FALLBACK_IMAGES = [
    { src: "/images/referral-img.png", thumb: "/images/referral-img.png" },
    { src: "/images/ai-art.png", thumb: "/images/ai-art.png" },
    { src: "/images/background.png", thumb: "/images/background.png" },
    { src: "/images/ai-art-girl.png", thumb: "/images/ai-art-girl.png" },
];

const activeTab = ref('product-details');
const isSticky = ref(false);
const mainSplide = ref(null);
const thumbSplide = ref(null);
const lgTrigger = ref(null);
const stickyContainer = ref(null);
const popupWrapper = ref(null);
const isGalleryOpen = ref(false);
const unpublishConfirmOpen = ref(false);
const deleteConfirmOpen = ref(false);
const ownerMenuOpen = ref(false);
let lgInstance = null;
let startX, startY;
let ownerMenuOutsideHandler = null;

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    variant: {
        type: String,
        default: 'regular',
        validator: (value) => ['regular', 'pre-order', 'subscriber-pre-order', 'subscriber-grab', 'out-of-stock'].includes(value)
    },
    merch: {
        type: Object,
        default: null
    },
    /** Creator shop page — show Edit / Unpublish / Delete footer */
    showOwnerActions: {
        type: Boolean,
        default: false,
    },
    /**
     * When a stacked popup (edit listing, etc.) is open on top, do not dismiss
     * this panel on outside click / Escape — only the top popup should close.
     */
    suppressDismiss: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits([
    "update:modelValue",
    "purchase",
    "edit-details",
    "unpublished",
    "published",
    "deleted",
]);

const { t } = useI18n();
const { url: editIconUrl } = useAssetUrl('shops.merch.icon.edit');
const { url: unpublishIconUrl } = useAssetUrl('icon.media.menu.unpublish');
const { url: deleteIconUrl } = useAssetUrl('icon.media.menu.delete');
const { url: publishedIconUrl } = useAssetUrl('icon.media.upload');
const { url: reviewingIconUrl } = useAssetUrl('shops.merch.icon.reviewing');
const { url: menuDotsUrl } = useAssetUrl('icon.media.threeDotsVertical');

const stripMoney = (value, fallback) => String(value ?? fallback).replace(/^\$/, '');

const images = computed(() => {
    const gallery = Array.isArray(props.merch?.galleryUploaded) ? props.merch.galleryUploaded : [];
    const mapped = gallery
        .map((item) => {
            const src = item?.dataUrl || item?.objectUrl || item?.src || '';
            if (!src) return null;
            return { src, thumb: item?.thumb || src };
        })
        .filter(Boolean);
    if (mapped.length) return mapped;
    if (props.merch?.thumbnail) {
        return [{ src: props.merch.thumbnail, thumb: props.merch.thumbnail }];
    }
    return FALLBACK_IMAGES;
});

const merchTitle = computed(() => props.merch?.title || '[Peach] from my farm-Peach from my farm (Autumn harvest)');
const merchDescription = computed(() =>
    props.merch?.description
    || "Get Jenny’s favourite Mangoes! Buy them while supply last !",
);
const merchTags = computed(() => {
    const tags = Array.isArray(props.merch?.tags) ? props.merch.tags : [];
    const names = tags.map((tag) => (typeof tag === 'string' ? tag : tag?.name)).filter(Boolean);
    return names.length ? names : ['Featured', 'Best Seller', 'Seasonal Offers'];
});
const merchCurrency = computed(() => {
    const currency = props.merch?.currency || 'USD';
    return currency.endsWith('$') ? currency : `${currency}$`;
});
const merchOldPrice = computed(() =>
    stripMoney(props.merch?.originalPrice ?? props.merch?.price, '12.99'),
);
const merchFinalPrice = computed(() =>
    stripMoney(props.merch?.discountedPrice ?? props.merch?.finalPrice, '6.99'),
);
const merchDiscountPercent = computed(() => {
    const original = Number(merchOldPrice.value);
    const final = Number(merchFinalPrice.value);
    if (!Number.isFinite(original) || !Number.isFinite(final) || original <= 0 || final >= original) {
        return null;
    }
    return Math.round(((original - final) / original) * 100);
});
const officialReleaseDate = computed(() =>
    props.merch?.officialReleaseDate || props.merch?.releaseDate || '12 Jul 2024',
);
const lowStockCount = computed(() => {
    const stock = Number(props.merch?.stockAmount ?? props.merch?.stock);
    return Number.isFinite(stock) && stock > 0 ? stock : 1;
});
/** Inventory step: unlimited checkbox OR limited stock amount > 0. */
const showStockBadge = computed(() => {
    if (props.variant === 'out-of-stock') return false;
    if (props.merch?.unlimitedStock) return true;
    const raw = props.merch?.stockAmount ?? props.merch?.stock;
    if (raw === '' || raw == null) return false;
    const stock = Number(raw);
    return Number.isFinite(stock) && stock > 0;
});
/** Left-stock sits with the -% badge (not under yellow pre-order badges). */
const showStockBesidePrice = computed(() => {
    if (props.variant === 'pre-order' || props.variant === 'subscriber-pre-order') return false;
    return showStockBadge.value;
});
const showPriceSideBadges = computed(() => {
    if (props.variant === 'pre-order' || props.variant === 'subscriber-pre-order') return true;
    if (merchDiscountPercent.value != null) return true;
    return showStockBesidePrice.value;
});
const publishedLabel = computed(() => {
    const date = props.merch?.publishedAt || props.merch?.publishedOn || 'Nov-3-2024 23:23';
    return t('shops.merch.detail.publishedOn', { date });
});

const merchStatus = computed(() => props.merch?.status || 'draft');
const isOutOfStock = computed(() => props.variant === 'out-of-stock');
const isReviewing = computed(() => merchStatus.value === 'reviewing');
const canUnpublish = computed(() =>
    merchStatus.value === 'published' || merchStatus.value === 'preorder',
);
/** Live shopper CTAs, or the OUT OF STOCK skew button (draft out-of-stock). */
const showShopperCtas = computed(() => canUnpublish.value || isOutOfStock.value);
const canPublish = computed(() => merchStatus.value === 'draft');
const showShareIcon = computed(() => !isReviewing.value && !canPublish.value);
const showPublishedMeta = computed(() =>
    canUnpublish.value && Boolean(props.merch?.publishedAt || props.merch?.publishedOn),
);

const originCountryLabel = computed(() => {
    const key = props.merch?.originCountry;
    if (!key) return 'Taiwan';
    const i18nKey = `shops.merch.listing.inventory.countries.${key}`;
    const label = t(i18nKey);
    return label === i18nKey ? key : label;
});

function onEditDetails() {
    if (isReviewing.value) return;
    emit('edit-details');
}

function onDeleteMenuClick() {
    ownerMenuOpen.value = false;
    deleteConfirmOpen.value = true;
}

function bindOwnerMenuOutside() {
    if (typeof document === 'undefined') return;
    unbindOwnerMenuOutside();
    ownerMenuOutsideHandler = (event) => {
        if (event.target?.closest?.('[data-merch-owner-menu]')) return;
        ownerMenuOpen.value = false;
    };
    // Next tick so the opening click does not immediately close.
    setTimeout(() => {
        if (!ownerMenuOutsideHandler) return;
        document.addEventListener('click', ownerMenuOutsideHandler, true);
    }, 0);
}

function unbindOwnerMenuOutside() {
    if (typeof document === 'undefined' || !ownerMenuOutsideHandler) return;
    document.removeEventListener('click', ownerMenuOutsideHandler, true);
    ownerMenuOutsideHandler = null;
}

watch(ownerMenuOpen, (open) => {
    if (open) bindOwnerMenuOutside();
    else unbindOwnerMenuOutside();
});

const openPurchase = () => {
    emit('purchase', props.merch);
};

function refreshGallery() {
    nextTick(() => {
        setTimeout(() => {
            mainSplide.value?.splide?.refresh();
            thumbSplide.value?.splide?.refresh();
        }, 50);
    });
}

// When popup opens, Splide + lightGallery need current merch slides (not stale init/fallback).
watch(() => props.modelValue, async (open) => {
    if (!open) {
        ownerMenuOpen.value = false;
        if (lgInstance && isGalleryOpen.value) {
            lgInstance.closeGallery();
            isGalleryOpen.value = false;
        }
        return;
    }
    await nextTick();
    refreshGallery();
    syncLightGallery();
});

watch(images, () => {
    if (!props.modelValue) return;
    refreshGallery();
    syncLightGallery();
});

const lockProfileDismiss = computed(
    () => props.suppressDismiss || unpublishConfirmOpen.value || deleteConfirmOpen.value,
);

/** Ignore outside/Escape close while a stacked popup is open — keep profile merch open. */
function onPopupModelUpdate(val) {
    if (!val && lockProfileDismiss.value) return;
    emit('update:modelValue', val);
}

const profileMerchPopupConfig = computed(() => ({
    actionType: "slideIn",
    from: "right",
    offset: "0px",
    speed: "250ms",
    effect: "ease-in-out",
    shouldShowOverlay: false,
    shouldCloseOnOutsideClick: !lockProfileDismiss.value,
    shouldLockBodyScroll: true,
    shouldCloseOnEscape: !lockProfileDismiss.value,
    width: { default: "100%", "<768": "100%" },
    height: { default: "100%", "<768": "100%" },
    scrollable: true,
    closeSpeed: "250ms",
    closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
}));

const mainOptions = {
    type: 'fade',
    pagination: false,
    arrows: false,
    cover: true,
    heightRatio: 1.22445,
    mediaQuery: 'min',
    breakpoints: {
        480: { heightRatio: 1.1755, height: '450px' },
        1024: { heightRatio: 'auto', fixedHeight: '100vh' }
    }
};

const thumbOptions = {
    perPage: 6,
    gap: 8,
    pagination: false,
    isNavigation: true,
    arrows: false,
    drag: true,
    mediaQuery: 'min',
};

function getLgDynamicEl() {
    return images.value.map((img) => ({
        src: img.src,
        thumb: img.thumb || img.src,
    }));
}

/** Keep lightGallery in sync with current merch images (init alone uses stale/fallback slides). */
function syncLightGallery() {
    if (!lgInstance) return;
    const els = getLgDynamicEl();
    if (typeof lgInstance.refresh === 'function') {
        lgInstance.refresh(els);
        return;
    }
    if (lgInstance.settings) {
        lgInstance.settings.dynamicEl = els;
    }
}

const onMouseDown = (e) => { startX = e.clientX; startY = e.clientY; };
const onMouseUp = (index, e) => {
    const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
    if (dist >= 12 || !lgInstance) return;
    syncLightGallery();
    lgInstance.openGallery(index);
};

const checkSticky = () => {
    if (!stickyContainer.value) return;
    const rect = stickyContainer.value.getBoundingClientRect();
    isSticky.value = Math.abs(rect.bottom - window.innerHeight) < 2;
};

// Check for fine pointer (mouse)
const hasFinePointer = () => window.matchMedia('(pointer: fine)').matches;

onMounted(async () => {
    await nextTick();
    const main = mainSplide.value?.splide;
    const thumbs = thumbSplide.value?.splide;
    if (main && thumbs) main.sync(thumbs);

    if (!lgTrigger.value || !popupWrapper.value) return;

    // Init LightGallery — slides refreshed via syncLightGallery() whenever merch images change
    lgInstance = lightGallery(lgTrigger.value, {
        container: popupWrapper.value,
        dynamic: true,
        dynamicEl: getLgDynamicEl(),
        plugins: [lgThumbnail],
        speed: 400,
        download: false,
        counter: false,
        controls: false,
        showCloseIcon: false,
        addClass: 'lg-custom-thumbs',
        backdropClass: 'lg-profile-merch-backdrop',
        thumbMargin: 0,
    });
    syncLightGallery();

    // Parallax & Custom Cursor Logic
    lgTrigger.value.addEventListener('lgAfterOpen', () => {
        isGalleryOpen.value = true;
        const outer = document.querySelector('.lg-outer');
        if (!outer) return;

        // Hide Scrollbar of the popup container to prevent clipping/artifacts
        if (popupWrapper.value && popupWrapper.value.parentElement) {
            popupWrapper.value.parentElement.style.overflow = 'hidden';
        }

        // Force-hide default toolbar & content bottom shift (handled by CSS, but robust safety here)
        const toolbar = outer.querySelector('.lg-toolbar');
        if (toolbar) toolbar.classList.add('!hidden');

        const lgImageContainer = outer.querySelector('.lg-content');
        if (lgImageContainer) lgImageContainer.classList.add('!bottom-[7.875rem]');

        // Custom Close Button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'fixed top-6 right-6 flex justify-center items-center w-12 h-12 bg-black/30 backdrop-blur-[10px] rounded-full cursor-pointer z-[10000] dark:bg-[#181a1b]/30';
        closeBtn.innerHTML = `
            <img src="https://i.ibb.co.com/DfT6Sg5g/x-close.webp" 
                 alt="x close" 
                 class="w-8 h-8 drop-shadow-[0px_0px_8px_#00000080] [filter:brightness(0)_saturate(100%)_invert(97%)_sepia(1%)_saturate(5636%)_hue-rotate(182deg)_brightness(95%)_contrast(81%)]">
        `;
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (lgInstance) lgInstance.closeGallery();
        });
        outer.appendChild(closeBtn);

        // CUSTOM CURSOR (only if fine pointer)
        let customCursor = null;
        if (hasFinePointer()) {
            customCursor = document.createElement('div');
            customCursor.id = 'lg-custom-cursor';
            customCursor.className = `flex justify-center items-center w-10 h-10 lg:w-20 lg:h-20 rounded-full bg-black/25 backdrop-blur-[10px] group/cursor dark:bg-[#181a1b]/25 pointer-events-none fixed z-[9999] transition-opacity duration-200 opacity-0 transform -translate-x-1/2 -translate-y-1/2`;
            customCursor.innerHTML = `
                <img src="https://i.ibb.co.com/TDGYvfTn/zoom-in.webp" alt="zoom in" class="w-6 h-6 lg:w-10 lg:h-10 zoom-in-icon transition-all duration-200">
                <img src="https://i.ibb.co.com/jdwwgzf/zoom-out.webp" alt="zoom out" class="w-6 h-6 lg:w-10 lg:h-10 zoom-out-icon hidden transition-all duration-200">
            `;
            outer.appendChild(customCursor);

            // Inject strong cursor override for Chrome/Safari compatibility
            if (!document.getElementById('lg-cursor-override')) {
                const style = document.createElement('style');
                style.id = 'lg-cursor-override';
                style.innerHTML = `
                @media (pointer: fine) {
                    .lg-outer.lg-grab .lg-item img,
                    .lg-outer.lg-grabbing .lg-item img {
                    }
                }
                `;
                document.head.appendChild(style);
            }
        }

        // Force-hide ALL default cursors
        const forceNoCursor = () => {
            const imageAreas = outer.querySelectorAll('.lg-object, .lg-image');
            imageAreas.forEach(el => {
                if (el) el.style.setProperty('cursor', 'none', 'important');
            });
        };
        forceNoCursor();

        // Background Blur Logic
        // Handled via CSS class .lg-profile-merch-backdrop
        const lgBackgroundWrapper = document.querySelector('.lg-backdrop');
        if (lgBackgroundWrapper) {
            lgBackgroundWrapper.style.backgroundSize = 'cover';
            lgBackgroundWrapper.style.backgroundPosition = 'center';
            lgBackgroundWrapper.style.backgroundRepeat = 'no-repeat';
            lgBackgroundWrapper.style.filter = 'blur(50px)';
            lgBackgroundWrapper.style.transform = 'scale(1.12)';
        }

        const updateBackground = () => {
            const currentImg = outer.querySelector('.lg-current img');
            if (currentImg && lgBackgroundWrapper) {
                lgBackgroundWrapper.style.backgroundImage = `url(${currentImg.src})`;
            }
        };
        updateBackground();

        // Thumbnails Logic
        const thumbOuter = outer.querySelector('.lg-thumb-outer');
        if (thumbOuter) thumbOuter.classList.add('!bg-transparent');

        const thumbInner = outer.querySelector('.lg-thumb');
        if (thumbInner) {
            thumbInner.classList.add('!w-full', '!flex', 'justify-self-center', 'gap-1', '!bg-transparent', 'drop-shadow-[0px_30px_-34px_#0000004D]', '!p-1', '!m-0', '!flex-nowrap', '!overflow-x-hidden', '!transform-none', '!transition-none', 'md:!w-[45rem]', 'md:!p-2', 'md:gap-2');
        }

        const thumbItems = outer.querySelectorAll('.lg-thumb-item');
        thumbItems.forEach(wrapper => {
            wrapper.classList.add('!h-auto', '!aspect-square', '!mb-0', 'backdrop-blur-[10px]', 'bg-white/20', '[border:1px_solid_transparent_!important;]', '[&.active]:[border:1px_solid_#F5F5F4_!important;]', 'dark:bg-[#181a1b]/20', 'dark:[&.active]:[border:1px_solid_#333739_!important;]');
            // Dynamic width calculation
            if (window.innerWidth >= 1024) {
                wrapper.style.setProperty('width', `calc((45rem - 1.75rem) / ${images.value.length})`, 'important');
            } else {
                wrapper.style.setProperty('width', `calc((100vw - 1.75rem) / ${images.value.length})`, 'important');
            }

            const img = wrapper.querySelector('img');
            if (img) img.classList.add('!w-full', '!h-full', '!object-cover');
        });

        const getCurrentImg = () => outer.querySelector('.lg-current .lg-image');

        const updateZoomCursor = (isZoomed) => {
            if (!customCursor) return;
            customCursor.querySelector('.zoom-in-icon')?.classList.toggle('hidden', isZoomed);
            customCursor.querySelector('.zoom-out-icon')?.classList.toggle('hidden', !isZoomed);
        };

        const setImageZoomed = (zoomed) => {
            outer.classList.toggle('lg-merch-zoomed', zoomed);
            const img = getCurrentImg();
            if (img) {
                img.style.setProperty('transform', zoomed ? 'scale(1.8)' : 'scale(1)', 'important');
                img.style.setProperty('transform-origin', 'center center', 'important');
            }
            updateZoomCursor(zoomed);
        };

        const handleImageClick = (e) => {
            if (!(e.target.closest('.lg-current .lg-image') || e.target.closest('.lg-current .lg-object'))) return;
            e.preventDefault();
            e.stopPropagation();
            setImageZoomed(!outer.classList.contains('lg-merch-zoomed'));
        };

        const handleMouseMove = (e) => {
            if (!customCursor) return;
            const isOverImage = e.target.closest('.lg-current .lg-image') || e.target.closest('.lg-current .lg-object');
            if (isOverImage) {
                customCursor.style.left = `${e.clientX}px`;
                customCursor.style.top = `${e.clientY}px`;
                customCursor.style.opacity = '1';
                updateZoomCursor(outer.classList.contains('lg-merch-zoomed'));
            } else {
                customCursor.style.opacity = '0';
            }
        };

        outer.addEventListener('click', handleImageClick);
        outer.addEventListener('mousemove', handleMouseMove);

        // Helper to clean up listener
        const cleanupListener = () => {
            outer.removeEventListener('mousemove', handleMouseMove);
            outer.removeEventListener('click', handleImageClick);
        };

        const getCenterFrameSize = () => {
            const width = 400;
            const height = Math.round(Math.min(window.innerHeight * 0.76, 780));
            return { width, height };
        };

        const applyFrameToImage = (img) => {
            if (!img || img.classList.contains('lg-merch-blur-bg')) return;
            const { width, height } = getCenterFrameSize();
            const wrap = img.closest('.lg-img-wrap');
            if (wrap) {
                wrap.style.setProperty('width', `${width}px`, 'important');
                wrap.style.setProperty('height', `${height}px`, 'important');
                wrap.style.setProperty('position', 'absolute', 'important');
                wrap.style.setProperty('left', '50%', 'important');
                wrap.style.setProperty('top', '50%', 'important');
                wrap.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
                wrap.style.setProperty('margin', '0', 'important');
            }
            img.style.setProperty('width', `${width}px`, 'important');
            img.style.setProperty('height', `${height}px`, 'important');
            img.style.setProperty('max-width', `${width}px`, 'important');
            img.style.setProperty('max-height', `${height}px`, 'important');
            img.style.setProperty('object-fit', 'cover', 'important');
            img.style.setProperty('transform-origin', 'center center', 'important');
            if (!outer.classList.contains('lg-merch-zoomed') || !img.closest('.lg-current')) {
                img.style.setProperty('transform', 'scale(1)', 'important');
            }
        };

        const syncCenterImageSize = () => {
            outer.querySelectorAll('.lg-item .lg-image, .lg-item .lg-object').forEach(applyFrameToImage);
        };

        syncCenterImageSize();
        requestAnimationFrame(syncCenterImageSize);
        setTimeout(syncCenterImageSize, 50);
        setTimeout(syncCenterImageSize, 200);

        lgTrigger.value.addEventListener('lgAfterAppendSlide', syncCenterImageSize);
        lgTrigger.value.addEventListener('lgSlideItemLoad', syncCenterImageSize);
        window.addEventListener('resize', syncCenterImageSize);

        // lgAfterSlide Logic
        const onSlide = () => {
            setImageZoomed(false);
            syncCenterImageSize();
            updateBackground();

            const thumb = outer.querySelector('.lg-thumb');
            if (thumb) {
                thumb.style.left = '0px';
                thumb.style.transform = 'translateX(0px)';
                thumb.style.display = 'flex'; // Re-apply flex
            }
            forceNoCursor();
        };

        lgTrigger.value.addEventListener('lgAfterSlide', onSlide);

        // Cleanup on Close
        lgTrigger.value.addEventListener('lgBeforeClose', () => {
            isGalleryOpen.value = false;
            cleanupListener();
            const cursor = outer.querySelector('#lg-custom-cursor');
            if (cursor) cursor.remove();

            // Restore Scrollbar
            if (popupWrapper.value && popupWrapper.value.parentElement) {
                popupWrapper.value.parentElement.style.removeProperty('overflow');
            }

            lgTrigger.value.removeEventListener('lgAfterSlide', onSlide);
            lgTrigger.value.removeEventListener('lgAfterAppendSlide', syncCenterImageSize);
            lgTrigger.value.removeEventListener('lgSlideItemLoad', syncCenterImageSize);
            window.removeEventListener('resize', syncCenterImageSize);
        }, { once: true });

    });
});

onUnmounted(() => {
    unbindOwnerMenuOutside();
    window.removeEventListener('scroll', checkSticky, true);
    window.removeEventListener('resize', checkSticky);
    lgInstance?.destroy();
});
</script>

<style>
/* Global styles for LightGallery when appended to body */
.lg-outer {
    z-index: 999999 !important;
    position: fixed !important;
    /* Scoped to viewport for correct centering */
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
}

/* Blur the cover photo itself. backdrop-filter cannot blur this element's own image. */
.lg-backdrop.lg-profile-merch-backdrop {
    z-index: 999998 !important;
    background-color: transparent !important;
    background-size: cover !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
    filter: blur(50px) !important;
    transform: scale(1.12) !important;
    opacity: 1 !important;
    transition: opacity 0.4s ease 0s !important;
}

.dark .lg-backdrop.lg-profile-merch-backdrop {
    background-color: transparent !important;
}

.lg-backdrop.lg-profile-merch-backdrop::after {
    content: none;
}

/* Instance specific overrides using the class added in config: 'lg-custom-thumbs' */
.lg-outer.lg-custom-thumbs {
    cursor: none !important;
}

.lg-outer.lg-custom-thumbs .lg-item img {
    cursor: none !important;
}

/* Strict Layout Overrides for LightGallery to prevent gaps */
.lg-outer.lg-custom-thumbs .lg-toolbar {
    display: none !important;
    height: 0 !important;
}

.lg-outer.lg-custom-thumbs .lg-content {
    top: 0 !important;
    bottom: 7.875rem !important;
    /* Space for thumbnails */
    height: auto !important;
    padding-top: 0 !important;
}

.lg-outer.lg-custom-thumbs .lg-inner {
    top: 0 !important;
    margin-top: 0 !important;
}

.lg-outer.lg-custom-thumbs .lg-img-wrap {
    width: 400px !important;
    height: min(76vh, 780px) !important;
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
    overflow: hidden !important;
}

.lg-outer.lg-custom-thumbs .lg-item .lg-image,
.lg-outer.lg-custom-thumbs .lg-item .lg-object {
    width: 400px !important;
    height: min(76vh, 780px) !important;
    max-width: 400px !important;
    max-height: min(76vh, 780px) !important;
    object-fit: cover !important;
    transform-origin: center center !important;
    transition: transform 0.25s ease !important;
}
</style>

<style scoped>
.is-sticky::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0) 100%);
}
</style>