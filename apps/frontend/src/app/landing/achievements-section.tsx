'use client';

import { Trophy } from 'lucide-react';

type Lang = 'id' | 'en';

interface AchievementsSectionProps {
  lang: Lang;
}

const data = {
  id: {
    eyebrow: 'Pencapaian Kami',
    numbers: [
      { value: '20', label: 'tahun\ngabungan pengalaman\ntim kami' },
      { value: '25', label: 'project\nAI & Web selesai\ndi 2025' },
    ],
    description:
      'Kami percaya bahwa kerja terbaik lahir dari kolaborasi yang jujur, scope yang jelas, dan eksekusi yang rapi. Setiap project adalah komitmen, bukan sekadar transaksi.',
    achievements: [
      'Best Digital Agency — TechAwards 2025',
      'Innovation Design Partner',
      'Client Satisfaction Leader',
      'Growth Tech Company of the Year',
    ],
  },
  en: {
    eyebrow: 'Our Achievements',
    numbers: [
      { value: '20', label: 'years\ncombined team\nexperience' },
      { value: '25', label: 'AI & Web\nprojects delivered\nin 2025' },
    ],
    description:
      'We believe the best work comes from honest collaboration, clear scope, and clean execution. Every project is a commitment, not just a transaction.',
    achievements: [
      'Best Digital Agency — TechAwards 2025',
      'Innovation Design Partner',
      'Client Satisfaction Leader',
      'Growth Tech Company of the Year',
    ],
  },
};

export function AchievementsSection({ lang }: AchievementsSectionProps) {
  const t = data[lang];

  return (
    <section className="relative bg-[#111111] px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-px w-full max-w-xl -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl">
        <p className="mb-12 text-xs font-bold uppercase tracking-widest text-brand-400">{t.eyebrow}</p>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: Big numbers */}
          <div className="space-y-6">
            {t.numbers.map((item, i) => (
              <div key={i} className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                  {/* Number */}
                  <span
                    className="block text-[7rem] font-black leading-none tracking-tighter"
                    style={{
                      background: 'linear-gradient(135deg, #6F3CFF 0%, #00D4FF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {item.value}
                  </span>
                  {/* Decorative dots */}
                  <div className="absolute -right-4 top-4 grid grid-cols-3 gap-1">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <span
                        key={j}
                        className="h-1 w-1 rounded-full bg-brand-500/40"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm font-medium leading-6 text-[#B0B0B0] whitespace-pre-line">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Right: Description + Achievements */}
          <div>
            <p className="text-base leading-8 text-[#B0B0B0]">{t.description}</p>

            <div className="mt-10 space-y-3">
              {t.achievements.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#161616] px-5 py-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="mr-3 text-xs font-bold text-brand-400">{i + 1}</span>
                    <span className="text-sm font-medium text-white">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
