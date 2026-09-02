/**
 * Backend service contracts. The prototype implements these with local, in-memory /
 * localStorage adapters. A real backend swaps the adapters without touching the UI.
 */
export interface AuthService { currentUser(): Promise<{ id: string; name: string; handle: string } | null>; signIn(handle: string): Promise<void>; signOut(): Promise<void> }
export interface DatabaseService { get<T>(collection: string, id: string): Promise<T | null>; list<T>(collection: string): Promise<T[]>; put<T extends { id: string }>(collection: string, doc: T): Promise<T>; remove(collection: string, id: string): Promise<void> }
export interface StorageService { upload(file: Blob, path: string): Promise<{ url: string }> }

const KEY = "bc-db";
function load(): Record<string, Record<string, unknown>> { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } }
function save(db: Record<string, Record<string, unknown>>) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} }

export const localDb: DatabaseService = {
  async get(c, id) { return (load()[c]?.[id] as any) ?? null; },
  async list(c) { return Object.values(load()[c] || {}) as any; },
  async put(c, doc) { const db = load(); db[c] = db[c] || {}; db[c][doc.id] = doc; save(db); return doc; },
  async remove(c, id) { const db = load(); if (db[c]) delete db[c][id]; save(db); },
};

export const localAuth: AuthService = {
  async currentUser() { return { id: "me", name: "Mara Voss", handle: "maravoss" }; },
  async signIn() {},
  async signOut() {},
};

export const localStorageService: StorageService = {
  async upload(file) { return { url: URL.createObjectURL(file) }; },
};

export const services = { auth: localAuth, db: localDb, storage: localStorageService };
