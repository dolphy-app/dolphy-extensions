<script setup lang="ts">
import { useApp } from '@dolphy-app/extension-sdk/client';
import { computed } from 'vue';
import DayBars from './DayBars.vue';
import { LEAGUE_TIERS } from './shared/types.ts';
import { useGamification } from './useGamification.ts';

const app = useApp();
const { status, error, loading, format: f, load } = useGamification();

const percent = computed(() => {
  const today = status.value?.today;
  if (today === undefined || today.goal <= 0) return 0;
  return Math.min(100, Math.round((today.xp / today.goal) * 100));
});

const isEmpty = computed(
  () =>
    status.value !== null &&
    status.value.totalXp === 0 &&
    status.value.recent.length === 0,
);

const weekPercent = computed(() => {
  const week = status.value?.week;
  if (week === undefined || week.promoteAt <= 0) return 0;
  return Math.min(100, Math.round((week.xp / week.promoteAt) * 100));
});

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
</script>

<template>
  <section class="xp" data-testid="xp-panel">
    <header class="xp__header">
      <v-btn
        variant="tonal"
        prepend-icon="mdi-refresh"
        :aria-busy="loading"
        data-testid="xp-refresh"
        @click="load"
      >
        {{ f.t('refresh') }}
      </v-btn>
    </header>

    <div class="xp__loadbar">
      <v-progress-linear
        v-if="loading"
        indeterminate
        :aria-label="f.t('loading')"
      />
    </div>

    <v-alert
      v-if="error !== null"
      class="xp__notice"
      type="error"
      variant="tonal"
      data-testid="xp-error"
    >
      {{ f.t('loadFailed') }} {{ error }}
    </v-alert>

    <template v-if="status !== null">
      <v-alert
        v-if="!status.enabled"
        class="xp__notice"
        type="info"
        variant="tonal"
        data-testid="xp-disabled"
      >
        <div class="xp__alert">
          <span>{{ f.t('disabled') }}</span>
          <v-btn variant="outlined" color="on-surface" @click="openSettings">{{
            f.t('openSettings')
          }}</v-btn>
        </div>
      </v-alert>

      <v-alert
        v-else-if="isEmpty"
        class="xp__notice"
        type="info"
        variant="tonal"
        icon="mdi-rocket-launch-outline"
        data-testid="xp-empty"
      >
        {{ f.t('empty') }}
      </v-alert>

      <div class="xp__grid">
        <v-card class="xp__card xp__today" data-testid="xp-today">
          <v-card-title class="xp__title">{{ f.t('xpToday') }}</v-card-title>
          <div class="xp__ring-wrap">
            <v-progress-circular
              :model-value="percent"
              :size="168"
              :width="14"
              :color="status.today.reached ? 'success' : 'primary'"
              :aria-label="
                f.t('ringLabel', {
                  xp: status.today.xp,
                  goal: status.today.goal,
                })
              "
            >
              <div class="xp__ring-text">
                <span class="xp__ring-xp" data-testid="xp-today-xp">{{
                  f.number(status.today.xp)
                }}</span>
                <span class="xp__ring-goal"
                  >/ {{ f.number(status.today.goal) }} XP</span
                >
              </div>
            </v-progress-circular>
          </div>
          <div
            v-if="status.today.reached"
            class="xp__reached"
            data-testid="xp-goal-reached"
          >
            <v-icon icon="mdi-check-circle" />
            {{ f.t('goalReached') }}
          </div>
          <div v-else class="xp__muted">
            {{
              f.t('goalLeft', {
                n: Math.max(0, status.today.goal - status.today.xp),
              })
            }}
          </div>
        </v-card>

        <v-card class="xp__card" data-testid="xp-league">
          <v-card-title class="xp__title">{{ f.t('league') }}</v-card-title>
          <div v-if="!status.leaguesEnabled" class="xp__body xp__muted">
            <v-icon icon="mdi-trophy-broken" />
            {{ f.t('leaguesOff') }}
          </div>
          <div v-else class="xp__body">
            <div class="xp__league-name">
              <v-icon icon="mdi-trophy" size="32" />
              <div>
                <div class="xp__league-tier" data-testid="xp-league-name">
                  {{ f.tier(status.league.tier) }}
                </div>
                <div class="xp__muted">
                  {{
                    f.t('leagueOf', {
                      n: status.league.index + 1,
                      total: LEAGUE_TIERS.length,
                    })
                  }}
                </div>
              </div>
            </div>
            <div class="xp__week-head">
              <span>{{ f.t('weekProgress') }}</span>
              <span data-testid="xp-week-xp"
                >{{ f.number(status.week.xp) }} /
                {{ f.number(status.week.promoteAt) }}</span
              >
            </div>
            <v-progress-linear
              :model-value="weekPercent"
              :height="12"
              rounded
              :color="status.league.atRisk ? 'warning' : 'primary'"
              :aria-label="f.t('weekProgress')"
            />
            <div class="xp__muted" data-testid="xp-promote">
              <template v-if="status.league.next === null">{{
                f.t('topLeague')
              }}</template>
              <template v-else-if="status.league.toPromote === 0">{{
                f.t('promoteReady')
              }}</template>
              <template v-else>{{
                f.t('toPromote', {
                  n: status.league.toPromote,
                  tier: f.tier(status.league.next),
                })
              }}</template>
            </div>
            <v-alert
              v-if="status.league.atRisk && status.league.previous !== null"
              class="xp__notice"
              type="warning"
              variant="tonal"
              density="compact"
              data-testid="xp-at-risk"
            >
              {{
                f.t('atRisk', {
                  n: Math.max(0, status.week.keepAt - status.week.xp),
                  tier: f.tier(status.league.tier),
                })
              }}
            </v-alert>
            <div class="xp__muted">
              <v-icon icon="mdi-calendar-week" size="16" />
              {{ f.tn('daysLeft', status.week.daysLeft) }}
            </div>
          </div>
        </v-card>

        <v-card class="xp__card xp__streak" data-testid="xp-totals">
          <v-card-title class="xp__title">{{
            f.t('streakAndTotal')
          }}</v-card-title>
          <div class="xp__body">
            <div class="xp__stat">
              <v-icon icon="mdi-fire" size="32" />
              <div>
                <div class="xp__stat-value" data-testid="xp-streak">
                  {{ f.tn('streakDays', status.streak.current) }}
                </div>
                <div class="xp__muted">
                  {{
                    f.t('bestStreak', {
                      n: f.tn('streakDays', status.streak.longest),
                    })
                  }}
                </div>
              </div>
            </div>
            <div class="xp__stat">
              <v-icon icon="mdi-star-four-points" size="32" />
              <div>
                <div class="xp__stat-value" data-testid="xp-total">
                  {{ f.number(status.totalXp) }} XP
                </div>
                <div class="xp__muted">
                  {{ f.tn('perfectSessions', status.perfectSessions) }}
                </div>
              </div>
            </div>
          </div>
        </v-card>

        <v-card class="xp__card xp__wide" data-testid="xp-history">
          <v-card-title class="xp__title">{{ f.t('history') }}</v-card-title>
          <div class="xp__body">
            <DayBars :days="status.history" :goal="status.today.goal" :f="f" />
          </div>
        </v-card>

        <v-card class="xp__card xp__weeks" data-testid="xp-weeks">
          <v-card-title class="xp__title">{{ f.t('weeks') }}</v-card-title>
          <p v-if="status.weeks.length === 0" class="xp__body xp__muted">
            {{ f.t('weeksEmpty') }}
          </p>
          <ul v-else class="xp__list">
            <li
              v-for="week in status.weeks"
              :key="week.start"
              class="xp__row"
              data-testid="xp-week"
            >
              <div class="xp__row-main">
                <span>{{
                  f.t('weekOf', { date: f.dayMonth(week.start) })
                }}</span>
                <span class="xp__muted">{{ f.tier(week.tier) }}</span>
              </div>
              <div class="xp__row-side">
                <span class="xp__row-xp">{{ f.number(week.xp) }} XP</span>
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

        <v-card class="xp__card" data-testid="xp-recent">
          <v-card-title class="xp__title">{{ f.t('recent') }}</v-card-title>
          <p v-if="status.recent.length === 0" class="xp__body xp__muted">
            {{ f.t('recentEmpty') }}
          </p>
          <ul v-else class="xp__list">
            <li
              v-for="entry in status.recent"
              :key="`${entry.at}-${entry.kind}`"
              class="xp__row"
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
              <span class="xp__row-main">{{ entryText(entry) }}</span>
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
  </section>
</template>

<style scoped>
.xp {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1100px;
  padding: 16px;
}

.xp__header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.xp__alert {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.xp__loadbar {
  height: 4px;
}

.xp__notice :deep(.v-alert__content) {
  color: rgb(var(--v-theme-on-surface));
}

/* one column; two from 640px (the streak card spans both); three from 960px */
.xp__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.xp__wide {
  grid-column: 1 / -1;
}

@container (min-width: 640px) {
  .xp__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .xp__streak {
    grid-column: 1 / -1;
  }

  .xp__streak .xp__body {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px 48px;
  }
}

@container (min-width: 960px) {
  .xp__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .xp__streak {
    grid-column: auto;
  }

  .xp__streak .xp__body {
    flex-direction: column;
  }
}

.xp__card {
  padding-bottom: 8px;
}

.xp__title {
  font-size: 1rem;
  font-weight: 500;
}

.xp__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 12px;
}

.xp__muted {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
  opacity: var(--v-medium-emphasis-opacity);
}

.xp__today {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.xp__today .xp__title {
  align-self: flex-start;
}

.xp__ring-wrap {
  padding: 8px 0 12px;
}

.xp__ring-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}

.xp__ring-xp {
  font-size: 2.5rem;
  font-weight: 700;
}

.xp__ring-goal {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
  opacity: var(--v-medium-emphasis-opacity);
}

.xp__reached {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.xp__reached .v-icon {
  color: rgb(var(--v-theme-success));
}

.xp__league-name,
.xp__stat {
  display: flex;
  align-items: center;
  gap: 12px;
}

.xp__league-tier,
.xp__stat-value {
  font-size: 1.25rem;
  font-weight: 500;
}

.xp__week-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.xp__list {
  margin: 0;
  padding: 0 16px;
  list-style: none;
}

.xp__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgb(var(--v-theme-on-surface), 0.12);
}

.xp__row:last-child {
  border-bottom: 0;
}

.xp__row-main {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}

.xp__row time {
  flex: 0 0 auto;
  white-space: nowrap;
}

.xp__row-side {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.xp__row-xp {
  font-weight: 500;
  white-space: nowrap;
}

.xp__result {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  white-space: nowrap;
}
</style>
