import { useEffect } from 'react';

let activeModalsCount = 0;
let originalBodyOverflow = '';
let originalHtmlOverflow = '';

const preventDefaultOnBackdrop = (e) => {
  if (!e.target) return;
  const isBackdrop =
    e.target.classList?.contains('modal-backdrop') ||
    e.target.classList?.contains('tt-auth-modal-overlay') ||
    e.target.classList?.contains('admin-modal-overlay') ||
    e.target.hasAttribute?.('data-modal-backdrop') ||
    (typeof e.target.getAttribute === 'function' && e.target.getAttribute('role') === 'dialog');

  if (isBackdrop) {
    if (e.cancelable) {
      e.preventDefault();
    }
  }
};

export function lockBodyScroll() {
  activeModalsCount++;
  if (activeModalsCount === 1) {
    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');

    window.addEventListener('touchmove', preventDefaultOnBackdrop, { passive: false });
    window.addEventListener('wheel', preventDefaultOnBackdrop, { passive: false });
  }
}

export function unlockBodyScroll() {
  activeModalsCount = Math.max(0, activeModalsCount - 1);
  if (activeModalsCount === 0) {
    document.body.style.overflow = originalBodyOverflow || '';
    document.documentElement.style.overflow = originalHtmlOverflow || '';
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');

    window.removeEventListener('touchmove', preventDefaultOnBackdrop);
    window.removeEventListener('wheel', preventDefaultOnBackdrop);
  }
}

export function useBodyScrollLock(isOpen = true) {
  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [isOpen]);
}
