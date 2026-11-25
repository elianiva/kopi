import * as Cloudflare from "@alchemy.run/cloudflare";
import * as GitHub from "@alchemy.run/github";
import * as Alchemy from "alchemy";
import { Stage } from "alchemy/Stage";
import * as Output from "alchemy/Output";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const domain = "kopi.elianiva.com";

// Every page is prerendered, so this deploys static assets only: no Worker
// code runs per request. Cloudflare serves dist/404.html for unknown paths.
// Only prod gets the custom domain; previews stay on workers.dev.
export const Website = Cloudflare.Website.Astro(
	"Website",
	Effect.gen(function* () {
		const prod = (yield* Stage) === "prod";
		return {
			astro: { output: "static" },
			assets: { notFoundHandling: "404-page" },
			domain: prod ? domain : undefined,
		} as const;
	}),
);

export default Alchemy.Stack(
	"kopi",
	{
		providers: Layer.mergeAll(Cloudflare.providers(), GitHub.providers()),
		state: Cloudflare.state(),
	},
	Effect.gen(function* () {
		const site = yield* Website;

		// On pull requests, post the preview URL and keep the comment updated.
		const github = yield* GitHub.GitHubEnv;
		if (github?.pr) {
			yield* GitHub.Comment("preview-comment", {
				owner: github.owner,
				repository: github.repository,
				issueNumber: github.pr,
				body: Output.interpolate`Preview: ${site.url}\n\nBuilt from ${github.sha.slice(0, 7)}.`,
			});
		}

		return { url: site.url };
	}),
);
