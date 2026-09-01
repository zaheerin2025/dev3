'use client';

// Global site-content settings (admin-editable key/value overrides).
// SiteApp calls load() once on mount; every view reads overrides from here.
// If the fetch fails or the DB is empty, `settings` stays empty and every
// consumer falls back to the static defaults — the site keeps working.

import { create } from 'zustand';

interface SiteSettingsState {
  settings: Record<string, string>;
  loaded: boolean;
  load: () => Promise<void>;
  /** Force a re-fetch (used after the admin panel saves new content). */
  reload: () => Promise<void>;
}

export const useSiteSettings = create<SiteSettingsState>((set, get) => ({
  settings: {},
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    await get().reload();
  },
  reload: async () => {
    set({ loaded: false });
    try {
      const response = await fetch('/api/public/settings');
      if (response.ok) {
        const payload = (await response.json()) as {
          ok?: boolean;
          settings?: Record<string, string>;
        };
        if (payload?.ok && payload.settings && typeof payload.settings === 'object') {
          set({ settings: payload.settings, loaded: true });
          return;
        }
      }
    } catch {
      // Ignore — static content stays in place when the API is unreachable.
    }
    set({ loaded: true });
  },
}));

/** Convenience selector: settings value or undefined. */
export function selectSetting(key: string) {
  return (state: SiteSettingsState): string | undefined => state.settings[key];
}
