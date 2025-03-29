import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

const RULES = {
  OFF: 'off',
  WARN: 'warn',
  ERROR: 'error',
};

export default [
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
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
    },
    rules: {
      quotes: [RULES.ERROR, 'single'],
      semi: [RULES.ERROR, 'always'],
      '@typescript-eslint/no-unused-vars': [RULES.ERROR],
      '@typescript-eslint/no-shadow': [RULES.ERROR],
      '@typescript-eslint/no-misused-promises': RULES.ERROR,
      '@typescript-eslint/no-unnecessary-type-assertion': RULES.ERROR,
      '@typescript-eslint/strict-boolean-expressions': RULES.ERROR,
      '@typescript-eslint/no-floating-promises': RULES.ERROR,
      '@typescript-eslint/restrict-template-expressions': RULES.ERROR,
      '@typescript-eslint/await-thenable': RULES.ERROR,
      '@typescript-eslint/no-for-in-array': RULES.ERROR,
      '@typescript-eslint/no-unnecessary-type-arguments': RULES.ERROR,
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
  ...tseslint.configs.strictTypeChecked,
];
