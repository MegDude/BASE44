import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, functionsVersion, appBaseUrl } = appParams;
const isConfigured = Boolean(appId);

const createEntityStub = () => ({
  list: async () => [],
  filter: async () => [],
  create: async (payload = {}) => payload,
  update: async (_id, payload = {}) => payload,
  delete: async () => true,
  subscribe: () => () => {},
});

const createNoopClient = () => ({
  auth: {
    me: async () => null,
    updateMe: async (payload = {}) => payload,
  },
  functions: {
    invoke: async () => null,
  },
  analytics: {
    track: () => {},
  },
  integrations: {
    Core: {
      InvokeLLM: async () => ({ success: false, reason: 'base44_not_configured' }),
    },
  },
  entities: new Proxy(
    {},
    {
      get: () => createEntityStub(),
    }
  ),
});

export const base44 = isConfigured
  ? createClient({
      appId,
      functionsVersion,
      serverUrl: '',
      requiresAuth: false,
      appBaseUrl,
    })
  : createNoopClient();
