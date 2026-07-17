// Pure trash-key encoding/decoding and snapshot split/merge helpers — no DOM,
// storage, or state-module imports, so these can be unit-tested directly
// under plain Node (see preview-logic.js for the same split between pure
// logic and its DOM-wiring counterpart, trash.js).

export const TRASH_PREFIX = '.trash/';

export function isTrashKey(key) {
  return key.startsWith(TRASH_PREFIX);
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function splitExt(name) {
  const match = /^(.*)(\.[^./]+)$/.exec(name);
  return match ? [match[1], match[2]] : [name, ''];
}

// Encodes a live file name into a trash key carrying its delete time, at
// seconds resolution so repeated discards of the same name never collide.
export function timestampedTrashKey(name, date = new Date()) {
  const stamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  const [base, ext] = splitExt(name);
  return `${TRASH_PREFIX}${base}.${stamp}${ext}`;
}

// Recovers the pre-discard file name from a trash key produced by
// timestampedTrashKey().
export function originalNameFromTrashKey(trashKey) {
  const withoutPrefix = trashKey.slice(TRASH_PREFIX.length);
  const match = /^(.*)\.\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}(\.[^./]+)$/.exec(withoutPrefix);
  return match ? `${match[1]}${match[2]}` : withoutPrefix;
}

// Splits a flat workspace snapshot object into live slide entries and trash
// entries (pinned keys, per isPinnedName, are skipped entirely) — used by
// applyWorkspace() to populate state.slides/state.trash from one persisted
// object without changing that object's shape.
export function splitSnapshot(snapshot, isPinnedName) {
  const slides = [];
  const trash = [];
  for (const [key, content] of Object.entries(snapshot)) {
    if (isPinnedName(key)) continue;
    if (isTrashKey(key)) {
      trash.push({ trashKey: key, name: originalNameFromTrashKey(key), content });
    } else {
      slides.push({ name: key, content });
    }
  }
  return { slides, trash };
}

// Produces a name with no conflict in existingNames, appending " (restored)"
// and then a numeric counter if needed. Used when restoring a trashed file
// whose original name is already taken by a live slide.
export function dedupeRestoredName(name, existingNames) {
  if (!existingNames.has(name)) return name;
  const [base, ext] = splitExt(name);
  let candidate = `${base} (restored)${ext}`;
  let n = 2;
  while (existingNames.has(candidate)) {
    candidate = `${base} (restored ${n})${ext}`;
    n += 1;
  }
  return candidate;
}
