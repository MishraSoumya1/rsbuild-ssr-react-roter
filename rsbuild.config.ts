import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  environments: {
    web: {
      output: {
        target: 'web',
        manifest: true,
        polyfill: 'usage',
      },
      source: {
        entry: {
          index: './src/index',
        },
      },
    },
    ssr: {
      output: {
        polyfill: 'usage',
        target: 'node',
        distPath: {
          root: 'dist/server',
        },
      },
      source: {
        entry: {
          index: './src/index.server',
        },
      },
    },
  },
  tools: {
    htmlPlugin: false,
    rspack(config, { appendPlugins, mergeConfig }) {},
  },
});
