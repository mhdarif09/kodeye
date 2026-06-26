import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { MarketingNav } from '../../components/marketing-nav';
import { getPublishedBlogPosts } from '../../features/blog/server';
import { whatsappUrl } from '../../lib/whatsapp';
import { GridDots } from '../landing/hero-section';
import { TestimonialsCtaFooter } from '../landing/testimonials-cta-footer';

export const metadata: Metadata = {
  alternates: {
    canonical: '/blog',
  },
  description:
    'Baca artikel wawasan teknologi Kodeye: AI code review, web development berkinerja tinggi, arsitektur cloud ekstrim, dan otomasi sistem digital.',
  openGraph: {
    description:
      'Baca artikel wawasan teknologi Kodeye: AI code review, web development berkinerja tinggi, arsitektur cloud ekstrim, dan otomasi sistem digital.',
    title: 'Blog Insights | Kodeye - Digital & AI Agency',
    url: '/blog',
  },
  title: 'Blog Insights',
};

const fallbackPosts = [
  {
    id: 'fallback-1',
    title: 'AI-Powered Secure Code Review: Mengapa Scanner Konvensional Tidak Cukup',
    slug: 'ai-powered-secure-code-review',
    excerpt:
      'Bagaimana AI automation mendeteksi kerentanan logika bisnis rumit yang sering dilewatkan oleh SAST konvensional seperti OWASP Top 10 dan CWE risk classes.',
    publishedAt: '2026-06-20T10:00:00Z',
    category: 'AI Automation',
  },
  {
    id: 'fallback-2',
    title: 'Arsitektur Modern Zero-Downtime Deployment untuk Aplikasi Enterprise',
    slug: 'arsitektur-modern-zero-downtime-deployment',
    excerpt:
      'Panduan praktis membangun infrastruktur cloud berkinerja tinggi dengan Docker kontainerisasi, VPS Worker, Blue-Green Deployment, dan automated rollback.',
    publishedAt: '2026-06-22T10:00:00Z',
    category: 'Cloud & DevOps',
  },
  {
    id: 'fallback-3',
    title: 'Membangun Aplikasi Web Kustom Skala Besar: Pengalaman Tim Kodeye',
    slug: 'membangun-aplikasi-web-kustom-skala-besar',
    excerpt:
      'Catatan engineering di balik pengembangan arsitektur multi-tenant berkecepatan tinggi dengan Next.js 15, NestJS modular, dan Prisma ORM.',
    publishedAt: '2026-06-25T10:00:00Z',
    category: 'Web Development',
  },
];

export default async function BlogPage() {
  const rawPosts = await getPublishedBlogPosts().catch(() => []);
  const whatsappHref = whatsappUrl();

  const posts = rawPosts && rawPosts.length > 0 ? rawPosts : fallbackPosts;

  const formatDateStr = (dateVal: string | Date | null | undefined) => {
    if (!dateVal) return '20 Jun 2026';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '20 Jun 2026';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  };

  return (
    <main className="min-h-screen bg-background text-white selection:bg-primary/30 selection:text-white overflow-hidden">
      <MarketingNav whatsappHref={whatsappHref} />

      {/* Hero Header */}
      <section className="relative pt-36 pb-20 px-6 lg:px-12 text-center overflow-hidden min-h-[420px] flex items-center justify-center">
        {/* Giant Watermark Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="text-[15vw] md:text-[13rem] font-black uppercase tracking-widest text-white/[0.03] scale-y-125 font-mono">
            Insights
          </span>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary shadow-glow">
            <Sparkles className="h-3.5 w-3.5" /> Engineering & Tech Notes
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white flex items-center justify-center">
            Kodeye Blog <GridDots className="text-primary ml-3 animate-pulse" />
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-7 max-w-xl mx-auto">
            Wawasan praktis seputar pengembangan website konversi tinggi, otomatisasi AI WhatsApp, arsitektur server, dan standar audit keamanan kode.
          </p>
        </div>
      </section>

      {/* Blog Grid List */}
      <section className="py-16 px-6 lg:px-12 relative z-10">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => {
            const postRecord = post as unknown as Record<string, string>;
            const dateDisplay = formatDateStr(post.publishedAt || postRecord.createdAt);
            const categoryTag = postRecord.category || 'Tech Insight';

            return (
              <article
                key={post.id || idx}
                className="group relative flex flex-col justify-between rounded-3xl bg-card border border-white/[0.08] p-8 transition-all duration-500 hover:border-primary/60 hover:-translate-y-2 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                      {categoryTag}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" /> {dateDisplay}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-3">
                    {post.title}
                  </h2>
                  <p className="text-xs leading-6 text-text-secondary line-clamp-3 mb-8 font-normal">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-semibold text-white group-hover:text-primary transition">
                    Baca Artikel Lengkap
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white group-hover:bg-primary group-hover:border-primary group-hover:shadow-glow transition duration-300"
                    aria-label={`Read ${post.title}`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <TestimonialsCtaFooter whatsappHref={whatsappHref} />
    </main>
  );
}
