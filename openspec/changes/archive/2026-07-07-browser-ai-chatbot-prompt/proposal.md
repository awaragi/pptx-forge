## Why

The browser tool's AI button currently copies only `INSTRUCTIONS.md` + `lib.d.ts` — a pure API reference with no behavioral instruction. Pasted into a chatbot, it tells the assistant *how* to write a valid slide file but never tells it *what to do right now*: turn the current conversation into a deck, or ask the user what deck they want. Users have to type that framing themselves every time.

## What Changes

- Add `AI-CHAT.md` at the repo root: a system-prompt-style file instructing the assistant to either (a) apply the ongoing discussion to generate a pptx-forge slide/deck output, or (b) if the discussion gives no clear presentation content yet, ask the user what presentation they want to generate.
- Update `scripts/build-browser.js` to read `AI-CHAT.md` alongside `INSTRUCTIONS.md` and `lib.d.ts`, and combine all three into the single bundled reference string injected as `__AI_REFERENCE__`. `AI-CHAT.md` is placed first, since it frames how the assistant should use the reference material that follows.
- No change to the AI button's UI or clipboard/fallback behavior — only the composition of the text it copies.

## Capabilities

### Modified Capabilities
- `browser-ai-reference`: the build-time bundling requirement now includes a third source file (`AI-CHAT.md`) and defines its ordering ahead of `INSTRUCTIONS.md` and `lib.d.ts` in the combined reference text.

## Impact

- `AI-CHAT.md` (new file, repo root): the system prompt content.
- `scripts/build-browser.js`: reads the new file and extends the `aiReference` template with a third section.
- `src/tools/browser/app.js`, `src/tools/browser/index.html`: no code changes expected — `AI_REFERENCE` is consumed as an opaque bundled string already.
- No changes to the CLI (`bin/`, `src/lib/`) or `INSTRUCTIONS.md`/`lib.d.ts` themselves.
