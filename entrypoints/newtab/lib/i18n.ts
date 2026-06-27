// 极简 i18n：默认英文。结构预留多语 —— 之后加 locale 只需补一张 dict 表并切 `locale`。

export type Locale = 'en';

export const locale: Locale = 'en';

const en = {
  // 卡片标题
  weather: 'Weather',
  claude: 'Claude',
  codex: 'Codex',
  calendar: 'Calendar',
  shortcuts: 'Shortcuts',

  // 通用
  loading: 'Loading…',
  placeholder: 'placeholder',
  edit: 'Edit',

  // 天气
  setCity: 'Set city',
  locationMode: 'Location',
  cityMode: 'City',
  searchCityPlaceholder: 'Search a city (e.g. Shanghai)',
  useMyLocation: 'Use my location',
  searching: 'Searching…',
  locating: 'Locating…',
  loadingWeather: 'Fetching weather…',
  cantLocate: 'We couldn’t find your location. Pick a city to see the forecast.',
  pickCity: 'Pick a city',
  currentLocation: 'Current location',
  feelsLike: 'Feels like',

  // 用量
  usageUnavailable: 'Usage data unavailable',
  resetsIn: 'Resets in',
  usageUpdated: 'Usage updated',
  ago: 'ago',
  setEndpoint: 'Set endpoint',
  endpointPlaceholder: 'Paste your usage endpoint URL',
  endpointHint: 'Fetches the 5h / 7d windows from this URL. Empty = placeholder data.',

  // 快捷方式（Shortcuts）
  addShortcut: 'Add',
  editShortcut: 'Edit',
  deleteShortcut: 'Remove',
  moveLeft: 'Move left',
  moveRight: 'Move right',
  save: 'Save',
  cancel: 'Cancel',
  titleField: 'Title',
  urlField: 'URL',
  noShortcuts: 'No shortcuts yet — add one.',

  // 日历
  calendarConnect: 'Connect a calendar to see today’s agenda',
  calendarUrlPlaceholder: 'Paste your private iCal URL (.ics)',
  addCalendar: 'Add calendar',
  connect: 'Connect',
  change: 'Change',
  viewAll: 'View all',
  noEventsToday: 'Nothing on the calendar today',
  loadingCalendar: 'Loading calendar…',
  calendarError: 'Couldn’t load calendar',

  // 搜索
  searchPlaceholder: 'Search Google or type a URL',
};

export type StringKey = keyof typeof en;

const dict: Record<Locale, Record<StringKey, string>> = { en };

export function t(key: StringKey): string {
  return dict[locale][key];
}

/** "2 events today" 之类的可数标签 */
export function eventsToday(n: number): string {
  return `${n} event${n === 1 ? '' : 's'} today`;
}
