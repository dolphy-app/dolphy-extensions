import { useApp, useEngine, useRpc } from '@dolphy-app/extension-sdk/client';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import type { ComputedRef, Ref, ShallowRef } from 'vue';
import { createFormat } from './i18n.ts';
import type { Format } from './i18n.ts';
import { statusRpc } from './shared/rpc.ts';
import type { GamificationStatus } from './shared/types.ts';

const EXTENSION_ID = 'xp-goals';

export interface Gamification {
  status: ShallowRef<GamificationStatus | null>;
  /** Message of the last failed load; `null` after a successful one. */
  error: Ref<string | null>;
  loading: Ref<boolean>;
  format: ComputedRef<Format>;
  load(): Promise<void>;
}

/**
 * The status of the server part, reloaded when the component is mounted, when
 * the window becomes visible and when the engine reports progress or a change
 * of this extension's settings. Call it in `setup`.
 */
export const useGamification = (): Gamification => {
  const app = useApp();
  const engine = useEngine();
  const fetchStatus = useRpc(statusRpc);
  const status = shallowRef<GamificationStatus | null>(null);
  const error = ref<string | null>(null);
  const loading = ref(false);
  const format = computed(() => createFormat(app.locale));

  // only the newest request may write the result
  let latest = 0;
  const load = async () => {
    latest += 1;
    const mine = latest;
    loading.value = true;
    try {
      const next = await fetchStatus({});
      if (mine !== latest) return;
      status.value = next;
      error.value = null;
    } catch (cause) {
      if (mine !== latest) return;
      error.value = cause instanceof Error ? cause.message : String(cause);
    } finally {
      if (mine === latest) loading.value = false;
    }
  };

  const onVisible = () => {
    if (document.visibilityState === 'visible') void load();
  };
  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    void load();
    document.addEventListener('visibilitychange', onVisible);
    unsubscribe = engine.subscribe((event) => {
      const settingsOfThis =
        event.type === 'settings-changed' &&
        event.scope === 'extensionValues' &&
        event.extensionId === EXTENSION_ID;
      if (event.type === 'progress' || settingsOfThis) void load();
    });
  });
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVisible);
    unsubscribe?.();
    unsubscribe = null;
    // a late answer must not touch an unmounted component
    latest += 1;
  });

  return { status, error, loading, format, load };
};
