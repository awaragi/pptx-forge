// localStorage-backed multi-workspace persistence, keyed by workspace name.
// Wrapped in try/catch because localStorage availability under file:// is
// inconsistent across browsers (private browsing, hardened configs, quota limits).
const WORKSPACES_KEY = 'pptx-forge.workspaces';
const ACTIVE_KEY = 'pptx-forge.activeWorkspace';
const HELP_SEEN_KEY = 'pptx-forge.helpSeen';
const PREVIEW_VISIBLE_KEY = 'pptx-forge.preview.visible';
const PREVIEW_HEIGHT_KEY = 'pptx-forge.preview.height';
const DEFAULT_PREVIEW_HEIGHT_PCT = 50;

// Conservative assumption: several browsers cap localStorage around 5MB/origin.
// Warn well before a write is likely to actually fail.
const QUOTA_WARNING_BYTES = 4 * 1024 * 1024;

let onFailure = null;
let warned = false;
let onNearingQuota = null;
let onExternalChange = null;

export function setStorageFailureHandler(fn) {
  onFailure = fn;
}

// Called (repeatably, not just once) after a write whose estimated total
// size crosses QUOTA_WARNING_BYTES.
export function setNearingQuotaHandler(fn) {
  onNearingQuota = fn;
}

// Called when another tab/window writes a new workspaces map, with that
// map already parsed. Callers decide whether it affects their active
// workspace and whether it's safe to apply (e.g. editor not focused).
export function setExternalChangeHandler(fn) {
  onExternalChange = fn;
}

function handleFailure() {
  if (warned) return;
  warned = true;
  if (onFailure) onFailure();
}

function readRaw() {
  try {
    const raw = localStorage.getItem(WORKSPACES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    handleFailure();
    return {};
  }
}

function writeRaw(workspaces) {
  try {
    const serialized = JSON.stringify(workspaces);
    localStorage.setItem(WORKSPACES_KEY, serialized);
    if (onNearingQuota && serialized.length * 2 >= QUOTA_WARNING_BYTES) {
      onNearingQuota();
    }
  } catch {
    handleFailure();
  }
}

export function estimateUsageBytes() {
  try {
    const raw = localStorage.getItem(WORKSPACES_KEY) || '';
    return raw.length * 2; // rough UTF-16 byte estimate
  } catch {
    return 0;
  }
}

// Direct read of the raw workspaces key, safe to call before the
// default-workspace auto-create logic runs (which would otherwise make
// "no workspace" unobservable). Used solely for first-visit detection.
export function hasAnyWorkspaceData() {
  try {
    const raw = localStorage.getItem(WORKSPACES_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed) && typeof parsed === 'object' && Object.keys(parsed).length > 0;
  } catch {
    return false;
  }
}

export function hasSeenHelp() {
  try {
    return localStorage.getItem(HELP_SEEN_KEY) === '1';
  } catch {
    handleFailure();
    return false;
  }
}

export function markHelpSeen() {
  try {
    localStorage.setItem(HELP_SEEN_KEY, '1');
  } catch {
    handleFailure();
  }
}

// UI preferences below are global (not keyed by workspace), same tier as
// HELP_SEEN_KEY — they describe how the editor looks, not workspace content.
export function getPreviewVisible() {
  try {
    const raw = localStorage.getItem(PREVIEW_VISIBLE_KEY);
    return raw === null ? true : raw === '1';
  } catch {
    return true;
  }
}

export function setPreviewVisible(visible) {
  try {
    localStorage.setItem(PREVIEW_VISIBLE_KEY, visible ? '1' : '0');
  } catch {
    handleFailure();
  }
}

export function getPreviewHeightPct() {
  try {
    const raw = localStorage.getItem(PREVIEW_HEIGHT_KEY);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : DEFAULT_PREVIEW_HEIGHT_PCT;
  } catch {
    return DEFAULT_PREVIEW_HEIGHT_PCT;
  }
}

export function setPreviewHeightPct(pct) {
  try {
    localStorage.setItem(PREVIEW_HEIGHT_KEY, String(pct));
  } catch {
    handleFailure();
  }
}

export function listWorkspaceNames() {
  return Object.keys(readRaw()).sort((a, b) => a.localeCompare(b));
}

export function workspaceExists(name) {
  return Object.prototype.hasOwnProperty.call(readRaw(), name);
}

export function readWorkspace(name) {
  const workspaces = readRaw();
  return workspaces[name] || null;
}

export function writeWorkspace(name, snapshot) {
  const workspaces = readRaw();
  workspaces[name] = snapshot;
  writeRaw(workspaces);
}

export function deleteWorkspace(name) {
  const workspaces = readRaw();
  delete workspaces[name];
  writeRaw(workspaces);
}

// Renames in place, preserving content. Returns false (no-op) if newName
// already exists or oldName doesn't — no override/merge path via rename.
export function renameWorkspace(oldName, newName) {
  const workspaces = readRaw();
  if (Object.prototype.hasOwnProperty.call(workspaces, newName)) return false;
  if (!Object.prototype.hasOwnProperty.call(workspaces, oldName)) return false;
  workspaces[newName] = workspaces[oldName];
  delete workspaces[oldName];
  writeRaw(workspaces);
  return true;
}

export function getActiveWorkspaceName() {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    handleFailure();
    return null;
  }
}

export function setActiveWorkspaceName(name) {
  try {
    localStorage.setItem(ACTIVE_KEY, name);
  } catch {
    handleFailure();
  }
}

// Cross-tab sync: other tabs writing to WORKSPACES_KEY fire a `storage`
// event here. `e.newValue` is the raw string already written by the other
// tab, so this only needs to parse it and hand it off.
window.addEventListener('storage', (e) => {
  if (e.key !== WORKSPACES_KEY || !onExternalChange) return;
  try {
    onExternalChange(e.newValue ? JSON.parse(e.newValue) : {});
  } catch {
    // Ignore a malformed external write rather than crash this tab.
  }
});
