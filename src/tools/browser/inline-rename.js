// Generic "click to rename in place" state machine, shared by the active-file
// rename control (view.js) and the workspace rename control (workspace.js) —
// both are the same start/cancel/commit shape swapping an input for a display
// element, differing only in which elements they toggle and how a new value
// is validated/applied.
import { notifyError } from './notifications.js';

// input: the text input swapped in during editing.
// displayEl: the element shown when not editing (hidden while editing).
// hideWhileEditing: other elements hidden while editing, restored on exit.
// showWhileEditing: elements shown only while editing (e.g. a filename-extension suffix).
// getCurrentValue(): () => string — value to prefill the input with, and to
//   compare the committed input against to detect a no-op rename.
// canStart(): () => boolean — extra guard checked before entering edit mode
//   (e.g. pinned files can't be renamed at all).
// validate(newValue, oldValue): () => string | null — an error message, or
//   null if newValue is acceptable.
// commit(oldValue, newValue): performs the actual rename (state mutation,
//   persistence, success notification) once validate() has passed.
// afterExit(): called after leaving edit mode, on every path (commit, cancel,
//   or a reverted blur) — e.g. to trigger a full re-render.
export function createInlineRename({
  input,
  displayEl,
  hideWhileEditing = [],
  showWhileEditing = [],
  getCurrentValue,
  canStart = () => true,
  validate,
  commit,
  afterExit,
}) {
  let active = false;

  function isActive() {
    return active;
  }

  function start() {
    if (active || !canStart()) return;
    active = true;
    input.value = getCurrentValue();
    displayEl.style.display = 'none';
    hideWhileEditing.forEach((el) => { el.style.display = 'none'; });
    input.style.display = 'inline-block';
    showWhileEditing.forEach((el) => { el.style.display = 'inline'; });
    input.focus();
    input.select();
  }

  function exit() {
    active = false;
    input.style.display = 'none';
    showWhileEditing.forEach((el) => { el.style.display = 'none'; });
    displayEl.style.display = '';
    hideWhileEditing.forEach((el) => { el.style.display = ''; });
    if (afterExit) afterExit();
  }

  function cancel() {
    if (!active) return;
    exit();
  }

  // keepEditingOnFailure: true while the user can still type (Enter key) —
  // stays in the input so they can fix the name. false on blur, where focus
  // is already gone, so an invalid name just reverts.
  function commitValue(keepEditingOnFailure) {
    if (!active) return;
    const oldValue = getCurrentValue();
    const newValue = input.value.trim();

    if (newValue === oldValue) {
      exit();
      return;
    }

    // Only notify on the Enter-key path: on blur, the input already showed
    // this exact error once (from a prior Enter press) and is now just
    // silently reverting, per the comment above — re-notifying here would
    // duplicate the toast every time focus leaves a still-invalid input.
    const fail = (message) => {
      if (keepEditingOnFailure) {
        notifyError(`Rename failed — ${message}`);
        input.focus();
        input.select();
      } else {
        exit();
      }
    };

    const error = validate(newValue, oldValue);
    if (error) {
      fail(error);
      return;
    }

    commit(oldValue, newValue);
    exit();
  }

  return { isActive, start, cancel, commitValue };
}
