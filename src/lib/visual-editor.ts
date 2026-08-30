'use client';

// State for the on-page visual content editor (Elementor-style).
// Toggled from the floating admin bar; while enabled, every <Editable>
// region on the page highlights and clicks open the editor panel.

import { create } from 'zustand';

interface VisualEditorState {
  enabled: boolean;
  selectedKey: string | null;
  /** Unsaved edits keyed by Setting key. */
  dirty: Record<string, string>;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
  select: (key: string | null) => void;
  setDraft: (key: string, value: string) => void;
  clearDirty: () => void;
}

export const useVisualEditor = create<VisualEditorState>((set) => ({
  enabled: false,
  selectedKey: null,
  dirty: {},
  setEnabled: (enabled) => set({ enabled, selectedKey: null, dirty: {} }),
  toggle: () => set((s) => ({ enabled: !s.enabled, selectedKey: null, dirty: {} })),
  select: (selectedKey) => set({ selectedKey }),
  setDraft: (key, value) => set((s) => ({ dirty: { ...s.dirty, [key]: value } })),
  clearDirty: () => set({ dirty: {} }),
}));

/** Mirror the enabled flag onto <html data-ve-active> for the CSS outlines. */
export function syncVeActiveAttribute(enabled: boolean): void {
  if (typeof document === 'undefined') return;
  if (enabled) {
    document.documentElement.setAttribute('data-ve-active', '1');
  } else {
    document.documentElement.removeAttribute('data-ve-active');
  }
}
