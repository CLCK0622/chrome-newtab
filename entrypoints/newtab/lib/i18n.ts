// 极简 i18n：默认英文。结构预留多语 —— 之后加 locale 只需补一张 dict 表并切 `locale`。

export type Locale = 'en';

export const locale: Locale = 'en';

const en = {
  // 卡片标题
  weather: 'Weather',
  claude: 'Claude',
  codex: 'Codex',
  calendar: 'Calendar',
  quickLinks: 'Quick Links',

  // 通用
  loading: 'Loading…',
  today: 'Today',
  placeholder: 'placeholder',

  // 天气
  setCity: 'Set city',
  searchCityPlaceholder: 'Search a city (e.g. Shanghai)',
  useMyLocation: 'Use my location',
  searching: 'Searching…',
  locating: 'Locating…',
  loadingWeather: 'Fetching weather…',
  cantLocate: 'Couldn’t locate you — pick a city',
  pickCity: 'Pick a city',
  currentLocation: 'Current location',
  feelsLike: 'Feels like',

  // 用量
  usageUnavailable: 'Usage data unavailable',

  // 常用链接
  addLink: 'Add link',
  editLink: 'Edit',
  deleteLink: 'Remove',
  moveLeft: 'Move left',
  moveRight: 'Move right',
  save: 'Save',
  cancel: 'Cancel',
  titleField: 'Title',
  urlField: 'URL',
  noLinks: 'No links yet — add one.',

  // 日历
  calendarConnect: 'Connect a calendar to see today’s agenda',
  calendarUrlPlaceholder: 'Paste your private iCal URL (.ics)',
  connect: 'Connect',
  change: 'Change',
  noEventsToday: 'Nothing on the calendar today',
  allDay: 'All day',
  loadingCalendar: 'Loading calendar…',
  calendarError: 'Couldn’t load calendar',

  // 搜索
  searchPlaceholder: 'Search, or enter a URL…',
};

export type StringKey = keyof typeof en;

const dict: Record<Locale, Record<StringKey, string>> = { en };

export function t(key: StringKey): string {
  return dict[locale][key];
}
