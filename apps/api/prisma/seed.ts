import {
  PrismaClient,
  BlogPostStatus,
  CouponType,
  PlanInterval,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcrypt';

import { SETTING_DEFINITIONS } from '../src/settings/setting-definitions';

const prisma = new PrismaClient();

async function main() {
  const currencies = [
    ['IDR', 'Indonesian Rupiah', 'Rp', 0, true, true, false],
    ['USD', 'US Dollar', '$', 2, false, false, true],
    ['EUR', 'Euro', 'EUR', 2, false, false, true],
    ['SGD', 'Singapore Dollar', 'S$', 2, false, false, true],
  ] as const;
  for (const [
    code,
    name,
    symbol,
    minorUnit,
    isDefault,
    midtrans,
    paypal,
  ] of currencies) {
    await prisma.currency.upsert({
      create: {
        code,
        isDefault,
        minorUnit,
        name,
        supportedByMidtrans: midtrans,
        supportedByPaypal: paypal,
        symbol,
      },
      update: {
        isDefault,
        minorUnit,
        name,
        supportedByMidtrans: midtrans,
        supportedByPaypal: paypal,
        symbol,
      },
      where: { code },
    });
  }
  const plans = [
    {
      basePriceIdr: 0,
      code: 'free',
      enableGithubAutoScan: false,
      enablePdfReport: false,
      enableRecurring: false,
      interval: PlanInterval.MONTHLY,
      isEnterprise: false,
      maxRepositories: 1,
      maxScansPerMonth: 5,
      name: 'Free',
      requiresManualApproval: false,
    },
    {
      basePriceIdr: 99000,
      code: 'pro_monthly',
      enableGithubAutoScan: true,
      enablePdfReport: true,
      enableRecurring: true,
      interval: PlanInterval.MONTHLY,
      isEnterprise: false,
      maxRepositories: 10,
      maxScansPerMonth: 100,
      name: 'Pro Monthly',
      requiresManualApproval: false,
    },
    {
      basePriceIdr: 299000,
      code: 'team_monthly',
      enableGithubAutoScan: true,
      enablePdfReport: true,
      enableRecurring: true,
      interval: PlanInterval.MONTHLY,
      isEnterprise: false,
      maxRepositories: 50,
      maxScansPerMonth: 500,
      name: 'Team Monthly',
      requiresManualApproval: false,
    },
    {
      basePriceIdr: null,
      code: 'enterprise_custom',
      enableGithubAutoScan: true,
      enablePdfReport: true,
      enableRecurring: false,
      interval: PlanInterval.CUSTOM,
      isEnterprise: true,
      maxRepositories: 1000,
      maxScansPerMonth: 10000,
      name: 'Enterprise Custom',
      requiresManualApproval: true,
    },
  ];
  for (const plan of plans) {
    const saved = await prisma.plan.upsert({
      create: plan,
      update: plan,
      where: { code: plan.code },
    });
    if (plan.code === 'free') {
      for (const [code] of currencies)
        await prisma.planPrice.upsert({
          create: { amount: 0, currencyCode: code, planId: saved.id },
          update: { amount: 0 },
          where: {
            planId_currencyCode: { currencyCode: code, planId: saved.id },
          },
        });
    }
  }
  await prisma.coupon.upsert({
    create: {
      code: 'LAUNCH20',
      name: 'Launch 20%',
      percentOff: 20,
      type: CouponType.PERCENT,
    },
    update: {},
    where: { code: 'LAUNCH20' },
  });
  const fixed = await prisma.coupon.upsert({
    create: {
      code: 'KODEYEIDR50',
      name: 'Kodeye IDR 50K',
      type: CouponType.FIXED_AMOUNT,
    },
    update: {},
    where: { code: 'KODEYEIDR50' },
  });
  await prisma.couponAmount.upsert({
    create: { amountOff: 50000, couponId: fixed.id, currencyCode: 'IDR' },
    update: { amountOff: 50000 },
    where: {
      couponId_currencyCode: { couponId: fixed.id, currencyCode: 'IDR' },
    },
  });
  for (const definition of SETTING_DEFINITIONS) {
    await prisma.appSetting.upsert({
      create: {
        category: definition.category,
        description: definition.description,
        isSecret: Boolean(definition.isSecret),
        key: definition.key,
        valueType: definition.valueType,
      },
      update: {
        category: definition.category,
        description: definition.description,
        isSecret: Boolean(definition.isSecret),
        valueType: definition.valueType,
      },
      where: { key: definition.key },
    });
  }
  const blogPosts = [
    {
      title: 'AI-Powered Secure Code Review: Mengapa Scanner Konvensional Tidak Cukup',
      slug: 'ai-powered-secure-code-review',
      excerpt:
        'Bagaimana AI automation mendeteksi kerentanan logika bisnis rumit yang sering dilewatkan oleh SAST konvensional seperti OWASP Top 10 dan CWE risk classes.',
      metaTitle: 'AI-Powered Secure Code Review | Kodeye Blog',
      metaDescription:
        'Pelajari bagaimana AI Code Review mengatasi keterbatasan scanner SAST konvensional dalam mendeteksi OWASP Top 10 dan celah keamanan logika.',
      status: BlogPostStatus.PUBLISHED,
      publishedAt: new Date('2026-06-20T10:00:00Z'),
      content: `Keamanan aplikasi di era modern tidak lagi cukup hanya mengandalkan *Static Application Security Testing* (SAST) berbasis aturan kaku (rule-based). Scanner konvensional sering kali menghasilkan ratusan *false positive* sekaligus melewatkan cacat logika bisnis kritis.

## Mengapa SAST Konvensional Memiliki Batasan?
1. **Kurangnya Konteks Arsitektur**: Scanner tradisional memeriksa AST (Abstract Syntax Tree) secara terisolasi tanpa memahami aliran data lintas microservice.
2. **Cacat Logika (Business Logic Flaws)**: Kerentanan seperti *IDOR (Insecure Direct Object References)* atau bypass otorisasi tingkat lanjut sulit dideteksi tanpa pemahaman semantik kode.
3. **Kelelahan Peringatan (Alert Fatigue)**: Developer menghabiskan 60% waktu Triase hanya untuk mengabaikan peringatan palsu.

## Pendekatan AI Automation di Kodeye
Melalui kombinasi analisis statis presisi tinggi dan pemodelan AI generatif khusus engineering, Kodeye melakukan tinjauan mendalam terhadap *Pull Request* secara otomatis:
- **Korelasi OWASP Top 10 & CWE**: Setiap temuan dikaitkan langsung dengan standar industri dan rekomendasi perbaikan instan.
- **Validasi Otomatis**: AI mensimulasikan eksploitasi potensial sebelum memberikan status *Failed* pada jalur CI/CD.

Dengan mengintegrasikan Kodeye langsung ke repositori GitHub perusahaan, tim engineering dapat mempercepat siklus rilis hingga 4x lebih cepat dengan standar keamanan level *Bank-Grade*.`,
    },
    {
      title: 'Arsitektur Modern Zero-Downtime Deployment untuk Aplikasi Enterprise',
      slug: 'arsitektur-modern-zero-downtime-deployment',
      excerpt:
        'Panduan praktis membangun infrastruktur cloud berkinerja tinggi dengan Docker, VPS Worker, Blue-Green Deployment, dan automated rollback.',
      metaTitle: 'Arsitektur Zero-Downtime Deployment | Kodeye Blog',
      metaDescription:
        'Strategi DevOps membangun sistem enterprise berkinerja tinggi tanpa downtime menggunakan Docker kontainerisasi dan rollback otomatis.',
      status: BlogPostStatus.PUBLISHED,
      publishedAt: new Date('2026-06-22T14:30:00Z'),
      content: `Downtime dalam aplikasi enterprise tidak hanya merugikan secara finansial, tetapi juga merusak reputasi brand. Arsitektur cloud modern dituntut untuk mendukung pembaruan kode puluhan kali sehari tanpa memutus koneksi pengguna aktif.

## Pilar Utama Infrastruktur Zero-Downtime
Membangun sistem yang tangguh membutuhkan harmoni antara lapisan load balancer, kontainer aplikasi, dan replikasi database:

1. **Blue-Green Deployment Strategy**
   Menjalankan dua lingkungan produksi yang identik (Blue dan Green). Saat pembaruan siap, trafik dialihkan seketika melalui reverse proxy seperti Nginx atau Traefik tanpa *dropped request*.

2. **Decoupled Background Workers**
   Proses berat seperti pemindaian keamanan kode (security scanning) atau ekspor laporan PDF dipisahkan dari API utama ke antrean asinkron (*Redis-backed BullMQ*) yang dijalankan oleh VPS Worker terdedikasi.

3. **Automated Health Checks & Rollback**
   Sistem orkestrasi memantau metrik latensi dan tingkat error HTTP 5xx. Jika ambang batas terlampaui dalam 30 detik pertama rilis, trafik dikembalikan secara otomatis ke versi stabil sebelumnya.

Tim infrastruktur Kodeye merancang standar otomasi DevOps ini untuk memastikan sistem klien beroperasi dengan ketersediaan 99.99% (*Four Nines*).`,
    },
    {
      title: 'Membangun SaaS B2B Skala Besar: Pengalaman Tim Engineering Kodeye',
      slug: 'membangun-saas-b2b-skala-besar',
      excerpt:
        'Catatan engineering di balik pengembangan arsitektur multi-tenant berkecepatan tinggi dengan Next.js, NestJS, dan Prisma ORM.',
      metaTitle: 'Membangun SaaS B2B Skala Besar | Kodeye Blog',
      metaDescription:
        'Membedah stack teknologi modern Next.js 15, NestJS, dan Prisma ORM dalam membangun produk SaaS multi-tenant berkinerja tinggi.',
      status: BlogPostStatus.PUBLISHED,
      publishedAt: new Date('2026-06-25T08:15:00Z'),
      content: `Mengembangkan produk *Software as a Service* (SaaS) B2B memiliki kompleksitas unik: pemisahan ketat data antar organisasi (multi-tenancy), manajemen penagihan berlangganan (recurring billing), dan tata kelola hak akses berbasis peran (RBAC).

## Pemilihan Tech Stack yang Pragmatis
Setelah mengevaluasi berbagai pendekatan arsitektur, tim Kodeye menetapkan standar pemrogram ganda (*Type-Safe Monorepo*):

- **Frontend: Next.js dengan App Router**
  Memberikan kombinasi optimal antara *Server-Side Rendering* (SSR) untuk SEO halaman publik dan *Client Components* interaktif untuk dashboard manajemen yang reaktif.
- **Backend: NestJS Modular Architecture**
  Menyediakan kerangka kerja berdisiplin tinggi berbasis *Dependency Injection*, mempermudah penerapan arsitektur *Domain-Driven Design* (DDD) dan pemeliharaan kode jangka panjang.
- **Database Layer: Prisma ORM & MySQL**
  Menjamin integrasi tipe data konsisten dari skema database hingga ke UI komponen, memangkas 80% potensi *runtime error* akibat ketidakcocokan payload JSON.

## Pelajaran Berharga bagi Startup & Enterprise
Kesalahan umum pengembangan SaaS adalah membangun terlalu banyak abstraksi di awal. Kunci keberhasilan terletak pada pondasi kode yang modular, sistem logging terpusat, dan otomatisasi pengujian unit sebelum penskalaan horizontal dilakukan.`,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      create: post,
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        status: post.status,
        publishedAt: post.publishedAt,
      },
      where: { slug: post.slug },
    });
  }
  console.log('Seeded 3 published blog posts');

  const portfolioProjects = [
    {
      id: 'port-1',
      title: 'Website Development',
      subtitle: 'Corporate Landing Page & E-Commerce',
      category: 'Website Development',
      imageUrl: '/projects/landing-web.png',
      projectUrl: 'https://kodeye.id',
      sortOrder: 1,
      isActive: true,
    },
    {
      id: 'port-2',
      title: 'AI Automation Workflow',
      subtitle: 'WhatsApp Bot & Admin Automation',
      category: 'AI Automation',
      imageUrl: '/projects/ai-automation.png',
      projectUrl: 'https://kodeye.id',
      sortOrder: 2,
      isActive: true,
    },
    {
      id: 'port-3',
      title: 'Custom Web Application',
      subtitle: 'SaaS Dashboard & Internal System',
      category: 'Website Development',
      imageUrl: '/projects/web-dashboard.png',
      projectUrl: 'https://kodeye.id',
      sortOrder: 3,
      isActive: true,
    },
    {
      id: 'port-4',
      title: 'AI Chatbot Assistant',
      subtitle: '24/7 Customer Support Integration',
      category: 'AI Automation',
      imageUrl: '/projects/chatbot-app.png',
      projectUrl: 'https://kodeye.id',
      sortOrder: 4,
      isActive: true,
    },
  ];

  for (const project of portfolioProjects) {
    await prisma.portfolioProject.upsert({
      create: project,
      update: project,
      where: { id: project.id },
    });
  }
  console.log('Seeded 4 portfolio projects');

  const teamMembers = [
    {
      name: 'M. Arif',
      role: 'Founder & Lead AI Architect',
      description: 'Arsitek utama sistem kecerdasan buatan, arsitektur cloud ekstrim, serta strategi pengembangan perangkat lunak.',
      photoUrl: '/hero-girl.jpg',
      linkedinUrl: 'https://linkedin.com',
      githubUrl: 'https://github.com',
      instagramUrl: 'https://instagram.com',
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Sarah Jenkins',
      role: 'Lead Cloud & DevOps Engineer',
      description: 'Pakar infrastruktur cloud berketahanan tinggi, keandalan server 99.99%, dan otomasi alur integrasi berkelanjutan.',
      photoUrl: '/hero-girl.jpg',
      linkedinUrl: 'https://linkedin.com',
      githubUrl: 'https://github.com',
      instagramUrl: 'https://instagram.com',
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Alex Santoso',
      role: 'Lead UI/UX & Web Developer',
      description: 'Spesialis antarmuka pengguna interaktif, animasi mikro berkonversi tinggi, dan performa pemuatan web super kilat.',
      photoUrl: '/hero-girl.jpg',
      linkedinUrl: 'https://linkedin.com',
      githubUrl: 'https://github.com',
      instagramUrl: 'https://instagram.com',
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const m of teamMembers) {
    const existing = await prisma.teamMember.findFirst({ where: { name: m.name } });
    if (!existing) {
      await prisma.teamMember.create({ data: m });
    }
  }
  console.log('Seeded 3 team members');

  const trustedCompanies = [
    { name: 'Telkomsel Indonesia', logoUrl: '/kodeye-logo.png', websiteUrl: 'https://kodeye.id', sortOrder: 1, isActive: true },
    { name: 'Bank BCA', logoUrl: '/kodeye-logo.png', websiteUrl: 'https://kodeye.id', sortOrder: 2, isActive: true },
    { name: 'Tokopedia', logoUrl: '/kodeye-logo.png', websiteUrl: 'https://kodeye.id', sortOrder: 3, isActive: true },
    { name: 'Gojek Tech', logoUrl: '/kodeye-logo.png', websiteUrl: 'https://kodeye.id', sortOrder: 4, isActive: true },
  ];

  for (const c of trustedCompanies) {
    const existing = await prisma.trustedCompany.findFirst({ where: { name: c.name } });
    if (!existing) {
      await prisma.trustedCompany.create({ data: c });
    }
  }
  console.log('Seeded 4 trusted companies');

  const isProduction = process.env.NODE_ENV === 'production';
  const adminEmail =
    process.env.ADMIN_SEED_EMAIL || (!isProduction ? 'admin@kodeye.local' : '');
  const adminPassword =
    process.env.ADMIN_SEED_PASSWORD || (!isProduction ? 'KodeyeAdmin123!' : '');
  if (adminEmail && adminPassword) {
    const email = adminEmail.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          name: process.env.ADMIN_SEED_NAME ?? 'Kodeye Admin',
          passwordHash: await bcrypt.hash(adminPassword, 12),
          role: UserRole.ADMIN,
        },
      });
      console.log(`Seeded admin user: ${email}`);
    } else if (process.env.ADMIN_SEED_OVERWRITE === 'true') {
      await prisma.user.update({
        data: {
          name: process.env.ADMIN_SEED_NAME ?? existing.name,
          passwordHash: await bcrypt.hash(adminPassword, 12),
          role: UserRole.ADMIN,
        },
        where: { id: existing.id },
      });
      console.log(`Updated existing admin user: ${email}`);
    } else if (existing.role !== UserRole.ADMIN) {
      await prisma.user.update({
        data: { role: UserRole.ADMIN },
        where: { id: existing.id },
      });
      console.log(`Promoted existing user to admin: ${email}`);
    } else {
      console.log(`Admin user already exists: ${email}`);
    }
  } else {
    console.log(
      'Admin seed skipped. ADMIN_SEED_EMAIL or ADMIN_SEED_PASSWORD not set.',
    );
  }
}

void main().finally(() => prisma.$disconnect());
