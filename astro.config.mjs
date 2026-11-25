// @ts-check
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
	// Every page is static HTML. Prefetch links as they scroll into view so
	// the next page is already in cache when you tap it.
	prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Kalam",
			cssVariable: "--font-hand",
			weights: [300, 400, 700],
			subsets: ["latin"],
			fallbacks: ["cursive"],
		},
		{
			provider: fontProviders.google(),
			name: "Caveat Brush",
			cssVariable: "--font-marker",
			weights: [400],
			subsets: ["latin"],
			fallbacks: ["cursive"],
		},
		{
			provider: fontProviders.google(),
			name: "Special Elite",
			cssVariable: "--font-type",
			weights: [400],
			subsets: ["latin"],
			fallbacks: ["monospace"],
		},
	],
});
