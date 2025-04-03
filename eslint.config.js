const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');
const path = require('node:path');

const RULES = {
  OFF: 'off',
  WARN: 'warn',
  ERROR: 'error',
};

module.exports = [
  js.configs.recommended,
  prettier,
  {
    ignores: ['node_modules', 'dist', 'eslint.config.js'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [path.resolve(process.cwd(), 'tsconfig.json')],
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        node: {
          paths: ['src'],
          extensions: ['.js', '.ts'],
        },
      },
    },
    rules: {
      quotes: [RULES.ERROR, 'single'],
      semi: [RULES.ERROR, 'always'],
      '@typescript-eslint/no-unused-vars': RULES.WARN,
      '@typescript-eslint/no-shadow': RULES.WARN,
      '@typescript-eslint/no-misused-promises': RULES.WARN,
      '@typescript-eslint/no-unnecessary-type-assertion': RULES.WARN,
      '@typescript-eslint/strict-boolean-expressions': RULES.WARN,
      '@typescript-eslint/no-floating-promises': RULES.WARN,
      '@typescript-eslint/restrict-template-expressions': RULES.WARN,
      '@typescript-eslint/await-thenable': RULES.WARN,
      '@typescript-eslint/no-for-in-array': RULES.WARN,
      '@typescript-eslint/no-unnecessary-type-arguments': RULES.WARN,
      '@typescript-eslint/no-unsafe-call': RULES.WARN,
      'import/order': [
        RULES.ERROR,
        {
          alphabetize: { order: 'asc' },
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
        },
      ],
    },
  },
  ...tseslint.configs.recommendedTypeChecked,
];
