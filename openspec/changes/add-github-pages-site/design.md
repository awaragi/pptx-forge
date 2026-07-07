## Context

pptx-forge is a public repo with a single `master` branch. `pptx-forge.html` (the browser tool) is intentionally gitignored — it's a generated artifact, rebuilt from `src/` via `npm run build:browser`, and only ever published as a GitHub Releases asset (`.github/workflows/release.yml`, tag-triggered). There is currently no GitHub Pages site (`gh api repos/awaragi/pptx-forge/pages` → 404) and no `Website` field set on the repo.

The goal is a Pages site with a dedicated landing page (`src/pages/index.html`) where visitors can immediately open the live browser tool, plus a link back to the GitHub repo.

## Goals / Non-Goals

**Goals:**
- `src/pages/index.html` is the homepage — a focused landing page, not the developer-oriented README.
- The live browser tool is reachable at a stable Pages URL and opens directly in-browser.
- `pptx-forge.html` stays gitignored on `master` — this change must not require committing the generated artifact to any branch.
- The Pages site rebuilds only on version tags, matching the cadence of `release.yml`, so the hosted tool is always exactly the last officially released version.
- `index.html` is plain HTML/CSS — no framework, no build step, easy to maintain and easy to replace with a designed mockup in a later pass.

**Non-Goals:**
- Not using Jekyll or any markdown rendering — the site is assembled manually.
- Not changing `release.yml` or the Releases-based distribution.
- Not adding a custom domain.
- Not redesigning README content beyond adding one link.

## Decisions

**1. Pages source = "GitHub Actions", not "Deploy from a branch".**
The classic branch-deploy mode needs the published artifact to actually live in a git ref (typically a `gh-pages` branch), which would mean either committing the generated `pptx-forge.html` (conflicts with the existing gitignore design and bloats history with a 470KB+ minified blob every release) or standing up a bot-maintained orphan branch just to hold build output. The Actions-based deploy instead builds directly from the runner's filesystem at workflow time — `npm run build:browser` writes `pptx-forge.html` to disk, and that's enough for the Pages build step to pick it up. Nothing needs to be committed anywhere.

**2. No Jekyll — assemble `_site/` manually.**
The original design planned to use `actions/jekyll-build-pages` to get free README-as-homepage rendering. With a hand-authored `index.html`, Jekyll adds no value and introduces complexity (Jekyll install, `_config.yml` exclusions, risk of Jekyll trying to process `node_modules`). The `pages.yml` workflow instead assembles `_site/` directly: copy `src/pages/index.html` → `_site/index.html`, copy freshly-built `pptx-forge.html` → `_site/pptx-forge.html`, then run `actions/upload-pages-artifact` + `actions/deploy-pages`. Two files, no pipeline.

**3. Landing page lives at `src/pages/index.html`, not repo root.**
Keeping the source HTML under `src/pages/` is consistent with where other browser tool source lives (`src/tools/browser/`), avoids polluting the repo root, and makes it clear this file is built/published content rather than a project config file. The `pages.yml` workflow copies it to `_site/index.html` at deploy time.

**4. `pages.yml` triggers on the same tag pattern as `release.yml`, as a separate workflow file.**
Considered folding this into `release.yml` as an additional job. Kept it separate because Pages deployment needs its own permissions block (`pages: write`, `id-token: write`) and its own `environment: github-pages`, and a failure in the Pages deploy should never block or be conflated with the Releases publish step (`gh release create`). Same trigger, independent workflows.

**5. README links to the hosted tool with an absolute URL.**
`pptx-forge.html` is never committed to `master`, so a relative link would 404 when README is viewed on github.com. An absolute URL to `https://awaragi.github.io/pptx-forge/pptx-forge.html` behaves identically in both contexts.

## Risks / Trade-offs

- **[Risk]** First deploy requires a manual repo Settings change (Pages source → "GitHub Actions") → **Mitigation**: called out explicitly as a manual task in tasks.md.
- **[Risk]** Because Pages only redeploys on tags, landing page edits pushed to `master` won't appear on the live site until the next release tag → **Mitigation**: accepted trade-off; the landing page is a stable marketing surface unlikely to need hotfixes between releases.
- **[Risk]** `actions/deploy-pages` requires the `github-pages` environment to exist and be unrestricted → **Mitigation**: GitHub auto-creates this on first run with no protection rules by default; flagged as something to verify if first deploy fails.
- **[Risk]** `index.html` will be replaced by a designed mockup later, but the placeholder gets deployed immediately on the next tag → **Mitigation**: acceptable; the placeholder is functional and correct, just unstyled. The mockup is a follow-on change.

## Migration Plan

1. Merge `src/pages/index.html`, `.github/workflows/pages.yml`, and the README link change to `master`.
2. Repo owner manually flips Settings → Pages → Source to "GitHub Actions" (see tasks.md).
3. Next version tag push (via `npm run release`) triggers both `release.yml` and `pages.yml`; confirm the Pages deploy succeeds and the site is reachable.
4. Rollback: disabling Pages (Settings → Pages → Source → "None") or reverting/deleting `pages.yml` fully removes the site with no impact on `release.yml` or Releases distribution.

## Open Questions

None outstanding — approach (`index.html` under `src/pages/`, no Jekyll, tag-only deploy) confirmed with repo owner.
