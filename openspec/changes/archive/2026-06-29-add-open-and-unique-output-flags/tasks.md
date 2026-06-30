## 1. Dependencies

- [x] 1.1 Install `open` npm package (`npm install open`)

## 2. Forge Command

- [x] 2.1 Rename `bin/compile.js` to `bin/forge.js`
- [x] 2.2 Add arg parsing for `--open/-o`, `--snapshot/-t`, `--help/-h` flags and slug extraction
- [x] 2.3 Implement `--help` output and early exit (code 0)
- [x] 2.4 Implement `--snapshot` timestamped output path logic
- [x] 2.5 Implement `--open` file launch after successful compile using `open` package

## 3. Backup Command

- [x] 3.1 Add `--help/-h` flag parsing to `bin/backup.js`
- [x] 3.2 Show help and exit 0 when no slug provided (replace current error behavior)
- [x] 3.3 Implement help output text for backup

## 4. Package Scripts

- [x] 4.1 Update `package.json` scripts: rename `compile` to `forge`, add `build` and `generate` aliases (all pointing to `node bin/forge.js`)

## 5. Documentation and References

- [x] 5.1 Update `bin/create.js` post-scaffold instructions to use `npm run forge <name>` instead of `node bin/compile.js <name>`
- [x] 5.2 Update `README.md`: rename Compile section to Forge, update all command references, add flag documentation
- [x] 5.3 Update `INSTRUCTIONS.md`: update project layout (bin/compile.js → bin/forge.js), Compile Pipeline section header and commands, worked example footer line
