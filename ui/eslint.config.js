// Flat config (ESLint 10) — @eslint/js recommended rules only, per the
// estate's docs/standards/pipeline-testing.md §6a. No Prettier.
// ui/dist is committed build output, not source — never linted.
//
// src/plugin.jsx is JSX compiled by esbuild against host.h (see
// vite.config.js), so the parser needs ecmaFeatures.jsx on — espree cannot
// read the file at all without it.
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    files: ['vite.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
