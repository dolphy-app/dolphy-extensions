<script setup lang="ts">
import { useApp } from '@dolphy-app/extension-sdk/client';
import { computed } from 'vue';
import { useGamification } from './useGamification.ts';

const app = useApp();
const { status, error, format: f, load } = useGamification();

const percent = computed(() => {
  const today = status.value?.today;
  if (today === undefined || today.goal <= 0) return 0;
  return Math.min(100, Math.round((today.xp / today.goal) * 100));
});

const openPanel = () => app.openPanel('xp-goals', 'xp-goals.main');
</script>

<template>
  <v-card
    v-if="status !== null && status.enabled"
    class="xp-card"
    variant="tonal"
    data-testid="xp-plan-card"
  >
    <div class="xp-card__body">
      <v-progress-circular
        class="xp-card__ring"
        :model-value="percent"
        :size="64"
        :width="7"
        :color="status.today.reached ? 'success' : 'primary'"
        :aria-label="
          f.t('ringLabel', { xp: status.today.xp, goal: status.today.goal })
        "
      >
        <v-icon v-if="status.today.reached" icon="mdi-check" size="28" />
        <span v-else class="xp-card__percent">{{ percent }}%</span>
      </v-progress-circular>

      <div class="xp-card__text">
        <div class="xp-card__title">
          <span data-testid="xp-plan-today">{{
            f.t('ringLabel', { xp: status.today.xp, goal: status.today.goal })
          }}</span>
        </div>
        <div v-if="status.today.reached" class="xp-card__done">
          <v-icon icon="mdi-check-circle" size="16" />
          {{ f.t('goalReached') }}
        </div>
        <div class="xp-card__chips">
          <v-chip
            v-if="status.leaguesEnabled"
            size="small"
            prepend-icon="mdi-trophy"
            data-testid="xp-plan-league"
          >
            {{ f.tier(status.league.tier) }}
          </v-chip>
          <v-chip
            size="small"
            prepend-icon="mdi-fire"
            data-testid="xp-plan-streak"
          >
            {{ f.tn('streakDays', status.streak.current) }}
          </v-chip>
        </div>
      </div>

      <v-btn
        class="xp-card__open"
        variant="text"
        append-icon="mdi-chevron-right"
        @click="openPanel"
      >
        {{ f.t('details') }}
      </v-btn>
    </div>
  </v-card>

  <v-card
    v-else-if="status === null && error !== null"
    class="xp-card"
    variant="tonal"
  >
    <div class="xp-card__body">
      <v-icon icon="mdi-alert-circle-outline" color="error" />
      <span class="xp-card__text">{{ f.t('loadFailed') }}</span>
      <v-btn variant="text" @click="load">{{ f.t('refresh') }}</v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.xp-card {
  margin-top: 16px;
}

.xp-card__body {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 16px;
}

.xp-card__text {
  display: flex;
  flex: 1 1 200px;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.xp-card__title {
  font-size: 1rem;
  font-weight: 500;
}

.xp-card__done {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
}

.xp-card__done .v-icon {
  color: rgb(var(--v-theme-success));
}

.xp-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.xp-card__percent {
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
