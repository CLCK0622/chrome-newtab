// 统一的异步存储：优先 chrome.storage.local，非扩展环境（本地预览）回退 localStorage。
// 值以 JSON 序列化，读写均为 Promise。

function hasChromeStorage(): boolean {
  return (
    typeof chrome !== 'undefined' &&
    !!chrome.storage &&
    !!chrome.storage.local &&
    typeof chrome.storage.local.get === 'function'
  );
}

export async function storageGet<T>(key: string, fallback: T): Promise<T> {
  if (hasChromeStorage()) {
    return new Promise<T>((resolve) => {
      try {
        chrome.storage.local.get(key, (items) => {
          if (chrome.runtime?.lastError || items?.[key] === undefined) {
            resolve(fallback);
          } else {
            resolve(items[key] as T);
          }
        });
      } catch {
        resolve(fallback);
      }
    });
  }
  // localStorage 回退
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  if (hasChromeStorage()) {
    return new Promise<void>((resolve) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => resolve());
      } catch {
        resolve();
      }
    });
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 隐私模式等场景静默失败 */
  }
}
