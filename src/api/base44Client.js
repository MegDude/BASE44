import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;
const isBrowser = typeof window !== "undefined";
const isLocalApp = isBrowser && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
const shouldUseRemoteBase44 = Boolean(token) && !isLocalApp;
const LOCAL_USER = {
  id: "resident-local",
  email: "resident@downtownperks.local",
  full_name: "Downtown Perks Resident",
  role: "resident",
};

function localEntityStore(entityName) {
  const key = `dp_base44_local:${entityName}`;
  const read = () => {
    if (!isBrowser) return [];
    try {
      return JSON.parse(window.localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };
  const write = (items) => {
    if (!isBrowser) return;
    window.localStorage.setItem(key, JSON.stringify(items));
  };

  return {
    async list() {
      return read();
    },
    async filter(query = {}, _sort, limit) {
      const entries = read().filter((item) =>
        Object.entries(query || {}).every(([field, value]) => item?.[field] === value)
      );
      return typeof limit === "number" ? entries.slice(0, limit) : entries;
    },
    async create(payload = {}) {
      const item = {
        id: payload.id || `${entityName.toLowerCase()}-${Date.now()}`,
        created_date: new Date().toISOString(),
        ...payload,
      };
      write([item, ...read()]);
      return item;
    },
    async update(id, payload = {}) {
      const entries = read();
      const index = entries.findIndex((item) => item.id === id);
      const item = { ...(index >= 0 ? entries[index] : { id }), ...payload, updated_date: new Date().toISOString() };
      if (index >= 0) entries[index] = item;
      else entries.unshift(item);
      write(entries);
      return item;
    },
    async delete(id) {
      write(read().filter((item) => item.id !== id));
      return { success: true };
    },
    subscribe() {
      return () => {};
    },
  };
}

const localBase44 = {
  auth: {
    async me() {
      return LOCAL_USER;
    },
    async isAuthenticated() {
      return false;
    },
    async updateMe(data = {}) {
      return { ...LOCAL_USER, ...data };
    },
    logout() {
      if (!isBrowser) return;
      window.localStorage.removeItem("base44_access_token");
      window.localStorage.removeItem("token");
    },
  },
  functions: {
    async invoke(functionName, payload = {}) {
      if (isBrowser && functionName === "getSharedMapFeed") {
        const response = await fetch("/api/ask-map", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => null);
        if (response?.ok) return response.json();
      }
      return { data: null, items: [], success: true };
    },
  },
  analytics: {
    track() {},
  },
  entities: new Proxy({}, {
    get(_target, entityName) {
      return localEntityStore(String(entityName));
    },
  }),
};

// Public-first client: auth can hydrate an existing user, but viewing the app never requires sign-in.
export const base44 = shouldUseRemoteBase44
  ? createClient({
      appId,
      token,
      functionsVersion,
      serverUrl: '',
      requiresAuth: false,
      appBaseUrl
    })
  : localBase44;
