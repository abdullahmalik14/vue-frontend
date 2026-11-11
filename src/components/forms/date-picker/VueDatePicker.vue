<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    modelValue: {
        type: [String, Object, Array, Date], // Single: string/Date, Range: {start, end} or [start, end]
        default: null
    },
    config: {
        type: Object,
        default: () => ({})
    },
    // Optional: Selector to sync value to an external input
    targetInputSelector: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue', 'date-selected', 'range-selected', 'range-changing']);

// --- Internal Helpers (No external imports) ---
const utils = {
    pad: (n) => n < 10 ? `0${n}` : `${n}`,

    isValidDate: (d) => d instanceof Date && !isNaN(d),

    // Create date at noon to avoid timezone edge cases for simple date picking
    dateFromStr: (str) => {
        if (!str) return null;
        if (str instanceof Date) return str;

        // Handle potential ISO strings or custom formats with time
        let datePart = str;
        if (typeof str === 'string' && str.includes(' ')) {
            datePart = str.split(' ')[0];
        } else if (typeof str === 'string' && str.includes('T')) {
            datePart = str.split('T')[0];
        }

        let y, m, d;

        if (typeof datePart === 'string' && datePart.includes('/')) {
            // MM/DD/YYYY
            const parts = datePart.split('/').map(Number);
            if (parts.length !== 3) return null;
            [m, d, y] = parts;
        } else {
            // YYYY-MM-DD
            const parts = datePart.split('-').map(Number);
            if (parts.length < 3) return null;
            [y, m, d] = parts;
        }

        if (!y || isNaN(m) || isNaN(d)) return null;

        return new Date(y, m - 1, d, 12, 0, 0);
    },

    formatDate: (date, format = 'YYYY-MM-DD') => {
        if (!date) return '';
        const y = date.getFullYear();
        const m = utils.pad(date.getMonth() + 1);
        const d = utils.pad(date.getDate());
        const h = utils.pad(date.getHours());
        const min = utils.pad(date.getMinutes());
        const s = utils.pad(date.getSeconds());

        return format
            .replace('YYYY', y)
            .replace('MM', m)
            .replace('DD', d)
            .replace('HH', h)
            .replace('mm', min)
            .replace('ss', s);
    },

    daysInMonth: (month, year) => new Date(year, month + 1, 0).getDate(),

    firstDayOfMonth: (month, year) => new Date(year, month, 1).getDay(),

    isSameDate: (d1, d2) => {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    },

    isBetween: (target, start, end) => {
        if (!target || !start || !end) return false;
        const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
        const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
        const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
        return t > s && t < e;
    },

    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    diffInDays: (d1, d2) => {
        const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
        const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
        return Math.abs(Math.round((t2 - t1) / (1000 * 60 * 60 * 24)));
    },

    applyTimeToDate: (date, timeState) => {
        if (!date || !timeState) return date ? new Date(date) : null;
        const d = new Date(date);
        const hours24 = timeState.period === 'PM' && timeState.hours !== 12
            ? timeState.hours + 12
            : (timeState.period === 'AM' && timeState.hours === 12 ? 0 : timeState.hours);
        d.setHours(hours24);
        d.setMinutes(Number(timeState.minutes) || 0);
        d.setSeconds(0);
        return d;
    },

    extractTimeState: (val) => {
        if (typeof val !== 'string') return null;
        let timePart = null;
        if (val.includes(' ')) {
            timePart = val.split(' ')[1];
        } else if (val.includes('T')) {
            timePart = val.split('T')[1]?.slice(0, 8);
        }
        if (!timePart || !timePart.includes(':')) return null;

        const [h, min] = timePart.split(':').map(Number);
        if (isNaN(h) || isNaN(min)) return null;

        let period = 'PM';
        let hours12 = h;
        if (h < 12) {
            period = 'AM';
            hours12 = h === 0 ? 12 : h;
        } else {
            period = 'PM';
            hours12 = h === 12 ? 12 : h - 12;
        }
        return { hours: hours12, minutes: min, period };
    }
};

// --- Config Defaults ---
const defaultConfig = {
    mode: 'single', // 'single' | 'range'
    layout: 'single', // 'single' | 'dual' (dual only applies when mode === 'range')
    format: 'YYYY-MM-DD',
    enableTime: false,
    minDate: null, // 'YYYY-MM-DD'
    maxDate: null,
    blockedDates: [], // Array of 'YYYY-MM-DD'
    maxRangeDays: null,
    alarmIcon: '', // URL for clock/alarm icon next to TIME section (dual/pink)

    labels: {
        startDate: 'START DATE',
        endDate: 'END DATES',
        time: 'TIME'
    },

    // UI / Theme
    placeholder: 'Select Date',
    style: {
        theme: 'blue', // blue, red, green, dark, pink, etc.
        rounded: 'rounded-lg',
        shadow: 'shadow-lg',
        border: 'border border-gray-200',
        headerClass: 'bg-white text-gray-900',
        cellClass: '', // Day cell override
        selectedClass: 'bg-indigo-600 text-white',
        rangeClass: 'bg-indigo-100 text-indigo-900',
        todayStyle: 'underline', // 'underline' | 'background' | 'circle'
        debug: false // Show hidden inputs
    },

    startOfWeek: 0 // 0=Sun, 1=Mon
};

const options = computed(() => {
    // Deep merge would be better, but simple spread works for shallow nesting
    return {
        ...defaultConfig,
        ...props.config,
        style: { ...defaultConfig.style, ...props.config.style },
        labels: { ...defaultConfig.labels, ...props.config.labels },
        // Auto-fix format if time is enabled but format is default
        format: (props.config.enableTime && (!props.config.format || props.config.format === 'YYYY-MM-DD'))
            ? 'YYYY-MM-DD HH:mm'
            : (props.config.format || defaultConfig.format)
    };
});

const isDualLayout = computed(() =>
    options.value.mode === 'range' && options.value.layout === 'dual'
);

const isPinkTheme = computed(() =>
    (options.value.style.theme || 'blue') === 'pink'
);

const usePinkTimeUi = computed(() =>
    options.value.enableTime && (isDualLayout.value || isPinkTheme.value)
);

// --- State ---
const now = new Date();
const view = ref('day'); // 'day', 'month', 'year' (single layout)
const currentMonth = ref(now.getMonth());
const currentYear = ref(now.getFullYear());
const hoverDate = ref(null);

// Dual panel month/year (left = start, right = end)
const startMonth = ref(now.getMonth());
const startYear = ref(now.getFullYear());
const endMonth = ref(now.getMonth() === 11 ? 0 : now.getMonth() + 1);
const endYear = ref(now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear());

// Selection State
const singleDate = ref(null);
const startDate = ref(null);
const endDate = ref(null);

// Time State (single / legacy)
const time = ref({
    hours: 12,
    minutes: 0,
    period: 'PM'
});

// Dual range time state
const startTime = ref({
    hours: 1,
    minutes: 0,
    period: 'AM'
});
const endTime = ref({
    hours: 1,
    minutes: 0,
    period: 'AM'
});

// --- Output & Sync ---

// Watch time changes to emit updates immediately
watch(time, () => {
    if (options.value.mode === 'single' && singleDate.value) {
        emitValue();
    } else if (options.value.mode === 'range' && !isDualLayout.value && (startDate.value || endDate.value)) {
        emitValue();
    }
}, { deep: true });

watch([startTime, endTime], () => {
    if (isDualLayout.value && (startDate.value || endDate.value)) {
        emitValue();
    }
}, { deep: true });

// --- Initialization ---
watch(() => props.modelValue, (val, oldVal) => {
    // Parse incoming value
    // Ideally prevent infinite loops if we emit update immediately
    if (JSON.stringify(val) === JSON.stringify(oldVal)) return;
    initFromValue(val);
}, { immediate: true });

function initFromValue(val) {
    if (!val) {
        // defaults
        singleDate.value = null;
        startDate.value = null;
        endDate.value = null;
        return;
    }

    if (options.value.mode === 'single') {
        singleDate.value = utils.dateFromStr(val);
        if (singleDate.value) {
            currentMonth.value = singleDate.value.getMonth();
            currentYear.value = singleDate.value.getFullYear();

            // Extract time if enabled
            if (options.value.enableTime) {
                const extracted = utils.extractTimeState(val);
                if (extracted) {
                    time.value.hours = extracted.hours;
                    time.value.minutes = extracted.minutes;
                    time.value.period = extracted.period;
                }
            }
        }
    } else {
        // Range — always sync both ends so panels don't share stale selection
        startDate.value = val.start ? utils.dateFromStr(val.start) : null;
        endDate.value = val.end ? utils.dateFromStr(val.end) : null;

        if (startDate.value) {
            currentMonth.value = startDate.value.getMonth();
            currentYear.value = startDate.value.getFullYear();
            startMonth.value = startDate.value.getMonth();
            startYear.value = startDate.value.getFullYear();
        }
        if (endDate.value) {
            endMonth.value = endDate.value.getMonth();
            endYear.value = endDate.value.getFullYear();
        } else if (startDate.value) {
            setEndPanelToStartPlusOne();
        }

        if (options.value.enableTime) {
            if (val.start) {
                const extracted = utils.extractTimeState(val.start);
                if (extracted) {
                    startTime.value = { ...extracted };
                    if (!isDualLayout.value) {
                        time.value = { ...extracted };
                    }
                }
            }
            if (val.end) {
                const extracted = utils.extractTimeState(val.end);
                if (extracted) {
                    endTime.value = { ...extracted };
                }
            }
        }
    }
}

function setEndPanelToStartPlusOne() {
    if (startMonth.value === 11) {
        endMonth.value = 0;
        endYear.value = startYear.value + 1;
    } else {
        endMonth.value = startMonth.value + 1;
        endYear.value = startYear.value;
    }
}

// --- Navigation (single layout) ---
function prevMonth() {
    if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
    } else {
        currentMonth.value--;
    }
}

function nextMonth() {
    if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
    } else {
        currentMonth.value++;
    }
}

function switchView(v) {
    view.value = v;
}

function setMonth(m) {
    currentMonth.value = m;
    view.value = 'day';
}

function setYear(y) {
    currentYear.value = y;
    view.value = 'day'; // Or 'month' if you prefer drilling down
}

// --- Navigation (dual layout panels) ---
function prevPanelMonth(panel) {
    if (panel === 'start') {
        if (startMonth.value === 0) {
            startMonth.value = 11;
            startYear.value--;
        } else {
            startMonth.value--;
        }
    } else {
        if (endMonth.value === 0) {
            endMonth.value = 11;
            endYear.value--;
        } else {
            endMonth.value--;
        }
    }
}

function nextPanelMonth(panel) {
    if (panel === 'start') {
        if (startMonth.value === 11) {
            startMonth.value = 0;
            startYear.value++;
        } else {
            startMonth.value++;
        }
    } else {
        if (endMonth.value === 11) {
            endMonth.value = 0;
            endYear.value++;
        } else {
            endMonth.value++;
        }
    }
}

// --- Grid Generation ---
const daysOfWeek = computed(() => {
    const days = isDualLayout.value
        ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    if (options.value.startOfWeek === 1) {
        return [...days.slice(1), days[0]];
    }
    return days;
});

// Full weekday keys for dual headers (to color first Sunday uniquely)
const dualWeekdayMeta = computed(() => {
    const days = [
        { label: 'S', isSunday: true },
        { label: 'M', isSunday: false },
        { label: 'T', isSunday: false },
        { label: 'W', isSunday: false },
        { label: 'T', isSunday: false },
        { label: 'F', isSunday: false },
        { label: 'S', isSunday: false }
    ];
    if (options.value.startOfWeek === 1) {
        return [...days.slice(1), days[0]];
    }
    return days;
});

function buildCalendarGrid(month, year) {
    const m = month;
    const y = year;
    const totalDays = utils.daysInMonth(m, y);
    const firstDay = utils.firstDayOfMonth(m, y); // 0 = Sun

    const offset = (firstDay - options.value.startOfWeek + 7) % 7;

    const days = [];

    // Previous Month Padding
    const prevMonthDays = utils.daysInMonth(m === 0 ? 11 : m - 1, m === 0 ? y - 1 : y);
    for (let i = offset - 1; i >= 0; i--) {
        days.push({
            date: new Date(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1, prevMonthDays - i),
            isCurrentMonth: false,
            isToday: false // simplified
        });
    }

    // Current Month
    for (let i = 1; i <= totalDays; i++) {
        const d = new Date(y, m, i);
        days.push({
            date: d,
            isCurrentMonth: true,
            isToday: utils.isSameDate(d, now)
        });
    }

    // Next Month Padding (to fill 6 rows = 42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({
            date: new Date(m === 11 ? y + 1 : y, m === 11 ? 0 : m + 1, i),
            isCurrentMonth: false,
            isToday: false
        });
    }

    return days;
}

const calendarGrid = computed(() =>
    buildCalendarGrid(currentMonth.value, currentYear.value)
);

const startCalendarGrid = computed(() =>
    buildCalendarGrid(startMonth.value, startYear.value)
);

const endCalendarGrid = computed(() =>
    buildCalendarGrid(endMonth.value, endYear.value)
);

// --- Date Interaction ---
function handleDateClick(day, panel = null) {
    if (isDisabled(day.date)) return;

    if (options.value.mode === 'single') {
        singleDate.value = day.date;
        emitValue();
        emit('date-selected', day.date);
        return;
    }

    // Dual layout: each panel owns its own selection (no shared click state)
    if (isDualLayout.value && panel) {
        handleDualPanelClick(day, panel);
        return;
    }

    // Legacy single-calendar range mode
    if (!startDate.value || (startDate.value && endDate.value)) {
        startDate.value = day.date;
        endDate.value = null;
    } else if (startDate.value && !endDate.value) {
        if (day.date < startDate.value) {
            startDate.value = day.date;
        } else {
            if (options.value.maxRangeDays) {
                const diff = utils.diffInDays(startDate.value, day.date);
                if (diff > options.value.maxRangeDays) return;
            }
            endDate.value = day.date;
            emit('range-selected', {
                start: withTime(startDate.value, 'start'),
                end: withTime(endDate.value, 'end')
            });
        }
    }
    emitValue();
}

function handleDualPanelClick(day, panel) {
    if (panel === 'start') {
        startDate.value = day.date;
        startMonth.value = day.date.getMonth();
        startYear.value = day.date.getFullYear();
        // Keep end panel on its own month; only clear invalid end
        if (endDate.value && day.date > endDate.value) {
            endDate.value = null;
        }
    } else {
        // End panel only sets end — never copies into start
        if (startDate.value && day.date < startDate.value) {
            // End before start: reject and keep previous end
            return;
        }
        if (options.value.maxRangeDays && startDate.value) {
            const diff = utils.diffInDays(startDate.value, day.date);
            if (diff > options.value.maxRangeDays) return;
        }
        endDate.value = day.date;
        endMonth.value = day.date.getMonth();
        endYear.value = day.date.getFullYear();
    }

    emitValue();
    if (startDate.value && endDate.value) {
        emit('range-selected', {
            start: withTime(startDate.value, 'start'),
            end: withTime(endDate.value, 'end')
        });
    }
}

function handleDateHover(day) {
    if (options.value.mode === 'range' && startDate.value && !endDate.value) {
        hoverDate.value = day.date;
        emit('range-changing', { start: startDate.value, end: day.date });
    } else {
        hoverDate.value = null;
    }
}

function isDisabled(date) {
    // Configured bounds
    if (options.value.minDate && date < utils.dateFromStr(options.value.minDate)) return true;
    if (options.value.maxDate && date > utils.dateFromStr(options.value.maxDate)) return true;

    // Configured blocked dates
    if (options.value.blockedDates.some(blocked => utils.isSameDate(utils.dateFromStr(blocked), date))) return true;

    // Range Logic: prevent selecting beyond maxRange from start (during selection)
    if (options.value.mode === 'range' && startDate.value && !endDate.value && options.value.maxRangeDays) {
        const diff = utils.diffInDays(startDate.value, date);
        // Only disable if it's AFTER start AND exceeds range
        if (date > startDate.value && diff > options.value.maxRangeDays) return true;
    }

    return false;
}

// --- Styling Helpers ---
const themeColors = computed(() => {
    const t = options.value.style.theme || 'blue';
    const colors = {
        blue: { select: 'bg-blue-600', range: 'bg-blue-100 text-blue-900', today: 'text-blue-600', border: 'border-blue-600', text: 'text-blue-700', label: 'text-blue-700', nav: 'text-blue-600' },
        indigo: { select: 'bg-indigo-600', range: 'bg-indigo-100 text-indigo-900', today: 'text-indigo-600', border: 'border-indigo-600', text: 'text-indigo-700', label: 'text-indigo-700', nav: 'text-indigo-600' },
        red: { select: 'bg-red-600', range: 'bg-red-100 text-red-900', today: 'text-red-600', border: 'border-red-600', text: 'text-red-700', label: 'text-red-700', nav: 'text-red-600' },
        green: { select: 'bg-green-600', range: 'bg-green-100 text-green-900', today: 'text-green-600', border: 'border-green-600', text: 'text-green-700', label: 'text-green-700', nav: 'text-green-600' },
        dark: { select: 'bg-gray-800', range: 'bg-gray-200 text-gray-800', today: 'text-gray-900', border: 'border-gray-900', text: 'text-gray-900', label: 'text-gray-900', nav: 'text-gray-800' },
        pink: {
            select: 'bg-[#FF0066]',
            range: 'bg-[#FFF2F5] text-[#0C111D]',
            today: 'text-[#FF0066]',
            border: 'border-[#FF0066]',
            text: 'text-[#FF0066]',
            label: 'text-[#FF0066]',
            nav: 'text-[#FF0066]'
        },
    };
    return colors[t] || colors.blue;
});

/** Range fill on the cell (full row width). Row gap comes from the grid `gap-y`. */
function getDualCellClass(day) {
    if (!isDualLayout.value) return 'flex justify-center relative';
    const inRange = isDayInRange(day.date);
    const isStart = isRangeStart(day.date);
    const isEnd = isRangeEnd(day.date);
    const showFill = inRange || isStart || isEnd;
    return [
        'flex justify-center items-center relative w-full h-9',
        showFill ? 'bg-[#FFF2F5]' : '',
    ].join(' ');
}

function getDayClasses(day, panel = null) {
    const isStart = isRangeStart(day.date);
    const isEnd = isRangeEnd(day.date);
    const isSelected = isDaySelected(day.date);
    const inRange = isDayInRange(day.date);

    // Dual: selected = pink circle; light range fill stays on the cell wrapper
    if (isDualLayout.value) {
        const base =
            'h-9 w-9 flex items-center justify-center text-sm font-semibold rounded-full border-0 outline-none relative z-20 cursor-pointer transition-colors';
        if (isDisabled(day.date)) {
            return base + ' text-gray-300 cursor-not-allowed bg-transparent';
        }
        if (panel === 'start' && isStart) {
            return base + ' bg-[#FF0066] text-white';
        }
        if (panel === 'end' && isEnd) {
            return base + ' bg-[#FF0066] text-white';
        }

        let classes = base + ' bg-transparent ';
        if (!day.isCurrentMonth) classes += ' text-gray-400 ';
        else classes += ' text-gray-700 ';
        if (day.isToday) {
            classes += ' underline decoration-2 underline-offset-4 text-gray-900 font-bold ';
        }
        return classes;
    }

    const radius = 'rounded-full';
    const base = `h-9 w-9 flex items-center justify-center text-sm font-semibold ${radius} transition-colors cursor-pointer relative z-20 border-0 outline-none `;
    if (isDisabled(day.date)) {
        return base + ' text-gray-300 cursor-not-allowed';
    }

    if (isSelected || isStart || isEnd) {
        return base + ` ${themeColors.value.select} !text-white hover:opacity-90`;
    }

    if (inRange) {
        return `h-9 w-9 flex items-center justify-center text-sm font-medium transition-colors cursor-pointer relative z-10 border-0 outline-none bg-[#FFF2F5] text-[#0C111D] rounded-none`;
    }

    let classes = base + ' hover:bg-gray-100 ';
    if (!day.isCurrentMonth) classes += ' text-gray-400 ';
    else classes += ' text-gray-700 ';

    if (day.isToday) {
        if (options.value.style.todayStyle === 'background') {
            classes += ' bg-gray-100 font-bold ';
        } else if (options.value.style.todayStyle === 'circle') {
            classes += ` border ${themeColors.value.border} font-bold `;
        } else {
            // underline default
            classes += ` underline decoration-2 underline-offset-4 ${themeColors.value.today} font-bold `;
        }
    }

    return classes;
}

function isZebraRow(idx) {
    return Math.floor(idx / 7) % 2 === 1;
}

const alarmMaskStyle = computed(() => {
    if (!options.value.alarmIcon) return {};
    return {
        maskImage: `url('${options.value.alarmIcon}')`,
        webkitMaskImage: `url('${options.value.alarmIcon}')`,
        maskSize: 'contain',
        webkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        webkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        webkitMaskPosition: 'center',
    };
});

function isDaySelected(date) {
    if (options.value.mode === 'single') {
        return singleDate.value && utils.isSameDate(date, singleDate.value);
    }
    return false;
}

function isRangeStart(date) {
    return options.value.mode === 'range' && startDate.value && utils.isSameDate(date, startDate.value);
}

function isRangeEnd(date) {
    if (options.value.mode !== 'range') return false;
    if (endDate.value && utils.isSameDate(date, endDate.value)) return true;
    // Preview
    if (startDate.value && !endDate.value && hoverDate.value) {
        return utils.isSameDate(date, hoverDate.value) && date > startDate.value;
    }
    return false;
}

function isDayInRange(date) {
    if (options.value.mode !== 'range' || !startDate.value) return false;

    const end = endDate.value || (hoverDate.value && hoverDate.value > startDate.value ? hoverDate.value : null);
    if (!end) return false;

    return utils.isBetween(date, startDate.value, end);
}

function withTime(date, which = 'start') {
    if (!date) return null;
    if (!options.value.enableTime) return new Date(date);
    if (isDualLayout.value) {
        const t = which === 'end' ? endTime.value : startTime.value;
        return utils.applyTimeToDate(date, t);
    }
    // Non-dual: single shared time state (legacy select UI)
    return utils.applyTimeToDate(date, time.value);
}

function monthName(month) {
    return new Date(2000, month)
        .toLocaleString('default', { month: 'long' })
        .toUpperCase();
}

function monthLabel(month, year) {
    return `${monthName(month)} ${year}`;
}

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: monthName(i),
}));

const yearOptions = computed(() => {
    const base = startYear.value || now.getFullYear();
    const years = [];
    for (let y = base - 8; y <= base + 12; y++) years.push(y);
    // also include end year neighborhood
    const endBase = endYear.value || base;
    for (let y = endBase - 8; y <= endBase + 12; y++) {
        if (!years.includes(y)) years.push(y);
    }
    return years.sort((a, b) => a - b);
});

// Dual panel month/year dropdown menus: 'start-month' | 'start-year' | 'end-month' | 'end-year' | null
const openDualMenu = ref(null);

function toggleDualMenu(key) {
    openDualMenu.value = openDualMenu.value === key ? null : key;
}

function selectPanelMonth(panel, monthIndex) {
    if (panel === 'start') startMonth.value = monthIndex;
    else endMonth.value = monthIndex;
    openDualMenu.value = null;
}

function selectPanelYear(panel, year) {
    if (panel === 'start') startYear.value = year;
    else endYear.value = year;
    openDualMenu.value = null;
}

function closeDualMenus() {
    openDualMenu.value = null;
}

function handleDualMenuOutside(event) {
    if (!openDualMenu.value) return;
    const root = event.target?.closest?.('.vue-date-picker--dual');
    if (!root) {
        openDualMenu.value = null;
        return;
    }
    if (!event.target?.closest?.('[data-dual-menu]')) {
        openDualMenu.value = null;
    }
}

onMounted(() => {
    document.addEventListener('mousedown', handleDualMenuOutside);
});

onUnmounted(() => {
    document.removeEventListener('mousedown', handleDualMenuOutside);
});

// --- Output & Sync ---
const formattedOutput = computed(() => {
    const fmt = options.value.format;
    if (options.value.mode === 'single') {
        if (!singleDate.value) return '';
        const d = withTime(singleDate.value, 'start');
        return utils.formatDate(d, fmt);
    } else {
        // Range
        if (!startDate.value) return '';
        if (options.value.enableTime) {
            const s = utils.formatDate(withTime(startDate.value, 'start'), fmt);
            const e = endDate.value ? utils.formatDate(withTime(endDate.value, 'end'), fmt) : '...';
            return `${s} | ${e}`;
        }
        const dateFmt = fmt.split(' ')[0];
        const s = utils.formatDate(startDate.value, dateFmt);
        const e = endDate.value ? utils.formatDate(endDate.value, dateFmt) : '...';
        return `${s} | ${e}`;
    }
});

function emitValue() {
    let val;
    if (options.value.mode === 'single') {
        val = formattedOutput.value; // String? Or Date object? Standard usually ISO string or Date.
        // Let's prefer standard YYYY-MM-DD or configured format string
    } else {
        const fmt = options.value.format;
        if (options.value.enableTime) {
            val = {
                start: startDate.value ? utils.formatDate(withTime(startDate.value, 'start'), fmt) : null,
                end: endDate.value ? utils.formatDate(withTime(endDate.value, 'end'), fmt) : null
            };
        } else {
            val = {
                start: startDate.value ? utils.formatDate(startDate.value, fmt) : null,
                end: endDate.value ? utils.formatDate(endDate.value, fmt) : null
            };
        }
    }
    emit('update:modelValue', val);

    // Target Sync
    if (props.targetInputSelector) {
        nextTick(() => {
            const el = document.querySelector(props.targetInputSelector);
            if (el) {
                el.value = typeof val === 'object' ? JSON.stringify(val) : val;
                el.dispatchEvent(new Event('input'));
            }
        });
    }
}

// --- Time Picker Logic ---
const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10...

function clampMinutes(val) {
    const n = parseInt(val, 10);
    if (isNaN(n)) return 0;
    return Math.min(59, Math.max(0, n));
}

function clampHours(val) {
    const n = parseInt(val, 10);
    if (isNaN(n)) return 12;
    return Math.min(12, Math.max(1, n));
}

function updateTime() {
    if (options.value.mode === 'single' && singleDate.value) {
        emitValue();
    } else if (options.value.mode === 'range' && (startDate.value || endDate.value)) {
        emitValue();
    }
}

function updateDualTime(which, field, value) {
    const target = which === 'end' ? endTime : startTime;
    if (field === 'hours') {
        target.value.hours = clampHours(value);
    } else if (field === 'minutes') {
        target.value.minutes = clampMinutes(value);
    } else if (field === 'period') {
        target.value.period = value;
    }
    updateTime();
}

function onMinuteBlur(which) {
    const target = which === 'end' ? endTime : startTime;
    target.value.minutes = clampMinutes(target.value.minutes);
    updateTime();
}

function onHourBlur(which) {
    const target = which === 'end' ? endTime : startTime;
    target.value.hours = clampHours(target.value.hours);
    updateTime();
}

</script>

<template>
    <!-- Dual Range Layout (plan-style) -->
    <div v-if="isDualLayout" class="vue-date-picker vue-date-picker--dual w-full max-w-full bg-white transition-all overflow-x-hidden overflow-y-auto"
        :class="[
            options.style.rounded,
            options.style.shadow,
            options.style.border,
            options.style.customClass
        ]">
        <div class="flex flex-col md:flex-row w-full max-w-full min-w-0">
            <!-- START DATE Panel -->
            <div class="flex-1 min-w-0 p-3 sm:p-4 md:border-r md:border-[#EAECF0]">
                <div class="uppercase mb-3 text-[#FF0066] tracking-wide" style="font-size: 11px; font-weight: 300;">
                    {{ options.labels.startDate }}
                </div>

                <!-- Month / Year dropdowns + nav arrows -->
                <div class="flex items-center justify-between mb-3 gap-2">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="relative" data-dual-menu>
                            <button
                                type="button"
                                class="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 tracking-wide outline-none focus:outline-none"
                                @click.stop="toggleDualMenu('start-month')"
                            >
                                <span>{{ monthName(startMonth) }}</span>
                                <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div
                                v-if="openDualMenu === 'start-month'"
                                class="absolute left-0 top-full mt-1 z-30 min-w-[7.5rem] max-h-48 overflow-y-auto bg-white border border-[#EAECF0] shadow-md"
                            >
                                <button
                                    v-for="opt in monthOptions"
                                    :key="'sm-' + opt.value"
                                    type="button"
                                    class="w-full text-left px-3 py-2 text-xs font-medium hover:bg-[#FFF2F5]"
                                    :class="opt.value === startMonth ? 'text-[#FF0066]' : 'text-gray-800'"
                                    @click.stop="selectPanelMonth('start', opt.value)"
                                >
                                    {{ opt.label }}
                                </button>
                            </div>
                        </div>
                        <div class="relative" data-dual-menu>
                            <button
                                type="button"
                                class="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 tracking-wide outline-none focus:outline-none"
                                @click.stop="toggleDualMenu('start-year')"
                            >
                                <span>{{ startYear }}</span>
                                <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div
                                v-if="openDualMenu === 'start-year'"
                                class="absolute left-0 top-full mt-1 z-30 min-w-[5rem] max-h-48 overflow-y-auto bg-white border border-[#EAECF0] shadow-md"
                            >
                                <button
                                    v-for="y in yearOptions"
                                    :key="'sy-' + y"
                                    type="button"
                                    class="w-full text-left px-3 py-2 text-xs font-medium hover:bg-[#FFF2F5]"
                                    :class="y === startYear ? 'text-[#FF0066]' : 'text-gray-800'"
                                    @click.stop="selectPanelYear('start', y)"
                                >
                                    {{ y }}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-0.5 shrink-0">
                        <button type="button" @click="prevPanelMonth('start')"
                            class="p-1 hover:bg-gray-100 rounded-full transition-colors outline-none focus:outline-none" aria-label="Previous month">
                            <svg class="w-5 h-5 text-[#FF0066]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button type="button" @click="nextPanelMonth('start')"
                            class="p-1 hover:bg-gray-100 rounded-full transition-colors outline-none focus:outline-none" aria-label="Next month">
                            <svg class="w-5 h-5 text-[#FF0066]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-7 mb-1">
                    <div v-for="(day, idx) in dualWeekdayMeta" :key="'s-wd-' + idx"
                        class="text-center text-xs font-semibold py-1"
                        :class="day.isSunday ? 'text-[#FF0066]' : 'text-gray-500'">
                        {{ day.label }}
                    </div>
                </div>

                <div class="grid grid-cols-7 gap-y-1.5">
                    <div
                        v-for="(day, idx) in startCalendarGrid"
                        :key="'s-' + idx"
                        :class="getDualCellClass(day)"
                        @mouseenter="handleDateHover(day)"
                    >
                        <button
                            type="button"
                            @click.stop="handleDateClick(day, 'start')"
                            :class="getDayClasses(day, 'start')"
                            :disabled="isDisabled(day.date)"
                        >
                            {{ day.date.getDate() }}
                        </button>
                    </div>
                </div>

                <!-- TIME: no horizontal border — only vertical mid-line between panels -->
                <div v-if="options.enableTime" class="mt-4 pt-3">
                    <div class="uppercase text-gray-500 mb-2 tracking-wide" style="font-size: 11px; font-weight: 300;">
                        {{ options.labels.time }}
                    </div>
                    <div class="flex items-center justify-start gap-2">
                        <span
                            v-if="options.alarmIcon"
                            class="inline-block w-5 h-5 shrink-0 bg-[#98A2B3]"
                            :style="alarmMaskStyle"
                            aria-hidden="true"
                        />
                        <input type="number" min="1" max="12" :value="startTime.hours"
                            @change="updateDualTime('start', 'hours', $event.target.value)"
                            @blur="onHourBlur('start')"
                            class="dual-time-input text-left text-sm font-medium bg-[#F2F4F7] rounded-[8px] border-0 outline-none focus:outline-none focus:ring-0" />
                        <span class="text-gray-900 font-semibold">:</span>
                        <input type="text" inputmode="numeric" maxlength="2"
                            :value="utils.pad(startTime.minutes)"
                            @change="updateDualTime('start', 'minutes', $event.target.value)"
                            @blur="onMinuteBlur('start')"
                            class="dual-time-input text-left text-sm font-medium bg-[#F2F4F7] rounded-[8px] border-0 outline-none focus:outline-none focus:ring-0" />
                        <div class="flex items-center gap-0.5 ml-1 border-0 outline-none shadow-none">
                            <button type="button" @click="updateDualTime('start', 'period', 'AM')"
                                class="dual-ampm text-xs font-semibold border-0 outline-none focus:outline-none focus:ring-0 shadow-none transition-colors rounded-full"
                                :class="startTime.period === 'AM' ? 'bg-[#FF0066] text-white' : 'bg-transparent text-gray-900'">
                                AM
                            </button>
                            <button type="button" @click="updateDualTime('start', 'period', 'PM')"
                                class="dual-ampm text-xs font-semibold border-0 outline-none focus:outline-none focus:ring-0 shadow-none transition-colors rounded-full"
                                :class="startTime.period === 'PM' ? 'bg-[#FF0066] text-white' : 'bg-transparent text-gray-900'">
                                PM
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- END DATES Panel -->
            <div class="flex-1 min-w-0 p-3 sm:p-4">
                <div class="uppercase mb-3 text-[#FF0066] tracking-wide" style="font-size: 11px; font-weight: 300;">
                    {{ options.labels.endDate }}    
                </div>

                <div class="flex items-center justify-between mb-3 gap-2">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="relative" data-dual-menu>
                            <button
                                type="button"
                                class="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 tracking-wide outline-none focus:outline-none"
                                @click.stop="toggleDualMenu('end-month')"
                            >
                                <span>{{ monthName(endMonth) }}</span>
                                <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div
                                v-if="openDualMenu === 'end-month'"
                                class="absolute left-0 top-full mt-1 z-30 min-w-[7.5rem] max-h-48 overflow-y-auto bg-white border border-[#EAECF0] shadow-md"
                            >
                                <button
                                    v-for="opt in monthOptions"
                                    :key="'em-' + opt.value"
                                    type="button"
                                    class="w-full text-left px-3 py-2 text-xs font-medium hover:bg-[#FFF2F5]"
                                    :class="opt.value === endMonth ? 'text-[#FF0066]' : 'text-gray-800'"
                                    @click.stop="selectPanelMonth('end', opt.value)"
                                >
                                    {{ opt.label }}
                                </button>
                            </div>
                        </div>
                        <div class="relative" data-dual-menu>
                            <button
                                type="button"
                                class="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 tracking-wide outline-none focus:outline-none"
                                @click.stop="toggleDualMenu('end-year')"
                            >
                                <span>{{ endYear }}</span>
                                <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div
                                v-if="openDualMenu === 'end-year'"
                                class="absolute left-0 top-full mt-1 z-30 min-w-[5rem] max-h-48 overflow-y-auto bg-white border border-[#EAECF0] shadow-md"
                            >
                                <button
                                    v-for="y in yearOptions"
                                    :key="'ey-' + y"
                                    type="button"
                                    class="w-full text-left px-3 py-2 text-xs font-medium hover:bg-[#FFF2F5]"
                                    :class="y === endYear ? 'text-[#FF0066]' : 'text-gray-800'"
                                    @click.stop="selectPanelYear('end', y)"
                                >
                                    {{ y }}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-0.5 shrink-0">
                        <button type="button" @click="prevPanelMonth('end')"
                            class="p-1 hover:bg-gray-100 rounded-full transition-colors outline-none focus:outline-none" aria-label="Previous month">
                            <svg class="w-5 h-5 text-[#FF0066]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>    
                        <button type="button" @click="nextPanelMonth('end')"
                            class="p-1 hover:bg-gray-100 rounded-full transition-colors outline-none focus:outline-none" aria-label="Next month">
                            <svg class="w-5 h-5 text-[#FF0066]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-7 mb-1">
                    <div v-for="(day, idx) in dualWeekdayMeta" :key="'e-wd-' + idx"
                        class="text-center text-xs font-semibold py-1"
                        :class="day.isSunday ? 'text-[#FF0066]' : 'text-gray-500'">
                        {{ day.label }}
                    </div>
                </div>

                <div class="grid grid-cols-7 gap-y-1.5">
                    <div
                        v-for="(day, idx) in endCalendarGrid"
                        :key="'e-' + idx"
                        :class="getDualCellClass(day)"
                        @mouseenter="handleDateHover(day)"
                    >
                        <button
                            type="button"
                            @click.stop="handleDateClick(day, 'end')"
                            :class="getDayClasses(day, 'end')"
                            :disabled="isDisabled(day.date)"
                        >
                            {{ day.date.getDate() }}
                        </button>
                    </div>
                </div>

                <div v-if="options.enableTime" class="mt-4 pt-3">
                    <div class="uppercase text-gray-500 mb-2 tracking-wide" style="font-size: 11px; font-weight: 300;">
                        {{ options.labels.time }}
                    </div>
                    <div class="flex items-center justify-start gap-2">
                        <span
                            v-if="options.alarmIcon"
                            class="inline-block w-5 h-5 shrink-0 bg-[#98A2B3]"
                            :style="alarmMaskStyle"
                            aria-hidden="true"
                        />
                        <input type="number" min="1" max="12" :value="endTime.hours"
                            @change="updateDualTime('end', 'hours', $event.target.value)"
                            @blur="onHourBlur('end')"
                            class="dual-time-input text-left text-sm font-medium bg-[#F2F4F7] rounded-[8px] border-0 outline-none focus:outline-none focus:ring-0" />
                        <span class="text-gray-900 font-semibold">:</span>
                        <input type="text" inputmode="numeric" maxlength="2"
                            :value="utils.pad(endTime.minutes)"
                            @change="updateDualTime('end', 'minutes', $event.target.value)"
                            @blur="onMinuteBlur('end')"
                            class="dual-time-input text-left text-sm font-medium bg-[#F2F4F7] rounded-[8px] border-0 outline-none focus:outline-none focus:ring-0" />
                        <div class="flex items-center gap-0.5 ml-1 border-0 outline-none shadow-none">
                            <button type="button" @click="updateDualTime('end', 'period', 'AM')"
                                class="dual-ampm text-xs font-semibold border-0 outline-none focus:outline-none focus:ring-0 shadow-none transition-colors rounded-full"
                                :class="endTime.period === 'AM' ? 'bg-[#FF0066] text-white' : 'bg-transparent text-gray-900'">
                                AM
                            </button>
                            <button type="button" @click="updateDualTime('end', 'period', 'PM')"
                                class="dual-ampm text-xs font-semibold border-0 outline-none focus:outline-none focus:ring-0 shadow-none transition-colors rounded-full"
                                :class="endTime.period === 'PM' ? 'bg-[#FF0066] text-white' : 'bg-transparent text-gray-900'">
                                PM
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Debug / Inputs -->
        <div v-if="options.style.debug" class="p-2 bg-gray-900 text-gray-200 text-xs font-mono">
            DEBUG MODE <br />
            Raw Model: {{ modelValue }} <br />
            Output: {{ formattedOutput }}
        </div>

        <input type="hidden" class="vue-datepicker-input"
            :value="typeof formattedOutput === 'object' ? JSON.stringify(formattedOutput) : formattedOutput" />
    </div>

    <!-- Single Layout (existing path — unchanged behavior) -->
    <div v-else class="vue-date-picker inline-block bg-white transition-all overflow-hidden" :class="[
        options.style.rounded,
        options.style.shadow,
        options.style.border,
        options.style.customClass
    ]">
        <!-- Navbar / Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100"
            :class="options.style.headerClass">
            <button type="button" @click="prevMonth" class="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
            </button>

            <div class="flex gap-2 font-semibold text-gray-800">
                <button type="button" @click="view === 'month' ? switchView('day') : switchView('month')"
                    class="hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                    {{ new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' }) }}
                </button>
                <button type="button" @click="view === 'year' ? switchView('day') : switchView('year')"
                    class="hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                    {{ currentYear }}
                </button>
            </div>

            <button type="button" @click="nextMonth" class="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </button>
        </div>

        <!-- View: Day Grid -->
        <div v-if="view === 'day'" class="p-4">
            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 mb-2">
                <div v-for="day in daysOfWeek" :key="day" class="text-center text-xs font-semibold text-gray-500 py-1">
                    {{ day }}
                </div>
            </div>

            <!-- Days -->
            <div class="grid grid-cols-7 gap-y-1">
                <div v-for="(day, idx) in calendarGrid" :key="idx" class="flex justify-center relative"
                    @mouseenter="handleDateHover(day)">
                    <!-- Special styling for Range Connectors (Start/End background extension) -->
                    <div v-if="options.mode === 'range' && isDayInRange(day.date)" class="absolute inset-y-0 w-full"
                        :class="[
                            themeColors.range,
                            isRangeStart(day.date) ? 'left-1/2 w-1/2 rounded-l-none' : '',
                            isRangeEnd(day.date) ? 'right-1/2 w-1/2 rounded-r-none' : '',
                            !isRangeStart(day.date) && !isRangeEnd(day.date) ? 'w-full' : ''
                        ]"></div>

                    <button type="button" @click.stop="handleDateClick(day)" :class="getDayClasses(day)"
                        :disabled="isDisabled(day.date)">
                        {{ day.date.getDate() }}
                    </button>
                </div>
            </div>
        </div>

        <!-- View: Month Selection -->
        <div v-else-if="view === 'month'" class="p-4 grid grid-cols-3 gap-2 h-[280px] overflow-y-auto">
            <button type="button" v-for="(m, i) in 12" :key="i" @click="setMonth(i)"
                class="p-2 rounded hover:bg-gray-100 text-sm font-medium"
                :class="i === currentMonth ? themeColors.text + ' bg-gray-50' : 'text-gray-700'">
                {{ new Date(2000, i).toLocaleString('default', { month: 'short' }) }}
            </button>
        </div>

        <!-- View: Year Selection -->
        <div v-else-if="view === 'year'" class="p-4 grid grid-cols-4 gap-2 h-[280px] overflow-y-auto">
            <button type="button" v-for="y in 20" :key="y" @click="setYear(currentYear - 10 + y)"
                class="p-2 rounded hover:bg-gray-100 text-sm font-medium"
                :class="(currentYear - 10 + y) === currentYear ? themeColors.text + ' bg-gray-50' : 'text-gray-700'">
                {{ currentYear - 10 + y }}
            </button>
        </div>

        <!-- Optional: Time Picker — pink-style inputs when theme is pink -->
        <div v-if="options.enableTime && view === 'day' && usePinkTimeUi"
            class="border-t border-gray-100 p-3 bg-gray-50">
            <div class="flex items-center gap-2 mb-2 justify-center">
                <img v-if="options.alarmIcon" :src="options.alarmIcon" alt="" class="w-4 h-4 object-contain" />
                <span class="text-xs font-bold tracking-wider uppercase text-gray-500">
                    {{ options.labels.time }}
                </span>
            </div>
            <div class="flex items-center justify-center gap-2">
                <input type="number" min="1" max="12" :value="time.hours"
                    @input="time.hours = clampHours($event.target.value); updateTime()"
                    class="w-12 h-10 text-center text-sm font-medium bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-[#FF0066]/60" />
                <span class="text-gray-400 font-semibold">:</span>
                <input type="number" min="0" max="59" :value="utils.pad(time.minutes)"
                    @input="time.minutes = clampMinutes($event.target.value); updateTime()"
                    class="w-12 h-10 text-center text-sm font-medium bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-[#FF0066]/60" />
                <div class="flex ml-1 rounded-lg overflow-hidden border border-gray-200">
                    <button type="button" @click="time.period = 'AM'; updateTime()"
                        class="px-3 py-2 text-xs font-semibold transition-colors"
                        :class="time.period === 'AM' ? 'bg-[#FF0066] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'">
                        AM
                    </button>
                    <button type="button" @click="time.period = 'PM'; updateTime()"
                        class="px-3 py-2 text-xs font-semibold transition-colors"
                        :class="time.period === 'PM' ? 'bg-[#FF0066] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'">
                        PM
                    </button>
                </div>
            </div>
        </div>

        <!-- Optional: Time Picker — legacy selects for non-dual/non-pink -->
        <div v-else-if="options.enableTime && view === 'day'"
            class="border-t border-gray-100 p-3 bg-gray-50 flex items-center justify-center gap-2">
            <select v-model="time.hours" @change="updateTime"
                class="bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                <option v-for="h in hours" :key="h" :value="h">{{ utils.pad(h) }}</option>
            </select>
            <span class="text-gray-400">:</span>
            <select v-model="time.minutes" @change="updateTime"
                class="bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                <option v-for="m in minutes" :key="m" :value="m">{{ utils.pad(m) }}</option>
            </select>
            <select v-model="time.period" @change="updateTime"
                class="bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>

        <!-- Debug / Inputs -->
        <div v-if="options.style.debug" class="p-2 bg-gray-900 text-gray-200 text-xs font-mono">
            DEBUG MODE <br />
            Raw Model: {{ modelValue }} <br />
            Output: {{ formattedOutput }}
        </div>

        <!-- Hidden Input for Forms -->
        <input type="hidden" class="vue-datepicker-input"
            :value="typeof formattedOutput === 'object' ? JSON.stringify(formattedOutput) : formattedOutput" />
    </div>
</template>

<style scoped>
/* Scrollbar hiding if needed */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* Hide number input spinners for pink/dual time UI */
.vue-date-picker--dual input[type='number']::-webkit-inner-spin-button,
.vue-date-picker--dual input[type='number']::-webkit-outer-spin-button,
.vue-date-picker input[type='number']::-webkit-inner-spin-button,
.vue-date-picker input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.vue-date-picker--dual input[type='number'],
.vue-date-picker input[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
}

.vue-date-picker--dual button {
    border: none !important;
    box-shadow: none;
    outline: none;
}

.vue-date-picker--dual button:focus,
.vue-date-picker--dual button:focus-visible {
    outline: none !important;
    box-shadow: none !important;
}

/* Time inputs: left-aligned, padded like design */
.vue-date-picker--dual .dual-time-input {
    width: 2.75rem;
    min-width: 2.75rem;
    padding: 4px 8px !important;
    text-align: left;
    box-sizing: border-box;
}

/* AM/PM selected pill — same padding as design (4 top/bottom, 8 left/right) */
.vue-date-picker--dual .dual-ampm {
    padding: 4px 8px !important;
    box-sizing: border-box;
}
</style>
