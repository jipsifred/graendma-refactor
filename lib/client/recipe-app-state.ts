import type { ActiveTimer, CategoryItem } from '../../types';

export const TIMER_STORAGE_KEY = 'feji_active_timers:v2';
export const LEGACY_TIMER_STORAGE_KEY = 'feji_active_timers';

export function readLocalStorage(key: string) {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
}

export function loadStoredTimers(): ActiveTimer[] {
  const saved = readLocalStorage(TIMER_STORAGE_KEY) ?? readLocalStorage(LEGACY_TIMER_STORAGE_KEY);
  if (!saved) return [];
  try {
    return (JSON.parse(saved) as ActiveTimer[]).map((timer) => {
      if (!timer.isRunning || !timer.endTime) return timer;
      return {
        ...timer,
        remainingSec: Math.max(0, Math.ceil((timer.endTime - Date.now()) / 1000)),
      };
    });
  } catch {
    return [];
  }
}

export function mergeCategories(baseCategories: CategoryItem[], extraCategories: CategoryItem[]) {
  const mergedCategories = [...baseCategories];
  const seenNames = new Set(baseCategories.map((category) => category.name.trim().toLowerCase()));

  extraCategories.forEach((category) => {
    const trimmedName = category.name.trim();
    if (!trimmedName) return;

    const normalizedName = trimmedName.toLowerCase();
    if (seenNames.has(normalizedName)) return;

    seenNames.add(normalizedName);
    mergedCategories.push({
      id: category.id || trimmedName,
      name: trimmedName,
      iconName: category.iconName,
      isCustom: category.isCustom ?? true,
    });
  });

  return mergedCategories;
}

export function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}
