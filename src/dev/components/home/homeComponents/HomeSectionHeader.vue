<script setup>
import Heading from "@/components/ui/typography/Heading.vue";
import Paragraph from "@/components/ui/typography/Paragraph.vue";

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  headingTheme: { type: String, default: "homeSectionTitle" },
  subtitleTheme: { type: String, default: "homeSectionSubtitle" },
  class: {
    type: String,
    default: "flex flex-col text-center gap-2 py-2.5 md:gap-6",
  },
});
</script>

<template>
  <div :class="class">
    <Heading :text="title" tag="h2" :theme="headingTheme" no-wrap />
    <Paragraph
      v-if="subtitle"
      :text="subtitle"
      :theme="subtitleTheme"
      no-wrap
    />
  </div>
</template>
