'use client';

import Image from 'next/image';
import Link from 'next/link';

import { legalNav, mainNav, site as repo } from '@/content/site';
import { useCompany } from '@/lib/use-content';
import { container, eyebrow } from './ui';

export function Footer() {
  const year = new Date().getFullYear();
  const site = useCompany();

  return (
    <footer className="mt-20 border-t border-edge bg-paper">
      <div className={`${container} pb-7 pt-14`}>
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Image src="/logo.svg" alt={site.name} width={110} height={22} className="h-[22px] w-auto" />
            <p className="mt-3.5 text-[13.5px] font-bold text-ink-900">{repo.headline}</p>
            <p className="mt-1 max-w-[320px] text-[13.5px] italic leading-relaxed text-ink-600">
              «&nbsp;{repo.slogan}&nbsp;»
            </p>
            <p className="mt-3.5 max-w-[320px] text-[13.5px] leading-relaxed text-ink-600">
              {repo.meaning}. Conseils en économie d&apos;eau et d&apos;énergie depuis {repo.since} —
              missions volontaires ou réglementaires.
            </p>
          </div>

          <div>
            <p className={`${eyebrow} mb-3.5`}>Missions</p>
            <ul className="flex flex-col gap-2 text-[13px] font-semibold text-ink-600">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-leaf-700">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={`${eyebrow} mb-3.5`}>Contact</p>
            <address className="flex flex-col gap-2 text-[13px] not-italic text-ink-600">
              <span className="font-bold text-ink-900">{site.owner.name}</span>
              <a href={`tel:${site.contact.phoneE164}`} className="tabular-nums hover:text-leaf-700">
                {site.contact.phone}
              </a>
              <a href={`mailto:${site.contact.email}`} className="hover:text-leaf-700">
                {site.contact.email}
              </a>
              <span>
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}
              </span>
            </address>
            <Link
              href="/contact/"
              className="mt-3.5 inline-block text-[13px] font-bold text-ink-900 underline decoration-leaf-400 underline-offset-4 hover:text-leaf-700"
            >
              Nous écrire
            </Link>
          </div>
        </div>

        <div className="mt-11 flex flex-wrap justify-between gap-x-5 gap-y-2 border-t border-edge pt-5 text-[11.5px] text-ink-600">
          <span>
            © {year} {site.legalName} — {site.address.city}
          </span>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            {legalNav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-leaf-700">
                {item.label}
              </Link>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
