import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import pluginRouter from '@tanstack/eslint-plugin-router';
import unusedImports from 'eslint-plugin-unused-imports';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.html', 'vite.config.d.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier,
      '@tanstack/router': pluginRouter,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.app.json', './tsconfig.node.json'],
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-shadow': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@tanstack/router/create-route-property-order': 'warn',
      'prettier/prettier': [
        'warn',
        {
          arrowParens: 'always',
          jsxSingleQuote: true,
          trailingComma: 'all',
          tabWidth: 2,
          semi: true,
          singleQuote: true,
          useTabs: false,
          endOfLine: 'auto',
          printWidth: 150,
          bracketSameLine: false,
        },
      ],

      'linebreak-style': 'off',

      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/**'],
              message: 'Features must not import from the app layer. Compose them at the route or app-shell level.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: [
                '@/features/*/api/**',
                '@/features/*/components/**',
                '@/features/*/hooks/**',
                '@/features/*/pages/**',
                '@/features/*/screens/**',
                '@/features/*/schemas/**',
                '@/features/*/types/**',
                '@/features/*/enums/**',
                '@/features/*/constants/**',
                '@/features/*/utils/**',
                '@/features/*/*/api/**',
                '@/features/*/*/components/**',
                '@/features/*/*/hooks/**',
                '@/features/*/*/pages/**',
                '@/features/*/*/screens/**',
                '@/features/*/*/schemas/**',
                '@/features/*/*/types/**',
                '@/features/*/*/enums/**',
                '@/features/*/*/constants/**',
                '@/features/*/*/utils/**',
              ],
              message: 'Import from the feature or sub-feature public API instead of internal feature modules.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/shared/**/*.{ts,tsx}', 'src/components/ui/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}', 'src/utils/**/*.{ts,tsx}', 'src/types/**/*.{ts,tsx}', 'src/enums/**/*.{ts,tsx}', 'src/constants/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: ['@/app/**', '@/features/**'],
              message: 'Shared layers must not depend on app composition or feature business modules.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.d.ts', '**/*.config.*', 'scripts/**/*'],
    languageOptions: {
      parserOptions: {
        project: false,
      },
      globals: {
        ...globals.node,
        Bun: 'readonly',
      },
    },
    rules: {
      'import/order': 'off',
    },
  },
  // Disable rules that conflict with Prettier
  eslintConfigPrettier,
];
