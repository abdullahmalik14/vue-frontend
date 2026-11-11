<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import PlanInviteFansBar from '@/dev/components/plan/parts/PlanInviteFansBar.vue';
import PlanCopyInviteLink from '@/dev/components/plan/parts/PlanCopyInviteLink.vue';
import SocialPostToXComposer from '@/dev/components/ui/social/SocialPostToXComposer.vue';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

const props = defineProps({
  publishFlow: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n();
const { assets } = usePlanAssets();

const verifiedFanCheckboxClass =
  "appearance-none border rounded-[4px] w-4 min-w-4 h-4 min-h-4 shrink-0 cursor-pointer outline-none focus:outline-none focus:ring-0 box-border bg-white border-[#D0D5DD] checked:bg-[#07f468] checked:border-[#07f468] checked:accent-[#07f468] checked:[background-image:url('/dev/cdn/remote/plan-check.svg')] checked:[background-position:center] checked:[background-repeat:no-repeat] checked:[background-size:55%]";

const postToXProxy = computed({
  get: () => props.publishFlow.state.postToX,
  set: (val) => props.publishFlow.setState('postToX', val),
});

const postMessageProxy = computed({
  get: () => props.publishFlow.state.postMessage,
  set: (val) => props.publishFlow.setState('postMessage', val),
});

const socialThumbnailModeProxy = computed({
  get: () => props.publishFlow.state.socialThumbnailMode,
  set: (val) => props.publishFlow.setState('socialThumbnailMode', val),
});

const invitedPerformersProxy = computed({
  get: () => props.publishFlow.state.invitedPerformers,
  set: (val) => props.publishFlow.setState('invitedPerformers', val),
});

const verifiedFanProxy = computed({
  get: () => props.publishFlow.state.verifiedFanOnly,
  set: (val) => props.publishFlow.setState('verifiedFanOnly', val),
});

const transferTypeOptions = computed(() => [
  { value: 'useOriginal', label: t('mediaUploader.publish.useOriginal') },
  { value: 'useCustom', label: t('mediaUploader.publish.useCustom') },
  { value: 'none', label: t('mediaUploader.publish.none') },
]);

const performersList = computed(() => [
  { id: 1, name: t('plan.sharing.mock.userOneName'), username: t('plan.sharing.mock.userOneUsername') },
  { id: 2, name: t('plan.sharing.mock.userTwoName'), username: t('plan.sharing.mock.userTwoUsername') },
]);

const inviteLink = computed(() => t('plan.sharing.mock.inviteLink'));
</script>

<template>
  <div class="flex flex-col gap-6 grow md:gap-8 md:pb-6 xl:pb-6">
    <section class="flex flex-col gap-4 px-2 py-4 bg-white/25 md:gap-6 md:p-4 dark:bg-[#181a1b40]">
      <Heading tag="h2" theme="custom" no-wrap add-class="text-xl leading-normal font-semibold opacity-80 text-[#667085] md:text-2xl dark:text-[#9e9689]" :text="t('plan.sharing.title')" />

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 relative">
          <CheckboxSwitch
            v-model="postToXProxy"
            :label="t('plan.sharing.postToX')"
            id="post-to-x"
            theme="plan"
            label-class="text-base font-medium text-black dark:text-[#e8e6e3]"
          />

          <span class="flex items-center justify-center">
            <div class="md:relative inline-flex overflow-hidden cursor-pointer group hover:overflow-visible">
              <img :src="assets.tooltip" :alt="t('plan.sharing.alt.tooltip')" class="w-4 h-4" />

              <div
                class="absolute z-[2] flex flex-col items-start w-max md:w-max max-w-[22.4375rem] md:max-w-[21.5rem]
                  opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto
                  text-xs leading-normal font-medium text-white py-2 px-3 rounded-lg
                  bg-[#101828B2] dark:bg-[rgba(14,19,32,0.9)] dark:text-[#dbd8d3] [box-shadow:0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] [backdrop-filter:blur(25px)]
                  -right-2 bottom-full -translate-y-2 md:bottom-[unset] md:left-auto md:top-1/2 md:-right-2 md:translate-y-[-50%] md:translate-x-full
                  before:content-[''] before:absolute before:w-0 before:h-0 before:left-[92%] before:bottom-[-5px] before:translate-x-[-50%] before:border-[6px] before:border-b-0 before:border-l-transparent before:border-r-transparent before:border-t-[rgba(16,24,40,0.7)]
                  md:before:top-1/2 md:before:left-[-6px] md:before:translate-y-[-50%] md:before:border-[6px] md:before:border-r-[rgba(16,24,40,0.7)] md:before:border-t-transparent md:before:border-b-transparent md:before:border-l-transparent"
              >
                <Paragraph theme="custom" no-wrap add-class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]" :text="t('plan.sharing.postToX')" />
              </div>
            </div>
          </span>
        </div>
      </div>

      <SocialPostToXComposer
        v-if="postToXProxy"
        v-model:post-message="postMessageProxy"
        v-model:social-thumbnail-mode="socialThumbnailModeProxy"
        :attach-media-options="transferTypeOptions"
        radio-name="socialMode"
        :characters-used="66"
        show-media-always
        preview-card-class="flex gap-2 px-2 py-4 rounded-[0.3125rem] bg-white/70 w-[calc(100%+1rem)] -ml-2 dark:bg-[#181a1bb3] sm:max-w-[17.625rem] sm:self-end sm:w-full sm:ml-0"
      />
    </section>

    <section class="flex flex-col gap-4 px-2 py-4 bg-white/25 opacity-80 md:gap-6 md:p-4 dark:bg-[#181a1b40]">
      <Heading tag="h2" theme="custom" no-wrap add-class="text-xl leading-normal font-semibold text-[#667085] md:text-2xl dark:text-[#9e9689]" :text="t('plan.sharing.inviteFans')" />

      <PlanInviteFansBar
        v-model="invitedPerformersProxy"
        :results="performersList"
        :max-items="5"
      />

      <div class="flex flex-col gap-2">
        <div class="flex flex-col gap-1.5">
          <Paragraph theme="custom" no-wrap add-class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]" :text="t('plan.sharing.inviteHelp')" />
          <PlanCopyInviteLink :link="inviteLink" />
        </div>

        <CheckboxGroup
          :label="t('plan.sharing.verifiedFanOnly')"
          v-model="verifiedFanProxy"
          :checkboxClass="verifiedFanCheckboxClass"
          labelClass="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
          wrapperClass="pl-1 flex items-center gap-3"
        />
      </div>
    </section>
  </div>
</template>
