import { ArrowLeft, CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MarketingNav } from '../../../components/marketing-nav';
import {
  getPublishedBlogPost,
  getPublishedBlogPosts,
} from '../../../features/blog/server';
import { formatDate } from '../../../lib/utils';

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts().catch(() => []);
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug).catch(() => null);
  if (!post) return {};
  const description = post.metaDescription || post.excerpt;
  return {
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    description,
    openGraph: {
      description,
      title: `${post.metaTitle || post.title} | Kodeye`,
      url: `/blog/${post.slug}`,
    },
    title: post.metaTitle || post.title,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug).catch(() => null);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-slate-950">
      <MarketingNav />
      <article>
        <header className="border-b border-slate-200">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
              href="/blog"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
            <p className="mt-8 flex items-center gap-2 text-sm font-semibold text-brand-600">
              <CalendarDays className="h-4 w-4" />
              {formatDate(post.publishedAt ?? post.createdAt)}
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
              {post.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              {post.excerpt}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
            <BlogContent content={post.content} />
          </div>
        </div>
      </article>
    </main>
  );
}

function BlogContent({ content }: { content: string }) {
  return (
    <div className="space-y-5 text-base leading-8 text-slate-700">
      {content
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p className="whitespace-pre-line" key={`${index}-${paragraph}`}>
            {paragraph}
          </p>
        ))}
    </div>
  );
}
