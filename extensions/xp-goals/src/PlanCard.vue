<script setup lang="ts">
import { useApp } from '@dolphy-app/extension-sdk/client';
import { computed } from 'vue';
import { dayLabel } from './dayLabel.ts';
import LeagueBadge from './LeagueBadge.vue';
import { useGamification } from './useGamification.ts';
import XpRing from './XpRing.vue';
import { weekDays } from './core/week.ts';

const app = useApp();
const { status, error, format: f, load } = useGamification();

const percent = computed(() => {
  const today = status.value?.today;
  if (today === undefined || today.goal <= 0) return 0;
  return Math.min(100, Math.round((today.xp / today.goal) * 100));
});

const days = computed(() =>
  status.value === null ? [] : weekDays(status.value),
);

const openPanel = () => app.openPanel('xp-goals', 'xp-goals.main');
</script>

<template>
  <v-card
    v-if="status !== null && status.enabled"
    class="plan-card"
    data-testid="xp-plan-card"
  >
    <div class="plan-card__head">
      <h2 class="plan-card__title">{{ f.t('title') }}</h2>
      <v-btn
        class="plan-card__open"
        variant="text"
        color="primary"
        append-icon="mdi-chevron-right"
        data-testid="xp-plan-open"
        @click="openPanel"
      >
        {{ f.t('details') }}
      </v-btn>
    </div>

    <div class="plan-card__body">
      <XpRing
        :xp="status.today.xp"
        :goal="status.today.goal"
        :label="
          f.t('ringLabel', { xp: status.today.xp, goal: status.today.goal })
        "
        :size="72"
        :width="8"
      >
        <v-icon
          v-if="status.today.reached"
          icon="mdi-check-bold"
          size="28"
          color="success"
        />
        <span v-else class="plan-card__percent">{{ percent }}%</span>
      </XpRing>

      <div class="plan-card__text">
        <p class="plan-card__today" data-testid="xp-plan-today">
          {{
            f.t('ringLabel', { xp: status.today.xp, goal: status.today.goal })
          }}
        </p>
        <p
          class="plan-card__sub"
          :class="{ 'plan-card__sub--done': status.today.reached }"
        >
          <template v-if="status.today.reached">
            <v-icon icon="mdi-check-circle" size="16" />
            {{ f.t('goalReached') }}
          </template>
          <template v-else>{{
            f.t('goalLeft', {
              n: Math.max(0, status.today.goal - status.today.xp),
            })
          }}</template>
        </p>
        <div class="plan-card__chips">
          <v-chip
            v-if="status.leaguesEnabled"
            size="small"
            data-testid="xp-plan-league"
          >
            <LeagueBadge
              class="plan-card__badge"
              :tier="status.league.tier"
              :size="20"
            />
            {{ f.tier(status.league.tier) }}
          </v-chip>
          <v-chip
            size="small"
            :prepend-icon="
              status.streak.current > 0 ? 'mdi-fire' : 'mdi-fire-off'
            "
            data-testid="xp-plan-streak"
          >
            {{ f.tn('streakDays', status.streak.current) }}
          </v-chip>
        </div>
      </div>
      <ol class="plan-card__week" :aria-label="f.t('thisWeek')">
        <li
          v-for="day in days"
          :key="day.date"
          class="plan-card__day"
          :class="{ 'plan-card__day--today': day.isToday }"
          :title="dayLabel(f, day)"
        >
          <span aria-hidden="true">{{ f.weekdayShort(day.date) }}</span>
          <span
            class="plan-card__dot"
            :class="`plan-card__dot--${day.state}`"
            aria-hidden="true"
          >
            <v-icon
              v-if="day.state === 'reached'"
              icon="mdi-check-bold"
              size="16"
            />
          </span>
          <span class="sr">{{ dayLabel(f, day) }}</span>
        </li>
      </ol>
    </div>
  </v-card>

  <v-card
    v-else-if="status === null && error !== null"
    class="plan-card"
    data-testid="xp-plan-error"
  >
    <div class="plan-card__body">
      <v-icon icon="mdi-alert-circle-outline" color="error" />
      <span class="plan-card__text">{{ f.t('loadFailed') }}</span>
      <v-btn variant="text" @click="load">{{ f.t('refresh') }}</v-btn>
    </div>
  </v-card>
</template>

<style scoped>
/* the anchor of the page already keeps the distance to the blocks above */
.plan-card {
  padding: 24px;
}

.plan-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.plan-card__title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1.3;
}

.plan-card__open {
  margin-right: -8px;
}

.plan-card__body {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px 24px;
}

.plan-card__text {
  display: flex;
  flex: 1 1 200px;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.plan-card__today {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 500;
}

.plan-card__sub {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.plan-card__sub--done {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.plan-card__sub--done .v-icon {
  color: rgb(var(--v-theme-success));
}

.plan-card__week {
  display: flex;
  gap: 8px;
  margin: 0 0 0 auto;
  padding: 0;
  list-style: none;
}

.plan-card__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 28px;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.plan-card__day--today {
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.plan-card__dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 2px solid transparent;
  border-radius: 50%;
  box-sizing: border-box;
}

.plan-card__dot--reached {
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--v-theme-primary));
}

.plan-card__dot--today {
  border-color: rgb(var(--v-theme-primary));
}

.plan-card__dot--missed {
  background: rgba(var(--v-theme-on-surface), 0.12);
}

.plan-card__dot--upcoming {
  border-color: rgba(var(--v-theme-on-surface), 0.24);
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.plan-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.plan-card__badge {
  margin-right: 8px;
  margin-left: -6px;
}

.plan-card__percent {
  font-size: 0.875rem;
  font-weight: 700;
}
</style>
