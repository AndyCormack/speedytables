import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import ts from 'typescript-eslint';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: { parserOptions: { parser: ts.parser } }
	},
	{
		// core stays framework-free; the package graph enforces imports, this guards accidents
		files: ['packages/core/**'],
		rules: {
			'no-restricted-imports': ['error', { patterns: ['svelte', 'svelte/*', '$app/*', '$lib/*'] }]
		}
	},
	{
		ignores: ['**/dist/', '**/build/', '**/.svelte-kit/', '.wip/', 'tools/bench/results/']
	}
);
