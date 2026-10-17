const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores(['dist/**', '.expo/**', 'node_modules/**']),
  expoConfig,
  {
    settings: {
      react: {
        version: '19.2',
      },
    },
    rules: {
      'import/no-named-as-default': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
]);
