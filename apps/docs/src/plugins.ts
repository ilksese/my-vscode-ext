import type { DefaultTheme } from 'vitepress';

export interface PluginPage {
  text: string;
  link: string;
}

export interface PluginMeta {
  /** 插件标识，作为站点内目录名与 URL，如 `my-commands` */
  id: string;
  /** 导航 / 卡片显示名 */
  title: string;
  /** 一句话描述，用于主页卡片 */
  description: string;
  /** 图标：public 下的图片路径（如 `/icons/my-commands.svg`），无则回退 emoji */
  icon: string;
  /** 主页 grid 排序权重，越小越靠前 */
  order?: number;
  /** 该插件的侧边栏页面，按展示顺序排列 */
  pages: PluginPage[];
}

export const plugins: PluginMeta[] = [
  {
    id: 'my-commands',
    title: 'my-commands',
    description: '自定义命令执行工具：侧边栏管理 + 编辑器右键快速运行',
    icon: '/icons/my-commands.svg',
    order: 1,
    pages: [
      { text: '介绍', link: '/my-commands/' },
      { text: '安装', link: '/my-commands/installation' },
      { text: '使用指南', link: '/my-commands/guide' },
      { text: '变量替换', link: '/my-commands/variables' },
    ],
  },
];

/** 依据插件注册表生成侧边栏，新插件只需在 `plugins` 数组追加一项 */
export function createSidebar(pluginList: PluginMeta[]): DefaultTheme.Sidebar {
  return Object.fromEntries(
    [...pluginList]
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
      .map((p) => [
        `/${p.id}/`,
        [{ text: p.title, collapsed: false, items: p.pages }],
      ]),
  );
}