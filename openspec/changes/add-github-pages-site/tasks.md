> **Note for whoever applies this change:** tasks in section 4 are marked **MANUAL**. They require the repo owner to act outside this codebase (GitHub repo Settings UI, or pushing a tag). Complete automatable tasks (1–3) first. When you reach a MANUAL task, stop, describe exactly what needs to be done, and wait for the user to confirm they've done it before moving to the next task — do not mark a MANUAL task complete on their behalf, and do not batch multiple MANUAL tasks together.

## 1. Landing page

- [x] 1.1 Create `src/pages/index.html` — plain HTML/CSS landing page with a "Try it in your browser" link to `https://awaragi.github.io/pptx-forge/pptx-forge.html`, a "View on GitHub" link, and a brief description of pptx-forge; no framework, no external dependencies
- [x] 1.2 Verify `src/pages/index.html` opens correctly when loaded directly from the filesystem (no server)

## 2. Pages workflow

- [x] 2.1 Create `.github/workflows/pages.yml` triggered on `push: tags: ["[0-9]+.[0-9]+.[0-9]+"]`, with `permissions: { pages: write, id-token: write }` and `environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url } }`
- [x] 2.2 Add steps: `actions/checkout@v4`, `actions/setup-node@v4` (node 20), `npm ci`, `npm run build:browser`
- [x] 2.3 Add a shell step that assembles `_site/`: `mkdir -p _site && cp src/pages/index.html _site/index.html && cp pptx-forge.html _site/pptx-forge.html`
- [x] 2.4 Add `actions/upload-pages-artifact@v3` (path: `_site/`) and `actions/deploy-pages@v4` (id: `deployment`) steps
- [x] 2.5 Confirm no Jekyll-related steps (`actions/jekyll-build-pages`, `_config.yml`) are present in the workflow

## 3. README update

- [x] 3.1 Add a "Try it live" link near the top of `README.md` (before the Prerequisites section) pointing to the Pages site homepage `https://awaragi.github.io/pptx-forge/` — this is the entry point for anyone who just wants to use the tool
- [x] 3.2 Add a direct link to the live browser tool `https://awaragi.github.io/pptx-forge/pptx-forge.html` in the existing "Browser tool" section, alongside the existing GitHub Releases download links — clearly labelled as the hosted/online version so readers know they can use it without downloading

## 4. Manual GitHub configuration (perform one at a time, confirm each before continuing)

- [ ] 4.1 **MANUAL**: Merge/push the branch containing `src/pages/index.html`, `pages.yml`, and the README change to `master`
- [ ] 4.2 **MANUAL**: In the GitHub repo, go to Settings → Pages → "Build and deployment" → set Source to **"GitHub Actions"**
- [ ] 4.3 **MANUAL**: Optional — Settings → General → set the repo's **Website** field to `https://awaragi.github.io/pptx-forge/`
- [ ] 4.4 **MANUAL**: Push a version tag to trigger the first deploy (e.g. `npm run release`)
- [ ] 4.5 **MANUAL**: In the Actions tab, confirm the `pages.yml` run succeeded, then verify `https://awaragi.github.io/pptx-forge/` shows the landing page and `https://awaragi.github.io/pptx-forge/pptx-forge.html` opens the working browser tool

## 5. Verification

- [x] 5.1 Confirm `pptx-forge.html` is not present in `git log` on any branch (must stay gitignored)
- [x] 5.2 Confirm `release.yml` still runs and publishes a GitHub Release unaffected by `pages.yml` on the same tag
