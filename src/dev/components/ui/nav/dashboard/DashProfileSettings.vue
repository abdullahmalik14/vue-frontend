<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { getAssetUrl } from '@/systems/assets/assetLibrary.js';
import { settingsMenuConfig } from '@/dev/assets/data/settingsMenuConfig.js';
import SettingsProfileAvatar from '@/dev/components/settings/SettingsProfileAvatar.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';

const props = defineProps({
  userRole: {
    type: String,
    default: 'creator',
  },
  displayNameKey: {
    type: String,
    default: 'demo.dashProfileSettings.sample.displayName',
  },
  handleKey: {
    type: String,
    default: 'demo.dashProfileSettings.sample.handle',
  },
  emailKey: {
    type: String,
    default: 'demo.dashProfileSettings.sample.email',
  },
  avatarKey: {
    type: String,
    default: 'profileSettings.placeholderAvatar',
  },
  editIconKey: {
    type: String,
    default: 'icon.profileSettings.editArrow',
  },
});

const emit = defineEmits(['edit-profile']);

const { t, locale } = useI18n();
const router = useRouter();
const { url: avatarUrl } = useAssetUrl(props.avatarKey);
const { url: editIconUrl } = useAssetUrl(props.editIconKey);

function onEditProfile() {
  emit('edit-profile');
  router.push('/edit-profile');
}

const iconUrls = ref({});

const menuGroups = computed(() => {
  void locale.value;
  const groups = settingsMenuConfig[props.userRole] || settingsMenuConfig.creator;

  return groups.map((group) => ({
    categoryName: t(group.categoryKey),
    items: group.items.map((item) => ({
      label: t(item.labelKey),
      badge: item.badgeKey ? t(item.badgeKey) : null,
      icon: iconUrls.value[item.iconKey] || null,
      tabId: item.tabId || null,
      isActive: item.isActive,
      isDisabled: item.isDisabled,
    })),
  }));
});

async function resolveMenuIcons() {
  const groups = settingsMenuConfig[props.userRole] || settingsMenuConfig.creator;
  const keys = [...new Set(groups.flatMap((group) => group.items.map((item) => item.iconKey)))];
  const urls = {};

  await Promise.all(
    keys.map(async (key) => {
      urls[key] = await getAssetUrl(key);
    }),
  );

  iconUrls.value = urls;
}

onMounted(resolveMenuIcons);
watch(() => props.userRole, resolveMenuIcons);
</script>

<template>
  <div class="flex flex-col">
    <div class="relative z-[2] min-h-[32rem] overflow-hidden md:h-auto">
      <div class="relative flex flex-col h-full">
        <div class="relative flex flex-col flex-grow">
          <div class="flex flex-col h-full">
            <div
              class="flex flex-col justify-start items-end w-full min-h-[32rem] max-w-full border border-white/50 dark:border-[#575757] dark:[background:var(--background-dark-app)] [background:linear-gradient(180deg,rgba(255,255,255,0.50)_0%,rgba(255,255,255,0.00)_50%,rgba(255,255,255,0.50)_100%),rgba(255,255,255,0.01)] flex-1 overflow-y-auto lg:max-w-[26.6875rem]"
            >
              <div
                class="flex flex-col justify-center items-center self-stretch gap-4 border-b border-white dark:border-[#575757] px-2 py-4 md:px-4 md:pt-10 md:pb-6 xl:p-6"
              >
                <SettingsProfileAvatar :src="avatarUrl" />

                <div class="flex flex-col justify-center items-center gap-1 self-stretch text-center">
                  <div class="text-xl leading-normal font-semibold text-[#0c111d] dark:text-text">
                    {{ t(displayNameKey) }}
                  </div>
                  <div class="text-base text-[#0c111d] dark:text-text">
                    {{ t(handleKey) }}
                  </div>
                  <div class="text-sm text-center self-stretch text-[#344054] dark:text-[#B9D1E9]">
                    {{ t(emailKey) }}
                  </div>
                </div>

                <DashboardPrimaryButton
                  :text="t('profileSettings.editProfile')"
                  theme="dashProfileEdit"
                  :rightIcon="editIconUrl"
                  @click="onEditProfile"
                />
              </div>

              <div
                class="flex flex-col justify-start items-start gap-4 self-stretch h-full px-2 py-4 md:gap-6 md:px-4 md:pt-10 md:pb-6 xl:p-6"
              >
                <div
                  v-for="(group, groupIndex) in menuGroups"
                  :key="groupIndex"
                  class="flex flex-col justify-start items-start self-stretch gap-1 md:gap-2"
                >
                  <div class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">
                    {{ group.categoryName }}
                  </div>

                  <div
                    v-for="(item, itemIndex) in group.items"
                    :key="itemIndex"
                    :data-tab-button="item.tabId || undefined"
                    class="inline-flex justify-start items-center gap-2.5 self-stretch py-1 cursor-pointer group [&.disabled]:pointer-events-none"
                    :class="{
                      active: item.isActive,
                      disabled: item.isDisabled,
                    }"
                  >
                    <div
                      class="text-base font-medium flex-grow text-[#0c111d] dark:text-text group-[.active]:text-black lg:group-[.active]:text-[#004eeb] dark:lg:group-[.active]:text-[#7897FF] group-[.disabled]:text-[#667085]"
                    >
                      {{ item.label }}
                      <span
                        v-if="item.badge"
                        class="text-sm text-[#0c111d] group-[.active]:text-black lg:group-[.active]:text-[#004eeb] dark:lg:group-[.active]:text-[#7897FF] group-[.disabled]:text-[#667085]"
                      >
                        {{ item.badge }}
                      </span>
                    </div>

                    <div class="w-6 h-6 relative">
                      <img
                        v-if="item.icon"
                        :src="item.icon"
                        :alt="t('profileSettings.icons.menuItem')"
                        class="w-6 h-6 dark:[filter:brightness(0)_saturate(100%)_invert(100%)] lg:group-[.active]:[filter:brightness(0)_saturate(100%)_invert(24%)_sepia(88%)_saturate(7497%)_hue-rotate(220deg)_brightness(96%)_contrast(101%)] group-[.disabled]:[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
