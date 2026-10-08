<script setup lang="ts">
// A one-line message beside the content: neutral for information, tinted for
// a failure. The text keeps the normal text colour (a tonal `v-alert` paints
// it in the status colour, which is too pale on white); the status shows as
// the icon, the border and the words themselves.
withDefaults(
  defineProps<{
    tone: 'info' | 'error';
    icon: string;
    /** `status` is polite; `alert` interrupts and is only for failures. */
    role?: 'status' | 'alert';
  }>(),
  { role: 'status' },
);
</script>

<template>
  <div class="notice" :class="`notice--${tone}`" :role="role">
    <v-icon class="notice__icon" :icon="icon" size="20" />
    <div class="notice__body"><slot /></div>
  </div>
</template>

<style scoped>
.notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 8px 8px 16px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
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

.notice--info .notice__icon {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.notice--error {
  border-color: rgba(var(--v-theme-error), 0.6);
  background: rgba(var(--v-theme-error), 0.08);
}

.notice--error .notice__icon {
  color: rgb(var(--v-theme-error));
}
</style>
