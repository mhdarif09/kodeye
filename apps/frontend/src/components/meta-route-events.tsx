'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { trackMetaEvent } from '../lib/meta-events';

export function MetaRouteEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = useRef('');

  useEffect(() => {
    const queryString = searchParams.toString();
    const pathWithQuery = queryString ? `${pathname}?${queryString}` : pathname;

    if (lastTrackedRef.current === pathWithQuery) return;
    lastTrackedRef.current = pathWithQuery;

    const contentName = pathname === '/' ? 'Homepage' : pathname;

    trackMetaEvent('ViewContent', {
      customData: {
        content_name: contentName,
        content_type: 'page',
      },
    });

    const searchTerm =
      searchParams.get('q') ??
      searchParams.get('query') ??
      searchParams.get('search');

    if (searchTerm) {
      trackMetaEvent('Search', {
        customData: {
          search_string: searchTerm,
        },
      });
    }
  }, [pathname, searchParams]);

  return null;
}
