// sessionStorage-backed workspace persistence. Wrapped in try/catch because
// sessionStorage availability under file:// is inconsistent across browsers
// (private browsing, hardened configs, quota limits).
const WORKSPACES_KEY = 'pptx-forge.workspaces';
const ACTIVE_KEY = 'pptx-forge.workspace';

let onFailure = null;
let warned = false;

export function setStorageFailureHandler(fn) {
  onFailure = fn;
}

function handleFailure() {
  if (warned) return;
  warned = true;
  if (onFailure) onFailure();
}

export function readWorkspaces() {
  try {
    const raw = sessionStorage.getItem(WORKSPACES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    handleFailure();
    return {};
  }
}

export function writeWorkspaces(workspaces) {
  try {
    sessionStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
  } catch {
    handleFailure();
  }
}

export function getActiveWorkspaceName() {
  try {
    return sessionStorage.getItem(ACTIVE_KEY);
  } catch {
    handleFailure();
    return null;
  }
}

export function setActiveWorkspaceName(name) {
  try {
    sessionStorage.setItem(ACTIVE_KEY, name);
  } catch {
    handleFailure();
  }
}
