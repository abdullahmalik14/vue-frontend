<template>
  <section class="flex flex-col gap-12">
    <p class="text-xs text-slate-500/80">
      {{ t('demo.page.sections.shoppingCartDescription') }}
    </p>

    <!-- Full Cart -->
    <div class="flex flex-col gap-3">
      <Cart />
      <ShowCodeToggle :code="code.cart" />
    </div>

    <!-- CartTypeToggle -->
    <div class="flex flex-col items-start gap-3">
      <div class="bg-[#0C111D] p-4 w-max">
        <CartTypeToggle v-model="cartType" />
      </div>
      <ShowCodeToggle :code="code.cartTypeToggle" />
    </div>

    <!-- Sync Live -->
    <div class="flex flex-col items-start gap-3">
      <div class="bg-[#0C111D] p-4 w-max">
        <DashboardPrimaryButton
          :text="t('cart.syncLive')"
          theme="cartSyncLive"
        />
      </div>
      <ShowCodeToggle :code="code.syncLive" />
    </div>

    <!-- Rename input -->
    <div class="flex flex-col items-start gap-3 w-full max-w-[26.875rem]">
      <div class="bg-[#0C111D] px-3 py-2 w-full">
        <DashboardTextInput
          v-model="newLabel"
          :placeholder="t('cart.renamePlaceholder')"
          :show-label="false"
          theme="cartCompact"
        />
      </div>
      <ShowCodeToggle :code="code.renameInput" />
    </div>

    <!-- Save -->
    <div class="flex flex-col items-start gap-3">
      <div class="bg-[#0C111D] p-4 w-max">
        <DashboardPrimaryButton
          :text="t('cart.save')"
          theme="cartSave"
        />
      </div>
      <ShowCodeToggle :code="code.save" />
    </div>

    <!-- Coupon input -->
    <div class="flex flex-col items-start gap-3 w-full max-w-[26.875rem]">
      <div class="bg-[#0C111D] px-3 py-2 w-full">
        <DashboardTextInput
          v-model="couponCode"
          :placeholder="t('cart.couponPlaceholder')"
          :show-label="false"
          theme="cartCompact"
        />
      </div>
      <ShowCodeToggle :code="code.couponInput" />
    </div>

    <!-- Apply -->
    <div class="flex flex-col items-start gap-3">
      <div class="bg-[#0C111D] p-4 w-max">
        <DashboardPrimaryButton
          :text="t('cart.apply')"
          theme="cartApply"
        />
      </div>
      <ShowCodeToggle :code="code.apply" />
    </div>

    <!-- Remove -->
    <div class="flex flex-col items-start gap-3">
      <div class="bg-[#0C111D] p-4 w-max">
        <DashboardPrimaryButton
          :text="t('cart.remove')"
          theme="cartRemove"
        />
      </div>
      <ShowCodeToggle :code="code.remove" />
    </div>

    <!-- Add NBA -->
    <div class="flex flex-col items-start gap-3 max-w-xs">
      <div class="bg-[#0C111D] p-4 w-full">
        <DashboardPrimaryButton
          :text="t('cart.addNbaCard')"
          theme="cartAddPrimary"
          @click="onQuickAdd('nba123')"
        />
      </div>
      <ShowCodeToggle :code="code.addNba" />
    </div>

    <!-- Add Vintage -->
    <div class="flex flex-col items-start gap-3 max-w-xs">
      <div class="bg-[#0C111D] p-4 w-full">
        <DashboardPrimaryButton
          :text="t('cart.addVintageShirt')"
          theme="cartAddSecondary"
          @click="onQuickAdd('item456')"
        />
      </div>
      <ShowCodeToggle :code="code.addVintage" />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import Cart from '@/components/ui/cart/Cart.vue';
import CartTypeToggle from '@/dev/components/ui/cart/CartTypeToggle.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import { FlowHandler } from '@/services/flow-system/FlowHandler';

const { t } = useI18n();
const cartType = ref('standard');
const newLabel = ref('');
const couponCode = ref('');

async function onQuickAdd(productId) {
  const sessionId = localStorage.getItem('sessionId') || 'guest';
  await FlowHandler.run('cart.addItem', {
    productId,
    quantity: 1,
    sessionId,
  });
}

const code = {
  cart: `import Cart from '@/components/ui/cart/Cart.vue';

<Cart @close="onCloseCart" />`,

  cartTypeToggle: `import CartTypeToggle from '@/dev/components/ui/cart/CartTypeToggle.vue';

<CartTypeToggle
  v-model="cartTypeSelection"
  @change="onCartTypeChange"
/>`,

  syncLive: `import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';

<DashboardPrimaryButton
  :text="t('cart.syncLive')"
  theme="cartSyncLive"
  @click="syncLiveData"
/>`,

  renameInput: `import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';

<DashboardTextInput
  v-model="newLabel"
  :placeholder="t('cart.renamePlaceholder')"
  :show-label="false"
  theme="cartCompact"
/>`,

  save: `import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';

<DashboardPrimaryButton
  :text="t('cart.save')"
  theme="cartSave"
  @click="renameCart"
/>`,

  couponInput: `import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';

<DashboardTextInput
  v-model="couponCode"
  :placeholder="t('cart.couponPlaceholder')"
  :show-label="false"
  theme="cartCompact"
/>`,

  apply: `import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';

<DashboardPrimaryButton
  :text="t('cart.apply')"
  theme="cartApply"
  @click="applyCoupon"
/>`,

  remove: `import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';

<DashboardPrimaryButton
  :text="t('cart.remove')"
  theme="cartRemove"
  @click="removeCoupon"
/>`,

  addNba: `import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';

<DashboardPrimaryButton
  :text="t('cart.addNbaCard')"
  theme="cartAddPrimary"
  @click="quickBuy('nba123')"
/>`,

  addVintage: `import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';

<DashboardPrimaryButton
  :text="t('cart.addVintageShirt')"
  theme="cartAddSecondary"
  @click="quickBuy('item456')"
/>`,
};
</script>
