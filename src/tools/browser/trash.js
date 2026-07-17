// Per-workspace slide trash: move-to-trash, restore-by-click, and empty-trash,
// wiring state.trash (state.js) together with the pure key-encoding/name-dedup
// helpers in trash-logic.js. Not unit-testable under plain Node (state.js pulls
// in storage.js's window.addEventListener at module scope) — covered instead
// by test/e2e/slide-trash.spec.js, matching how compileDeck/preview are tested.
import { state, persistWorkspace } from './state.js';
import { timestampedTrashKey, dedupeRestoredName } from './trash-logic.js';
import { render, selectFile } from './view.js';
import { notifySuccess } from './notifications.js';

// Trash keys embed an ISO-ish timestamp right after the prefix, so lexical
// sort order is already chronological.
export function sortedTrashKeys() {
  return [...state.trash.keys()].sort();
}

export function moveToTrash(name) {
  const entry = state.slides.get(name);
  if (!entry) return;
  const trashKey = timestampedTrashKey(name);
  state.trash.set(trashKey, { name, trashKey, content: entry.content });
  state.slides.delete(name);
  persistWorkspace();
}

export function restoreFromTrash(trashKey) {
  const entry = state.trash.get(trashKey);
  if (!entry) return;
  if (!window.confirm(`Restore "${entry.name}" from trash?`)) return;
  const restoredName = dedupeRestoredName(entry.name, new Set(state.slides.keys()));
  state.slides.set(restoredName, { name: restoredName, content: entry.content });
  state.trash.delete(trashKey);
  persistWorkspace();
  selectFile(restoredName);
  notifySuccess(restoredName === entry.name ? `Restored ${restoredName}` : `Restored as ${restoredName}`);
}

export function emptyTrash() {
  if (state.trash.size === 0) return;
  if (!window.confirm('Permanently delete everything in the trash? This cannot be undone.')) return;
  state.trash.clear();
  persistWorkspace();
  render();
  notifySuccess('Trash emptied.');
}
