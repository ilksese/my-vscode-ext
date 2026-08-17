import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import PluginGrid from '../../../components/PluginGrid.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PluginGrid', PluginGrid);
  },
} satisfies Theme;