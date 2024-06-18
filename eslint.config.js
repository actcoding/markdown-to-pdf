import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

/** @type {import('eslint').Linter.FlatConfig} */
const config = [
    {
        languageOptions: {
            globals: globals.node,
        }
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            'indent': [
                'error',
                4
            ],
            'linebreak-style': [
                'error',
                'unix'
            ],
            'quotes': [
                'error',
                'single'
            ],
            'semi': [
                'error',
                'never'
            ],
            'no-case-declarations': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    'varsIgnorePattern': '^_.*'
                }
            ]
        }
    }
]

export default config
