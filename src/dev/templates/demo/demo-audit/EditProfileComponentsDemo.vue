<template>
  <section class="flex flex-col gap-10">
    <!-- EditProfileMenu -->
    <div class="flex flex-col gap-3">
      <EditProfileMenu has-image />
      <ShowCodeToggle :code="code.editProfileMenu" />
    </div>

    <DemoPageViewport variant="dashboard" class="flex flex-col gap-10">
      <!-- UnifiedSelect — Profile Visibility (md:w-[22.5rem] on EditProfilePage) -->
      <div class="flex flex-col gap-2 md:w-[22.5rem]">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-[#667085] md:text-[#0C111D] dark:text-[#9e9589] md:dark:text-[#dbd8d3]">
            {{ t('editProfile.page.fields.profileVisibility') }}
          </label>
          <UnifiedSelect
          v-model="profile.visibility"
          :options="visibilityOptions"
          :placeholder="t('editProfile.page.fields.selectVisibility')"
            variant="dashboard"
            name="profile-visibility"
            dropdown-max-height="max-h-72"
            required
          />
        </div>
        <ShowCodeToggle :code="code.visibilitySelect" />
      </div>

      <!-- UnifiedSelect — Gender / Country / Body Type / Hair -->
      <div class="flex flex-col gap-4">
        <div v-for="group in selectGroups" :key="group.key" class="flex flex-col gap-2">
          <div :class="group.rowClass">
            <div v-for="select in group.fields" :key="select.key" class="flex flex-col gap-1.5 w-full">
              <label class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">{{ select.label }}</label>
              <UnifiedSelect
                v-model="profile[select.model]"
                :options="select.options"
                :placeholder="t('editProfile.page.fields.select')"
                variant="dashboard"
                :name="select.name"
                required
              />
            </div>
          </div>
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
import EditProfileMenu from '@/components/ui/profile/EditProfileMenu.vue';
import UnifiedSelect from '@/components/ui/dropdowns/select/UnifiedSelect.vue';

const { t } = useI18n();

/** Same option lists as EditProfilePage.vue */
const visibilityOptions = computed(() => [
  { label: t('editProfile.page.options.visibilityEveryone'), value: 'everyone', description: t('editProfile.page.options.visibilityEveryoneDesc') },
  { label: t('editProfile.page.options.visibilityModelsOnly'), value: 'models-only', description: t('editProfile.page.options.visibilityModelsOnlyDesc') },
  { label: t('editProfile.page.options.visibilityFansOnly'), value: 'fans-only', description: t('editProfile.page.options.visibilityFansOnlyDesc') },
  { label: t('editProfile.page.options.visibilityRegisteredOnly'), value: 'registered-user-only', description: t('editProfile.page.options.visibilityRegisteredOnlyDesc') },
  { label: t('editProfile.page.options.visibilityNobody'), value: 'nobody', description: t('editProfile.page.options.visibilityNobodyDesc') },
]);

const genderOptions = computed(() => [
  { label: t('editProfile.page.options.genderMale'), value: 'male' },
  { label: t('editProfile.page.options.genderFemale'), value: 'female' },
  { label: t('editProfile.page.options.genderOthers'), value: 'others' },
]);

const countryOptions = computed(() => [
  { label: t('editProfile.page.options.countryAustralia'), value: 'australia' },
  { label: t('editProfile.page.options.countryUsa'), value: 'usa' },
  { label: t('editProfile.page.options.countrySingapore'), value: 'singapore' },
  { label: t('editProfile.page.options.countryThailand'), value: 'thailand' },
]);

const bodyTypeOptions = computed(() => [
  { label: t('editProfile.page.options.bodySkinny'), value: 'skinny' },
  { label: t('editProfile.page.options.bodySlim'), value: 'slim' },
  { label: t('editProfile.page.options.bodyAthletic'), value: 'athletic' },
  { label: t('editProfile.page.options.bodyMedium'), value: 'medium' },
  { label: t('editProfile.page.options.bodyCurvy'), value: 'curvy' },
  { label: t('editProfile.page.options.bodyBbw'), value: 'bbw' },
]);

const hairOptions = computed(() => [
  { label: t('editProfile.page.options.hairBlonde'), value: 'blonde' },
  { label: t('editProfile.page.options.hairBlack'), value: 'black' },
  { label: t('editProfile.page.options.hairBrunette'), value: 'brunette' },
  { label: t('editProfile.page.options.hairBrown'), value: 'brown' },
  { label: t('editProfile.page.options.hairRedhead'), value: 'redhead' },
  { label: t('editProfile.page.options.hairColorful'), value: 'colorful' },
]);

const profile = reactive({
  visibility: 'everyone',
  gender: 'female',
  country: 'usa',
  bodyType: 'slim',
  hair: 'black',
});

const selectGroups = computed(() => [
  {
    key: 'genderCountry',
    rowClass: 'flex flex-col gap-4 sm:flex-row',
    fields: [
      { key: 'gender', model: 'gender', label: t('editProfile.page.fields.gender'), name: 'gender', options: genderOptions.value },
      { key: 'country', model: 'country', label: t('editProfile.page.fields.country'), name: 'country', options: countryOptions.value },
    ],
    code: `<!-- EditProfilePage.vue — dropdown-group (gender / country) -->
<div class="flex flex-col gap-4 sm:flex-row">
  <div class="flex flex-col gap-1.5 w-full">
    <label class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">{{ t('editProfile.page.fields.gender') }}</label>
    <UnifiedSelect
      v-model="profileData.gender"
      :options="genderOptions"
      :placeholder="t('editProfile.page.fields.select')"
      variant="dashboard"
      name="gender"
      required
    />
  </div>
  <div class="flex flex-col gap-1.5 w-full">
    <label class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">{{ t('editProfile.page.fields.country') }}</label>
    <UnifiedSelect
      v-model="profileData.country"
      :options="countryOptions"
      :placeholder="t('editProfile.page.fields.select')"
      variant="dashboard"
      name="country"
      required
    />
  </div>
</div>`,
  },
  {
    key: 'bodyTypeHair',
    rowClass: 'flex flex-col gap-4 sm:flex-row',
    fields: [
      { key: 'bodyType', model: 'bodyType', label: t('editProfile.page.fields.bodyType'), name: 'body-type', options: bodyTypeOptions.value },
      { key: 'hair', model: 'hair', label: t('editProfile.page.fields.hair'), name: 'hair', options: hairOptions.value },
    ],
    code: `<!-- EditProfilePage.vue — dropdown-group (body type / hair) -->
<div class="flex flex-col gap-4 sm:flex-row">
  <div class="flex flex-col gap-1.5 w-full">
    <label class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">{{ t('editProfile.page.fields.bodyType') }}</label>
    <UnifiedSelect
      v-model="profileData.bodyType"
      :options="bodyTypeOptions"
      :placeholder="t('editProfile.page.fields.select')"
      variant="dashboard"
      name="body-type"
      required
    />
  </div>
  <div class="flex flex-col gap-1.5 w-full">
    <label class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">{{ t('editProfile.page.fields.hair') }}</label>
    <UnifiedSelect
      v-model="profileData.hair"
      :options="hairOptions"
      :placeholder="t('editProfile.page.fields.select')"
      variant="dashboard"
      name="hair"
      required
    />
  </div>
</div>`,
  },
]);

const code = {
  editProfileMenu: `import EditProfileMenu from '@/components/ui/profile/EditProfileMenu.vue';

<!-- EditProfilePage.vue -->
<EditProfileMenu
  :hasImage="!!profileData.profileImageUrl"
  @upload-new="triggerFileUpload"
  @edit="openCropper"
  @choose-avatar="openAvatarPopup"
/>`,

  visibilitySelect: `import UnifiedSelect from '@/components/ui/dropdowns/select/UnifiedSelect.vue';

<!-- EditProfilePage.vue — profile-visibility, md:w-[22.5rem] -->
<label class="text-sm font-medium text-[#667085] md:text-[#0C111D] dark:text-[#9e9589] md:dark:text-[#dbd8d3]">
  {{ t('editProfile.page.fields.profileVisibility') }}
</label>
<UnifiedSelect
    v-model="profileData.visibility"
    :options="visibilityOptions"
    :placeholder="t('editProfile.page.fields.selectVisibility')"
  variant="dashboard"
  name="profile-visibility"
  dropdown-max-height="max-h-72"
  required
/>`,
};
</script>
