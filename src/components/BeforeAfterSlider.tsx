import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion';
import { ChevronsLeftRight } from 'lucide-react';

/**
 * Clip-path comparison slider. Pointer-driven (motion values, no React state
 * on the hot path), keyboard accessible, hardware accelerated.
 */
export default function BeforeAfterSlider({
  before,
  after,
  beforeLabel,
  afterLabel,
  hint,
  alt,
}: {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
  hint: string;
  alt: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const pos = useMotionValue(58);
  const right = useTransform(pos, (v) => 100 - v);
  const clip = useMotionTemplate`inset(0% ${right}% 0% 0%)`;
  const left = useMotionTemplate`${pos}%`;

  useMotionValueEvent(pos, 'change', (v) => {
    handleRef.current?.setAttribute('aria-valuenow', String(Math.round(v)));
  });

  const setFromClientX = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    pos.set(Math.min(96, Math.max(4, next)));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.buttons & 1) setFromClientX(e.clientX);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      pos.set(Math.max(4, pos.get() - 6));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      pos.set(Math.min(96, pos.get() + 6));
    }
  };

  return (
    <div>
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative aspect-[16/9] cursor-ew-resize touch-none select-none overflow-hidden bg-plaster"
      >
        <img
          src={after}
          alt={alt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* "Before" placeholder: same shot, desaturated, until real pair photos arrive */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0">
          <img
            src={before}
            alt=""
            aria-hidden
            draggable={false}
            className="h-full w-full object-cover brightness-90 contrast-75 grayscale"
          />
        </motion.div>
        <motion.div
          style={{ left }}
          className="absolute inset-y-0 -ml-px w-0.5 bg-limestone shadow-[0_0_14px_rgba(20,18,13,0.35)]"
        >
          <button
            ref={handleRef}
            role="slider"
            aria-label={hint}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={58}
            onKeyDown={onKeyDown}
            className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-limestone text-ink shadow-lg transition-transform duration-150 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure focus-visible:ring-offset-2"
          >
            <ChevronsLeftRight size={20} strokeWidth={1.75} />
          </button>
        </motion.div>
      </div>
      <div className="mt-3 flex items-baseline justify-between text-xs uppercase tracking-[0.14em] text-ink/55">
        <span>{beforeLabel}</span>
        <span className="normal-case tracking-normal text-ink/45">{hint}</span>
        <span>{afterLabel}</span>
      </div>
    </div>
  );
}
