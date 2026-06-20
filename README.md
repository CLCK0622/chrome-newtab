# Elegant New Tab

雅致的自定义新标签页 dashboard。基于 [wxt.dev](https://wxt.dev) + React + TypeScript，输出 MV3 Chrome 扩展。

## 功能（v1）

- **问候 + 日期**（左上）：按时段 Good Morning / Afternoon / Evening，每分钟刷新。
- **实时时钟**（右上）：秒级跳动。
- **天气**：Open-Meteo（免 key）。优先浏览器定位，可手动搜索/切换城市（localStorage 记忆）。
- **用量**（Claude / Codex）：组件位 + 占位数据；接口 `UsageProvider`（`lib/usage.ts`）已约定好，EVO-77 就绪后替换 `usageProvider` 一行即可。
- **书签**：读 `chrome.bookmarks`，按文件夹分组。
- **每日一句**（serif 大字）+ **搜索框**（打开即聚焦，回车 Google 搜索或网址直达）。

## 设计

100vh 全高、无页面滚动条、fit-to-viewport CSS grid、响应式 reflow、serif 字体（Newsreader / Source Serif 4）、低饱和暖调奶白，含深色模式。

## 开发

```bash
pnpm install
pnpm dev          # 启动开发服务（自动打开带扩展的 Chrome）
pnpm build        # 产出 MV3 可加载产物到 .output/chrome-mv3
pnpm compile      # 类型检查（tsc --noEmit）
```

## 加载到 Chrome（未打包）

1. `pnpm build`，产物在 `.output/chrome-mv3/`。
2. 打开 `chrome://extensions`，右上角开启 **开发者模式**。
3. 点 **加载已解压的扩展程序**，选择 `.output/chrome-mv3/` 目录。
4. 新开标签页即为本 dashboard。书签/定位首次会请求授权。

## 数据接口约定（与 EVO-77 对接）

见 `entrypoints/newtab/lib/usage.ts` 的 `UsageMetric` / `UsageProvider`：

```ts
interface UsageMetric {
  provider: 'claude' | 'codex';
  label: string;
  used: number;
  limit: number | null;   // null = 无上限/仅计量
  unit: string;           // 'tokens' | 'requests' | ...
  window: string;         // '今日' | '本月' | ...
  updatedAt: string;      // ISO
}
```

EVO-77 提供真实数据源时，实现 `UsageProvider.getUsage()` 并替换 `usageProvider` 导出即可，UI 无需改动。
