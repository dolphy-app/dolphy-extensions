<script setup lang="ts">
import { computed } from 'vue';
import type { Format } from './i18n.ts';
import type { DayXp } from './shared/types.ts';

const props = defineProps<{
  days: readonly DayXp[];
  goal: number;
  f: Format;
}>();

/** Scale: the goal line always fits with room above it. */
const scale = computed(() =>
  Math.max(props.goal * 1.25, ...props.days.map((day) => day.xp), 1),
);
const percent = (xp: number) => `${(xp / scale.value) * 100}%`;

// one or two active days: a compact chart, not a field of empty space
const compact = computed(
  () => props.days.filter((day) => day.xp > 0).length <= 2,
);

const labelOf = (day: DayXp) =>
  `${props.f.t('historyDay', {
    date: props.f.dayLong(day.date),
    xp: props.f.number(day.xp),
  })}${day.reached ? `, ${props.f.t('historyReached')}` : ''}`;
</script>

<template>
  <div class="bars-host">
    <div class="bars" :class="{ 'bars--compact': compact }">
      <div class="bars__plot">
        <div class="bars__area" aria-hidden="true">
          <div class="bars__goal" :style="{ bottom: percent(goal) }">
            <span class="bars__goal-label"
              >{{ f.t('goalLine') }} {{ f.number(goal) }}</span
            >
          </div>
        </div>
        <ul class="bars__list" :aria-label="f.t('history')">
          <li
            v-for="(day, index) in days"
            :key="day.date"
            class="bars__item"
            :class="{ 'bars__item--today': index === days.length - 1 }"
            :style="{ '--p': percent(day.xp), '--i': index }"
            :title="labelOf(day)"
            data-testid="xp-day"
            :data-reached="day.reached"
          >
            <span class="bars__sr">{{ labelOf(day) }}</span>
            <span
              v-if="day.xp > 0"
              class="bars__value"
              :class="{ 'bars__value--reached': day.reached }"
              aria-hidden="true"
              >{{ f.number(day.xp) }}</span
            >
            <span
              class="bars__bar"
              :class="{
                'bars__bar--reached': day.reached,
                'bars__bar--zero': day.xp === 0,
              }"
              aria-hidden="true"
            />
          </li>
        </ul>
      </div>
      <div class="bars__days" aria-hidden="true">
        <span
          v-for="(day, index) in days"
          :key="day.date"
          class="bars__day"
          :class="{ 'bars__day--today': index === days.length - 1 }"
        >
          <span class="bars__weekday">{{ f.weekdayShort(day.date) }}</span>
          <span class="bars__date">{{ f.dayOnly(day.date) }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bars-host {
  container-type: inline-size;
}

.bars {
  --xp-plot-height: 128px;
  --xp-gutter: 72px;
  container-type: normal;
}

.bars--compact {
  --xp-plot-height: 96px;
}

.bars__plot {
  position: relative;
  height: calc(var(--xp-plot-height) + 20px);
  padding-top: 20px;
}

.bars__list {
  position: relative;
  display: flex;
  gap: 6px;
  height: 100%;
  margin: 0;
  padding: 0 var(--xp-gutter) 0 0;
  list-style: none;
}

.bars__item {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  border-radius: 8px;
}

.bars__item--today {
  background: rgba(var(--v-theme-primary), 0.1);
}

.bars__bar {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  max-width: 32px;
  height: max(4px, var(--p));
  margin: 0 auto;
  border-radius: 6px 6px 2px 2px;
  background: rgba(var(--v-theme-primary), 0.5);
  transform-origin: bottom;
  animation: grow 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 18ms);
}

.bars__bar--reached {
  background: rgb(var(--v-theme-primary));
}

.bars__bar--zero {
  background: rgba(var(--v-theme-on-surface), 0.24);
}

.bars__value {
  position: absolute;
  right: 0;
  bottom: calc(max(4px, var(--p)) + 4px);
  left: 0;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.bars__value--reached {
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.bars__days {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  padding-right: var(--xp-gutter);
}

.bars__day {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  font-size: 0.75rem;
  line-height: 1.3;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.bars__day--today {
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

/* the area is the same box as the columns: the top 20px of the plot hold the values */
.bars__area {
  position: absolute;
  inset: 20px 0 0;
  pointer-events: none;
}

.bars__goal {
  position: absolute;
  right: 0;
  left: 0;
  z-index: 1;
  border-top: 1px dashed rgba(var(--v-theme-on-surface), 0.55);
}

/* the label sits in the gutter right of the columns, never over a value */
.bars__goal-label {
  position: absolute;
  right: 0;
  bottom: 3px;
  width: var(--xp-gutter);
  padding-left: 8px;
  font-size: 0.75rem;
  white-space: nowrap;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.bars__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* narrow card: every second date, the last day (today) always stays */
@container (max-width: 560px) {
  .bars {
    --xp-gutter: 56px;
  }

  .bars__day:nth-child(odd) {
    visibility: hidden;
  }

  .bars__weekday {
    display: none;
  }
}

@keyframes grow {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bars__bar {
    animation: none;
  }
}
</style>
