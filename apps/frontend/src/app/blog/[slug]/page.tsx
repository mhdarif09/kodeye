import { ArrowLeft, CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MarketingNav } from '../../../components/marketing-nav';
import {
  getPublishedBlogPost,
  getPublishedBlogPosts,
} from '../../../features/blog/server';
import { whatsappUrl } from '../../../lib/whatsapp';
import { TestimonialsCtaFooter } from '../../landing/testimonials-cta-footer';

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts().catch(() => []);
  const fallbackSlugs = [
    { slug: 'ai-powered-secure-code-review' },
    { slug: 'arsitektur-modern-zero-downtime-deployment' },
    { slug: 'membangun-aplikasi-web-kustom-skala-besar' },
  ];
  const dbSlugs = posts.map((post) => ({ slug: post.slug }));
  return [...dbSlugs, ...fallbackSlugs];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug).catch(() => null);
  if (!post) {
    if (slug === 'ai-powered-secure-code-review') return { title: 'AI-Powered Secure Code Review | Kodeye' };
    if (slug === 'arsitektur-modern-zero-downtime-deployment') return { title: 'Arsitektur Zero-Downtime Deployment | Kodeye' };
    if (slug === 'membangun-aplikasi-web-kustom-skala-besar') return { title: 'Membangun Aplikasi Web Kustom Skala Besar | Kodeye' };
    return {};
  }
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
  let post = await getPublishedBlogPost(slug).catch(() => null);
  const whatsappHref = whatsappUrl();

  if (!post && slug === 'ai-powered-secure-code-review') {
    post = {
      id: 'fallback-detail-1',
      title: 'AI-Powered Secure Code Review: Mengapa Scanner Konvensional Tidak Cukup',
      slug: 'ai-powered-secure-code-review',
      excerpt: 'Bagaimana AI automation mendeteksi kerentanan logika bisnis rumit yang sering dilewatkan oleh SAST konvensional.',
      content: `Keamanan aplikasi di era modern tidak lagi cukup hanya mengandalkan Static Application Security Testing (SAST) berbasis aturan kaku (rule-based). Scanner konvensional sering kali menghasilkan ratusan false positive sekaligus melewatkan cacat logika bisnis kritis.

Mengapa SAST Konvensional Memiliki Batasan?

1. Kurangnya Konteks Arsitektur
Scanner tradisional memeriksa AST (Abstract Syntax Tree) secara terisolasi tanpa memahami aliran data lintas microservice atau API eksternal.

2. Cacat Logika (Business Logic Flaws)
Kerentanan seperti IDOR (Insecure Direct Object References), manipulasi parameter penagihan, atau bypass otorisasi tingkat lanjut sulit dideteksi tanpa pemahaman semantik dari bisnis proses aplikasi.

3. Kelelahan Peringatan (Alert Fatigue)
Tim keamanan dan developer sering kali menghabiskan lebih dari 60% waktu triase mereka hanya untuk mengabaikan peringatan palsu (false positives).

Pendekatan AI Automation di Kodeye

Melalui kombinasi analisis statis presisi tinggi dan pemodelan AI generatif khusus engineering, Kodeye melakukan tinjauan mendalam terhadap Pull Request secara otomatis langsung di GitHub Anda.`,
      status: 'PUBLISHED',
      metaTitle: null,
      metaDescription: null,
      publishedAt: '2026-06-20T10:00:00Z',
      createdAt: '2026-06-20T10:00:00Z',
      updatedAt: '2026-06-20T10:00:00Z',
      author: null,
    };
  } else if (!post && slug === 'arsitektur-modern-zero-downtime-deployment') {
    post = {
      id: 'fallback-detail-2',
      title: 'Arsitektur Modern Zero-Downtime Deployment untuk Aplikasi Enterprise',
      slug: 'arsitektur-modern-zero-downtime-deployment',
      excerpt: 'Panduan praktis membangun infrastruktur cloud berkinerja tinggi dengan Docker kontainerisasi, VPS Worker, Blue-Green Deployment, dan automated rollback.',
      content: `Downtime saat deployment adalah mimpi buruk bagi aplikasi bisnis kritikal. Setiap detik server tidak dapat diakses berarti kerugian finansial dan penurunan reputasi brand di mata pengguna.

Kunci Utama Zero-Downtime Deployment:

1. Kontainerisasi dengan Docker & Kubernetes
Mengemas aplikasi dan seluruh dependensinya dalam kontainer terisolasi memastikan perilaku aplikasi konsisten di lingkungan staging maupun produksi.

2. Strategi Blue-Green Deployment
Menjalankan dua lingkungan produksi yang identik (Blue dan Green). Saat rilis baru siap, traffic dialihkan secara instan dari Blue ke Green melalui load balancer.

3. Automated Rollback Mechanism
Jika pemantauan kesehatan (health check) mendeteksi lonjakan error rate dalam 60 detik pertama setelah rilis, sistem secara otomatis mengembalikan routing ke versi sebelumnya.`,
      status: 'PUBLISHED',
      metaTitle: null,
      metaDescription: null,
      publishedAt: '2026-06-22T10:00:00Z',
      createdAt: '2026-06-22T10:00:00Z',
      updatedAt: '2026-06-22T10:00:00Z',
      author: null,
    };
  } else if (!post && slug === 'membangun-aplikasi-web-kustom-skala-besar') {
    post = {
      id: 'fallback-detail-3',
      title: 'Membangun Aplikasi Web Kustom Skala Besar: Pengalaman Tim Kodeye',
      slug: 'membangun-aplikasi-web-kustom-skala-besar',
      excerpt: 'Catatan engineering di balik pengembangan arsitektur web modern berkecepatan tinggi dengan Next.js 15, NestJS modular, dan Prisma ORM.',
      content: `Aplikasi bisnis skala enterprise membutuhkan ketahanan tinggi terhadap lonjakan traffic konkuren dan kemudahan skalabilitas kode dalam jangka panjang.

Arsitektur Stack Pilihan Kodeye:

1. Frontend Next.js dengan Server Components
Memanfaatkan React Server Components (RSC) untuk meminimalkan ukuran bundel JavaScript di sisi klien sehingga Core Web Vitals selalu sempurna.

2. Backend NestJS Modular
Struktur kode berbasis modul yang terdesentralisasi memungkinkan tim engineer bekerja paralel tanpa risiko konflik kode antar layanan.

3. Database Optimization & Redis Caching
Penerapan strategi indexing basis data yang presisi dikombinasikan dengan lapisan cache in-memory Redis untuk respon API di bawah 50ms.`,
      status: 'PUBLISHED',
      metaTitle: null,
      metaDescription: null,
      publishedAt: '2026-06-25T10:00:00Z',
      createdAt: '2026-06-25T10:00:00Z',
      updatedAt: '2026-06-25T10:00:00Z',
      author: null,
    };
  }

  if (!post) notFound();

  const formatDateStr = (dateVal: string | Date | null | undefined) => {
    if (!dateVal) return '20 Jun 2026';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '20 Jun 2026';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  };

  return (
    <main className="min-h-screen bg-background text-white selection:bg-primary/30 selection:text-white overflow-hidden">
      <MarketingNav whatsappHref={whatsappHref} />

      <article className="pt-36 pb-20 px-6 lg:px-12 relative z-10">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Back button */}
          <div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300 hover:bg-white/10 hover:text-white hover:border-primary/50 transition duration-300"
            >
              <ArrowLeft className="h-4 w-4 text-primary" /> Kembali ke Daftar Artikel
            </Link>
          </div>

          {/* Article Header Box */}
          <div className="rounded-3xl bg-card border border-white/[0.08] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-4 mb-6 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                Kodeye Insight
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
                <CalendarDays className="h-3.5 w-3.5 text-primary" /> {formatDateStr(post.publishedAt || (post as unknown as Record<string, string>).createdAt)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-6 relative z-10">
              {post.title}
            </h1>
            <p className="text-sm sm:text-lg leading-8 text-text-secondary font-normal border-l-2 border-primary pl-4 relative z-10">
              {post.excerpt}
            </p>
          </div>

          {/* Article Body Content */}
          <div className="rounded-3xl bg-[#0e0e0e] border border-white/[0.06] p-8 sm:p-14 shadow-xl">
            <BlogContent content={post.content} />
          </div>
        </div>
      </article>

      <TestimonialsCtaFooter whatsappHref={whatsappHref} />
    </main>
  );
}

function BlogContent({ content }: { content: string }) {
  return (
    <div className="space-y-6 text-sm sm:text-base leading-8 text-slate-200 font-normal">
      {content
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => {
          // If paragraph looks like a section header (short line or ends with ?)
          const isHeading = paragraph.length < 60 && (paragraph.match(/^[0-9]\./) || paragraph.endsWith('?') || paragraph.includes('Kunci Utama') || paragraph.includes('Arsitektur'));
          
          if (isHeading) {
            return (
              <h3 key={index} className="text-lg sm:text-xl font-bold text-primary pt-4 pb-1 font-mono">
                {paragraph}
              </h3>
            );
          }

          return (
            <p className="whitespace-pre-line leading-7" key={index}>
              {paragraph}
            </p>
          );
        })}
    </div>
  );
}
