import { useEffect } from 'react';

let activeModalsCount = 0;
let originalBodyOverflow = '';
let originalHtmlOverflow = '';

const preventDefaultOnBackdrop = (e) => {
  if (!e || !e.target) return;
  const target = e.target;
  const isBackdrop =
    (target.classList && typeof target.classList.contains === 'function' && (
      target.classList.contains('modal-backdrop') ||
      target.classList.contains('tt-auth-modal-overlay') ||
      target.classList.contains('admin-modal-overlay')
    )) ||
    (typeof target.hasAttribute === 'function' && target.hasAttribute('data-modal-backdrop')) ||
    (typeof target.getAttribute === 'function' && target.getAttribute('role') === 'dialog');

  if (isBackdrop) {
    if (e.cancelable) {
      e.preventDefault();
    }
  }
};

export function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  activeModalsCount++;
  if (activeModalsCount === 1) {
    originalBodyOverflow = document.body ? document.body.style.overflow : '';
    originalHtmlOverflow = document.documentElement ? document.documentElement.style.overflow : '';

    if (document.body) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    }
    if (document.documentElement) {
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.classList.add('modal-open');
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('touchmove', preventDefaultOnBackdrop, { passive: false });
      window.addEventListener('wheel', preventDefaultOnBackdrop, { passive: false });
    }
  }
}

export function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  activeModalsCount = Math.max(0, activeModalsCount - 1);
  if (activeModalsCount === 0) {
    if (document.body) {
      document.body.style.overflow = originalBodyOverflow || '';
      document.body.classList.remove('modal-open');
    }
    if (document.documentElement) {
      document.documentElement.style.overflow = originalHtmlOverflow || '';
      document.documentElement.classList.remove('modal-open');
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('touchmove', preventDefaultOnBackdrop);
      window.removeEventListener('wheel', preventDefaultOnBackdrop);
    }
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
