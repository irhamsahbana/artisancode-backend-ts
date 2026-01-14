// @ts-check

import eslint from '@eslint/js'
import pluginImport from 'eslint-plugin-import'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // General configuration overrides
  {
    ignores: ['src/generated/**'],
  },

  // Base recommended ESLint rules
  eslint.configs.recommended,
  tseslint.configs.strict, // Strict TypeScript rules from typescript-eslint
  tseslint.configs.stylistic, // Stylistic TypeScript rules from typescript-eslint

  // Import ordering and resolver configuration
  {
    plugins: { import: pluginImport },
    settings: {
      // Enable TypeScript-aware import resolution based on tsconfig paths
      'import/resolver': { typescript: true },
    },
    rules: {
      'import/order': ['error', {
        groups: [
          'builtin', 'external', 'internal',
          ['parent', 'sibling', 'index'], 'object', 'type'
        ],
        pathGroups: [
          // Match custom alias imports (e.g., @/**) as "internal"
          { pattern: '@/**', group: 'internal', position: 'before' },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      }],
    },
  },
)
