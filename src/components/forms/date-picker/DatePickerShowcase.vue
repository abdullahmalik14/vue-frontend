<script setup>
import { reactive, ref } from 'vue';
import VueDatePicker from '@/components/forms/date-picker/VueDatePicker.vue';

// --- 1. Modes & Layouts ---
const singleDefault = ref(null);
const singleExplicit = ref(null);
const rangeSingleLayout = ref({ start: null, end: null });
const rangeDualLayout = ref({ start: null, end: null });
const planDualPink = ref({ start: null, end: null });

const planDatePickerConfig = {
  mode: 'range',
  layout: 'dual',
  enableTime: true,
  format: 'MM/DD/YYYY HH:mm:ss',
  alarmIcon: '/images/alarm-grey-icon.png',
  style: {
    theme: 'pink',
    rounded: 'rounded-none',
    shadow: 'shadow-[0px_4px_20px_0px_rgba(0,0,0,0.10)]',
    border: 'border-0',
  },
};

// --- 2. Themes ---
const themeModels = reactive({
  blue: null,
  indigo: null,
  red: null,
  green: null,
  dark: null,
  pink: null,
});
const themeList = [
  { key: 'blue', label: 'Blue (default theme)' },
  { key: 'indigo', label: 'Indigo' },
  { key: 'red', label: 'Red' },
  { key: 'green', label: 'Green' },
  { key: 'dark', label: 'Dark' },
  { key: 'pink', label: 'Pink' },
];

// --- 3. Today styles ---
const todayUnderline = ref(null);
const todayBackground = ref(null);
const todayCircle = ref(null);

// --- 4. Time ---
const singleTime = ref(null);
const singleTimeCustomFormat = ref(null);
const rangeTime = ref({ start: null, end: null });
const dualTimeNoPink = ref({ start: null, end: null });
const pinkSingleTime = ref(null);

// --- 5. Validation / constraints ---
const blockedDates = ref(null);
const minDate = ref(null);
const maxDate = ref(null);
const futureOnly = ref(null);
const pastOnly = ref(null);
const maxRange1 = ref({ start: null, end: null });
const maxRange7 = ref({ start: null, end: null });
const rangeBlocked = ref({ start: null, end: null });

// --- 6. Week start ---
const weekSunday = ref(null);
const weekMonday = ref(null);

// --- 7. Formats ---
const formatYmd = ref(null);
const formatMdy = ref(null);
const formatDmyTime = ref(null);

// --- 8. Styling overrides ---
const styleHeader = ref(null);
const styleCompact = ref(null);
const styleRounded = ref(null);
const styleSquare = ref(null);
const styleTransparent = ref(null);
const styleError = ref(null);
const styleMono = ref(null);
const styleGlass = ref(null);

// --- 9. Labels + sync + debug ---
const customLabels = ref({ start: null, end: null });
const dateSync = ref(null);
const debugMode = ref(null);

// --- Events ---
const lastEvent = ref('');

function onDateSelected(val) {
  lastEvent.value = `date-selected: ${val}`;
}

function onRangeSelected(val) {
  lastEvent.value = `range-selected: ${JSON.stringify(val)}`;
}

function onRangeChanging(val) {
  lastEvent.value = `range-changing: ${JSON.stringify(val)}`;
}

const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const blockedSample = [
  new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
  new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
];

const sections = [
  { id: 'modes', label: 'Modes & Layouts' },
  { id: 'plan', label: 'Plan Page' },
  { id: 'themes', label: 'Themes' },
  { id: 'today', label: 'Today Styles' },
  { id: 'time', label: 'Time' },
  { id: 'validation', label: 'Validation' },
  { id: 'week', label: 'Week Start' },
  { id: 'formats', label: 'Formats' },
  { id: 'styling', label: 'Styling' },
  { id: 'extras', label: 'Labels / Sync / Debug' },
];

const activeSection = ref('modes');

function scrollToSection(id) {
  activeSection.value = id;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 font-sans text-gray-900">
    <div class="max-w-7xl mx-auto space-y-14">
      <!-- Header -->
      <header class="text-center space-y-3">
        <h1 class="text-3xl md:text-4xl font-extrabold text-indigo-900">Vue DatePicker — All Variations</h1>
        <p class="text-gray-500 max-w-2xl mx-auto">
          Full demo of every supported mode, layout, theme, time option, constraint, and style override.
        </p>
        <div class="flex flex-wrap justify-center gap-2 text-xs font-medium">
          <span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">mode: single | range</span>
          <span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">layout: single | dual</span>
          <span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">themes: blue indigo red green dark pink</span>
          <span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">enableTime · min/max · blocked · maxRangeDays</span>
        </div>
      </header>

      <!-- Jump nav (buttons only — no hash links, avoids Vue Router 404) -->
      <nav class="sticky top-0 z-40 -mx-2 px-2 py-3 bg-gray-50/95 backdrop-blur border-b border-gray-200">
        <div class="flex flex-wrap gap-2 justify-center">
          <button
            v-for="s in sections"
            :key="s.id"
            type="button"
            class="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-indigo-400 hover:text-indigo-700"
            :class="activeSection === s.id ? 'border-indigo-500 text-indigo-700' : ''"
            @click="scrollToSection(s.id)"
          >
            {{ s.label }}
          </button>
        </div>
      </nav>

      <!-- 1. Modes & Layouts -->
      <section id="modes" class="space-y-5 scroll-mt-20">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">1. Modes & Layouts</h2>
          <p class="text-sm text-gray-500 mt-2">
            Single pick is supported and is the default. Range can use one calendar or dual panels.
          </p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h3 class="font-bold text-gray-800">Single pick (default)</h3>
            <p class="text-xs text-gray-500">No mode set — defaults to <code>mode: 'single'</code>.</p>
            <VueDatePicker v-model="singleDefault" @date-selected="onDateSelected" />
            <div class="text-xs bg-gray-50 p-2 rounded break-all"><strong>v-model:</strong> {{ singleDefault }}</div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h3 class="font-bold text-gray-800">Single pick (explicit)</h3>
            <p class="text-xs text-gray-500"><code>mode: 'single'</code>, <code>layout: 'single'</code></p>
            <VueDatePicker
              v-model="singleExplicit"
              :config="{ mode: 'single', layout: 'single', style: { theme: 'indigo' } }"
              @date-selected="onDateSelected"
            />
            <div class="text-xs bg-gray-50 p-2 rounded break-all"><strong>v-model:</strong> {{ singleExplicit }}</div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h3 class="font-bold text-gray-800">Range — single calendar</h3>
            <p class="text-xs text-gray-500"><code>mode: 'range'</code>, <code>layout: 'single'</code> (default layout)</p>
            <VueDatePicker
              v-model="rangeSingleLayout"
              :config="{ mode: 'range', layout: 'single', style: { theme: 'indigo' } }"
              @range-selected="onRangeSelected"
              @range-changing="onRangeChanging"
            />
            <div class="text-xs bg-gray-50 p-2 rounded break-all"><strong>v-model:</strong> {{ rangeSingleLayout }}</div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h3 class="font-bold text-gray-800">Range — dual calendars</h3>
            <p class="text-xs text-gray-500"><code>mode: 'range'</code>, <code>layout: 'dual'</code> (no time)</p>
            <div class="overflow-x-auto">
              <VueDatePicker
                v-model="rangeDualLayout"
                :config="{
                  mode: 'range',
                  layout: 'dual',
                  enableTime: false,
                  style: { theme: 'blue', rounded: 'rounded-none', border: 'border-0', shadow: 'shadow-md' },
                }"
                @range-selected="onRangeSelected"
              />
            </div>
            <div class="text-xs bg-gray-50 p-2 rounded break-all"><strong>v-model:</strong> {{ rangeDualLayout }}</div>
          </div>
        </div>
      </section>

      <!-- 2. Plan page production config -->
      <section id="plan" class="space-y-5 scroll-mt-20">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">2. Plan Page (production)</h2>
          <p class="text-sm text-gray-500 mt-2">
            Exact config from Subscription Plan Variations / Lucky Draw popups —
            dual pink range + time.
          </p>
        </div>
        <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3 overflow-x-auto">
          <h3 class="font-bold text-gray-800">Dual pink + time</h3>
          <p class="text-xs text-gray-500">
            <code>mode: 'range'</code> · <code>layout: 'dual'</code> · <code>theme: 'pink'</code> ·
            <code>enableTime: true</code> · <code>format: 'MM/DD/YYYY HH:mm:ss'</code>
          </p>
          <VueDatePicker
            v-model="planDualPink"
            :config="planDatePickerConfig"
            @range-selected="onRangeSelected"
          />
          <div class="text-xs bg-gray-50 p-2 rounded break-all"><strong>v-model:</strong> {{ planDualPink }}</div>
        </div>
      </section>

      <!-- 3. Themes -->
      <section id="themes" class="space-y-5 scroll-mt-20">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">3. Themes</h2>
          <p class="text-sm text-gray-500 mt-2">All built-in themes: blue, indigo, red, green, dark, pink.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div
            v-for="item in themeList"
            :key="item.key"
            class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2"
          >
            <h3 class="font-bold text-sm text-gray-700">{{ item.label }}</h3>
            <VueDatePicker v-model="themeModels[item.key]" :config="{ style: { theme: item.key } }" />
            <div class="text-xs bg-gray-50 p-1.5 rounded break-all">{{ themeModels[item.key] }}</div>
          </div>
        </div>
      </section>

      <!-- 4. Today styles -->
      <section id="today" class="space-y-5 scroll-mt-20">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">4. Today Styles</h2>
          <p class="text-sm text-gray-500 mt-2"><code>todayStyle</code>: underline | background | circle</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Underline (default)</h3>
            <VueDatePicker v-model="todayUnderline" :config="{ style: { theme: 'blue', todayStyle: 'underline' } }" />
          </div>
          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Background</h3>
            <VueDatePicker v-model="todayBackground" :config="{ style: { theme: 'blue', todayStyle: 'background' } }" />
          </div>
          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Circle</h3>
            <VueDatePicker v-model="todayCircle" :config="{ style: { theme: 'green', todayStyle: 'circle' } }" />
          </div>
        </div>
      </section>

      <!-- 5. Time -->
      <section id="time" class="space-y-5 scroll-mt-20">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">5. Time Picker</h2>
          <p class="text-sm text-gray-500 mt-2">
            <code>enableTime: true</code> — legacy select UI, or pink/dual numeric TIME UI.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Single + time</h3>
            <VueDatePicker
              v-model="singleTime"
              :config="{ enableTime: true, style: { theme: 'dark' } }"
              @date-selected="onDateSelected"
            />
            <div class="text-xs bg-gray-50 p-1.5 rounded break-all">{{ singleTime }}</div>
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Single + time + custom format</h3>
            <p class="text-xs text-gray-500"><code>MM/DD/YYYY @ HH:mm</code></p>
            <VueDatePicker
              v-model="singleTimeCustomFormat"
              :config="{ enableTime: true, format: 'MM/DD/YYYY @ HH:mm', style: { theme: 'red' } }"
            />
            <div class="text-xs bg-gray-50 p-1.5 rounded break-all">{{ singleTimeCustomFormat }}</div>
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Range (single layout) + time</h3>
            <VueDatePicker
              v-model="rangeTime"
              :config="{ mode: 'range', enableTime: true, style: { theme: 'indigo' } }"
              @range-selected="onRangeSelected"
            />
            <div class="text-xs bg-gray-50 p-1.5 rounded break-all">{{ rangeTime }}</div>
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Pink theme + time (single)</h3>
            <p class="text-xs text-gray-500">Uses pink TIME UI even without dual layout.</p>
            <VueDatePicker
              v-model="pinkSingleTime"
              :config="{ enableTime: true, format: 'YYYY-MM-DD HH:mm', style: { theme: 'pink' } }"
            />
            <div class="text-xs bg-gray-50 p-1.5 rounded break-all">{{ pinkSingleTime }}</div>
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2 md:col-span-2 overflow-x-auto">
            <h3 class="font-bold text-sm">Dual layout + time (non-pink)</h3>
            <VueDatePicker
              v-model="dualTimeNoPink"
              :config="{
                mode: 'range',
                layout: 'dual',
                enableTime: true,
                format: 'YYYY-MM-DD HH:mm',
                style: { theme: 'blue', rounded: 'rounded-none', border: 'border-0' },
              }"
              @range-selected="onRangeSelected"
            />
            <div class="text-xs bg-gray-50 p-1.5 rounded break-all">{{ dualTimeNoPink }}</div>
          </div>
        </div>
      </section>

      <!-- 6. Validation -->
      <section id="validation" class="space-y-5 scroll-mt-20">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">6. Validation & Constraints</h2>
          <p class="text-sm text-gray-500 mt-2">minDate, maxDate, blockedDates, maxRangeDays</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Blocked dates</h3>
            <VueDatePicker
              v-model="blockedDates"
              :config="{ blockedDates: blockedSample, style: { theme: 'red' } }"
            />
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Min date: 2026-01-01</h3>
            <VueDatePicker v-model="minDate" :config="{ minDate: '2026-01-01' }" />
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Max date: 2026-12-31</h3>
            <VueDatePicker v-model="maxDate" :config="{ maxDate: '2026-12-31' }" />
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Future only</h3>
            <VueDatePicker v-model="futureOnly" :config="{ minDate: tomorrow }" />
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Past only</h3>
            <VueDatePicker v-model="pastOnly" :config="{ maxDate: yesterday, style: { theme: 'dark' } }" />
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Max range: 1 day</h3>
            <VueDatePicker
              v-model="maxRange1"
              :config="{ mode: 'range', maxRangeDays: 1, style: { theme: 'red' } }"
            />
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Max range: 7 days</h3>
            <VueDatePicker
              v-model="maxRange7"
              :config="{ mode: 'range', maxRangeDays: 7, style: { theme: 'indigo' } }"
            />
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2 md:col-span-2">
            <h3 class="font-bold text-sm">Range + blocked weekends sample</h3>
            <VueDatePicker
              v-model="rangeBlocked"
              :config="{
                mode: 'range',
                maxRangeDays: 30,
                blockedDates: ['2026-03-07', '2026-03-08', '2026-03-14', '2026-03-15'],
                style: { theme: 'green' },
              }"
            />
          </div>
        </div>
      </section>

      <!-- 7. Week start -->
      <section id="week" class="space-y-5 scroll-mt-20">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">7. Week Start</h2>
          <p class="text-sm text-gray-500 mt-2"><code>startOfWeek</code>: 0 = Sunday, 1 = Monday</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Sunday start (default)</h3>
            <VueDatePicker v-model="weekSunday" :config="{ startOfWeek: 0, style: { theme: 'blue' } }" />
          </div>
          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Monday start (ISO)</h3>
            <VueDatePicker v-model="weekMonday" :config="{ startOfWeek: 1, style: { theme: 'indigo' } }" />
          </div>
        </div>
      </section>

      <!-- 8. Formats -->
      <section id="formats" class="space-y-5 scroll-mt-20">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">8. Output Formats</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">YYYY-MM-DD</h3>
            <VueDatePicker v-model="formatYmd" :config="{ format: 'YYYY-MM-DD' }" />
            <div class="text-xs bg-gray-50 p-1.5 rounded break-all">{{ formatYmd }}</div>
          </div>
          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">MM/DD/YYYY</h3>
            <VueDatePicker v-model="formatMdy" :config="{ format: 'MM/DD/YYYY', style: { theme: 'green' } }" />
            <div class="text-xs bg-gray-50 p-1.5 rounded break-all">{{ formatMdy }}</div>
          </div>
          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">DD/MM/YYYY HH:mm</h3>
            <VueDatePicker
              v-model="formatDmyTime"
              :config="{ enableTime: true, format: 'DD/MM/YYYY HH:mm', style: { theme: 'dark' } }"
            />
            <div class="text-xs bg-gray-50 p-1.5 rounded break-all">{{ formatDmyTime }}</div>
          </div>
        </div>
      </section>

      <!-- 9. Styling overrides -->
      <section id="styling" class="space-y-5 scroll-mt-20">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">9. Styling Overrides</h2>
          <p class="text-sm text-gray-500 mt-2">
            headerClass, rounded, shadow, border, customClass, error/mono/glass looks
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Custom header (teal)</h3>
            <VueDatePicker
              v-model="styleHeader"
              :config="{ style: { headerClass: 'bg-teal-600 text-white', theme: 'blue' } }"
            />
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Compact</h3>
            <VueDatePicker
              v-model="styleCompact"
              :config="{ style: { customClass: 'text-xs', rounded: 'rounded-sm', shadow: 'shadow-none border border-gray-300' } }"
            />
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Large rounded + green</h3>
            <VueDatePicker
              v-model="styleRounded"
              :config="{ style: { theme: 'green', rounded: 'rounded-3xl', shadow: 'shadow-2xl' } }"
            />
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Square / sharp</h3>
            <VueDatePicker
              v-model="styleSquare"
              :config="{ style: { rounded: 'rounded-none', todayStyle: 'background' } }"
            />
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Borderless float</h3>
            <VueDatePicker
              v-model="styleTransparent"
              :config="{ style: { border: 'border-0', shadow: 'shadow-xl' } }"
            />
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm text-red-600">Error state</h3>
            <VueDatePicker
              v-model="styleError"
              :config="{ style: { border: 'border-2 border-red-500', shadow: 'shadow-red-50', rounded: 'rounded-md' } }"
            />
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2">
            <h3 class="font-bold text-sm">Minimalist mono</h3>
            <VueDatePicker
              v-model="styleMono"
              :config="{
                style: {
                  theme: 'dark',
                  rounded: 'rounded-none',
                  shadow: 'shadow-none border-2 border-black',
                  headerClass: 'bg-black text-white',
                },
              }"
            />
          </div>

          <div class="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl shadow-sm space-y-2 md:col-span-2">
            <h3 class="font-bold text-sm text-white">Glassmorphism</h3>
            <VueDatePicker
              v-model="styleGlass"
              :config="{
                style: {
                  customClass: 'bg-white/20 backdrop-blur-lg border border-white/30 text-white',
                  headerClass: 'bg-transparent text-white border-white/20',
                  shadow: 'shadow-2xl',
                  theme: 'blue',
                },
              }"
            />
          </div>
        </div>
      </section>

      <!-- 10. Extras -->
      <section id="extras" class="space-y-5 scroll-mt-20">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">10. Labels, Sync & Debug</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2 overflow-x-auto">
            <h3 class="font-bold text-sm">Custom dual labels</h3>
            <VueDatePicker
              v-model="customLabels"
              :config="{
                mode: 'range',
                layout: 'dual',
                enableTime: true,
                labels: { startDate: 'FROM', endDate: 'TO', time: 'CLOCK' },
                style: { theme: 'pink', rounded: 'rounded-none', border: 'border-0' },
              }"
            />
            <div class="text-xs bg-gray-50 p-1.5 rounded break-all">{{ customLabels }}</div>
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-3">
            <h3 class="font-bold text-sm">Sync with external input</h3>
            <VueDatePicker v-model="dateSync" targetInputSelector="#datepicker-showcase-external" />
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">External input</label>
              <input
                id="datepicker-showcase-external"
                type="text"
                class="w-full border border-gray-300 rounded p-2 text-sm"
                placeholder="Updates automatically..."
              />
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border shadow-sm space-y-2 md:col-span-2">
            <h3 class="font-bold text-sm">Debug mode</h3>
            <p class="text-xs text-gray-500"><code>style.debug: true</code> shows raw model under the picker.</p>
            <VueDatePicker v-model="debugMode" :config="{ style: { debug: true, theme: 'indigo' } }" />
          </div>
        </div>
      </section>
    </div>

    <!-- Event log -->
    <div
      class="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm text-xs font-mono z-50 opacity-90 hover:opacity-100"
    >
      <div class="font-bold border-b border-gray-700 pb-2 mb-2">Event Log</div>
      <div class="break-all">{{ lastEvent || 'Waiting for interaction...' }}</div>
    </div>
  </div>
</template>
