<script setup lang="ts">
import { useApp } from '@dolphy-app/extension-sdk/client';
import { computed } from 'vue';
import DayBars from './DayBars.vue';
import LeagueCard from './LeagueCard.vue';
import NoticeBox from './NoticeBox.vue';
import TodayHero from './TodayHero.vue';
import { useGamification } from './useGamification.ts';

const app = useApp();
const { status, error, loading, format: f, load } = useGamification();

const historyEmpty = computed(
  () => status.value?.history.every((day) => day.xp === 0) ?? true,
);
const reachedDays = computed(
  () => status.value?.history.filter((day) => day.reached).length ?? 0,
);

const RESULT_ICONS = {
  promoted: 'mdi-arrow-up-bold-circle',
  demoted: 'mdi-arrow-down-bold-circle',
  kept: 'mdi-minus-circle',
} as const;
const RESULT_COLORS = {
  promoted: 'success',
  demoted: 'warning',
  kept: 'on-surface',
} as const;

const entryText = (entry: {
  kind: 'attempt' | 'perfect-bonus';
  xp: number;
  grade: number | null;
}) => {
  if (entry.kind === 'perfect-bonus')
    return f.value.t('entryBonus', { xp: entry.xp });
  return entry.grade === null
    ? f.value.t('entryAttempt', { xp: entry.xp })
    : f.value.t('entryGrade', { xp: entry.xp, grade: entry.grade });
};

const openSettings = () => app.openSettings('xp-goals');

// opens today's plan with the app's own navigation command
const toPlan = async () => {
  try {
    await app.runCommand('app:go:dailyPlan');
  } catch {
    app.notify(f.value.t('commandFailed'), 'error');
  }
};
</script>

<template>
  <section class="xp" data-testid="xp-panel">
    <div class="xp__inner">
      <header class="xp__header">
        <h1 class="xp__title" data-testid="xp-title">{{ f.t('title') }}</h1>
        <div class="xp__meta">
          <p v-if="status !== null" class="xp__date">
            {{ f.dayLong(status.today.date) }}
          </p>
          <v-btn
            class="xp__refresh"
            variant="tonal"
            prepend-icon="mdi-refresh"
            :aria-busy="loading"
            data-testid="xp-refresh"
            @click="load"
          >
            {{ f.t('refresh') }}
          </v-btn>
        </div>
      </header>

      <div class="xp__loadbar">
        <v-progress-linear
          v-if="loading && status !== null"
          indeterminate
          :aria-label="f.t('loading')"
        />
      </div>

      <NoticeBox
        v-if="error !== null"
        tone="error"
        icon="mdi-alert-circle-outline"
        role="alert"
        data-testid="xp-error"
      >
        {{ f.t('loadFailed') }} {{ error }}
      </NoticeBox>

      <div
        v-if="status === null && loading"
        class="xp__skeleton"
        role="status"
        :aria-label="f.t('loading')"
        data-testid="xp-loading"
      >
        <div class="xp__skeleton-hero" />
        <div class="xp__row xp__row--main">
          <div class="xp__skeleton-card" />
          <div class="xp__skeleton-card" />
        </div>
      </div>

      <template v-if="status !== null">
        <NoticeBox
          v-if="!status.enabled"
          tone="info"
          icon="mdi-information-outline"
          data-testid="xp-disabled"
        >
          <div class="xp__alert">
            <span>{{ f.t('disabled') }}</span>
            <v-btn variant="outlined" @click="openSettings">{{
              f.t('openSettings')
            }}</v-btn>
          </div>
        </NoticeBox>

        <TodayHero :status="status" :f="f" />

        <div class="xp__row xp__row--main">
          <LeagueCard :status="status" :f="f" />

          <v-card class="xp-card xp__totals" data-testid="xp-totals">
            <h2 class="xp-card__title">{{ f.t('totals') }}</h2>
            <div class="xp__stats">
              <div class="xp__stat">
                <span class="xp__stat-icon" aria-hidden="true">
                  <v-icon icon="mdi-star-four-points" size="24" />
                </span>
                <div>
                  <div class="xp__stat-value" data-testid="xp-total">
                    {{ f.number(status.totalXp) }} XP
                  </div>
                  <div class="xp__muted">{{ f.t('totalXp') }}</div>
                </div>
              </div>
              <div class="xp__stat">
                <span class="xp__stat-icon" aria-hidden="true">
                  <v-icon icon="mdi-check-decagram" size="24" />
                </span>
                <div>
                  <div class="xp__stat-value xp__stat-value--small">
                    {{ f.tn('perfectSessions', status.perfectSessions) }}
                  </div>
                </div>
              </div>
            </div>
          </v-card>
        </div>

        <v-card
          v-if="!historyEmpty"
          class="xp-card xp__history"
          data-testid="xp-history"
        >
          <div class="xp__card-head">
            <h2 class="xp-card__title">{{ f.t('history') }}</h2>
            <span class="xp__muted">{{
              f.t('historyReachedCount', { n: reachedDays })
            }}</span>
          </div>
          <DayBars :days="status.history" :goal="status.today.goal" :f="f" />
        </v-card>

        <v-card
          v-else
          class="xp-card xp__history xp__history--empty"
          data-testid="xp-history-empty"
        >
          <v-icon icon="mdi-chart-box-outline" size="40" />
          <h2 class="xp-card__title">{{ f.t('historyEmptyTitle') }}</h2>
          <p class="xp__muted">{{ f.t('historyEmptyText') }}</p>
          <v-btn variant="tonal" color="primary" @click="toPlan">{{
            f.t('toPlan')
          }}</v-btn>
        </v-card>

        <div
          v-if="status.weeks.length > 0 || status.recent.length > 0"
          class="xp__row xp__row--lists"
        >
          <v-card
            v-if="status.weeks.length > 0"
            class="xp-card"
            data-testid="xp-weeks"
          >
            <h2 class="xp-card__title">{{ f.t('weeks') }}</h2>
            <ul class="xp__list">
              <li
                v-for="week in status.weeks"
                :key="week.start"
                class="xp__item"
                data-testid="xp-week"
              >
                <div class="xp__item-main">
                  <span>{{
                    f.t('weekOf', { date: f.dayMonth(week.start) })
                  }}</span>
                  <span class="xp__muted">{{ f.tier(week.tier) }}</span>
                </div>
                <div class="xp__item-side">
                  <span class="xp__item-xp">{{ f.number(week.xp) }} XP</span>
                  <span class="xp__result">
                    <v-icon
                      :icon="RESULT_ICONS[week.result]"
                      :color="RESULT_COLORS[week.result]"
                      size="18"
                    />
                    {{ f.t(week.result) }}
                  </span>
                </div>
              </li>
            </ul>
          </v-card>

          <v-card
            v-if="status.recent.length > 0"
            class="xp-card"
            data-testid="xp-recent"
          >
            <h2 class="xp-card__title">{{ f.t('recent') }}</h2>
            <ul class="xp__list">
              <li
                v-for="entry in status.recent"
                :key="`${entry.at}-${entry.kind}`"
                class="xp__item"
                data-testid="xp-entry"
              >
                <v-icon
                  :icon="
                    entry.kind === 'perfect-bonus'
                      ? 'mdi-star-circle'
                      : 'mdi-plus-circle-outline'
                  "
                  size="20"
                />
                <span class="xp__item-main">{{ entryText(entry) }}</span>
                <time
                  class="xp__muted"
                  :datetime="new Date(entry.at).toISOString()"
                  >{{ f.dateTime(entry.at) }}</time
                >
              </li>
            </ul>
          </v-card>
        </div>
      </template>
    </div>
  </section>
</template>

<style>
/*
 * The card surface of the panel. In the dark theme the plain surface sits too
 * close to the page background, so the card is lifted by a share of the text
 * colour: a tonal surface made of theme tokens only.
 */
.xp-card {
  --xp-card-bg: rgb(var(--v-theme-surface));
  border-radius: 16px;
  background: var(--xp-card-bg);
}

.v-theme--dark .xp-card {
  --xp-card-bg: color-mix(
    in srgb,
    rgb(var(--v-theme-surface)),
    rgb(var(--v-theme-on-surface)) 6%
  );
}

.xp-card__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
}
</style>

<style scoped>
.xp {
  container-type: inline-size;
  width: 100%;
  min-height: 100%;
  overflow-y: auto;
}

.xp__inner {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 32px 48px;
}

.xp__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
}

.xp__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 2rem;
}

.xp__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.xp__date {
  margin: 0;
  font-size: 1rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.xp__date::first-letter {
  text-transform: uppercase;
}

/* out of the flow: the bar appearing must not move the page */
.xp__loadbar {
  position: absolute;
  top: 0;
  right: 32px;
  left: 32px;
}

.xp__alert {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.xp__skeleton {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.xp__skeleton-hero,
.xp__skeleton-card {
  background: rgba(var(--v-theme-on-surface), 0.08);
  animation: xp-pulse 1.4s ease-in-out infinite;
}

.xp__skeleton-hero {
  height: 340px;
  border-radius: 24px;
}

.xp__skeleton-card {
  height: 300px;
  border-radius: 16px;
}

@keyframes xp-pulse {
  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .xp__skeleton-hero,
  .xp__skeleton-card {
    animation: none;
  }
}

.xp__row {
  display: grid;
  gap: 24px;
}

.xp__row--main {
  grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
}

.xp__row--lists {
  align-items: start;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
}

.xp__totals,
.xp__history {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
}

.xp__stats {
  display: grid;
  flex: 1;
  grid-auto-rows: 1fr;
  gap: 24px;
}

.xp__card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
}

.xp__history--empty {
  align-items: center;
  padding: 40px 24px;
  text-align: center;
}

.xp__history--empty .v-icon {
  color: rgb(var(--v-theme-primary));
}

.xp__stat {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* two equal rows with a divider: the card is as tall as the league next to it */
.xp__stat + .xp__stat {
  align-self: stretch;
  padding-top: 24px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.xp__stat-icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
}

.xp__stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.xp__stat-value--small {
  font-size: 1rem;
  font-weight: 500;
}

.xp__muted {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.xp-card:has(> .xp__list) {
  padding: 24px 24px 12px;
}

.xp__list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.xp__item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 8px 0;
}

.xp__item + .xp__item {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.xp__item-main {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}

.xp__item-side {
  display: flex;
  align-items: center;
  gap: 16px;
}

.xp__item-xp {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.xp__result {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 150px;
  font-size: 0.875rem;
}

@container (max-width: 760px) {
  .xp__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 20px 40px;
  }

  .xp__stat + .xp__stat {
    padding-top: 0;
    border-top: 0;
  }

  .xp__inner {
    padding: 16px 16px 32px;
  }

  .xp__row--main {
    grid-template-columns: minmax(0, 1fr);
  }

  .xp__result {
    min-width: 0;
  }
}
</style>
