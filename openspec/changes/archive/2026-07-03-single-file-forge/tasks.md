## 1. Argument resolution

- [x] 1.1 In `bin/forge.js`, after resolving `wsDir` from `workspaceArg`, `stat` the resolved path instead of assuming it's a directory.
- [x] 1.2 If the resolved path is a file: validate it ends in `.js`; on failure, print an informative error to stderr and exit non-zero (same pattern as the existing "no slide files found" error).
- [x] 1.3 If the resolved path is a file ending in `.js`: derive `wsDir` for theme/output purposes — if the file's parent directory is named `slides`, use the parent of that directory; otherwise use the file's own containing directory.

## 2. Single-file slide loading

- [x] 2.1 When in single-file mode, skip `readdir(slidesDir)` and instead build the `slideFiles`/import list from just the one resolved file (track its full path directly rather than a bare filename, since it may not live under `slidesDir`).
- [x] 2.2 Ensure the existing per-file import loop (`pathToFileURL(join(slidesDir, file))`) works for both directory mode (filenames joined with `slidesDir`) and single-file mode (an already-absolute file path) without duplicating the loop.
- [x] 2.3 Confirm `theme.js` loading, `outDir` creation, `workspaceSlug`, and the theme-color XML patch step are unaffected and still run against the derived `wsDir`.

## 3. Help text and docs

- [x] 3.1 Update the `HELP` usage text in `bin/forge.js` to document that `<workspace>` may be a path to a single slide `.js` file, with an example.
- [x] 3.2 Update `INSTRUCTIONS.md`/`README.md` if they document the `<workspace>` argument's accepted forms.

## 4. Verification

- [x] 4.1 Manually run `npm run forge <existing-workspace>/slides/<one-file>.js` and confirm the output `.pptx` contains only that slide's content.
- [x] 4.2 Manually run `npm run forge <existing-workspace>` (directory form) and confirm output is unchanged (all slides still included).
- [x] 4.3 Run `npm run forge <path-to-non-js-file>` and confirm a clean non-zero-exit error, no `.pptx` written.
- [x] 4.4 Run `npm run forge <workspace>/slides/<file>.js --open --snapshot` and confirm flags still work in single-file mode.
