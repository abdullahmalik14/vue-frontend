<template>
  <div class="lazy-demo-page">
    <header class="lazy-demo-page__intro">
      <h1>{{ t('demo.lazySection.pageTitle') }}</h1>
      <p>{{ t('demo.lazySection.intro') }}</p>
      <p class="lazy-demo-page__hint">{{ t('demo.lazySection.hint') }}</p>
    </header>

    <div class="lazy-demo-page__spacer">
      <span>{{ t('demo.lazySection.scrollSpacer') }}</span>
    </div>

    <div class="lazy-demo-page__slot">
      <LazySection
        :loader="() => import('@/dev/templates/demo/lazy-sections/LazyAlphaSection.vue')"
        root-margin="0px 0px"
      >
        <template #placeholder>
          <div data-lazy-placeholder="alpha" class="lazy-demo-page__placeholder">
            {{ t('demo.lazySection.placeholderA') }}
          </div>
        </template>
      </LazySection>
    </div>

    <div class="lazy-demo-page__spacer">
      <span>{{ t('demo.lazySection.spacer') }}</span>
    </div>

    <div class="lazy-demo-page__slot">
      <LazySection
        :loader="() => import('@/dev/templates/demo/lazy-sections/LazyBetaSection.vue')"
        root-margin="0px 0px"
      >
        <template #placeholder>
          <div data-lazy-placeholder="beta" class="lazy-demo-page__placeholder">
            {{ t('demo.lazySection.placeholderB') }}
          </div>
        </template>
      </LazySection>
    </div>

    <div class="lazy-demo-page__spacer">
      <span>{{ t('demo.lazySection.spacer') }}</span>
    </div>

    <div class="lazy-demo-page__spacer">
      <span>{{ t('demo.lazySection.keepScrolling') }}</span>
    </div>

    <div class="lazy-demo-page__slot">
      <LazySection
        :loader="() => import('@/dev/templates/demo/lazy-sections/LazyGammaSection.vue')"
        root-margin="0px 0px"
      >
        <template #placeholder>
          <div data-lazy-placeholder="gamma" class="lazy-demo-page__placeholder">
            {{ t('demo.lazySection.placeholderC') }}
          </div>
        </template>
      </LazySection>
    </div>

    <footer class="lazy-demo-page__end">
      {{ t('demo.lazySection.end') }}
    </footer>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import LazySection from '@/components/lazy/LazySection.vue';

const { t } = useI18n();
</script>

<style scoped>
.lazy-demo-page {
  min-height: 100vh;
  background: #0b1020;
  color: #e5e7eb;
  padding: 32px 16px 96px;
  font-family: system-ui, sans-serif;
}
.lazy-demo-page__intro {
  max-width: 760px;
  margin: 0 auto 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.lazy-demo-page__intro h1 {
  font-size: 30px;
  font-weight: 800;
}
.lazy-demo-page__intro p {
  font-size: 15px;
  line-height: 1.6;
  opacity: 0.9;
}
.lazy-demo-page__hint {
  font-size: 13px;
  opacity: 0.7;
}
.lazy-demo-page code {
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.9em;
}
.lazy-demo-page__spacer {
  max-width: 760px;
  margin: 0 auto;
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
}
.lazy-demo-page__slot {
  max-width: 760px;
  margin: 0 auto;
}
.lazy-demo-page__placeholder {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  border: 2px dashed rgba(248, 113, 113, 0.6);
  border-radius: 16px;
  background: rgba(248, 113, 113, 0.08);
  color: #fca5a5;
  font-size: 15px;
  font-weight: 600;
}
.lazy-demo-page__end {
  max-width: 760px;
  margin: 24px auto 0;
  text-align: center;
  opacity: 0.5;
  font-size: 14px;
}
</style>
