# Elegant New Tab

自定义新标签页 dashboard。基于 [wxt.dev](https://wxt.dev) + React + TypeScript，输出 MV3 Chrome 扩展。**Material 3 Expressive** 视觉（v4，按 Kevin 的 M3 设计稿重做）。

默认 **English** UI（i18n 结构预留，见 `lib/i18n.ts`）。

## 功能

- **Greeting + date**（左上，按时段 Good Morning / Afternoon / Evening，date pill）+ **live clock**（右上，Roboto Mono，蓝色冒号 + 秒数 pill）。
- **Weather**：Open-Meteo（免 key）。优先浏览器定位，可手动搜索/切换城市（localStorage 记忆）。M3 绿色 tonal 卡。
- **Usage**：Claude（紫）/ Codex（粉）**各占独立 tonal 卡**，每卡展示**双窗口（5h + 7d）**用量/上限/进度条 + 「Resets in」+「Usage updated … ago」；占位数据；接口 `UsageProvider`（`lib/usage.ts`），EVO-77 就绪后替换 `usageProvider` 一行即可。
- **Calendar**（略宽 1.4fr，蓝色 tonal 卡）：`CalendarProvider` 接口 + iCal secret-URL 路径（粘贴私密 .ics → fetch + 客户端解析，存 `chrome.storage.local`），OAuth 预留。未配置显示连接入口；已连接显示今日事件（彩色左条 + 类型图标 + View all）。
- **Shortcuts**（原 Quick Links）：M3 圆形 tonal 图标块（上 favicon/首字母 / 下标签），用户可编辑（增/删/改 + 排序），存 `chrome.storage.local`（localStorage 兜底）。**不读 `chrome.bookmarks`，无 `bookmarks` 权限。**
- **每日一句** + **搜索框**（即聚焦，回车 Google 搜索或网址直达）。

## 设计 / 字体

- **Material 3 Expressive**：大圆角 tonal 卡（radius 18/29/36px、pill 999px）、M3 表达性配色与状态色、弹跳缓动（hover 卡片上浮、圆形图标 morph 成 squircle）。
- **字体本地打包**（MV3 不依赖 CDN，离线可用，见 `public/fonts` + `fonts.css`）：**DM Sans**（正文）、**Roboto Mono**（数字/时钟/用量）、**Material Symbols Rounded**（图标，subset）。
- 顶排 grid `1fr 1fr 1fr 1.4fr`：Weather｜Claude｜Codex｜Calendar；下方 Shortcuts。
- 桌面 100vh 全高、无滚动条、fit-to-viewport；≤1080px 优雅 reflow（2 列 / 单列堆叠，自然高度 + 隐藏滚动条）。

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
