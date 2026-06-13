import { Link, useNavigate } from 'react-router-dom';
import { MaskReveal, Reveal } from './Reveal';

export default function PageCta({
  title,
  sub,
  button,
  back,
}: {
  title: string;
  sub: string;
  button: string;
  back: string;
}) {
  const navigate = useNavigate();
  return (
    <section className="bg-night px-6 py-28 text-center lg:py-36">
      <MaskReveal>
        <h2 className="mx-auto max-w-3xl font-serif text-4xl leading-tight text-ivory md:text-6xl">
          {title}
        </h2>
      </MaskReveal>
      <Reveal delay={0.15}>
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-ivory/70">{sub}</p>
      </Reveal>
      <Reveal delay={0.3}>
        <button
          onClick={() => navigate('/contact')}
          className="mt-12 border border-ivory/70 px-10 py-4 text-[11px] uppercase tracking-[0.25em] text-ivory transition-colors duration-500 hover:bg-ivory hover:text-ink"
        >
          {button}
        </button>
        <div className="mt-10">
          <Link
            to="/"
            className="text-[11px] uppercase tracking-[0.2em] text-ivory/40 underline-offset-4 transition-colors hover:text-ivory hover:underline"
          >
            ← {back}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
