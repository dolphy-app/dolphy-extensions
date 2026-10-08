<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    xp: number;
    goal: number;
    /** Spoken name and value, e.g. "3 of 30 XP today". */
    label: string;
    size?: number;
    width?: number;
  }>(),
  { size: 112, width: 6 },
);

const radius = computed(() => (props.size - props.width) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const fraction = computed(() =>
  props.goal <= 0 ? 0 : Math.min(1, Math.max(0, props.xp / props.goal)),
);
const reached = computed(() => props.goal > 0 && props.xp >= props.goal);

// the ring fills from empty when it appears and follows later changes
const shown = ref(0);
let frame = 0;
const reduced = () =>
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;
const follow = (value: number) => {
  cancelAnimationFrame(frame);
  if (reduced()) {
    shown.value = value;
    return;
  }
  frame = requestAnimationFrame(() => {
    shown.value = value;
  });
};
onMounted(() => follow(fraction.value));
watch(fraction, follow);
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<template>
  <div
    class="ring"
    :class="{ 'ring--reached': reached }"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    :aria-valuemax="goal"
    :aria-valuenow="Math.min(xp, goal)"
    :aria-valuetext="label"
  >
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle
        class="ring__track"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="width"
        fill="none"
      />
      <circle
        class="ring__bar"
        :class="{ 'ring__bar--empty': shown === 0 }"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="width"
        fill="none"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="circumference * (1 - shown)"
      />
    </svg>
    <div class="ring__center" aria-hidden="true">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ring {
  position: relative;
  flex: none;
}

.ring svg {
  display: block;
  transform: rotate(-90deg);
}

.ring__track {
  stroke: rgba(var(--v-border-color), calc(var(--v-border-opacity) * 1.6));
}

.ring__bar {
  stroke: rgb(var(--v-theme-primary));
  transition:
    stroke-dashoffset 400ms cubic-bezier(0.22, 1, 0.36, 1),
    stroke 300ms ease,
    opacity 200ms ease;
}

.ring--reached .ring__bar {
  stroke: rgb(var(--v-theme-success));
}

/* a round cap would draw a dot on an empty ring */
.ring__bar--empty {
  opacity: 0;
}

.ring__center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (prefers-reduced-motion: reduce) {
  .ring__bar {
    transition: none;
  }
}
</style>
