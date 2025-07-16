import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';
import { dependencies as deps } from './package.json';

export default createModuleFederationConfig({
  name: 'host_starter_ssr_mfe',
  filename: 'remoteEntry.js',
  remotes: {},
  shared: [
    {
      react: {
        singleton: true,
        requiredVersion: deps.react,
        eager: true,
      },
      'react-dom': {
        singleton: true,
        requiredVersion: deps['react-dom'],
        eager: true,
      },
    },
  ],
  dts: false,
});
