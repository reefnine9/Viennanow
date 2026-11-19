import type { CapacitorConfig } from '@capacitor/cli';

// Phase 35: bundled assets rather than loading an arbitrary remote URL.
// The native build must use an explicit production API origin for Cloudflare Pages Functions.
const config: CapacitorConfig = {
  appId: 'app.viennanow.travel',
  appName: 'ViennaNow',
  appendUserAgent: 'ViennaNow (+https://viennanow.pages.dev)',
  webDir: 'dist-native',
  bundledWebRuntime: false,
  ios: { contentInset: 'automatic' },
  android: { allowMixedContent: false }
};
export default config;
