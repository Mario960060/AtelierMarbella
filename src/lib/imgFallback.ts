import type { SyntheticEvent } from 'react';

/**
 * Swap an <img> to a fallback the first time it fails to load — e.g. while the
 * real per-subcategory project photo hasn't been dropped into public/ yet, the
 * page keeps showing the placeholder instead of a broken image.
 */
export function imgFallback(fallback: string) {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (!fallback || el.dataset.fb) return;
    el.dataset.fb = '1';
    el.src = fallback;
  };
}
