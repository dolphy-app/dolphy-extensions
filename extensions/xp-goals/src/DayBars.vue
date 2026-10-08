<script setup lang="ts">
import { computed } from 'vue';
import type { Format } from './i18n.ts';
import type { DayXp } from './shared/types.ts';

const props = defineProps<{
  days: readonly DayXp[];
  goal: number;
  f: Format;
}>();

// the goal line is always inside the chart
const scale = computed(() =>
  Math.max(props.goal, ...props.days.map((day) => day.xp), 1),
);
const percent = (xp: number) => `${(xp / scale.value) * 100}%`;

const labelOf = (day: DayXp) =>
  `${props.f.t('historyDay', {
    date: props.f.dayLong(day.date),
    xp: props.f.number(day.xp),
  })}${day.reached ? `, ${props.f.t('historyReached')}` : ''}`;
</script>

<template>
  <div class="bars">
    <div class="bars__plot">
      <div class="bars__area" aria-hidden="true">
        <div class="bars__goal" :style="{ bottom: percent(goal) }">
          <span class="bars__goal-label">{{ f.t('goalLine') }}</span>
        </div>
      </div>
      <ul class="bars__list" :aria-label="f.t('history')">
        <li
          v-for="day in days"
          :key="day.date"
          class="bars__item"
          :title="labelOf(day)"
          data-testid="xp-day"
          :data-reached="day.reached"
        >
          <span class="bars__sr">{{ labelOf(day) }}</span>
          <v-icon
            v-if="day.reached"
            class="bars__check"
            icon="mdi-check-circle"
            size="16"
            aria-hidden="true"
          />
          <span
            class="bars__bar"
            :class="{ 'bars__bar--reached': day.reached }"
            :style="{ height: percent(day.xp) }"
            aria-hidden="true"
          />
        </li>
      </ul>
    </div>
    <div class="bars__days" aria-hidden="true">
      <span v-for="day in days" :key="day.date" class="bars__day">{{
        f.dayOnly(day.date)
      }}</span>
    </div>
  </div>
</template>

<style scoped>
.bars__plot {
  position: relative;
  height: 140px;
  padding-top: 20px;
}

.bars__list {
  display: flex;
  gap: 4px;
  height: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.bars__item {
  position: relative;
  display: flex;
  flex: 1 1 0;
  align-items: flex-end;
  justify-content: center;
  min-width: 0;
}

.bars__bar {
  width: 100%;
  max-width: 28px;
  min-height: 3px;
  border-radius: 4px 4px 0 0;
  background: rgb(var(--v-theme-primary));
  opacity: 0.55;
}

.bars__bar--reached {
  background: rgb(var(--v-theme-success));
  opacity: 1;
}

.bars__check {
  position: absolute;
  top: -18px;
  color: rgb(var(--v-theme-success));
}

.bars__days {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.bars__day {
  flex: 1 1 0;
  min-width: 0;
  font-size: 0.75rem;
  text-align: center;
  color: rgb(var(--v-theme-on-surface));
  opacity: var(--v-medium-emphasis-opacity);
}

/* the same box as the columns: the top 20px of the plot hold the check marks */
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
  border-top: 1px dashed rgb(var(--v-theme-on-surface));
}

.bars__goal-label {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 0 4px;
  font-size: 0.75rem;
  background: rgb(var(--v-theme-surface));
}

.bars__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
