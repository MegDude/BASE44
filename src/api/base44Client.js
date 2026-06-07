import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Public-first client: auth can hydrate an existing user, but viewing the app never requires sign-in.
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});
