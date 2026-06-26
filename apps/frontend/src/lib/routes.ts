import {
  LayoutDashboard,
  Settings,
  Shield,
} from 'lucide-react';

export const dashboardNavigation = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin', label: 'Admin', icon: Shield },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];
