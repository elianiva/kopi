// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	site: "https://kopi.elianiva.com",
	integrations: [sitemap()],
	// Every page is static HTML. Prefetch links as they scroll into view so
	// the next page is already in cache when you tap it.
	prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
	// Write brews.html instead of brews/index.html. Cloudflare then serves
	// /brews directly instead of redirecting it to /brews/.
	build: { format: "file" },
	trailingSlash: "never",
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Kalam",
			cssVariable: "--font-hand",
			weights: [400, 700],
			subsets: ["latin"],
			fallbacks: ["cursive"],
		},
		// Google serves these two whole (about 52 KB each). The local files are
		// subsets of the Google fonts with pyftsubset, limited to the ranges
		// below. Special Elite only draws uppercased labels, so it has no
		// lowercase. Characters outside a range fall back to the next font.
		{
			provider: fontProviders.local(),
			name: "Caveat Brush",
			cssVariable: "--font-marker",
			fallbacks: ["cursive"],
			options: {
				variants: [
					{
						src: ["./src/assets/fonts/caveat-brush.woff2"],
						weight: 400,
						style: "normal",
						unicodeRange: [
							"U+0020-007E",
							"U+00B7",
							"U+00E9",
							"U+2019",
							"U+2026",
						],
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: "Special Elite",
			cssVariable: "--font-type",
			fallbacks: ["monospace"],
			options: {
				variants: [
					{
						src: ["./src/assets/fonts/special-elite.woff2"],
						weight: 400,
						style: "normal",
						unicodeRange: [
							"U+0020-0060",
							"U+007B-007E",
							"U+00B0",
							"U+00B7",
							"U+2013-2014",
						],
					},
				],
			},
		},
	],
});
