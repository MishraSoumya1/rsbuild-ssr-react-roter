import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import moduleFederationConfig from './module-federation.config';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginSvgr({
      svgrOptions: {
        exportType: 'named',
        icon: true,
      },
    }),
  ],
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
    rspack(config, { appendPlugins, mergeConfig, env, target }) {
      config.output!.uniqueName = 'host_starter_ssr_mfe';
      const isSSR = target === 'node';
      const mfConfig = { ...moduleFederationConfig };

      if (isSSR) {
        mfConfig.library = { type: 'commonjs-module' };
      }

      appendPlugins([new ModuleFederationPlugin(mfConfig)]);

      if (isSSR) {
        mergeConfig({
          externals: [/^@module-federation\/enhanced/],
          target: 'node',
        });
      }
    },
  },
});
