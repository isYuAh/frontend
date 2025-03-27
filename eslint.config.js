import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {ignores: ['dist']},
    {
        extends: [
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
        ],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
)
