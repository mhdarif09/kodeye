'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

import type { PortfolioProject } from '../../features/portfolio/types';
import { GridDots } from './hero-section';

interface Props {
  projects?: PortfolioProject[];
}

const defaultProjects = [
  {
    id: '1',
    title: 'Website Development',
    subtitle: 'Corporate Landing Page & E-Commerce',
    imageUrl: '/projects/landing-web.png',
    projectUrl: 'https://kodeye.id',
  },
  {
    id: '2',
    title: 'AI Automation Workflow',
    subtitle: 'WhatsApp Bot & Admin Automation',
    imageUrl: '/projects/ai-automation.png',
    projectUrl: 'https://kodeye.id',
  },
  {
    id: '3',
    title: 'Custom Web Application',
    subtitle: 'SaaS Dashboard & Internal System',
    imageUrl: '/projects/web-dashboard.png',
    projectUrl: 'https://kodeye.id',
  },
  {
    id: '4',
    title: 'AI Chatbot Assistant',
    subtitle: '24/7 Customer Support Integration',
    imageUrl: '/projects/chatbot-app.png',
    projectUrl: 'https://kodeye.id',
  },
];

export function ProjectsSection({ projects }: Props) {
  const displayProjects = projects && projects.length > 0 ? projects : defaultProjects;

  return (
    <section id="projects" className="bg-background py-20 px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center">
              Our Projects <GridDots className="text-primary ml-3" />
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">
              Lihat bagaimana kami merombak dan mengotomatisasi berbagai sistem bisnis melalui website modern dan AI automation.
            </p>
          </div>

          <div>
            <button className="rounded-full border border-white/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:border-primary hover:bg-primary/10 transition">
              Show All
            </button>
          </div>
        </div>

        {/* Grid 2x2 matching Stygar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayProjects.map((item) => (
            <a
              key={item.id}
              href={'projectUrl' in item && item.projectUrl ? item.projectUrl : '#'}
              target={'projectUrl' in item && item.projectUrl && item.projectUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
              className="group relative block overflow-hidden rounded-3xl bg-card border border-white/[0.05] transition-all hover:border-primary/50"
            >
              {/* Image */}
              <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                <Image
                  src={'imageUrl' in item ? item.imageUrl : '/projects/landing-web.png'}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-[#161616]/30 to-transparent" />
              </div>

              {/* Bottom Glass Overlay */}
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-text-secondary mt-1">{item.subtitle}</p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-transform group-hover:scale-110 group-hover:bg-secondary group-hover:text-black">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
