import type Lenis from 'lenis';

function getLenis(): Lenis | undefined {
  return (window as unknown as { lenis?: Lenis }).lenis;
}

/**
 * Tracks the route we came *from*. App calls recordPath on every location
 * change; because `AnimatePresence mode="wait"` defers mounting the new page
 * until after that runs, the new page can read getPreviousPath() to tell whether
 * it was reached via Back from a child route (and restore the matching scroll
 * position) versus a fresh forward navigation.
 */
let currentPath = '';
let previousPath = '';

export function recordPath(path: string) {
  if (path === currentPath) return;
  previousPath = currentPath;
  currentPath = path;
}

export function getPreviousPath() {
  return previousPath;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

/** Absolute page Y for a 0→1 progress within a pinned section. */
export function progressToY(progress: number, top: number, range: number) {
  return top + progress * range;
}

/**
 * Glide the page to an absolute Y with Lenis (native smooth-scroll fallback).
 * `onStart`/`onEnd` let the caller guard against re-entrancy while the
 * programmatic scroll runs. Shared by the pinned-section snaps
 * (ServiceStage3D, StackCards) so they all feel identical.
 */
export function runSnap(
  targetY: number,
  {
    duration = 0.4,
    onStart,
    onEnd,
  }: { duration?: number; onStart?: () => void; onEnd?: () => void } = {}
) {
  onStart?.();
  const lenis = getLenis();
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(fallback);
    onEnd?.();
  };

  const fallback = window.setTimeout(finish, duration * 1000 + 400);

  if (lenis) {
    lenis.scrollTo(targetY, { duration, onComplete: finish });
  } else {
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    window.setTimeout(finish, duration * 1000);
  }
}
