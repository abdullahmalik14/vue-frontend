<script setup>
import Heading from "@/components/ui/typography/Heading.vue";
import Paragraph from "@/components/ui/typography/Paragraph.vue";

defineProps({
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
});
</script>

<template>
  <div class="flex flex-col gap-2 md:gap-5 md:max-w-[36.375rem]">
    <section class="flex flex-col gap-1 md:gap-2">
      <Heading :text="title" tag="h1" theme="homeHeroTitle" no-wrap />
      <Paragraph :text="tagline" theme="homeHeroTagline" no-wrap />
    </section>

    <Paragraph :text="description" theme="homeHeroBody" no-wrap />
  </div>
</template>
