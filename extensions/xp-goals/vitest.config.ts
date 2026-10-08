import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

// Vuetify ships CSS imports that Node cannot load: vite has to process it
export default defineConfig({
  plugins: [vue()],
  test: { server: { deps: { inline: ['vuetify'] } }, css: false },
});
