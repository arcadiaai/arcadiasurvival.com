// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://arcadiasurvival.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
});
