/**
 * Utility for smooth scrolling to specific target elements by ID,
 * taking into account fixed navigation bar offsets and dynamic tab transitions.
 */

export function scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
  if (typeof window === 'undefined') return;
  window.scrollTo({
    top: 0,
    behavior
  });
}

export function smoothScrollTo(targetId: string, offset = 80): void {
  if (typeof window === 'undefined') return;

  const attemptScroll = (): boolean => {
    const el = document.getElementById(targetId);
    if (el) {
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
      return true;
    }
    return false;
  };

  // First try immediately
  if (!attemptScroll()) {
    // Second try after React state switch and tab mounting
    setTimeout(() => {
      if (!attemptScroll()) {
        // Fallback try in next animation frame
        requestAnimationFrame(() => {
          attemptScroll();
        });
      }
    }, 70);
  }
}
