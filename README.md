# Elegant New Tab

雅致的自定义新标签页 dashboard。基于 [wxt.dev](https://wxt.dev) + React + TypeScript，输出 MV3 Chrome 扩展。

默认 **English** UI（i18n 结构预留，见 `lib/i18n.ts`）。

## 功能（v3）

- **Greeting + date**（左上，按时段 Good Morning / Afternoon / Evening）+ **live clock**（右上，秒级）。
- **Weather**：Open-Meteo（免 key）。优先浏览器定位，可手动搜索/切换城市（localStorage 记忆）。
- **Usage**：Claude / Codex **各占独立一格**，每格展示**双窗口（5h + 7d）**用量/上限/进度；占位数据；接口 `UsageProvider`（`lib/usage.ts`）已约定好，EVO-77 就绪后替换 `usageProvider` 一行即可。
- **Calendar**（占 2 格）：组件位 + `CalendarProvider` 接口；优先 **iCal secret-URL 路径**（粘贴私密 .ics 地址 → fetch + 客户端解析，存 `chrome.storage.local`），OAuth 作为后续重路径预留。未配置时显示占位与连接入口。
- **Quick Links**（取代书签）：竖向卡片（上 favicon / 下文字，取不到回退首字母）；用户可编辑列表（增/删/改 + 排序），存 `chrome.storage.local`（localStorage 兜底）。**不再读 `chrome.bookmarks`，已移除 `bookmarks` 权限。**
- **每日一句**（serif 大字）+ **搜索框**（打开即聚焦，回车 Google 搜索或网址直达）。

## 布局

顶排五等分：Weather(1) ｜ Claude(1) ｜ Codex(1) ｜ Calendar(span 2)；下方 Quick Links 横向等分一排。

## 设计

100vh 全高、无页面滚动条、fit-to-viewport CSS grid、响应式 reflow（窄屏顶排堆叠）、serif 字体（Newsreader / Source Serif 4）、低饱和暖调奶白，含深色模式。

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
4. 新开标签页即为本 dashboard。定位首次会请求授权。

## 数据接口约定

### 用量（与 EVO-77 对接，`lib/usage.ts`）

```ts
type UsageWindow = '5h' | '7d';        // 计量窗口（v3：每 provider 多窗口）

interface UsageMetric {
  provider: 'claude' | 'codex';
  window: UsageWindow;     // 同一 provider 每窗口一条
  used: number;
  limit: number | null;    // null = 无上限/仅计量
  unit: string;            // 'tokens' | 'requests' | ...
  updatedAt: string;       // ISO
}
interface UsageProvider { getUsage(): Promise<{ metrics: UsageMetric[]; source: string }> }
// 返回示例：metrics 含 claude@5h, claude@7d, codex@5h, codex@7d 共 4 条
```

每个 provider 在 `metrics[]` 中按窗口出现多条；`UsageCard` 取该 provider 全部窗口分行渲染（5h + 7d）。EVO-77 提供真实数据源时，实现 `UsageProvider.getUsage()` 并替换 `usageProvider` 导出即可，UI 无需改动。

### 日历（`lib/calendar.ts`）

```ts
interface CalendarEvent {
  start: string;   // ISO
  end: string;     // ISO
  title: string;
  allDay: boolean;
  location?: string;
}
interface CalendarProvider { getEvents(): Promise<{ events: CalendarEvent[]; source: string }> }
```

已内置 iCal provider：把 Google 日历「私密 iCal 格式地址」（`.ics`）粘到 Calendar 卡片即可（存本地、只读、无需 OAuth）。换 OAuth 重路径时实现同一 `CalendarProvider` 接口替换导出即可。
