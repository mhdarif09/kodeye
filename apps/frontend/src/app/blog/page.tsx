import { CalendarDays, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { MarketingNav } from '../../components/marketing-nav';
import { getPublishedBlogPosts } from '../../features/blog/server';
import { formatDate } from '../../lib/utils';

export const metadata: Metadata = {
  alternates: {
    canonical: '/blog',
  },
  description:
    'Read Kodeye articles about AI code review, secure engineering, OWASP, CWE, CodeQL, Semgrep, Trivy, and developer workflow automation.',
  openGraph: {
    description:
      'Read Kodeye articles about AI code review, secure engineering, OWASP, CWE, CodeQL, Semgrep, Trivy, and developer workflow automation.',
    title: 'Blog | Kodeye',
    url: '/blog',
  },
  title: 'Blog',
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts().catch(() => []);

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-slate-950">
      <MarketingNav />
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
            <FileText className="h-4 w-4 text-brand-600" />
            Kodeye Blog
          </p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
              Secure code review notes from the Kodeye team.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Practical articles about AI-assisted code audit, OWASP Top 10, CWE
              risk classes, scanner workflows, and engineering quality.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:px-8">
          {posts.map((post) => (
            <article
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70"
              key={post.id}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="flex items-center gap-2 text-sm font-semibold text-brand-600">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(post.publishedAt ?? post.createdAt)}
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-950">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {post.excerpt}
                  </p>
                </div>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  href={`/blog/${post.slug}`}
                >
                  Read article
                </Link>
              </div>
            </article>
          ))}
          {posts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
              No published blog posts yet.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
