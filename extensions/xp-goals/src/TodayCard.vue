<script setup lang="ts">
import { useApp } from '@dolphy-app/extension-sdk/client';
import { computed } from 'vue';
import { dayLabel } from './dayLabel.ts';
import type { Format } from './i18n.ts';
import type { GamificationStatus } from './shared/types.ts';
import XpRing from './XpRing.vue';

const props = defineProps<{ status: GamificationStatus; f: Format }>();

const app = useApp();

const today = computed(() => props.status.today);
const ringLabel = computed(() =>
  props.f.t('ringLabel', { xp: today.value.xp, goal: today.value.goal }),
);
const percent = computed(() =>
  Math.min(100, Math.round((today.value.xp / today.value.goal) * 100)),
);
const left = computed(() => Math.max(0, today.value.goal - today.value.xp));

// opens today's plan with the app's own navigation command
const start = async () => {
  try {
    await app.runCommand('app:go:dailyPlan');
  } catch {
    app.notify(props.f.t('commandFailed'), 'error');
  }
};
</script>

<template>
  <v-card class="today" data-testid="xp-hero">
    <section class="today__top" aria-labelledby="xp-today-title">
      <div class="today__ring" data-testid="xp-today">
        <XpRing :xp="today.xp" :goal="today.goal" :label="ringLabel">
          <v-icon
            v-if="today.reached"
            class="today__check"
            icon="mdi-check-bold"
            size="40"
          />
          <span v-else class="today__percent">{{ percent }}%</span>
        </XpRing>
      </div>

      <div class="today__text">
        <h2 id="xp-today-title" class="today__label">{{ f.t('today') }}</h2>
        <p class="today__figure">
          <span class="today__xp" data-testid="xp-today-xp">{{
            f.number(today.xp)
          }}</span>
          <span class="today__of">{{
            f.t('ofGoal', { goal: today.goal })
          }}</span>
        </p>
        <p v-if="today.reached" class="today__line today__line--done">
          <v-icon icon="mdi-check-circle" size="20" />
          <span data-testid="xp-goal-reached">{{ f.t('goalReached') }}</span>
        </p>
        <p v-else class="today__line" data-testid="xp-goal-left">
          {{ f.t('goalLeft', { n: left }) }}
        </p>
      </div>

      <v-btn
        class="today__start"
        variant="tonal"
        color="primary"
        append-icon="mdi-arrow-right"
        data-testid="xp-start"
        @click="start"
      >
        {{ f.t('startPractice') }}
      </v-btn>
    </section>

    <ol class="week" :aria-label="f.t('thisWeek')" data-testid="xp-week-strip">
      <li
        v-for="day in status.week.days"
        :key="day.date"
        class="week__day"
        :class="{ 'week__day--today': day.today }"
        :title="dayLabel(f, day)"
        data-testid="xp-week-day"
        :data-state="
          day.future
            ? 'upcoming'
            : day.reached
              ? 'reached'
              : day.today
                ? 'today'
                : 'missed'
        "
      >
        <span class="week__name" aria-hidden="true">{{
          f.weekdayShort(day.date)
        }}</span>
        <span
          class="week__dot"
          :class="{
            'week__dot--reached': day.reached && !day.future,
            'week__dot--today': day.today && !day.reached,
            'week__dot--missed': !day.future && !day.today && !day.reached,
          }"
          aria-hidden="true"
        >
          <v-icon
            v-if="day.reached && !day.future"
            icon="mdi-check-bold"
            size="16"
          />
        </span>
        <span class="sr">{{ dayLabel(f, day) }}</span>
      </li>
    </ol>
  </v-card>
</template>

<style scoped>
.today {
  padding: 24px;
}

.today__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 24px;
}

.today__text {
  display: flex;
  flex: 1 1 200px;
  flex-direction: column;
  min-width: 0;
}

.today__label {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.today__figure {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0 8px;
  margin: 0;
}

.today__xp {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.today__of {
  font-size: 1.25rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.today__line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.today__line--done {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.today__line--done .v-icon,
.today__check {
  color: rgb(var(--v-theme-success));
}

.today__percent {
  font-size: 1.25rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.today__start {
  flex: none;
}

.week {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  margin: 24px 0 0;
  padding: 24px 0 0;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  list-style: none;
}

.week__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.week__name {
  font-size: 0.75rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.week__day--today .week__name {
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.week__dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 2px solid rgba(var(--v-theme-on-surface), 0.45);
  border-radius: 50%;
  box-sizing: border-box;
}

.week__dot--reached {
  border-color: rgb(var(--v-theme-success));
  color: rgb(var(--v-theme-on-success));
  background: rgb(var(--v-theme-success));
}

/* a day gone by without the goal: the empty circle keeps a small mark */
.week__dot--missed::after {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(var(--v-theme-on-surface), 0.5);
  content: '';
}

.week__dot--today {
  border-color: rgb(var(--v-theme-primary));
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
