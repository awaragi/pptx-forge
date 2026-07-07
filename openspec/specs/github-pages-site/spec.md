# GitHub Pages Site Spec

## Purpose

Defines the landing page and CI workflow that publish pptx-forge's browser tool and a project homepage to GitHub Pages on every version tag push.

## Requirements
### Requirement: GitHub Actions Pages workflow
A `.github/workflows/pages.yml` workflow SHALL trigger on pushes to tags matching the pattern `[0-9]+.[0-9]+.[0-9]+` (the same pattern used by `release.yml`), install dependencies, run `npm run build:browser` to produce `pptx-forge.html` on disk, manually assemble a `_site/` directory containing `index.html` and `pptx-forge.html`, and deploy the result to GitHub Pages using `actions/upload-pages-artifact` and `actions/deploy-pages`. No Jekyll build step SHALL be used.

#### Scenario: Tag pushed to remote
- **WHEN** a tag such as `1.1.3` is pushed to the GitHub remote
- **THEN** `pages.yml` runs independently of `release.yml`, builds `pptx-forge.html` from source, assembles `_site/`, and deploys it to the repo's GitHub Pages environment

#### Scenario: Pages workflow does not block or depend on the release workflow
- **WHEN** `pages.yml` fails for any reason
- **THEN** `release.yml` still completes and publishes the GitHub Release unaffected

#### Scenario: Master-only pushes do not redeploy the site
- **WHEN** a commit is pushed to `master` without an accompanying version tag
- **THEN** `pages.yml` does not run and the published Pages site is unchanged

### Requirement: Landing page source lives under src/pages
A `src/pages/index.html` file SHALL be the source for the Pages site homepage. The `pages.yml` workflow SHALL copy it to `_site/index.html` at deploy time. The file SHALL be plain HTML and CSS with no build step and no external frameworks, so it can be edited directly and later replaced with a designed mockup without changing the workflow.

#### Scenario: Visiting the site root
- **WHEN** a visitor loads `https://awaragi.github.io/pptx-forge/`
- **THEN** the content of `src/pages/index.html` is served as the homepage

#### Scenario: Landing page is self-contained
- **WHEN** `src/pages/index.html` is opened directly from the filesystem (without a server)
- **THEN** it renders correctly with no missing external dependencies

### Requirement: Live browser tool published as a static file
The `pptx-forge.html` built during the `pages.yml` run SHALL be copied to `_site/pptx-forge.html` and published at the Pages site root, reachable at a stable URL, without ever being committed to any git branch.

#### Scenario: Opening the hosted tool
- **WHEN** a visitor navigates to `https://awaragi.github.io/pptx-forge/pptx-forge.html`
- **THEN** the browser tool loads and is fully functional with no download step and no local build required

#### Scenario: pptx-forge.html remains gitignored
- **WHEN** the repository's git history is inspected after a `pages.yml` run
- **THEN** no commit on any branch contains `pptx-forge.html`

### Requirement: README links to the hosted tool with an absolute URL
`README.md` SHALL link to the hosted browser tool using the absolute URL `https://awaragi.github.io/pptx-forge/pptx-forge.html`, not a relative path.

#### Scenario: Viewing README on github.com
- **WHEN** a visitor reads `README.md` directly on github.com
- **THEN** the link to the hosted tool resolves correctly as an absolute URL

#### Scenario: Viewing README on the Pages site
- **WHEN** a visitor reads the repo documentation via the Pages site
- **THEN** the same absolute link to the hosted tool resolves correctly
