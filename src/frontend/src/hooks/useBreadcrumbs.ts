import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Hook để thêm breadcrumb structured data
 * Giúp Google hiểu cấu trúc trang web
 * @example
 * useBreadcrumbs([
 *   { name: 'Trang chủ', url: '/' },
 *   { name: 'Shop', url: '/shop' },
 *   { name: 'Nick VIP', url: '/shop/vip' }
 * ])
 */
export function useBreadcrumbs(items: BreadcrumbItem[]) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    let script = document.querySelector('script[data-breadcrumb-schema]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-breadcrumb-schema', 'true');
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(schema);

    return () => {
      if (script) {
        script.remove();
      }
    };
  }, [items]);
}
