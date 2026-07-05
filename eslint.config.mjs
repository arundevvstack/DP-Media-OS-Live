import nextPlugin from '@next/eslint-plugin-next';

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'src/app/production/**',
      'src/app/api/**',
      'src/lib/production/**',
      'src/app/(dashboard)/**',
      'src/ai/**',
      'tests/**'
    ]
  },
  {
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    }
  }
];
