"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const SHORTLIST_KEY = "cm:shortlist";
const COMPARE_KEY = "cm:compare";
const MAX_COMPARE = 4;

interface SavedState {
  shortlist: string[];
  compare: string[];
}

const EMPTY: SavedState = { shortlist: [], compare: [] };
let state: SavedState = EMPTY;
let initialized = false;
const listeners = new Set<() => void>();

function readSlugs(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((value): value is string => typeof value === "string")
      .slice(0, 50);
  } catch {
    return [];
  }
}

function writeSlugs(key: string, slugs: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(slugs));
  } catch {
    // Storage can be unavailable in private mode; the UI still works for this session.
  }
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

function init(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  state = {
    shortlist: readSlugs(SHORTLIST_KEY),
    compare: readSlugs(COMPARE_KEY),
  };
  window.addEventListener("storage", (event) => {
    if (event.key === SHORTLIST_KEY) {
      state = { ...state, shortlist: readSlugs(SHORTLIST_KEY) };
      emit();
    }
    if (event.key === COMPARE_KEY) {
      state = { ...state, compare: readSlugs(COMPARE_KEY) };
      emit();
    }
  });
}

function subscribe(listener: () => void): () => void {
  init();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): SavedState {
  init();
  return state;
}

function getServerSnapshot(): SavedState {
  return EMPTY;
}

const noopSubscribe = () => () => {};

interface SavedContextValue {
  mounted: boolean;
  shortlist: string[];
  compare: string[];
  isShortlisted: (slug: string) => boolean;
  isComparing: (slug: string) => boolean;
  toggleShortlist: (slug: string) => void;
  toggleCompare: (slug: string) => void;
  clearShortlist: () => void;
  clearCompare: () => void;
  compareFull: boolean;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const toggleShortlist = useCallback((slug: string) => {
    const next = state.shortlist.includes(slug)
      ? state.shortlist.filter((item) => item !== slug)
      : [slug, ...state.shortlist];
    state = { ...state, shortlist: next };
    writeSlugs(SHORTLIST_KEY, next);
    emit();
  }, []);

  const toggleCompare = useCallback((slug: string) => {
    const next = state.compare.includes(slug)
      ? state.compare.filter((item) => item !== slug)
      : [...state.compare, slug].slice(-MAX_COMPARE);
    state = { ...state, compare: next };
    writeSlugs(COMPARE_KEY, next);
    emit();
  }, []);

  const clearShortlist = useCallback(() => {
    state = { ...state, shortlist: [] };
    writeSlugs(SHORTLIST_KEY, []);
    emit();
  }, []);

  const clearCompare = useCallback(() => {
    state = { ...state, compare: [] };
    writeSlugs(COMPARE_KEY, []);
    emit();
  }, []);

  const value = useMemo<SavedContextValue>(
    () => ({
      mounted,
      shortlist: snapshot.shortlist,
      compare: snapshot.compare,
      isShortlisted: (slug) => snapshot.shortlist.includes(slug),
      isComparing: (slug) => snapshot.compare.includes(slug),
      toggleShortlist,
      toggleCompare,
      clearShortlist,
      clearCompare,
      compareFull: snapshot.compare.length >= MAX_COMPARE,
    }),
    [
      mounted,
      snapshot,
      toggleShortlist,
      toggleCompare,
      clearShortlist,
      clearCompare,
    ],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): SavedContextValue {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error("useSaved must be used inside SavedProvider");
  }
  return context;
}
