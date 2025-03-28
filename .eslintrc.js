const RULES = {
  OFF: 'off',
  WARN: 'warn',
  ERROR: 'error',
};

module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'standard',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'import/newline-after-import': RULES.ERROR,
    'import/extensions': [RULES.ERROR, { ts: 'never' }],
    'import/order': [
      RULES.ERROR,
      {
        alphabetize: { order: 'asc' },
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'never',
      },
    ],
    '@typescript-eslint/camelcase': RULES.OFF,
    '@typescript-eslint/explicit-function-return-type': RULES.OFF,
    '@typescript-eslint/explicit-member-accessibility': [
      RULES.ERROR,
      { accessibility: 'no-public' },
    ],
    '@typescript-eslint/member-delimiter-style': RULES.OFF,
    '@typescript-eslint/explicit-module-boundary-types': RULES.OFF,

    '@typescript-eslint/indent': [RULES.ERROR, 2],
    indent: RULES.OFF,

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-redeclare.md
    'no-redeclare': RULES.OFF,
    '@typescript-eslint/no-redeclare': [RULES.ERROR],

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-empty-function.md
    'no-empty-function': RULES.OFF,
    '@typescript-eslint/no-empty-function': [RULES.ERROR],

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-shadow.md
    'no-shadow': RULES.OFF,
    '@typescript-eslint/no-shadow': [RULES.ERROR],

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-use-before-define.md
    'no-use-before-define': RULES.OFF,
    '@typescript-eslint/no-use-before-define': RULES.ERROR,

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-duplicate-imports.md
    'no-duplicate-imports': RULES.OFF,
    '@typescript-eslint/no-duplicate-imports': RULES.ERROR,

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-expressions.md
    'no-unused-expressions': RULES.OFF,
    '@typescript-eslint/no-unused-expressions': [RULES.ERROR],

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-vars.md
    'no-unused-vars': RULES.OFF,
    '@typescript-eslint/no-unused-vars': [RULES.ERROR],

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/return-await.md
    // 'return-await': RULES.OFF,
    // '@typescript-eslint/return-await': [RULES.ERROR],

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-invalid-this.md
    'no-invalid-this': RULES.OFF,
    '@typescript-eslint/no-invalid-this': [RULES.ERROR],

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/init-declarations.md
    'init-declarations': RULES.OFF,
    '@typescript-eslint/init-declarations': RULES.OFF,
    quotes: [RULES.ERROR, 'single'],
    semi: [RULES.ERROR, 'always', { omitLastInOneLineBlock: true }],
    'comma-dangle': [
      RULES.OFF,
      {
        arrays: 'never',
        objects: 'never',
        imports: 'never',
        exports: 'never',
        functions: 'never',
      },
    ],
  },
};
