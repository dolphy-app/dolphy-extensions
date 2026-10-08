<script setup lang="ts">
import { useApp } from '@dolphy-app/extension-sdk/client';
import { computed } from 'vue';
import DayBars from './DayBars.vue';
import NoticeBox from './NoticeBox.vue';
import TodayCard from './TodayCard.vue';
import type { XpEntry } from './shared/types.ts';
import { useGamification } from './useGamification.ts';

const app = useApp();
const { status, error, loading, format: f, load } = useGamification();

const historyEmpty = computed(
  () => status.value?.history.every((day) => day.xp === 0) ?? true,
);
const reachedDays = computed(
  () => status.value?.history.filter((day) => day.reached).length ?? 0,
);

const entryText = (entry: XpEntry) => {
  if (entry.kind === 'perfect-bonus')
    return f.value.t('entryBonus', { xp: entry.xp });
  return entry.grade === null
    ? f.value.t('entryAttempt', { xp: entry.xp })
    : f.value.t('entryGrade', { xp: entry.xp, grade: entry.grade });
};

// entries of today show the time, older ones the date and the time
const entryTime = (entry: XpEntry) =>
  status.value !== null &&
  new Date(entry.at).toDateString() ===
    new Date(`${status.value.today.date}T00:00`).toDateString()
    ? f.value.time(entry.at)
    : f.value.dateTime(entry.at);

const openSettings = () => app.openSettings('xp-goals');
</script>

<template>
  <section class="xp" data-testid="xp-panel">
    <div class="xp__inner">
      <header class="xp__header">
        <div class="xp__heading">
          <h1
            class="xp__title text-headline-large font-weight-bold"
            data-testid="xp-title"
          >
            {{ f.t('title') }}
          </h1>
          <p class="xp__date text-body-large">
            {{ status === null ? '' : f.dayLong(status.today.date) }}
          </p>
        </div>
        <v-btn
          class="xp__refresh"
          icon="mdi-refresh"
          variant="text"
          :aria-label="f.t('refresh')"
          :aria-busy="loading"
          data-testid="xp-refresh"
          @click="load"
        />
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
        <div class="xp__note">
          <span>{{ f.t('loadFailed') }} {{ error }}</span>
          <v-btn
            variant="text"
            size="small"
            data-testid="xp-retry"
            @click="load"
            >{{ f.t('retry') }}</v-btn
          >
        </div>
      </NoticeBox>

      <div
        v-if="status === null && loading"
        class="xp__skeleton"
        role="status"
        :aria-label="f.t('loading')"
        data-testid="xp-loading"
      >
        <div class="xp__skeleton-block xp__skeleton-block--today" />
        <div class="xp__skeleton-block xp__skeleton-block--stats" />
        <div class="xp__skeleton-block xp__skeleton-block--history" />
      </div>

      <template v-if="status !== null">
        <NoticeBox
          v-if="!status.enabled"
          tone="info"
          icon="mdi-information-outline"
          data-testid="xp-disabled"
        >
          <div class="xp__note">
            <span>{{ f.t('disabled') }}</span>
            <v-btn variant="text" size="small" @click="openSettings">{{
              f.t('openSettings')
            }}</v-btn>
          </div>
        </NoticeBox>

        <TodayCard :status="status" :f="f" />

        <v-card class="xp__section" data-testid="xp-stats">
          <dl class="stats">
            <div class="stats__cell">
              <dt>{{ f.t('streak') }}</dt>
              <dd data-testid="xp-streak">
                {{ f.tn('streakDays', status.streak.current) }}
              </dd>
            </div>
            <div class="stats__cell">
              <dt>{{ f.t('thisWeek') }}</dt>
              <dd data-testid="xp-week-xp">
                {{ f.t('xpAmount', { n: f.number(status.week.xp) }) }}
              </dd>
            </div>
            <div class="stats__cell">
              <dt>{{ f.t('total') }}</dt>
              <dd data-testid="xp-total">
                {{ f.t('xpAmount', { n: f.number(status.totalXp) }) }}
              </dd>
            </div>
          </dl>
        </v-card>

        <v-card class="xp__section" data-testid="xp-history">
          <div class="xp__head">
            <h2 class="xp__h2">{{ f.t('history') }}</h2>
            <span v-if="reachedDays > 0" class="xp__muted">{{
              f.t('historyReachedCount', { n: reachedDays })
            }}</span>
          </div>
          <p
            v-if="historyEmpty"
            class="xp__muted xp__empty"
            data-testid="xp-history-empty"
          >
            {{ f.t('historyEmpty') }}
          </p>
          <DayBars
            v-else
            :days="status.history"
            :goal="status.today.goal"
            :f="f"
          />
        </v-card>

        <v-card
          v-if="status.recent.length > 0"
          class="xp__section"
          data-testid="xp-recent"
        >
          <h2 class="xp__h2">{{ f.t('recent') }}</h2>
          <ul class="xp__list">
            <li
              v-for="entry in status.recent"
              :key="`${entry.at}-${entry.kind}`"
              class="xp__item"
              data-testid="xp-entry"
            >
              <span class="xp__item-main">{{ entryText(entry) }}</span>
              <time
                class="xp__muted"
                :datetime="new Date(entry.at).toISOString()"
                >{{ entryTime(entry) }}</time
              >
            </li>
          </ul>
        </v-card>
      </template>
    </div>
  </section>
</template>

<style scoped>
.xp {
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
  max-width: 704px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.xp__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.xp__heading {
  min-width: 0;
}

.xp__title {
  margin: 0;
}

/* reserves its line while the status loads: the page must not jump */
.xp__date {
  min-height: 1.5rem;
  margin: 4px 0 0;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.xp__date::first-letter {
  text-transform: uppercase;
}

.xp__refresh {
  flex: none;
  margin-top: 4px;
}

/* out of the flow: the bar appearing must not move the page */
.xp__loadbar {
  position: absolute;
  top: 0;
  right: 24px;
  left: 24px;
}

.xp__note {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
}

.xp__skeleton {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.xp__skeleton-block {
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  animation: xp-pulse 1.4s ease-in-out infinite;
}

.xp__skeleton-block--today {
  height: 268px;
}

.xp__skeleton-block--stats {
  height: 106px;
}

.xp__skeleton-block--history {
  height: 230px;
}

@keyframes xp-pulse {
  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .xp__skeleton-block {
    animation: none;
  }
}

.xp__section {
  padding: 24px;
}

.xp__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0 16px;
  margin-bottom: 16px;
}

.xp__h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
}

.xp__section > .xp__h2 {
  margin-bottom: 8px;
}

.xp__muted {
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.xp__empty {
  margin: 0;
  font-size: 1rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
}

.stats__cell {
  display: flex;
  flex-direction: column-reverse;
  gap: 4px;
  min-width: 0;
  padding: 0 24px;
}

.stats__cell:first-child {
  padding-left: 0;
}

.stats__cell:last-child {
  padding-right: 0;
}

.stats__cell + .stats__cell {
  border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.stats__cell dt {
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.stats__cell dd {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.33;
  font-variant-numeric: tabular-nums;
}

.xp__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.xp__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 40px;
}

.xp__item + .xp__item {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.xp__item-main {
  min-width: 0;
}

.xp__item time {
  flex: none;
  font-variant-numeric: tabular-nums;
}
</style>
