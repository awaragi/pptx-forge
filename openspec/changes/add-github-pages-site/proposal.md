## Why

The repo has no public-facing landing page — anyone finding pptx-forge on GitHub has to read raw README.md and then separately download `pptx-forge.html` from Releases before they can try the browser tool. Publishing a GitHub Pages site turns the README into a real homepage and lets visitors open the live browser tool directly, with zero download step.

## What Changes

- Enable GitHub Pages for the repo, built via GitHub Actions (not the legacy "deploy from branch" mode).
- Add `.github/workflows/pages.yml`, triggered on the same tag pattern as `release.yml` (`[0-9]+.[0-9]+.[0-9]+`), which builds `pptx-forge.html` from source, assembles a `_site/` directory containing `index.html` and `pptx-forge.html`, and deploys it via `actions/upload-pages-artifact` + `actions/deploy-pages`. No Jekyll involved — the site is assembled manually so no `_config.yml` or markdown rendering pipeline is needed.
- Add `src/pages/index.html` — a hand-authored, self-contained landing page (no build step, no framework) that links to the hosted browser tool and back to the GitHub repo. Designed to be replaced with a refined mockup in a later pass.
- Update README.md to add an absolute link to the hosted tool (`https://awaragi.github.io/pptx-forge/pptx-forge.html`) — an absolute URL is required because `pptx-forge.html` is gitignored and never committed, so a relative link would 404 when README is viewed on github.com itself.
- **Manual (not automatable by this change)**: repo owner must flip Settings → Pages → Source to "GitHub Actions", and may optionally set the repo's Website field to the Pages URL. These are called out explicitly in tasks.md as steps to execute by hand.

## Capabilities

### New Capabilities
- `github-pages-site`: GitHub Pages publishing of a dedicated `index.html` landing page plus the live browser tool, rebuilt and redeployed on every version tag push.

### Modified Capabilities
(none — `release-pipeline` and `release.yml` are untouched; this change adds a parallel, independent workflow on the same tag trigger)

## Impact

- New file: `.github/workflows/pages.yml`
- New file: `src/pages/index.html` (landing page, hand-authored HTML/CSS, no framework)
- Modified: `README.md` (add absolute link to hosted tool)
- Affected systems: GitHub Pages (new), GitHub Actions (new workflow + required repo permissions)
- Manual/out-of-band: GitHub repo Settings (Pages source selection) — cannot be done via this change's code changes alone
