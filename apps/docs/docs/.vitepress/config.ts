import { defineConfig } from 'vitepress';
import { createSidebar, plugins } from '../../src/plugins';

export default defineConfig({
  title: 'VSCode 插件套件',
  description: '官方插件文档',
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
  ],
  themeConfig: {
    nav: plugins.map((p) => ({ text: p.title, link: `/${p.id}/` })),
    sidebar: createSidebar(plugins),
    outline: { label: '本页导航', level: [2, 3] },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档' },
          modal: { resetButtonTitle: '清除' },
        },
      },
    },
    docFooter: { prev: '上一页', next: '下一页' },
    footer: { message: 'VSCode 插件官方文档' },
  },
});