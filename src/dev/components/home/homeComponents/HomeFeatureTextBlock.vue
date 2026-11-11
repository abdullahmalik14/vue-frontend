<script setup>
import Heading from "@/components/ui/typography/Heading.vue";
import Paragraph from "@/components/ui/typography/Paragraph.vue";

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
});
</script>

<template>
  <section class="flex flex-col gap-2 flex-1 min-w-0 xl:gap-4">
    <Heading :text="title" tag="h3" theme="homeFeatureTitle" no-wrap />
    <Paragraph :text="description" theme="homeFeatureBody" no-wrap />
  </section>
</template>
