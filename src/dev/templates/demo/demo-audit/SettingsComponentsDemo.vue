<template>
  <section class="flex flex-col gap-10">
    <!-- DashProfileSettings — sidebar column (own fixed width on page: lg:w-[26.6875rem]) -->
    <div class="flex flex-col gap-3">
      <div class="max-w-[26.6875rem]">
        <DashProfileSettings user-role="creator" />
      </div>
      <ShowCodeToggle :code="code.dashProfileSettings" />
    </div>

    <!-- Everything below lives in the tab-content column on SettingsPage -->
    <DemoPageViewport variant="settings" class="flex flex-col gap-10">
      <!-- DashboardTextInput usages live only in DemoPage → DashboardTextInput section -->

      <!-- SettingsLanguageField -->
      <div class="flex flex-col gap-2">
        <DashboardSharedSectionLayout>
          <SettingsLanguageField @locale-changed="onSettingsLocaleChanged" @locale-change-error="onSettingsLocaleError" />
        </DashboardSharedSectionLayout>
        <ShowCodeToggle :code="code.settingsLanguageField" />
      </div>

      <!-- UnifiedSelect — state / country (paired on page) + beneficiary country (standalone) -->
      <div class="flex flex-col gap-4">
        <div v-for="group in selectGroups" :key="group.key" class="flex flex-col gap-2">
          <DashboardSharedSectionLayout>
            <div :class="group.rowClass">
              <div v-for="select in group.fields" :key="select.key" class="flex flex-col gap-1.5 w-full">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">{{ select.label }}</label>
                  <UnifiedSelect
                    v-model="selectModels[select.key]"
                    :options="select.options"
                    variant="dashboard"
                    :name="select.name"
                    required
                  />
                </div>
              </div>
            </div>
          </DashboardSharedSectionLayout>
          <ShowCodeToggle :code="group.code" />
        </div>
      </div>
    </DemoPageViewport>
  </section>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import DemoPageViewport from '@/dev/templates/demo/DemoPageViewport.vue';
import DashboardSharedSectionLayout from '@/dev/templates/dashboard/shared/DashboardSharedSectionLayout.vue';
import DashProfileSettings from '@/dev/components/ui/nav/dashboard/DashProfileSettings.vue';
import SettingsLanguageField from '@/components/ui/nav/language/SettingsLanguageField.vue';
import UnifiedSelect from '@/components/ui/dropdowns/select/UnifiedSelect.vue';

const { t } = useI18n();

function onSettingsLocaleChanged(payload) {
  if (import.meta.env.DEV) {
    console.log('[Settings Demo] locale-changed', payload);
  }
}

function onSettingsLocaleError(payload) {
  console.warn('[Settings Demo] locale-change-error', payload);
}

/** Same option lists as SettingsPage.vue */
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

const selectGroups = computed(() => [
  {
    key: 'shipping.stateCountry',
    rowClass: 'flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6',
    fields: [
      { key: 'shipping.state', label: t('settings.page.shipping.state'), name: 'settings-demo-state', options: stateOptions.value },
      { key: 'shipping.country', label: t('settings.page.shipping.country'), name: 'settings-demo-country', options: countryOptions.value },
    ],
    code: `<!-- SettingsPage.vue — shipping-address tab, paired dropdown-group -->
<UnifiedSelect
  v-model="shippingState"
  :options="stateOptions"
  variant="dashboard"
  name="state-select"
  required
/>
<UnifiedSelect
  v-model="shippingCountry"
  :options="countryOptions"
  variant="dashboard"
  name="country-select"
  required
/>`,
  },
  {
    key: 'payout.beneficiaryCountry',
    rowClass: 'flex flex-col gap-1.5',
    fields: [{ key: 'payout.beneficiaryCountry', label: t('settings.page.shipping.country'), name: 'settings-demo-beneficiary-country', options: countryOptions.value }],
    code: `<!-- SettingsPage.vue — payout-details tab -->
<UnifiedSelect
  v-model="beneficiaryCountry"
  :options="countryOptions"
  variant="dashboard"
  name="beneficiary-country-select"
  required
/>`,
  },
]);

const selectModels = reactive({
  'shipping.state': 'georgia',
  'shipping.country': 'united-states-us',
  'payout.beneficiaryCountry': 'united-states-us',
});

const code = {
  dashProfileSettings: `import DashProfileSettings from '@/dev/components/ui/nav/dashboard/DashProfileSettings.vue';

<!-- SettingsPage.vue -->
<DashProfileSettings user-role="creator" />`,

  settingsLanguageField: `import SettingsLanguageField from '@/components/ui/nav/language/SettingsLanguageField.vue';

<!-- SettingsPage.vue -->
<SettingsLanguageField
  @locale-changed="onSettingsLocaleChanged"
  @locale-change-error="onSettingsLocaleError"
/>`,
};
</script>
