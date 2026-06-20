// Open-Meteo：免 key 的天气 + 地名搜索。
// 文档：https://open-meteo.com/en/docs

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  isDay: boolean;
  windSpeed: number;
}

export interface DailyWeather {
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationProbability: number | null;
}

export interface WeatherResult {
  current: CurrentWeather;
  today: DailyWeather;
}

export interface GeocodeHit {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

// WMO weather code → emoji + 中文描述。覆盖常见档位，未知码回退到「天气」。
const WMO: Record<number, { icon: string; label: string }> = {
  0: { icon: '☀️', label: '晴' },
  1: { icon: '🌤️', label: '大致晴朗' },
  2: { icon: '⛅', label: '局部多云' },
  3: { icon: '☁️', label: '阴' },
  45: { icon: '🌫️', label: '雾' },
  48: { icon: '🌫️', label: '雾凇' },
  51: { icon: '🌦️', label: '毛毛雨' },
  53: { icon: '🌦️', label: '小雨' },
  55: { icon: '🌧️', label: '密集毛毛雨' },
  61: { icon: '🌧️', label: '小雨' },
  63: { icon: '🌧️', label: '中雨' },
  65: { icon: '🌧️', label: '大雨' },
  71: { icon: '🌨️', label: '小雪' },
  73: { icon: '🌨️', label: '中雪' },
  75: { icon: '❄️', label: '大雪' },
  77: { icon: '🌨️', label: '雪粒' },
  80: { icon: '🌦️', label: '阵雨' },
  81: { icon: '🌧️', label: '强阵雨' },
  82: { icon: '⛈️', label: '暴雨' },
  85: { icon: '🌨️', label: '阵雪' },
  86: { icon: '❄️', label: '强阵雪' },
  95: { icon: '⛈️', label: '雷雨' },
  96: { icon: '⛈️', label: '雷雨伴冰雹' },
  99: { icon: '⛈️', label: '强雷雨冰雹' },
};

export function describeWeather(code: number): { icon: string; label: string } {
  return WMO[code] ?? { icon: '🌡️', label: '天气' };
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherResult> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m',
  );
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
  );
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '1');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`天气请求失败：${res.status}`);
  const data = await res.json();

  return {
    current: {
      temperature: Math.round(data.current.temperature_2m),
      apparentTemperature: Math.round(data.current.apparent_temperature),
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
      windSpeed: Math.round(data.current.wind_speed_10m),
    },
    today: {
      tempMax: Math.round(data.daily.temperature_2m_max[0]),
      tempMin: Math.round(data.daily.temperature_2m_min[0]),
      weatherCode: data.daily.weather_code[0],
      precipitationProbability: data.daily.precipitation_probability_max?.[0] ?? null,
    },
  };
}

export async function searchCity(query: string): Promise<GeocodeHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', trimmed);
  url.searchParams.set('count', '5');
  url.searchParams.set('language', 'zh');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`城市搜索失败：${res.status}`);
  const data = await res.json();
  return (data.results ?? []).map((r: any) => ({
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  }));
}

export function getBrowserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('浏览器不支持定位'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
    );
  });
}
