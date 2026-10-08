<script setup lang="ts">
// A message on a tinted surface: the text keeps the normal text colour (a
// tonal `v-alert` paints it in the status colour, which is too pale on white)
// and the status shows as the icon, the border and the words themselves.
withDefaults(
  defineProps<{
    tone: 'info' | 'warning' | 'error';
    icon: string;
    /** `status` is polite; `alert` interrupts and is only for failures. */
    role?: 'status' | 'alert';
  }>(),
  { role: 'status' },
);
</script>

<template>
  <div class="notice" :class="`notice--${tone}`" :role="role">
    <v-icon class="notice__icon" :icon="icon" size="22" />
    <div class="notice__body"><slot /></div>
  </div>
</template>

<style scoped>
.notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid transparent;
  border-radius: 12px;
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-on-surface));
}

.notice__icon {
  flex: none;
}

.notice__body {
  flex: 1 1 auto;
  min-width: 0;
}

.notice--info {
  border-color: rgba(var(--v-theme-info), 0.6);
  background: rgba(var(--v-theme-info), 0.14);
}

.notice--info .notice__icon {
  color: rgb(var(--v-theme-info));
}

.notice--warning {
  border-color: rgba(var(--v-theme-warning), 0.6);
  background: rgba(var(--v-theme-warning), 0.14);
}

.notice--warning .notice__icon {
  color: rgb(var(--v-theme-warning));
}

.notice--error {
  border-color: rgba(var(--v-theme-error), 0.6);
  background: rgba(var(--v-theme-error), 0.12);
}

.notice--error .notice__icon {
  color: rgb(var(--v-theme-error));
}
</style>
