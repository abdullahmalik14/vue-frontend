<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.checkoutReusable.sectionTitle')" />

        <div class=" bg-[#272727] font-sans p-6 flex flex-col gap-10 ">
            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.mediaPreview') }}</p>
                <CheckoutMediaPreview
                    :image="assets.featuredMediaBg"
                    :creator-name="t('demo.checkoutReusable.mediaPreview.creatorName')"
                    :creator-handle="t('demo.checkoutReusable.mediaPreview.creatorHandle')"
                    :is-verified="true"
                    :description="t('demo.checkoutReusable.mediaPreview.description')"
                />
                <ShowCodeToggle :code="code.mediaPreview" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.addressCard') }}</p>
                <AddressCard :address="t('demo.checkoutReusable.address.cart')" />
                <ShowCodeToggle :code="code.addressCard" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.planDropdown') }}</p>
                <div class="flex items-center gap-2">
                    <BasePlanDropdown
                        variant="checkout"
                        :label="t('demo.checkoutReusable.planDropdown.country')"
                        :options="countryOptions"
                        v-model="selectedCountry"
                    />
                    <BasePlanDropdown
                        variant="checkout"
                        :label="t('demo.checkoutReusable.planDropdown.state')"
                        :options="stateOptions"
                        v-model="selectedState"
                        placeholder=""
                    />
                </div>
                <ShowCodeToggle :code="code.planDropdown" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.notesWithAvatars') }}</p>
                <CheckoutNotes :show-avatars="true" v-model="notesWithAvatars" />
                <ShowCodeToggle :code="code.notesWithAvatars" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.notesWithoutAvatars') }}</p>
                <CheckoutNotes :show-avatars="false" v-model="notesWithoutAvatars" />
                <ShowCodeToggle :code="code.notesWithoutAvatars" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.notesGuest') }}</p>
                <CheckoutNotes :show-avatars="true" v-model="orderNotes" />
                <ShowCodeToggle :code="code.notesGuest" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.totalAmount') }}</p>
                <TotalAmountRow :amount="t('demo.checkoutReusable.total.amount')" />
                <ShowCodeToggle :code="code.totalAmount" />
            </div>
        </div>

        <div class="flex flex-col gap-10">
            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkoutReusable.sections.addressTopUp') }}</p>
                <AddressCard :address="t('demo.checkoutReusable.address.topUp')" />
                <ShowCodeToggle :code="code.addressTopUp" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AddressCard from '@/dev/components/checkout/reusable/AddressCard.vue';
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import CheckoutMediaPreview from '@/dev/components/checkout/reusable/CheckoutMediaPreview.vue';
import CheckoutNotes from '@/dev/components/checkout/reusable/CheckoutNotes.vue';
import TotalAmountRow from '@/dev/components/checkout/reusable/TotalAmountRow.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();
const { assets } = useCheckoutDemoAssets();

const notesWithAvatars = ref('');
const notesWithoutAvatars = ref('');
const orderNotes = ref('');

const selectedCountry = ref('hong-kong');
const selectedState = ref('florida');

const countryOptions = computed(() => ([
  { label: t('demo.checkoutReusable.options.hongKong'), value: 'hong-kong' },
  { label: t('demo.checkoutReusable.options.australia'), value: 'australia' },
  { label: t('demo.checkoutReusable.options.usa'), value: 'usa' },
]));

const stateOptions = computed(() => ([
  { label: t('demo.checkoutReusable.options.florida'), value: 'florida' },
  { label: t('demo.checkoutReusable.options.hawaii'), value: 'hawaii' },
  { label: t('demo.checkoutReusable.options.newYork'), value: 'new-york' },
]));

const code = computed(() => ({
  mediaPreview: `import CheckoutMediaPreview from '@/dev/components/checkout/reusable/CheckoutMediaPreview.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();

<CheckoutMediaPreview
  :image="assets.featuredMediaBg"
  :creator-name="t('demo.checkoutReusable.mediaPreview.creatorName')"
  :creator-handle="t('demo.checkoutReusable.mediaPreview.creatorHandle')"
  :is-verified="true"
  :description="t('demo.checkoutReusable.mediaPreview.description')"
/>`,
  addressCard: `import AddressCard from '@/dev/components/checkout/reusable/AddressCard.vue';

<AddressCard :address="t('demo.checkoutReusable.address.cart')" />`,
  planDropdown: `import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';

<BasePlanDropdown
  variant="checkout"
  :label="t('demo.checkoutReusable.planDropdown.country')"
  :options="countryOptions"
  v-model="selectedCountry"
/>
<BasePlanDropdown
  variant="checkout"
  :label="t('demo.checkoutReusable.planDropdown.state')"
  :options="stateOptions"
  v-model="selectedState"
  placeholder=""
/>`,
  notesWithAvatars: `import CheckoutNotes from '@/dev/components/checkout/reusable/CheckoutNotes.vue';

<CheckoutNotes :show-avatars="true" v-model="notesWithAvatars" />`,
  notesWithoutAvatars: `import CheckoutNotes from '@/dev/components/checkout/reusable/CheckoutNotes.vue';

<CheckoutNotes :show-avatars="false" v-model="notesWithoutAvatars" />`,
  notesGuest: `import CheckoutNotes from '@/dev/components/checkout/reusable/CheckoutNotes.vue';

<CheckoutNotes :show-avatars="true" v-model="orderNotes" />`,
  totalAmount: `import TotalAmountRow from '@/dev/components/checkout/reusable/TotalAmountRow.vue';

<TotalAmountRow :amount="t('demo.checkoutReusable.total.amount')" />`,
  addressTopUp: `import AddressCard from '@/dev/components/checkout/reusable/AddressCard.vue';

<AddressCard :address="t('demo.checkoutReusable.address.topUp')" />`,
}));
</script>
