<script setup>
import { useI18n } from 'vue-i18n';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';

const { t } = useI18n();
</script>

<template>
  <div class="w-[240px] sm:w-[340px] bg-white rounded-[5px] inline-flex flex-col justify-start items-start shadow-lg border border-gray-100 z-50">
    <div class="self-stretch h-14 px-3 py-2 inline-flex justify-start items-center gap-2 hover:bg-gray-50 transition-colors">
      <CheckboxGroup
        :label="t('calendar.eventDropdown.videoCall')"
        theme="calendarVideo"
      />
      <div class="flex-1 flex justify-between items-center">
        <div class="flex justify-start items-center gap-2">
          <div class="w-2 h-2 bg-indigo-600 rounded-full" />
        </div>
        <div class="w-5 h-5 relative overflow-hidden">
          <img src="/images/edit.png" alt="editIcon" />
        </div>
      </div>
    </div>

    <div class="self-stretch h-14 px-3 py-2 inline-flex justify-start items-center gap-2 hover:bg-gray-50 transition-colors">
      <CheckboxGroup
        :label="t('calendar.eventDropdown.audioCall')"
        theme="calendarAudio"
      />
      <div class="flex-1 flex justify-between items-center">
        <div class="flex justify-start items-center gap-2">
          <div class="w-2 h-2 bg-cyan-500 rounded-full" />
        </div>
        <div class="w-5 h-5 relative overflow-hidden">
                    <img src="/images/edit.png" alt="editIcon" />
        </div>
      </div>
    </div>

    <div class="self-stretch h-14 px-3 py-2 inline-flex justify-start items-center gap-2 hover:bg-gray-50 transition-colors">
      <CheckboxGroup
        :label="t('calendar.eventDropdown.groupCall')"
        theme="calendarGroup"
      />
      <div class="flex-1 flex justify-between items-center">
        <div class="flex justify-start items-center gap-2">
          <div class="w-2 h-2 bg-rose-600 rounded-full" />
        </div>
        <div class="w-5 h-5 relative overflow-hidden">
                    <img src="/images/edit.png" alt="editIcon" />
        </div>
      </div>
    </div>

    <div class="self-stretch h-14 px-3 py-2 border-t border-gray-300 inline-flex justify-start items-center gap-4 hover:bg-gray-50 transition-colors">
      <CheckboxGroup
        :label="t('calendar.eventDropdown.showSchedule')"
        theme="calendarSchedule"
      />
    </div>
  </div>
</template>
