import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Elegant New Tab',
    description: 'An elegant personal dashboard new tab: greeting / clock / weather / usage / calendar / quick links.',
    // Quick Links 改为用户自管，不再读 chrome.bookmarks——权限面收窄到仅 geolocation。
    permissions: ['geolocation'],
    // 扩展页面跨域请求：Open-Meteo（天气 + 地名 geocoding，免 key）+ Google 私密 iCal 订阅地址。
    host_permissions: [
      'https://api.open-meteo.com/*',
      'https://geocoding-api.open-meteo.com/*',
      'https://calendar.google.com/*',
    ],
  },
});
