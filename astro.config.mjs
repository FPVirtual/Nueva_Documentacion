// @ts-check
import "dotenv/config";
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Env
const repoUrl = process.env.URL_REPO_DOCS ?? ''

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'My Docs',
			social: [{ icon: 'github', label: 'GitHub', href: repoUrl }],
		}),
	],
});
