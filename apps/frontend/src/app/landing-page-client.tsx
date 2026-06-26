'use client';

import { MarketingNav } from '../components/marketing-nav';
import type { TrustedCompany } from '../features/partners/types';
import type { PortfolioProject } from '../features/portfolio/types';
import { BlogSection } from './landing/blog-section';
import { HeroSection } from './landing/hero-section';
import { JourneyAchievementsSection } from './landing/journey-achievements';
import { ProjectsSection } from './landing/projects-section';
import { ServicesSection } from './landing/services-section';
import { TestimonialsCtaFooter } from './landing/testimonials-cta-footer';
import { TrustedPartnersSection } from './landing/trusted-partners-section';
import type { LandingBlogPost } from './landing/types';

export type { LandingBlogPost };

interface Props {
  partners?: TrustedCompany[];
  posts: LandingBlogPost[];
  projects?: PortfolioProject[];
  whatsappHref: string;
}

export default function LandingPageClient({ partners, posts, projects, whatsappHref }: Props) {
  return (
    <main className="min-h-screen bg-background text-white selection:bg-primary/30 selection:text-white">
      <MarketingNav whatsappHref={whatsappHref} />
      <HeroSection whatsappHref={whatsappHref} />
      <TrustedPartnersSection companies={partners} />
      <ProjectsSection projects={projects} />
      <ServicesSection />
      <JourneyAchievementsSection />
      <BlogSection posts={posts} />
      <TestimonialsCtaFooter whatsappHref={whatsappHref} />
    </main>
  );
}
