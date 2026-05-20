import globals from 'globals';
import { configs as airbnb, plugins as airbnbPlugins } from 'eslint-config-airbnb-extended';
import jsdoc from 'eslint-plugin-jsdoc';
import cypressPlugin from 'eslint-plugin-cypress';

export default [
  {
    ignores: [
      '**/__test__/*',
      '**/assets/*',
      '**/*.scss',
      '**/*.css',
      '**/*.svg',
      'dist/**',
      'build/**',
      'coverage/**',
      'cypress-coverage/**',
      'node_modules/**',
    ],
  },

  airbnbPlugins.importX,
  airbnbPlugins.stylistic,
  airbnbPlugins.typescriptEslint,
  airbnbPlugins.react,
  airbnbPlugins.reactA11y,
  airbnbPlugins.reactHooks,

  ...airbnb.base.all,
  ...airbnb.react.all,

  jsdoc.configs['flat/recommended'],

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        JSX: 'readonly',
        RequestInit: 'readonly',
        BodyInit: 'readonly',
        NodeJS: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      'import-x/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'react/require-default-props': 'off',
      'linebreak-style': 'off',
      'react/jsx-filename-extension': [
        'error',
        { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      ],
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/cypress.config.ts',
            '**/cypress/**/*.js',
            '**/cypress/**/*.ts',
            '**/*.test.js',
            '**/*.spec.js',
          ],
        },
      ],
      'import-x/extensions': [
        'error',
        'ignorePackages',
        { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
      ],
      'import-x/prefer-default-export': 'off',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: ['function-declaration', 'arrow-function'],
          unnamedComponents: 'arrow-function',
        },
      ],
      'jsx-a11y/label-has-associated-control': ['error', { depth: 3 }],
      'no-shadow': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/tag-lines': 'off',

      '@stylistic/comma-dangle': ['error', 'never'],
      '@stylistic/max-len': 'off',
      '@stylistic/semi': 'off',
      '@stylistic/member-delimiter-style': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/brace-style': 'off',
      '@stylistic/space-infix-ops': 'off',
      '@stylistic/type-annotation-spacing': 'off',
      '@stylistic/operator-linebreak': 'off',

      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/prefer-find': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-unnecessary-template-expression': 'off',
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@stylistic/max-statements-per-line': 'off',
      'import-x/no-named-as-default': 'off',

      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/rules-of-hooks': 'warn',

      'prefer-object-has-own': 'off',
      'import-x/no-cycle': 'warn',
      'import-x/no-rename-default': 'warn',
      'jsdoc/reject-any-type': 'off',
    },
  },

  {
    files: ['cypress/**/*.{js,jsx,ts,tsx}', 'cypress.config.ts'],
    plugins: { cypress: cypressPlugin },
    languageOptions: {
      globals: {
        ...globals.mocha,
        cy: 'readonly',
        Cypress: 'readonly',
      },
    },
    rules: {
      'cypress/no-assigning-return-values': 'error',
      'cypress/no-unnecessary-waiting': 'error',
      'cypress/assertion-before-screenshot': 'warn',
      'cypress/no-force': 'warn',
      'cypress/no-async-tests': 'error',
      'cypress/no-pause': 'error',
    },
  },
];
