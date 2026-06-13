'use client';

import { Github } from 'lucide-react';

import { getApiUrl } from '../lib/api-client';
import { Button } from './ui/button';

export function GitHubAuthButton() {
  return (
    <Button
      className="w-full"
      onClick={() => window.location.assign(getApiUrl('/auth/github'))}
      variant="secondary"
    >
      <Github className="h-5 w-5" />
      Continue with GitHub
    </Button>
  );
}
