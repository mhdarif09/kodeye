import {
  Building2,
  LayoutDashboard,
  Plug,
  Settings,
  Shield,
  ShieldCheck,
  SquareCode,
} from 'lucide-react';

export const dashboardNavigation = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  {
    href: '/dashboard/organizations',
    label: 'Organizations',
    icon: Building2,
  },
  {
    href: '/dashboard/repositories',
    label: 'Repositories',
    icon: SquareCode,
  },
  { href: '/dashboard/scans', label: 'Scans', icon: ShieldCheck },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Plug },
  { href: '/dashboard/admin', label: 'Admin', icon: Shield },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];
