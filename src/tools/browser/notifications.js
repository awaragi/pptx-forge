const DISMISS_MS = { info: 4000, success: 4000, error: 8000 };
const ICONS = { info: 'ℹ', success: '✓', error: '⚠' };

function pushToast(message, tier) {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${tier}`;
  toast.setAttribute('role', 'status');

  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = ICONS[tier] || '';

  const text = document.createElement('span');
  text.className = 'toast-message';
  text.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'toast-close';
  closeBtn.setAttribute('aria-label', 'Dismiss notification');
  closeBtn.textContent = '×';

  toast.append(icon, text, closeBtn);
  stack.appendChild(toast);

  const duration = DISMISS_MS[tier] ?? DISMISS_MS.info;
  let remaining = duration;
  let startedAt = Date.now();
  let timeoutId = window.setTimeout(dismiss, duration);

  function dismiss() {
    window.clearTimeout(timeoutId);
    toast.remove();
  }

  // Hover pauses only this toast's timer; every other toast in the stack
  // keeps counting down independently.
  toast.addEventListener('mouseenter', () => {
    window.clearTimeout(timeoutId);
    remaining -= Date.now() - startedAt;
  });
  toast.addEventListener('mouseleave', () => {
    startedAt = Date.now();
    timeoutId = window.setTimeout(dismiss, Math.max(remaining, 0));
  });
  closeBtn.addEventListener('click', dismiss);
}

export function notifyInfo(message) {
  pushToast(message, 'info');
}

export function notifySuccess(message) {
  pushToast(message, 'success');
}

export function notifyError(message) {
  pushToast(message, 'error');
}
