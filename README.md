# kopi

A handwritten log of the coffee I brew, and the beans and roasteries I've tried. Built with Astro as a fully static site and deployed to Cloudflare with [Alchemy](https://alchemy.run).

## Develop

```sh
bun install
bun dev
```

Entries live in `src/data/`: `roasteries.yaml`, `beans.yaml`, and `brews.yaml`. A bean references a roastery by `id`, and a brew references a bean.

To log a brew, run `bun run brew`. It asks for each field, defaults to the last brew of the same bean, and appends the entry to `brews.yaml`.

## Deploy

`alchemy.run.ts` declares the site as `Cloudflare.Website.Astro`. Every page is prerendered, so Cloudflare serves static assets only and no Worker code runs per request. Deploy state lives in your Cloudflare account through `Cloudflare.state()`, so local and CI deploys share it.

Deploy from your machine:

```sh
bunx alchemy profile edit --add Cloudflare   # once
bun run deploy --stage prod
```

### GitHub Actions

`.github/workflows/deploy.yml` deploys `prod` to https://kopi.elianiva.my.id on every push to `master`. Each pull request gets its own `pr-<number>` stage with the preview URL posted as a comment, and closing the pull request destroys that stage.

The workflow needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets. `stacks/github.ts` mints a token scoped to this account and writes both secrets. Run it once with a profile that can create API tokens. Cloudflare OAuth can't, so use the Global API Key or a token with API Tokens Write:

```sh
bunx alchemy profile create admin
bunx alchemy profile edit --profile admin --add Cloudflare
bunx alchemy profile edit --profile admin --add GitHub
bunx alchemy deploy --config stacks/github.ts --profile admin
```

Run it again to rotate the token.
