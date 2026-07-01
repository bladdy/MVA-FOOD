/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				display: ['"Playfair Display"', 'Georgia', 'serif'],
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				cream: '#fdf6ee',
				warm: {
					400: '#8c735f',
					500: '#6b6560',
				},
				orange: {
					50: '#fff7ed',
					100: '#ffedd5',
					200: '#fed7aa',
					300: '#fdba74',
					400: '#fb923c',
					500: '#ea580c',
					600: '#c2410c',
					700: '#9a3412',
				},
			},
			boxShadow: {
				'card': '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
				'card-hover': '0 8px 24px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
				'drawer': '-4px 0 24px rgba(0,0,0,0.12)',
			},
		},
	},
	plugins: [],
}
