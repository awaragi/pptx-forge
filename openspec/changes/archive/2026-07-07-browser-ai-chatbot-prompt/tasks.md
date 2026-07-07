## 1. AI-CHAT.md content

- [x] 1.1 Create `AI-CHAT.md` at the repo root with a system-prompt-style instruction: given the current conversation, either apply it to generate a pptx-forge slide/deck output, or — if the conversation doesn't yet give clear presentation content — ask the user what presentation they want to generate.
- [x] 1.2 Keep the file scoped to behavioral instruction only; do not duplicate authoring rules from `INSTRUCTIONS.md` or API details from `lib.d.ts`.

## 2. Build script

- [x] 2.1 In `scripts/build-browser.js`, read `AI-CHAT.md` (`readFile(resolve(root, 'AI-CHAT.md'), 'utf8')`) alongside the existing `INSTRUCTIONS.md` and `lib.d.ts` reads.
- [x] 2.2 Update the `aiReference` template string to prepend the `AI-CHAT.md` content, ahead of the `INSTRUCTIONS.md` and `lib.d.ts` sections, using the same `# <filename>` heading convention already used for the other two files.

## 3. Verification

- [x] 3.1 Run `npm run build:browser` and confirm it completes without error.
- [x] 3.2 Open the built `pptx-forge.html`, click the AI button, and confirm the copied/fallback text starts with the `AI-CHAT.md` content followed by `INSTRUCTIONS.md` then `lib.d.ts`, matching the existing `# <filename>` section format.
- [x] 3.3 Run `openspec verify browser-ai-chatbot-prompt` (or equivalent) to confirm implementation matches the `browser-ai-reference` delta spec.
