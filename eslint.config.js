import globals from 'globals'
import js from '@eslint/js'
import ts from 'typescript-eslint'
import parser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'

/** @type{import('eslint').Linter.Config[]} */
const config = [
  { ignores: ['node_modules', 'dist'] },
  {
    files: ['**/*.{js,ts}'],
    plugins: {
      '@typescript-eslint': ts,
      prettier
    },
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    },
    rules: {
      ...js.configs.recommendedTypeChecked,
      ...ts.configs.recommended.rules,
      ...prettier.configs.recommended.rules
    }
  }
]

export default config
