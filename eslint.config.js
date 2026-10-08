import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Llamar fetch functions desde useEffect es un patrón válido en este proyecto
      'react-hooks/set-state-in-effect': 'off',
      // Inmutabilidad es advertencia, no error bloqueante
      'react-hooks/immutability': 'warn',
      // Dependencias de hooks: advertencia para no bloquear el build
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])

