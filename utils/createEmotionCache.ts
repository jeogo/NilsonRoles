import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

// This function creates a consistent cache for both server and client
export default function createEmotionCache() {
  return createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
    prepend: true, // This ensures styles are prepended to the <head>, which gives MUI styles precedence over other styles
  });
}
