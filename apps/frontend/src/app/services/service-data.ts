import { Bot, Code2, ServerCog, Workflow, type LucideIcon } from 'lucide-react';

export interface ServiceDetail {
  audience: string;
  collaboration: string[];
  description: string;
  deliverables: string[];
  detailedScope: { title: string; items: string[] }[];
  engagementModels: { name: string; description: string }[];
  faqs: { answer: string; question: string }[];
  handover: string[];
  href: string;
  icon: LucideIcon;
  outcomes: string[];
  process: string[];
  proofPoints: string[];
  slug: string;
  timeline: { phase: string; detail: string }[];
  title: string;
}

export const services: ServiceDetail[] = [
  {
    audience:
      'For teams with repetitive business operations, manual approvals, reporting work, or internal processes that slow delivery.',
    collaboration: [
      'We interview process owners and map the current workflow before recommending automation.',
      'Every automated step keeps a clear owner, fallback path, and human approval rule.',
      'We ship in small increments so the team can test real cases before expanding scope.',
    ],
    description:
      'Turn repeated operational work into reliable AI-assisted workflows: approvals, reporting, document handling, customer operations, and internal tooling.',
    deliverables: [
      'Automation opportunity map',
      'AI workflow or assistant prototype',
      'Human approval and escalation rules',
      'Dashboard or notification integration',
    ],
    detailedScope: [
      {
        items: [
          'Operational workflow discovery and bottleneck mapping',
          'AI assistant, agent, or workflow design',
          'Prompt, retrieval, tool-calling, and validation strategy',
          'Human approval, escalation, and audit trail rules',
        ],
        title: 'Workflow and AI design',
      },
      {
        items: [
          'Internal dashboard, form, or queue implementation',
          'Google Workspace, Slack, WhatsApp, email, CRM, or API integration',
          'Document extraction, classification, and summary flows',
          'Notification and reporting automation',
        ],
        title: 'Implementation',
      },
      {
        items: [
          'Failure handling and manual fallback paths',
          'Access control, secrets, and data boundary review',
          'Testing with real scenarios and edge cases',
          'Operating documentation for the team',
        ],
        title: 'Controls and rollout',
      },
    ],
    engagementModels: [
      {
        description:
          'A short discovery sprint to identify the highest-value automation opportunities and estimate delivery effort.',
        name: 'Automation audit',
      },
      {
        description:
          'Build one production workflow end to end with integrations, approval rules, and handover.',
        name: 'Workflow build',
      },
      {
        description:
          'Ongoing support to expand automations across departments and improve reliability over time.',
        name: 'Automation retainer',
      },
    ],
    faqs: [
      {
        answer:
          'Yes. We can start with one repetitive workflow, prove value, then expand after the team trusts the new process.',
        question: 'Can we start small?',
      },
      {
        answer:
          'We design human-in-the-loop checkpoints for risky actions, plus logs and fallback paths so the process stays accountable.',
        question: 'How do you control AI mistakes?',
      },
      {
        answer:
          'Common integrations include Slack, email, Google Sheets, CRMs, internal APIs, databases, dashboards, and custom web apps.',
        question: 'What systems can you connect?',
      },
    ],
    handover: [
      'Workflow diagram and owner map',
      'Prompt and automation configuration notes',
      'Runbook for common failures and manual fallback',
      'Training session for operators and admins',
    ],
    href: '/services/ai-automation',
    icon: Workflow,
    outcomes: [
      'Workflow mapping and automation roadmap',
      'AI assistant or agent implementation',
      'Human-in-the-loop approval design',
      'Dashboard and reporting integration',
    ],
    process: [
      'Map the workflow and identify high-friction handoffs.',
      'Design the AI-assisted flow with guardrails and approvals.',
      'Build, integrate, test, and hand over the automation.',
    ],
    proofPoints: [
      'Reduce repeated admin work',
      'Shorten response and approval time',
      'Improve process visibility',
      'Keep humans in control of sensitive decisions',
    ],
    slug: 'ai-automation',
    timeline: [
      {
        detail:
          'Map workflow, data sources, constraints, and target success metrics.',
        phase: 'Week 1',
      },
      {
        detail:
          'Build prototype, connect tools, and test the first real workflow path.',
        phase: 'Weeks 2-3',
      },
      {
        detail:
          'Harden edge cases, add reporting, train users, and launch the workflow.',
        phase: 'Week 4+',
      },
    ],
    title: 'AI Automation',
  },
  {
    audience:
      'For founders and product teams that need senior engineering judgment before scaling features, refactors, or technical decisions.',
    collaboration: [
      'We work with founders, product owners, and engineers to understand both business pressure and technical reality.',
      'Recommendations are prioritized by risk, effort, and product impact so the team can act quickly.',
      'We can stay hands-on for implementation or support your internal team through review and planning.',
    ],
    description:
      'Bring senior engineering judgment into product architecture, code quality, delivery planning, and technical decision-making.',
    deliverables: [
      'Architecture and codebase assessment',
      'Technical roadmap',
      'Refactor or delivery plan',
      'Implementation support',
    ],
    detailedScope: [
      {
        items: [
          'Architecture review and system boundary mapping',
          'Codebase maintainability, dependency, and testing assessment',
          'Security and reliability risk review',
          'Technical debt classification and prioritization',
        ],
        title: 'Assessment',
      },
      {
        items: [
          'Technical roadmap and sequencing',
          'Refactor plan with migration steps',
          'Feature delivery planning and estimation',
          'Team workflow, review, and release process improvements',
        ],
        title: 'Planning',
      },
      {
        items: [
          'Hands-on implementation for critical fixes',
          'Pull request review and engineering coaching',
          'Architecture decision records',
          'Handover and documentation for internal ownership',
        ],
        title: 'Execution support',
      },
    ],
    engagementModels: [
      {
        description:
          'A focused audit of architecture, code quality, delivery risks, and the most urgent engineering decisions.',
        name: 'Engineering audit',
      },
      {
        description:
          'A defined implementation or refactor project with scope, milestones, and review checkpoints.',
        name: 'Delivery sprint',
      },
      {
        description:
          'Fractional senior engineering support for ongoing technical decisions, reviews, and roadmap planning.',
        name: 'Advisory retainer',
      },
    ],
    faqs: [
      {
        answer:
          'Yes. We can work as an outside reviewer, fractional senior engineer, or implementation partner depending on your team capacity.',
        question: 'Can you work with our existing engineers?',
      },
      {
        answer:
          'We prioritize what blocks product delivery, creates production risk, or makes future changes expensive.',
        question: 'How do you prioritize technical debt?',
      },
      {
        answer:
          'Yes. We can review the codebase, architecture, deployment, and delivery workflow before a major rewrite decision.',
        question: 'Can you help before a rewrite?',
      },
    ],
    handover: [
      'Architecture and risk report',
      'Prioritized engineering roadmap',
      'Refactor or delivery plan',
      'Implementation notes and decision records',
    ],
    href: '/services/engineering-consulting',
    icon: Code2,
    outcomes: [
      'Architecture and codebase review',
      'Engineering roadmap support',
      'Refactoring and reliability planning',
      'Product delivery acceleration',
    ],
    process: [
      'Review the product, team constraints, and current codebase.',
      'Prioritize technical risks and delivery bottlenecks.',
      'Support the team through planning, implementation, and handover.',
    ],
    proofPoints: [
      'Clearer technical decisions',
      'Lower refactor risk',
      'Better delivery sequencing',
      'More maintainable codebase direction',
    ],
    slug: 'engineering-consulting',
    timeline: [
      {
        detail:
          'Discovery, repository review, architecture mapping, and stakeholder interviews.',
        phase: 'Week 1',
      },
      {
        detail:
          'Risk analysis, roadmap, refactor plan, and delivery recommendation.',
        phase: 'Week 2',
      },
      {
        detail:
          'Implementation support, review cadence, and internal team handover.',
        phase: 'Weeks 3+',
      },
    ],
    title: 'Engineering Consulting',
  },
  {
    audience:
      'For teams that need a stable production foundation, deployment pipeline, monitoring, and operational discipline.',
    collaboration: [
      'We begin with the current hosting, deployment, secrets, and incident workflow.',
      'Infrastructure changes are staged to reduce downtime and protect existing production systems.',
      'Your team receives clear runbooks, access boundaries, and maintenance guidance.',
    ],
    description:
      'Design and operate the production foundation: deployments, cloud infrastructure, CI/CD, observability, backups, and environment strategy.',
    deliverables: [
      'Deployment architecture',
      'CI/CD pipeline',
      'Monitoring and logging setup',
      'Environment and secrets hardening',
    ],
    detailedScope: [
      {
        items: [
          'Cloud, VPS, container, and runtime assessment',
          'Environment strategy for development, staging, and production',
          'Secrets, access, domain, SSL, and backup review',
          'Cost and reliability tradeoff analysis',
        ],
        title: 'Infrastructure assessment',
      },
      {
        items: [
          'CI/CD pipeline setup',
          'Docker, reverse proxy, and deployment automation',
          'Database migration and backup workflow',
          'Environment variables and secret management',
        ],
        title: 'Deployment foundation',
      },
      {
        items: [
          'Monitoring, logs, uptime checks, and alerting',
          'Basic incident response runbook',
          'Rollback and recovery procedure',
          'Performance and security hardening checklist',
        ],
        title: 'Operations',
      },
    ],
    engagementModels: [
      {
        description:
          'Review current infrastructure, deployment, monitoring, and operational risks.',
        name: 'Infrastructure audit',
      },
      {
        description:
          'Build the production deployment foundation with CI/CD, monitoring, and rollback basics.',
        name: 'Launch setup',
      },
      {
        description:
          'Ongoing infrastructure support for releases, incidents, improvements, and cost control.',
        name: 'Ops retainer',
      },
    ],
    faqs: [
      {
        answer:
          'Yes. We can stabilize the current setup first, then migrate or refactor infrastructure only when it is useful.',
        question: 'Can you work with our current server?',
      },
      {
        answer:
          'We usually support VPS, Docker, managed databases, object storage, GitHub Actions, and cloud providers depending on project needs.',
        question: 'What stack do you support?',
      },
      {
        answer:
          'Yes. We include rollback, backup, and recovery planning as part of production readiness.',
        question: 'Do you handle backup and rollback?',
      },
    ],
    handover: [
      'Deployment architecture and access map',
      'CI/CD pipeline documentation',
      'Monitoring and alerting runbook',
      'Backup, rollback, and recovery steps',
    ],
    href: '/services/devops-infrastructure',
    icon: ServerCog,
    outcomes: [
      'Cloud and VPS deployment setup',
      'CI/CD pipeline implementation',
      'Monitoring, logging, and incident basics',
      'Security and environment hardening',
    ],
    process: [
      'Audit deployment, hosting, secrets, and runtime risks.',
      'Design the target infrastructure and release workflow.',
      'Implement deployment, observability, and operating docs.',
    ],
    proofPoints: [
      'More predictable releases',
      'Faster recovery from incidents',
      'Cleaner environment management',
      'Better production visibility',
    ],
    slug: 'devops-infrastructure',
    timeline: [
      {
        detail:
          'Audit deployment, access, secrets, hosting, database, and release workflow.',
        phase: 'Week 1',
      },
      {
        detail:
          'Implement CI/CD, infrastructure changes, monitoring, and backup workflow.',
        phase: 'Weeks 2-3',
      },
      {
        detail:
          'Run production readiness checks, document operations, and hand over.',
        phase: 'Week 4+',
      },
    ],
    title: 'DevOps & Infrastructure',
  },
  {
    audience:
      'For businesses that need a credible website, customer portal, dashboard, booking flow, or internal system.',
    collaboration: [
      'We clarify the business goal first: leads, bookings, operations, customer self-service, or internal efficiency.',
      'Content, design, backend, integrations, and deployment are planned together so the website can actually operate.',
      'You receive a launch-ready system with handover, analytics, and a practical maintenance path.',
    ],
    description:
      'Build polished websites, dashboards, portals, and business systems that help companies move from manual work to digital operations.',
    deliverables: [
      'Website or web app build',
      'Admin dashboard or portal',
      'Payment/API integration',
      'Launch and handover support',
    ],
    detailedScope: [
      {
        items: [
          'Company website, landing page, or product marketing site',
          'Content structure, conversion flow, and contact forms',
          'Responsive UI implementation',
          'SEO basics, analytics, and performance setup',
        ],
        title: 'Website build',
      },
      {
        items: [
          'Admin dashboard or customer portal',
          'Booking, request, CRM, or internal workflow system',
          'Authentication and role-based access',
          'Database, API, payment, and third-party integrations',
        ],
        title: 'Web app and systems',
      },
      {
        items: [
          'Production deployment',
          'Form and notification routing',
          'CMS or content update workflow when needed',
          'Maintenance documentation and launch checklist',
        ],
        title: 'Launch operations',
      },
    ],
    engagementModels: [
      {
        description:
          'A focused company or product website with strategy, design, implementation, and launch.',
        name: 'Website launch',
      },
      {
        description:
          'A custom portal, dashboard, booking system, or internal tool built around business workflow.',
        name: 'Business system build',
      },
      {
        description:
          'Continuous development for new features, integrations, optimization, and maintenance.',
        name: 'Growth retainer',
      },
    ],
    faqs: [
      {
        answer:
          'Yes. We can build marketing websites, internal systems, dashboards, portals, and workflow tools.',
        question: 'Is this only for landing pages?',
      },
      {
        answer:
          'Yes. We can connect payment providers, CRMs, email, spreadsheets, WhatsApp workflows, and custom APIs.',
        question: 'Can you integrate payments or CRM?',
      },
      {
        answer:
          'Yes. We include deployment and handover, and can continue as a maintenance partner if needed.',
        question: 'Do you handle launch and maintenance?',
      },
    ],
    handover: [
      'Source code and deployment access map',
      'Content and admin usage guide',
      'Analytics, form, and integration notes',
      'Launch checklist and maintenance recommendations',
    ],
    href: '/services/website-development',
    icon: Bot,
    outcomes: [
      'Company and product websites',
      'Admin dashboards and portals',
      'Booking, CRM, or internal systems',
      'Integration with payments, APIs, and automation',
    ],
    process: [
      'Clarify business goals, content, and required workflows.',
      'Design and build the site or system with production-ready foundations.',
      'Launch, integrate, and hand over the operating flow.',
    ],
    proofPoints: [
      'More credible digital presence',
      'Lead capture and operational workflow in one place',
      'Custom system instead of spreadsheet chaos',
      'Production-ready launch and handover',
    ],
    slug: 'website-development',
    timeline: [
      {
        detail:
          'Define goals, content, pages, workflows, integrations, and launch requirements.',
        phase: 'Week 1',
      },
      {
        detail:
          'Design, build, integrate, and review core website or system flows.',
        phase: 'Weeks 2-4',
      },
      {
        detail:
          'Launch, monitor, train admins, and prepare next iteration roadmap.',
        phase: 'Week 5+',
      },
    ],
    title: 'Website Development',
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}
