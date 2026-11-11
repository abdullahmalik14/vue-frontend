<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.radioGroup.sectionTitle')" />
        <div class="flex flex-col gap-10 max-w-xl">
            <!-- MediaUploader — theme="dashboard" -->
            <div class="flex flex-col gap-3">
                <RadioGroup
                    v-model="publishMode"
                    name="socialMode"
                    :label="t('mediaUploader.publish.attachMedia')"
                    :options="publishOptions"
                    theme="dashboard"
                />
                <ShowCodeToggle :code="code.publish" />
            </div>

            <!-- EditProfile / PlanSharing / LuckyDraw — theme="plan" -->
            <div class="flex flex-col gap-3">
                <Heading
                    tag="h3"
                    theme="custom"
                    no-wrap
                    add-class="text-sm font-semibold text-[#667085] dark:text-[#9e9589]"
                    :text="t('editProfile.page.tipping.attachMedia')"
                />
                <RadioGroup
                    v-model="editAttach"
                    name="dash-radio-group"
                    theme="plan"
                    :options="editOptions"
                />
                <ShowCodeToggle :code="code.editProfile" />
            </div>

            <!-- CreateNewTagPopup — theme="createTag" -->
            <div class="flex flex-col gap-3">
                <div>
                    <RadioGroup
                        v-model="tagScope"
                        name="create-tag-scope"
                        :options="personalOption"
                        theme="createTag"
                    />
                    <p class="pl-8 mt-1 text-xs leading-[1.125rem] text-text-quaternary">
                        {{ t('mediaUploader.createTag.personalHint', { tag: createTagName }) }}
                    </p>
                </div>
                <div>
                    <RadioGroup
                        v-model="tagScope"
                        name="create-tag-scope"
                        :options="globalOption"
                        theme="createTag"
                    />
                    <p class="pl-8 mt-1 text-xs leading-[1.125rem] text-text-quaternary">
                        {{ t('mediaUploader.createTag.globalHint', { tag: createTagName }) }}
                    </p>
                </div>
                <ShowCodeToggle :code="code.createTag" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import RadioGroup from '@/components/forms/radio/dashboard/RadioGroup.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();

const publishMode = ref('useOriginal');
const editAttach = ref('upload');
const tagScope = ref('personal');
const createTagName = computed(() => t('demo.mediaUploaderComponents.tags.history.hello'));

const publishOptions = computed(() => [
    { value: 'useOriginal', label: t('mediaUploader.publish.useOriginal') },
    { value: 'useCustom', label: t('mediaUploader.publish.useCustom') },
    { value: 'none', label: t('mediaUploader.publish.none') },
]);

const editOptions = computed(() => [
    { label: t('editProfile.page.tipping.uploadMedia'), value: 'upload' },
    { label: t('editProfile.page.tipping.noMedia'), value: 'none' },
]);

const personalOption = computed(() => [
    { value: 'personal', label: t('mediaUploader.createTag.personalLabel') },
]);

const globalOption = computed(() => [
    { value: 'global', label: t('mediaUploader.createTag.globalLabel') },
]);

const importLine = "import RadioGroup from '@/components/forms/radio/dashboard/RadioGroup.vue';";

const code = computed(() => ({
    publish: `${importLine}

<!-- MediaUploaderStepPublishAndSharing.vue -->
<RadioGroup
  v-model="socialThumbnailModeModel"
  name="socialMode"
  :label="t('mediaUploader.publish.attachMedia')"
  :options="transferTypeOptions"
  theme="dashboard"
/>

const transferTypeOptions = computed(() => [
  { value: 'useOriginal', label: t('mediaUploader.publish.useOriginal') },
  { value: 'useCustom', label: t('mediaUploader.publish.useCustom') },
  { value: 'none', label: t('mediaUploader.publish.none') },
]);`,
    editProfile: `import Heading from '@/components/ui/typography/Heading.vue';
${importLine}

<!-- EditProfilePage.vue — same theme="plan" as PlanSharing / LuckyDraw -->
<Heading
  tag="h3"
  theme="custom"
  no-wrap
  add-class="text-sm font-semibold text-[#667085] dark:text-[#9e9589]"
  :text="t('editProfile.page.tipping.attachMedia')"
/>
<RadioGroup
  v-model="profileData.attachMedia"
  name="dash-radio-group"
  theme="plan"
  :options="attachMediaOptions"
/>

const attachMediaOptions = computed(() => [
  { label: t('editProfile.page.tipping.uploadMedia'), value: 'upload' },
  { label: t('editProfile.page.tipping.noMedia'), value: 'none' },
]);`,
    createTag: `${importLine}

<!-- CreateNewTagPopup.vue -->
<RadioGroup
  v-model="scope"
  name="create-tag-scope"
  :options="personalOption"
  theme="createTag"
/>
<p class="pl-8 mt-1 text-xs leading-[1.125rem] text-text-quaternary">
  {{ t('mediaUploader.createTag.personalHint', { tag: tagName }) }}
</p>
<RadioGroup
  v-model="scope"
  name="create-tag-scope"
  :options="globalOption"
  theme="createTag"
/>
<p class="pl-8 mt-1 text-xs leading-[1.125rem] text-text-quaternary">
  {{ t('mediaUploader.createTag.globalHint', { tag: tagName }) }}
</p>`,
}));
</script>
