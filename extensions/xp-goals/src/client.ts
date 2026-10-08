import { anchorSelector, defineClient } from '@dolphy-app/extension-sdk';
import PlanCard from './PlanCard.vue';
import StatsPanel from './StatsPanel.vue';

// runs in the app window: the panel and the card are Vue components the app draws
export const client = defineClient((c) => {
  c.addPanel({
    id: 'xp-goals.main',
    title: { en: 'XP goals', ru: 'XP и цели' },
    icon: 'trophy',
    component: StatsPanel,
  });

  c.addInjection({
    id: 'xp-goals.plan-card',
    target: anchorSelector('dailyPlan'),
    position: 'append',
    component: PlanCard,
  });
});
