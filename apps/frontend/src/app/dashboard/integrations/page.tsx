import { Github } from 'lucide-react';
import Link from 'next/link';

import { Card } from '../../../components/ui/card';

export default function IntegrationsPage() {
  return (
    <div>
      <p className="text-sm font-semibold text-brand-600">Integrations</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        Connect your workflow
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
        Integrations let Kodeye access only the repositories you explicitly
        choose for future security review.
      </p>
      <div className="mt-8 max-w-xl">
        <Link href="/dashboard/integrations/github">
          <Card className="transition hover:-translate-y-0.5 hover:border-brand-200">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Github className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-bold text-slate-950">GitHub</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Install the Kodeye GitHub App, select repositories, and sync their
              metadata.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
