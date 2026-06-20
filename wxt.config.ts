import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Elegant New Tab',
    description: '一个雅致的个人 dashboard 新标签页：问候 / 时钟 / 天气 / 用量 / 书签。',
    // chrome.bookmarks 用于按文件夹分组展示书签。
    permissions: ['bookmarks', 'geolocation'],
    // 扩展页面跨域请求 Open-Meteo（天气 + 地名 geocoding，均免 key）。
    host_permissions: [
      'https://api.open-meteo.com/*',
      'https://geocoding-api.open-meteo.com/*',
    ],
  },
});
