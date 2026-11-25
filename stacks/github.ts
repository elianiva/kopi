// Run once, locally, to give GitHub Actions its deploy credentials:
//   bun alchemy deploy --config stacks/github.ts --profile admin
// It mints a Cloudflare API token scoped to this account and stores it, with
// the account ID, as repository secrets. Re-run to rotate the token.
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as GitHub from "@alchemy.run/github";
import * as Alchemy from "alchemy";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

const repo = { owner: "elianiva", repository: "kopi" };

export default Alchemy.Stack(
	"kopi-github",
	{
		providers: Layer.mergeAll(Cloudflare.providers(), GitHub.providers()),
		state: Cloudflare.state(),
	},
	Effect.gen(function* () {
		const { accountId } = yield* yield* Cloudflare.CloudflareEnvironment;

		const token = yield* Cloudflare.ApiToken.AccountApiToken("CIToken", {
			accountId,
			policies: [
				{
					effect: "allow",
					// Workers and assets for the site; Secrets Store, KV, and
					// account settings for Alchemy's state store.
					permissionGroups: [
						"Workers Scripts Write",
						"Workers KV Storage Write",
						"Account Settings Write",
						"Secrets Store Write",
						"Workers Tail Read",
					],
					resources: {
						[`com.cloudflare.api.account.${accountId}`]: "*",
					},
				},
				{
					effect: "allow",
					// The kopi.elianiva.com custom domain (DNS record and
					// certificate) and the redirect from kopi.elianiva.my.id.
					permissionGroups: [
						"Zone Read",
						"DNS Write",
						"Workers Routes Write",
						"SSL and Certificates Write",
						"Dynamic URL Redirects Write",
					],
					resources: {
						[`com.cloudflare.api.account.${accountId}`]: {
							"com.cloudflare.api.account.zone.*": "*",
						},
					},
				},
			],
		});

		yield* GitHub.Secret("cf-api-token", {
			...repo,
			name: "CLOUDFLARE_API_TOKEN",
			value: token.value,
		});
		yield* GitHub.Secret("cf-account-id", {
			...repo,
			name: "CLOUDFLARE_ACCOUNT_ID",
			value: Redacted.make(accountId),
		});
	}),
);
