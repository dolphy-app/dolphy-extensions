<script setup lang="ts">
import { useApp } from '@dolphy-app/extension-sdk/client';
import { computed } from 'vue';
import { weekDays } from './core/week.ts';
import { dayLabel } from './dayLabel.ts';
import type { Format } from './i18n.ts';
import type { GamificationStatus } from './shared/types.ts';
import XpRing from './XpRing.vue';

const props = defineProps<{ status: GamificationStatus; f: Format }>();

const app = useApp();

const today = computed(() => props.status.today);
const days = computed(() => weekDays(props.status));
const ringLabel = computed(() =>
  props.f.t('ringLabel', { xp: today.value.xp, goal: today.value.goal }),
);
const left = computed(() => Math.max(0, today.value.goal - today.value.xp));
const over = computed(() => today.value.xp - today.value.goal);
const noXpYet = computed(() => props.status.totalXp === 0);

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
  <v-card
    class="hero"
    theme="dark"
    rounded="xl"
    :border="false"
    data-testid="xp-hero"
  >
    <div class="hero__body">
      <section class="hero__top" aria-labelledby="xp-hero-title">
        <div class="hero__ring" data-testid="xp-today">
          <XpRing
            tone="hero"
            :xp="today.xp"
            :goal="today.goal"
            :label="ringLabel"
          >
            <span class="hero__xp" data-testid="xp-today-xp">{{
              f.number(today.xp)
            }}</span>
            <span class="hero__of">{{
              f.t('ringGoal', { goal: today.goal })
            }}</span>
          </XpRing>
          <Transition name="pop">
            <span v-if="today.reached" class="hero__check" aria-hidden="true">
              <v-icon icon="mdi-check-bold" size="22" />
            </span>
          </Transition>
        </div>

        <div class="hero__main">
          <h2 id="xp-hero-title" class="hero__eyebrow">{{ f.t('today') }}</h2>
          <p v-if="today.reached" class="hero__headline">
            <v-icon icon="mdi-trophy" size="28" />
            <span data-testid="xp-goal-reached">{{ f.t('goalReached') }}</span>
          </p>
          <p v-else class="hero__headline" data-testid="xp-goal-left">
            {{ f.t('goalLeft', { n: left }) }}
          </p>
          <p v-if="today.reached || noXpYet" class="hero__sub">
            <template v-if="today.reached">
              {{ over > 0 ? f.t('goalOver', { n: over }) : f.t('goalExact') }}
            </template>
            <template v-else>{{ f.t('empty') }}</template>
          </p>
          <v-btn
            class="hero__cta"
            size="large"
            color="hero-contrast"
            append-icon="mdi-arrow-right"
            data-testid="xp-start"
            @click="start"
          >
            {{ f.t('startPractice') }}
          </v-btn>
        </div>
        <div class="streak" data-testid="xp-streak-block">
          <v-icon
            class="streak__icon"
            :class="{ 'streak__icon--off': status.streak.current === 0 }"
            :icon="status.streak.current > 0 ? 'mdi-fire' : 'mdi-fire-off'"
            size="36"
          />
          <div class="streak__text">
            <template v-if="status.streak.current > 0">
              <span class="streak__value" data-testid="xp-streak">{{
                f.tn('streakDays', status.streak.current)
              }}</span>
              <span class="streak__sub">{{
                f.t('bestStreak', {
                  n: f.tn('streakDays', status.streak.longest),
                })
              }}</span>
            </template>
            <template v-else>
              <span class="streak__value" data-testid="xp-streak"
                >{{ f.t('streak') }}: {{ f.tn('streakDays', 0) }}</span
              >
              <span class="streak__sub">{{ f.t('streakNone') }}</span>
            </template>
          </div>
        </div>
      </section>

      <div class="hero__bottom">
        <ol
          class="week"
          :aria-label="f.t('thisWeek')"
          data-testid="xp-week-strip"
        >
          <li
            v-for="(day, i) in days"
            :key="day.date"
            class="week__day"
            :class="{ 'week__day--today': day.isToday }"
            :data-state="day.state"
            :style="{ '--xp-i': i }"
            :title="dayLabel(f, day)"
            data-testid="xp-week-day"
          >
            <span class="week__name" aria-hidden="true">{{
              f.weekdayShort(day.date)
            }}</span>
            <span
              class="week__dot"
              :class="`week__dot--${day.state}`"
              aria-hidden="true"
            >
              <v-icon
                v-if="day.state === 'reached'"
                class="week__check"
                icon="mdi-check-bold"
                size="20"
              />
              <v-icon
                v-else-if="day.state === 'missed'"
                class="week__miss"
                icon="mdi-minus"
                size="16"
              />
            </span>
            <span class="sr">{{ dayLabel(f, day) }}</span>
          </li>
        </ol>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.hero {
  overflow: hidden;
  container-type: inline-size;
  padding: 0;
  color: rgb(var(--v-theme-hero-contrast));
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-hero-start)) 0%,
    rgb(var(--v-theme-hero-end)) 100%
  );
}

.hero__body {
  padding: 32px;
}

.hero__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px 40px;
}

.hero__ring {
  position: relative;
  flex: none;
}

.hero__xp {
  font-size: 3.25rem;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.hero__of {
  margin-top: 4px;
  font-size: 0.875rem;
  opacity: 0.9;
}

.hero__check {
  position: absolute;
  right: 4px;
  bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: rgb(var(--v-theme-on-success));
  background: rgb(var(--v-theme-success));
  box-shadow: 0 0 0 4px rgb(var(--v-theme-hero-end));
}

.hero__main {
  display: flex;
  flex: 1 1 280px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}

.hero__eyebrow {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.9;
}

.hero__headline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.25;
}

.hero__sub {
  margin: 0;
  font-size: 1rem;
  opacity: 0.92;
}

.hero .hero__cta.v-btn {
  margin-top: 16px;
  color: rgb(var(--v-theme-hero-start));
}

.hero__bottom {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(var(--v-theme-hero-contrast), 0.24);
}

.week {
  display: flex;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.week__day {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.week__name {
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.9;
}

.week__day--today .week__name {
  font-weight: 700;
  opacity: 1;
}

.week__dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid transparent;
  border-radius: 50%;
  box-sizing: border-box;
}

.week__dot--reached {
  color: rgb(var(--v-theme-hero-start));
  background: rgb(var(--v-theme-hero-contrast));
}

.week__dot--today {
  border-color: rgb(var(--v-theme-hero-contrast));
  background: rgba(var(--v-theme-hero-contrast), 0.16);
}

.week__dot--missed {
  background: rgba(var(--v-theme-hero-contrast), 0.2);
}

.week__dot--upcoming {
  border-color: rgba(var(--v-theme-hero-contrast), 0.4);
}

.week__check {
  animation: pop 280ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: calc(var(--xp-i, 0) * 40ms + 150ms);
}

.streak {
  display: flex;
  flex: none;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 16px;
  background: rgba(var(--v-theme-hero-contrast), 0.14);
}

.week__miss {
  opacity: 0.75;
}

.streak__icon {
  color: rgb(var(--v-theme-warning));
}

.streak__icon--off {
  color: inherit;
  opacity: 0.7;
}

.streak__text {
  display: flex;
  flex-direction: column;
}

.streak__value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
}

.streak__sub {
  font-size: 0.875rem;
  opacity: 0.92;
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.pop-enter-active {
  transition:
    transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 200ms ease;
}

.pop-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.4);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* no room beside the headline: the streak becomes a full-width strip */
@container (max-width: 760px) {
  .streak {
    justify-content: center;
    flex: 1 1 100%;
  }
}

@container (max-width: 560px) {
  .hero__body {
    padding: 24px;
  }

  .hero__top {
    justify-content: center;
    text-align: center;
  }

  .hero__main {
    align-items: center;
  }

  .hero__headline {
    justify-content: center;
    font-size: 1.5rem;
  }

  .hero__bottom {
    justify-content: center;
  }

  .week {
    gap: 8px;
  }

  .week__day {
    min-width: 36px;
  }

  .week__dot {
    width: 36px;
    height: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .week__check {
    animation: none;
  }

  .pop-enter-active {
    transition: none;
  }
}
</style>
