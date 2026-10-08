<script setup lang="ts">
import { useApp } from '@dolphy-app/extension-sdk/client';
import { computed } from 'vue';
import type { Format } from './i18n.ts';
import LeagueBadge from './LeagueBadge.vue';
import NoticeBox from './NoticeBox.vue';
import { LEAGUE_TIERS } from './shared/types.ts';
import type { GamificationStatus } from './shared/types.ts';

const props = defineProps<{ status: GamificationStatus; f: Format }>();

const app = useApp();

const league = computed(() => props.status.league);
const week = computed(() => props.status.week);

const percent = computed(() =>
  week.value.promoteAt <= 0
    ? 0
    : Math.min(100, Math.round((week.value.xp / week.value.promoteAt) * 100)),
);

// a league below the first one cannot be lost, the top one cannot be left
const keepMark = computed(() =>
  league.value.previous === null
    ? null
    : (week.value.keepAt / week.value.promoteAt) * 100,
);
const promoteMark = computed(() => league.value.next !== null);

const missingToKeep = computed(() =>
  Math.max(0, week.value.keepAt - week.value.xp),
);
const kept = computed(
  () => league.value.previous !== null && week.value.xp >= week.value.keepAt,
);

const stepState = (index: number) =>
  index < league.value.index
    ? 'done'
    : index === league.value.index
      ? 'current'
      : 'ahead';
const stepText = (tier: (typeof LEAGUE_TIERS)[number], index: number) =>
  `${props.f.tier(tier)}: ${props.f.t(
    {
      done: 'stepDone',
      current: 'stepCurrent',
      ahead: 'stepAhead',
    }[stepState(index)] as 'stepDone',
  )}`;

const openSettings = () => app.openSettings('xp-goals');
</script>

<template>
  <v-card
    v-if="status.leaguesEnabled"
    class="xp-card league xp-tier"
    :data-tier="league.tier"
    data-testid="xp-league"
  >
    <div class="league__head">
      <LeagueBadge :tier="league.tier" :size="64" />
      <div class="league__title">
        <h2 class="league__eyebrow">{{ f.t('league') }}</h2>
        <p class="league__name" data-testid="xp-league-name">
          {{ f.tier(league.tier) }}
        </p>
        <p class="muted">
          {{
            f.t('leagueOf', {
              n: league.index + 1,
              total: LEAGUE_TIERS.length,
            })
          }}
        </p>
      </div>
      <v-chip
        class="league__days"
        size="small"
        variant="tonal"
        prepend-icon="mdi-calendar-week"
        data-testid="xp-days-left"
      >
        {{ f.tn('daysLeft', week.daysLeft) }}
      </v-chip>
    </div>

    <ol class="ribbon" :aria-label="f.t('leagueSteps')">
      <li
        v-for="(tier, index) in LEAGUE_TIERS"
        :key="tier"
        class="ribbon__step xp-tier"
        :class="`ribbon__step--${stepState(index)}`"
        :data-tier="tier"
        :title="stepText(tier, index)"
        data-testid="xp-step"
      >
        <LeagueBadge
          class="ribbon__badge"
          :tier="tier"
          :size="stepState(index) === 'current' ? 40 : 28"
        />
        <span class="sr">{{ stepText(tier, index) }}</span>
      </li>
    </ol>

    <div class="week">
      <div class="week__head">
        <span class="muted">{{ f.t('weekProgress') }}</span>
        <span class="week__xp" data-testid="xp-week-xp"
          >{{ f.number(week.xp) }} / {{ f.number(week.promoteAt) }}</span
        >
      </div>
      <div class="week__track">
        <v-progress-linear
          :model-value="percent"
          :height="14"
          rounded
          :color="league.atRisk ? 'warning' : 'var(--xp-tier-ink)'"
          :aria-label="f.t('weekProgress')"
        />
        <span
          v-if="keepMark !== null"
          class="mark mark--keep"
          :style="{ left: `${keepMark}%` }"
          aria-hidden="true"
        />
      </div>
      <div class="marks">
        <span
          v-if="keepMark !== null"
          class="marks__label marks__label--keep"
          :class="{ 'marks__label--done': week.xp >= week.keepAt }"
          :style="{ left: `${keepMark}%` }"
          data-testid="xp-mark-keep"
        >
          <v-icon
            v-if="week.xp >= week.keepAt"
            icon="mdi-check-circle"
            size="14"
          />
          {{ f.t('keepMark', { n: week.keepAt }) }}
        </span>
        <span
          v-if="promoteMark"
          class="marks__label marks__label--promote"
          :class="{ 'marks__label--done': week.xp >= week.promoteAt }"
          data-testid="xp-mark-promote"
        >
          <v-icon
            v-if="week.xp >= week.promoteAt"
            icon="mdi-check-circle"
            size="14"
          />
          {{ f.t('promoteMark', { n: week.promoteAt }) }}
        </span>
      </div>
    </div>

    <div class="lines">
      <NoticeBox
        v-if="league.atRisk && league.previous !== null"
        tone="warning"
        icon="mdi-alert"
        data-testid="xp-at-risk"
      >
        {{
          f.t('atRisk', {
            n: missingToKeep,
            tier: f.tier(league.tier),
          })
        }}
      </NoticeBox>
      <p v-else-if="kept" class="line line--ok" data-testid="xp-kept">
        <v-icon icon="mdi-shield-check" size="20" />
        {{ f.t('keepSafe') }}
      </p>
      <p class="line" data-testid="xp-promote">
        <template v-if="league.next === null">{{ f.t('topLeague') }}</template>
        <template v-else-if="league.toPromote === 0">{{
          f.t('promoteReady')
        }}</template>
        <template v-else>{{
          f.t('toPromote', {
            n: league.toPromote,
            tier: f.tier(league.next),
          })
        }}</template>
      </p>
      <p
        v-if="status.weeks.length === 0"
        class="line muted"
        data-testid="xp-first-week"
      >
        <v-icon icon="mdi-information-outline" size="18" />
        {{ f.t('weeksFirstHint') }}
      </p>
    </div>
  </v-card>

  <v-card v-else class="xp-card league league--off" data-testid="xp-league">
    <v-icon class="league__off-icon" icon="mdi-trophy-broken" size="32" />
    <p class="league__off-text">{{ f.t('leaguesOff') }}</p>
    <v-btn variant="tonal" @click="openSettings">{{
      f.t('openSettings')
    }}</v-btn>
  </v-card>
</template>

<style scoped>
.league {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.league__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.league__title {
  display: flex;
  flex: 1 1 160px;
  flex-direction: column;
  min-width: 0;
}

.league__eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.league__name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
}

.muted {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.ribbon {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ribbon__step {
  position: relative;
  display: flex;
  flex: 1 1 0;
  align-items: center;
  justify-content: center;
  height: 44px;
}

/* the line to the next step: filled up to the current league */
.ribbon__step:not(:last-child)::after {
  position: absolute;
  top: 50%;
  left: calc(50% + 24px);
  width: calc(100% - 48px);
  height: 2px;
  border-radius: 1px;
  background: rgba(var(--v-theme-on-surface), 0.16);
  content: '';
}

.ribbon__step--done:not(:last-child)::after {
  background: var(--xp-tier-ink);
}

.ribbon__step--ahead .ribbon__badge {
  background: transparent;
  color: var(--xp-tier-ink);
  box-shadow: inset 0 0 0 2px rgba(var(--v-theme-on-surface), 0.28);
  opacity: 0.7;
}

.ribbon__step--current .ribbon__badge {
  box-shadow:
    0 0 0 3px rgb(var(--v-theme-surface)),
    0 0 0 5px var(--xp-tier-ink);
}

.ribbon__badge {
  transition: transform 200ms ease;
}

.week {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.week__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.week__xp {
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.week__track {
  position: relative;
}

.mark {
  position: absolute;
  top: -4px;
  width: 2px;
  height: 22px;
  border-radius: 1px;
  background: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
  transform: translateX(-1px);
}

.marks {
  position: relative;
  height: 20px;
  font-size: 0.8125rem;
}

.marks__label {
  position: absolute;
  top: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  transform: translateX(-50%);
}

.marks__label--promote {
  right: 0;
  left: auto;
  transform: none;
}

.marks__label--done {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 500;
}

.lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 0.9375rem;
}

.line--ok {
  font-weight: 500;
}

.line--ok .v-icon {
  color: rgb(var(--v-theme-success));
}

.league--off {
  flex-flow: row wrap;
  align-items: center;
  gap: 16px;
  padding: 24px;
}

.league__off-icon {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.league__off-text {
  flex: 1 1 200px;
  margin: 0;
  font-size: 1rem;
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
