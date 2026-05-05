// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://arcadiasurvival.com',
  output: 'static',
  integrations: [sitemap()],
  trailingSlash: 'never',
  build: { format: 'file' },
});
