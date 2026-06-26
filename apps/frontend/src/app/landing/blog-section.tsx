'use client';

import { ArrowUpRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';

import { GridDots } from './hero-section';
import type { LandingBlogPost } from './types';

interface BlogSectionProps {
  posts: LandingBlogPost[];
}

const fallbackPosts: LandingBlogPost[] = [
  {
    id: 'fallback-1',
    title: 'AI-Powered Secure Code Review: Mengapa Scanner Konvensional Tidak Cukup',
    slug: 'ai-powered-secure-code-review',
    excerpt:
      'Bagaimana AI automation mendeteksi kerentanan logika bisnis rumit yang sering dilewatkan oleh SAST konvensional seperti OWASP Top 10 dan CWE risk classes.',
    displayDate: '20 Jun 2026',
    createdAt: null,
    updatedAt: null,
    publishedAt: null,
  },
  {
    id: 'fallback-2',
    title: 'Arsitektur Modern Zero-Downtime Deployment untuk Aplikasi Enterprise',
    slug: 'arsitektur-modern-zero-downtime-deployment',
    excerpt:
      'Panduan praktis membangun infrastruktur cloud berkinerja tinggi dengan Docker kontainerisasi, VPS Worker, Blue-Green Deployment, dan automated rollback.',
    displayDate: '22 Jun 2026',
    createdAt: null,
    updatedAt: null,
    publishedAt: null,
  },
  {
    id: 'fallback-3',
    title: 'Membangun Aplikasi Web Kustom Skala Besar: Pengalaman Tim Kodeye',
    slug: 'membangun-aplikasi-web-kustom-skala-besar',
    excerpt:
      'Catatan engineering di balik pengembangan arsitektur multi-tenant berkecepatan tinggi dengan Next.js 15, NestJS modular, dan Prisma ORM.',
    displayDate: '25 Jun 2026',
    createdAt: null,
    updatedAt: null,
    publishedAt: null,
  },
];

export function BlogSection({ posts }: BlogSectionProps) {
  const displayedPosts = posts && posts.length > 0 ? posts : fallbackPosts;

  return (
    <section id="blog" className="bg-background py-20 px-6 lg:px-12 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center">
              Kodeye Insights <GridDots className="text-primary ml-3" />
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">
              Catatan teknologi, arsitektur cloud, keamanan cyber, dan inovasi AI automation langsung dari praktisi engineering Kodeye.
            </p>
          </div>

          <div>
            <Link
              href="/blog"
              className="rounded-full border border-white/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:border-primary hover:bg-primary/10 transition inline-block"
            >
              Show All
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayedPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-card border border-white/[0.06] p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
            >
              <div>
                {/* Top Badge & Date */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] px-3 py-1 text-xs font-mono text-primary group-hover:border-primary/30 transition-colors">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {post.displayDate || 'Recent'}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary/60">
                    Article
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white tracking-tight leading-snug group-hover:text-primary transition-colors duration-300">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="mt-4 text-sm text-text-secondary leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              {/* Card Footer Link */}
              <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white group-hover:text-primary transition-colors">
                  Read Article
                </span>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] border border-white/10 text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary group-hover:text-white">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              {/* Ambient Glow */}
              <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
