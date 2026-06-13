import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Check,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import PageShell from '../components/PageShell';
import { EASE, Reveal } from '../components/Reveal';

/* Fixed (placeholder) contact details — swap for the real numbers later.
   These mirror the ones shown in the footer. */
const CONTACT = {
  email: 'info@ateliermarbella.com',
  phoneEs: '+34 600 000 000',
  phoneEsHref: 'tel:+34600000000',
  phoneUk: '+44 7000 000000',
  phoneUkHref: 'tel:+447000000000',
  whatsapp: '+34 600 000 000',
  whatsappHref: 'https://wa.me/34600000000',
};

type Region = 'costa' | 'ibiza' | 'uk';
type Service = 'hard' | 'maintenance' | 'both';

const REGIONS: Region[] = ['costa', 'ibiza', 'uk'];
const SERVICES: Service[] = ['hard', 'maintenance', 'both'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* A selectable tile (region / service). Behaves like a radio button. */
function OptionTile({
  active,
  onClick,
  title,
  note,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  note: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex h-full flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
        active
          ? 'border-azure bg-azure/[0.06] ring-1 ring-azure'
          : 'border-ink/15 bg-white hover:border-ink/30 hover:bg-plaster/50'
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-200 ${
          active ? 'border-azure bg-azure text-white' : 'border-ink/25 text-transparent'
        }`}
        aria-hidden="true"
      >
        <Check size={13} strokeWidth={3} />
      </span>
      <span className="mt-1.5 text-sm font-medium text-ink">{title}</span>
      <span className="text-xs leading-snug text-ink/55">{note}</span>
    </button>
  );
}

export default function Contact() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  const [region, setRegion] = useState<Region>('costa');
  const [service, setService] = useState<Service>('hard');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [attempted, setAttempted] = useState(false);
  const [sent, setSent] = useState(false);

  const errors = useMemo(
    () => ({
      name: !name.trim(),
      email: !EMAIL_RE.test(email.trim()),
      message: message.trim().length < 5,
    }),
    [name, email, message]
  );
  const showError = (field: keyof typeof errors) => attempted && errors[field];

  const inputClass = (invalid: boolean | undefined) =>
    `w-full rounded-lg border bg-white px-4 py-3 text-base text-ink shadow-sm outline-none transition-colors duration-200 placeholder:text-ink/35 focus:border-azure focus:ring-2 focus:ring-azure/25 ${
      invalid ? 'border-terra/70' : 'border-ink/15'
    }`;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    if (errors.name || errors.email || errors.message) return;

    const regionName = t(`contactPage.regions.${region}.name`);
    const serviceName = t(`contactPage.services.${service}.name`);
    const subject = `${serviceName} · ${regionName}`;
    const body = [
      `${t('contactPage.nameLabel')}: ${name.trim()}`,
      `${t('contactPage.emailLabel')}: ${email.trim()}`,
      phone.trim() ? `${t('contactPage.phoneLabel')}: ${phone.trim()}` : null,
      `${t('contactPage.regionLegend')} ${regionName}`,
      `${t('contactPage.serviceLegend')} ${serviceName}`,
      '',
      message.trim(),
    ]
      .filter(Boolean)
      .join('\n');

    // Show the confirmation straight away.
    setSent(true);

    // No backend yet: hand the enquiry to the visitor's mail client, pre-filled.
    // Deferred to the next tick so the confirmation paints before the mail
    // app opens, and an anchor click keeps this page from unloading.
    const href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.setTimeout(() => {
      const mailto = document.createElement('a');
      mailto.href = href;
      mailto.rel = 'noopener';
      mailto.click();
    }, 0);
  }

  const firstName = name.trim().split(' ')[0] || name.trim();

  return (
    <PageShell>
      <div className="min-h-[100dvh] bg-limestone font-body text-ink">
        <section className="px-6 pb-24 pt-32 lg:px-12 lg:pb-32 lg:pt-40">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.22em] text-azure">
                {t('contactPage.eyebrow')}
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                {t('contactPage.title')}
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-ink/65 md:text-lg">
                {t('contactPage.sub')}
              </p>
            </Reveal>

            <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-16">
              {/* Left — direct contact / reassurance */}
              <div className="lg:col-span-5">
                <div className="space-y-9 lg:sticky lg:top-28">
                  <Reveal>
                    <div>
                      <h2 className="font-display text-xl font-medium tracking-tight">
                        {t('contactPage.talkTitle')}
                      </h2>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
                        {t('contactPage.talkSub')}
                      </p>
                    </div>
                  </Reveal>

                  <Reveal delay={0.06}>
                    <ul className="space-y-3">
                      <ContactRow
                        icon={<Mail size={17} strokeWidth={1.75} />}
                        label={t('contactPage.email')}
                        value={CONTACT.email}
                        href={`mailto:${CONTACT.email}`}
                      />
                      <ContactRow
                        icon={<Phone size={17} strokeWidth={1.75} />}
                        label={t('contactPage.phoneEs')}
                        value={CONTACT.phoneEs}
                        href={CONTACT.phoneEsHref}
                      />
                      <ContactRow
                        icon={<Phone size={17} strokeWidth={1.75} />}
                        label={t('contactPage.phoneUk')}
                        value={CONTACT.phoneUk}
                        href={CONTACT.phoneUkHref}
                      />
                      <ContactRow
                        icon={<MessageCircle size={17} strokeWidth={1.75} />}
                        label={t('contactPage.whatsapp')}
                        value={CONTACT.whatsapp}
                        href={CONTACT.whatsappHref}
                        external
                      />
                    </ul>
                  </Reveal>

                  <Reveal delay={0.12}>
                    <div className="rounded-xl border border-ink/10 bg-plaster/60 p-5">
                      <div className="flex items-center gap-2.5 text-azure">
                        <Clock size={17} strokeWidth={1.75} />
                        <p className="text-sm font-medium text-ink">
                          {t('contactPage.responseTitle')}
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink/60">
                        {t('contactPage.responseBody')}
                      </p>
                    </div>
                  </Reveal>

                  <Reveal delay={0.18}>
                    <div className="flex items-start gap-2.5">
                      <MapPin size={17} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink/40" />
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/45">
                          {t('contactPage.areasLabel')}
                        </p>
                        <p className="mt-1 text-sm text-ink/70">{t('contactPage.areas')}</p>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>

              {/* Right — form / success */}
              <div className="lg:col-span-7">
                <Reveal delay={0.1}>
                  <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_24px_70px_-40px_rgba(20,18,13,0.45)] sm:p-8 lg:p-10">
                    {sent ? (
                        <motion.div
                          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, ease: EASE }}
                          className="py-6 text-center"
                        >
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-azure/10 text-azure">
                            <Check size={26} strokeWidth={2.5} />
                          </div>
                          <h2 className="mt-6 font-display text-2xl font-bold tracking-tight md:text-3xl">
                            {t('contactPage.successTitle', { name: firstName })}
                          </h2>
                          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink/65">
                            {t('contactPage.successBody')}
                          </p>
                          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink/50">
                            {t('contactPage.successFallbackPre')}{' '}
                            <a
                              href={`mailto:${CONTACT.email}`}
                              className="text-azure underline-offset-4 hover:underline"
                            >
                              {CONTACT.email}
                            </a>
                            .
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSent(false);
                              setAttempted(false);
                            }}
                            className="mt-8 text-sm font-medium text-azure underline-offset-4 transition-colors hover:underline"
                          >
                            {t('contactPage.successAnother')}
                          </button>
                        </motion.div>
                      ) : (
                        <form noValidate onSubmit={handleSubmit} className="space-y-8">
                          {/* Region */}
                          <fieldset>
                            <legend className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
                              {t('contactPage.regionLegend')}
                            </legend>
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                              {REGIONS.map((r) => (
                                <OptionTile
                                  key={r}
                                  active={region === r}
                                  onClick={() => setRegion(r)}
                                  title={t(`contactPage.regions.${r}.name`)}
                                  note={t(`contactPage.regions.${r}.note`)}
                                />
                              ))}
                            </div>
                          </fieldset>

                          {/* Service */}
                          <fieldset>
                            <legend className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
                              {t('contactPage.serviceLegend')}
                            </legend>
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                              {SERVICES.map((s) => (
                                <OptionTile
                                  key={s}
                                  active={service === s}
                                  onClick={() => setService(s)}
                                  title={t(`contactPage.services.${s}.name`)}
                                  note={t(`contactPage.services.${s}.note`)}
                                />
                              ))}
                            </div>
                          </fieldset>

                          {/* Name */}
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-[11px] uppercase tracking-[0.18em] text-ink/55"
                            >
                              {t('contactPage.nameLabel')}
                            </label>
                            <input
                              id="name"
                              type="text"
                              autoComplete="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder={t('contactPage.namePlaceholder')}
                              aria-invalid={showError('name') || undefined}
                              className={`mt-2 ${inputClass(showError('name'))}`}
                            />
                            {showError('name') && (
                              <p className="mt-1.5 text-xs text-terra">
                                {t('contactPage.errors.name')}
                              </p>
                            )}
                          </div>

                          {/* Email + phone */}
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                              <label
                                htmlFor="email"
                                className="block text-[11px] uppercase tracking-[0.18em] text-ink/55"
                              >
                                {t('contactPage.emailLabel')}
                              </label>
                              <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('contactPage.emailPlaceholder')}
                                aria-invalid={showError('email') || undefined}
                                className={`mt-2 ${inputClass(showError('email'))}`}
                              />
                              {showError('email') && (
                                <p className="mt-1.5 text-xs text-terra">
                                  {t('contactPage.errors.email')}
                                </p>
                              )}
                            </div>
                            <div>
                              <label
                                htmlFor="phone"
                                className="block text-[11px] uppercase tracking-[0.18em] text-ink/55"
                              >
                                {t('contactPage.phoneLabel')}
                              </label>
                              <input
                                id="phone"
                                type="tel"
                                autoComplete="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder={t('contactPage.phonePlaceholder')}
                                className={`mt-2 ${inputClass(false)}`}
                              />
                            </div>
                          </div>

                          {/* Message */}
                          <div>
                            <label
                              htmlFor="message"
                              className="block text-[11px] uppercase tracking-[0.18em] text-ink/55"
                            >
                              {t('contactPage.messageLabel')}
                            </label>
                            <textarea
                              id="message"
                              rows={5}
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder={t('contactPage.messagePlaceholder')}
                              aria-invalid={showError('message') || undefined}
                              className={`mt-2 resize-none ${inputClass(showError('message'))}`}
                            />
                            {showError('message') && (
                              <p className="mt-1.5 text-xs text-terra">
                                {t('contactPage.errors.message')}
                              </p>
                            )}
                          </div>

                          {/* Submit */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <button
                              type="submit"
                              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-azure px-7 py-3.5 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out hover:bg-azure-deep active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure focus-visible:ring-offset-2"
                            >
                              <Send size={16} strokeWidth={2} />
                              {t('contactPage.submit')}
                              <ArrowRight
                                size={16}
                                strokeWidth={2}
                                className="transition-transform duration-200 group-hover:translate-x-0.5"
                              />
                            </button>
                            <p className="max-w-[28ch] text-xs leading-relaxed text-ink/45">
                              {t('contactPage.privacy')}
                            </p>
                          </div>
                        </form>
                      )}
                  </div>
                </Reveal>

                <Reveal delay={0.16}>
                  <div className="mt-8 text-center lg:text-left">
                    <Link
                      to="/"
                      className="text-sm text-ink/55 underline-offset-4 transition-colors duration-200 hover:text-azure hover:underline"
                    >
                      {t('contactPage.back')}
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  external = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group flex items-center gap-4 rounded-xl border border-transparent px-1 py-1.5 transition-colors hover:border-ink/10 hover:bg-white"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-azure/10 text-azure transition-colors group-hover:bg-azure group-hover:text-white">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] uppercase tracking-[0.18em] text-ink/45">{label}</span>
          <span className="block truncate text-sm font-medium text-ink">{value}</span>
        </span>
      </a>
    </li>
  );
}
