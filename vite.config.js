import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig(() => {
  const target = process.env.VITE_BUILD_TARGET || 'config';
  const inputMap = {
    config: path.resolve(__dirname, 'src/js/config.js'),
    desktop: path.resolve(__dirname, 'src/js/desktop.js'),
  };
  return {
    plugins: [vue(), cssInjectedByJsPlugin()],
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: { [target]: inputMap[target] },
        output: {
          dir: 'dist',
          entryFileNames: `js/${target}.js`,
          assetFileNames: (assetInfo) => {
            if (assetInfo.fileName && assetInfo.fileName.endsWith('.css')) {
              return `css/${target}.css`;
            }
            if (assetInfo.fileName && assetInfo.fileName.endsWith('.html')) {
              return `html/${target}.html`;
            }
            if (assetInfo.fileName && /\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.fileName)) {
              return 'image/[name].[ext]';
            }
            return 'assets/[name].[ext]';
          },
          format: 'iife',
          inlineDynamicImports: true,
          name: `${target}Plugin`,
        },
      },
      sourcemap: 'inline',
      emptyOutDir: false,
    },
  };
});
