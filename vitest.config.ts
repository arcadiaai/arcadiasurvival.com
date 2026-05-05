import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    cloudflareTest({
      miniflare: {
        compatibilityDate: '2024-09-23',
        kvNamespaces: ['WAITLIST_EMAILS', 'WAITLIST_RATELIMIT'],
        bindings: {
          DAILY_SALT: 'test-salt-do-not-use-in-prod',
        },
      },
    }),
  ],
  test: {
    include: ['tests/functions/**/*.test.ts'],
    passWithNoTests: true,
  },
});
