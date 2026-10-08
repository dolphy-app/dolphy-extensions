<script setup lang="ts">
import type { LeagueTier } from './shared/types.ts';

// the badge is decorative: the league name is always written next to it
withDefaults(defineProps<{ tier: LeagueTier; size?: number }>(), {
  size: 40,
});

const ICONS: Record<LeagueTier, string> = {
  bronze: 'mdi-shield',
  silver: 'mdi-shield-star',
  gold: 'mdi-shield-crown',
  sapphire: 'mdi-hexagon-multiple',
  ruby: 'mdi-hexagram',
  emerald: 'mdi-crown',
  diamond: 'mdi-diamond-stone',
};
</script>

<template>
  <span
    class="xp-tier xp-badge"
    :data-tier="tier"
    :style="{ '--xp-badge-size': `${size}px` }"
    aria-hidden="true"
  >
    <v-icon :icon="ICONS[tier]" :size="Math.round(size * 0.55)" />
  </span>
</template>

<style>
/*
 * The league tokens, defined once: any element with `.xp-tier[data-tier]`
 * (the badge, a step of the ribbon, a card) carries
 *   --xp-tier-fill: the solid colour of the badge,
 *   --xp-tier-on:   the icon on that fill (4.5:1 or more),
 *   --xp-tier-ink:  the same hue as an accent on the card surface (4.5:1+).
 * The light theme uses deep fills with a white icon (gold: a bright fill with a
 * dark icon); the dark theme uses light fills with a dark icon.
 */
.xp-tier[data-tier='bronze'] {
  --xp-tier-fill: #9c5a2b;
  --xp-tier-on: #ffffff;
  --xp-tier-ink: #7c4520;
}
.xp-tier[data-tier='silver'] {
  --xp-tier-fill: #64748b;
  --xp-tier-on: #ffffff;
  --xp-tier-ink: #475569;
}
.xp-tier[data-tier='gold'] {
  --xp-tier-fill: #f2b705;
  --xp-tier-on: #2a1b00;
  --xp-tier-ink: #a16207;
}
.xp-tier[data-tier='sapphire'] {
  --xp-tier-fill: #1e40af;
  --xp-tier-on: #ffffff;
  --xp-tier-ink: #1e3a8a;
}
.xp-tier[data-tier='ruby'] {
  --xp-tier-fill: #be123c;
  --xp-tier-on: #ffffff;
  --xp-tier-ink: #9f1239;
}
.xp-tier[data-tier='emerald'] {
  --xp-tier-fill: #047857;
  --xp-tier-on: #ffffff;
  --xp-tier-ink: #065f46;
}
.xp-tier[data-tier='diamond'] {
  --xp-tier-fill: #0e7490;
  --xp-tier-on: #ffffff;
  --xp-tier-ink: #155e75;
}

.v-theme--dark .xp-tier[data-tier='bronze'] {
  --xp-tier-fill: #e0a070;
  --xp-tier-on: #0e1020;
  --xp-tier-ink: #e0a070;
}
.v-theme--dark .xp-tier[data-tier='silver'] {
  --xp-tier-fill: #cbd5e1;
  --xp-tier-on: #0e1020;
  --xp-tier-ink: #cbd5e1;
}
.v-theme--dark .xp-tier[data-tier='gold'] {
  --xp-tier-fill: #fbbf24;
  --xp-tier-on: #0e1020;
  --xp-tier-ink: #fbbf24;
}
.v-theme--dark .xp-tier[data-tier='sapphire'] {
  --xp-tier-fill: #60a5fa;
  --xp-tier-on: #0e1020;
  --xp-tier-ink: #60a5fa;
}
.v-theme--dark .xp-tier[data-tier='ruby'] {
  --xp-tier-fill: #fb7185;
  --xp-tier-on: #0e1020;
  --xp-tier-ink: #fb7185;
}
.v-theme--dark .xp-tier[data-tier='emerald'] {
  --xp-tier-fill: #34d399;
  --xp-tier-on: #0e1020;
  --xp-tier-ink: #34d399;
}
.v-theme--dark .xp-tier[data-tier='diamond'] {
  --xp-tier-fill: #22d3ee;
  --xp-tier-on: #0e1020;
  --xp-tier-ink: #22d3ee;
}

.xp-badge {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--xp-badge-size);
  height: var(--xp-badge-size);
  border-radius: 50%;
  background: var(--xp-tier-fill);
  color: var(--xp-tier-on);
  box-shadow: inset 0 0 0 2px var(--xp-tier-ink);
}

.xp-badge .v-icon {
  color: inherit;
}
</style>
