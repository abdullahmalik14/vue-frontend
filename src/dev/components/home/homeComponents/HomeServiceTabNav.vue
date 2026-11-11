<script setup>
import { computed, onMounted } from "vue";
import { createStepStateEngine } from "@/utils/stateEngine.js";

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  engine: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["tab-change"]);

const localEngine =
  props.engine ??
  createStepStateEngine({
    flowId: "home-service-tabs",
    urlSync: "none",
    defaults: {
      activeTab: props.tabs[0]?.id ?? "",
    },
  });

onMounted(() => {
  if (!props.engine) {
    localEngine.initialize({ fromUrl: false });
  }
});

const activeTab = computed(() => localEngine.state.activeTab);

function selectTab(tabId) {
  localEngine.setState("activeTab", tabId, { reason: "tab-click" });
  emit("tab-change", tabId);
}

defineExpose({
  engine: localEngine,
  activeTab,
});
</script>

<template>
  <div
    class="flex items-center justify-center gap-6 px-4 py-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:px-12"
  >
    <ul class="flex items-center gap-2 xl:gap-4">
      <li
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'flex justify-center items-center gap-2.5 px-5 py-2 bg-[#FCFCFD] rounded-[6.25rem] shadow-[0px_3px_16.8px_0px_#0C111D26] cursor-pointer group/tab-button xl:px-8 xl:py-4 dark:bg-[#191c1d]',
          {
            'bg-[#07F468] dark:bg-[#06c454] tab-active': activeTab === tab.id,
          },
        ]"
        @click="selectTab(tab.id)"
      >
        <span
          class="text-sm leading-6 font-semibold uppercase whitespace-nowrap text-[#101828] md:font-medium xl:text-lg dark:text-[#d6d3cd]"
        >
          {{ tab.label }}
        </span>
      </li>
    </ul>
  </div>
</template>
