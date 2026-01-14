# Preparation

## ESLint and Prettier Setup

This document outlines the steps to configure ESLint and Prettier in this project to ensure code consistency and quality.

## 1. Install Dependencies

Ensure you are using `pnpm` as the package manager. Install all necessary dev dependencies with the following command:

```bash
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-import eslint-import-resolver-typescript @eslint/js typescript-eslint husky lint-staged
```

## 2. Configure ESLint

This project uses the latest ESLint configuration format (**flat config**).

Create an `eslint.config.mjs` file in the root directory with the following content:

```javascript
// eslint.config.mjs
import eslint from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // Base recommended ESLint rules
  eslint.configs.recommended,

  // Recommended TypeScript rules
  ...tseslint.configs.recommended,

  // Prettier compatibility (disables conflicting ESLint rules)
  prettierConfig,

  // Ignore generated and build files
  {
    ignores: ['node_modules', 'dist', 'coverage', 'src/generated/**'],
  },

  // Import plugin configuration
  {
    plugins: { import: pluginImport },
    settings: {
      // Enable TypeScript-aware import resolution based on tsconfig paths
      'import/resolver': { typescript: true },
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type',
          ],
          pathGroups: [
            // Match custom alias imports (e.g., @/**) as "internal"
            { pattern: '@/**', group: 'internal', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
);
```

## 3. Configure Prettier

Create a `.prettierrc.json` file to define Prettier's rules.

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "tabWidth": 2
}
```

Next, create a `.prettierignore` file to tell Prettier which files or directories to ignore.

```bash
node_modules
dist
coverage
.env
```

## 4. Add Scripts to `package.json`

Ensure the following scripts exist in your `package.json`:

```json
"scripts": {
  "test": "jest",
  "dev": "ts-node-dev --respawn --transpile-only -r tsconfig-paths/register src/index.ts",
  "prisma:migrate": "prisma migrate dev --name $name",
  "lint": "eslint --ext .ts src --fix",
  "format": "prettier --write \"src/**/*.{ts,js,json}\"",
  "lint:fix": "eslint --ext .ts src --fix && prettier --write \"src/**/*.{ts,js,json}\"",
  "type-check": "tsc --noEmit",
  "lint-staged": "lint-staged",
  "prepare": "husky"
}
```

## 5. Configure Lint-Staged

In this project, `lint-staged` is configured in `package.json`:

```json
"lint-staged": {
  "*.ts": [
    "eslint --fix"
  ]
}
```

This means that whenever you commit, ESLint will automatically fix issues in staged `.ts` files before committing. If you also want Prettier to run on staged files, you can modify it like this:

```json
"lint-staged": {
  "*.ts": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

## 6. Configure Husky

Husky is used to automatically run scripts on git hooks.

1. Initialize Husky:

   ```bash
   pnpm run prepare
   ```

2. Create the pre-commit hook:

   ```bash
   npx husky add .husky/pre-commit "pnpm lint-staged"
   ```

After completing all the steps above, ESLint and Prettier will run automatically every time you `git commit`. This will help maintain a consistent and high-quality codebase.
