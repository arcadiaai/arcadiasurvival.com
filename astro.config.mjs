// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://arcadiasurvival.com',
  output: 'static',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  trailingSlash: 'never',
  build: { format: 'file' },
});
