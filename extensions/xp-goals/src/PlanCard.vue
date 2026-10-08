<script setup lang="ts">
import { useApp } from '@dolphy-app/extension-sdk/client';
import { computed } from 'vue';
import { useGamification } from './useGamification.ts';
import XpRing from './XpRing.vue';

const app = useApp();
const { status, error, format: f, load } = useGamification();

const label = computed(() =>
  status.value === null
    ? ''
    : f.value.t('ringLabel', {
        xp: status.value.today.xp,
        goal: status.value.today.goal,
      }),
);

const openPanel = () => app.openPanel('xp-goals', 'xp-goals.main');
</script>

<template>
  <v-card
    v-if="status !== null && status.enabled"
    class="plan-card"
    data-testid="xp-plan-card"
  >
    <XpRing
      :xp="status.today.xp"
      :goal="status.today.goal"
      :label="label"
      :size="40"
      :width="4"
    >
      <v-icon
        v-if="status.today.reached"
        class="plan-card__check"
        icon="mdi-check-bold"
        size="20"
      />
    </XpRing>

    <div class="plan-card__text">
      <span class="plan-card__today" data-testid="xp-plan-today">{{
        label
      }}</span>
      <span
        v-if="status.streak.current > 0"
        class="plan-card__streak"
        data-testid="xp-plan-streak"
        >{{ f.t('streak') }}
        {{ f.tn('streakDays', status.streak.current) }}</span
      >
    </div>

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
  </v-card>

  <v-card
    v-else-if="status === null && error !== null"
    class="plan-card"
    data-testid="xp-plan-error"
  >
    <v-icon icon="mdi-alert-circle-outline" color="error" />
    <span class="plan-card__text">{{ f.t('loadFailed') }}</span>
    <v-btn variant="text" @click="load">{{ f.t('retry') }}</v-btn>
  </v-card>
</template>

<style scoped>
/* the anchor of the page already keeps the distance to the blocks above */
.plan-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 16px 16px 24px;
}

.plan-card__text {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 16px;
  min-width: 0;
}

.plan-card__today {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
}

.plan-card__streak {
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.plan-card__check {
  color: rgb(var(--v-theme-success));
}

.plan-card__open {
  flex: none;
}
</style>
