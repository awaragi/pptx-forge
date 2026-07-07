## Context

The browser tool (`pptx-forge.html`) has an AI button (`src/tools/browser/app.js`) that copies a bundled reference string (`__AI_REFERENCE__`) to the clipboard, built at build time (`scripts/build-browser.js`) by concatenating `INSTRUCTIONS.md` and `lib.d.ts`. That reference is pure API documentation — it tells an assistant how to write a valid slide file, but gives no instruction on what to *do* with a given conversation. Users currently have to supply that framing by hand each time they paste the reference into a chatbot.

## Goals / Non-Goals

**Goals:**
- Give the pasted reference an opening instruction that tells the assistant its task: turn the current discussion into a pptx-forge output, or ask what presentation the user wants if the discussion doesn't yet contain enough to act on.
- Keep the instruction content in its own file (`AI-CHAT.md`) so it can be edited independently of the API reference docs.
- Keep the existing button UX (copy-to-clipboard with textarea fallback) unchanged — this is purely a content change to what gets bundled.

**Non-Goals:**
- No changes to the AI button's click behavior, overlay, or clipboard/fallback logic.
- No runtime fetching — `AI-CHAT.md` is inlined at build time exactly like the other two files.
- Not building an actual in-browser chat interface — the button still just prepares text for the user to paste into an external chatbot.

## Decisions

- **File placement**: `AI-CHAT.md` lives at the repo root, alongside `INSTRUCTIONS.md` and `lib.d.ts`, so all three "AI reference" source files sit together and `scripts/build-browser.js` reads them the same way (`readFile` + string join). No new directory.
- **Ordering in the combined bundle**: `AI-CHAT.md` is placed **first**, ahead of `INSTRUCTIONS.md` and `lib.d.ts`. Rationale: it's a system-prompt-style instruction that frames how the assistant should treat the reference material that follows (read it, then either produce output or ask a clarifying question) — putting task framing before reference material matches how system prompts conventionally precede reference/context content.
- **Content boundary**: `AI-CHAT.md` contains only the behavioral instruction (decide: generate now vs. ask what to build). It does not duplicate anything from `INSTRUCTIONS.md` (authoring rules) or `lib.d.ts` (API surface) — those stay the single source of truth for "how to write a valid file."
- **No new build flag**: the file is always included; there's no scenario where a user wants the reference without the behavioral framing, so no opt-out is added.

## Risks / Trade-offs

- **Prompt drift**: `AI-CHAT.md` content is free text with no automated verification that it produces the intended chatbot behavior → mitigate by keeping the instruction short, explicit, and unambiguous (two clear branches: generate vs. ask), and treating wording refinement as a normal follow-up edit rather than something requiring code changes.
- **Reference size growth**: adding a third file increases the copied text size slightly → acceptable, the file is a short instruction, not reference-scale content.
