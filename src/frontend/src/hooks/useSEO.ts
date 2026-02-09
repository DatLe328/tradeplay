import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  author?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: Record<string, any>;
}

/**
 * Hook để cập nhật SEO meta tags động cho từng trang
 * @example
 * useSEO({
 *   title: "Cửa hàng nick Play Together",
 *   description: "Mua nick Play Together giá rẻ...",
 *   keywords: "nick play together, acc vip"
 * })
 */
export function useSEO({
  title,
  description,
  keywords,
  ogImage = 'https://tiencotruong.com/og-image.png',
  ogUrl = 'https://tiencotruong.com/',
  author = 'TienCoTruong',
  type = 'website',
  structuredData,
}: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;
    updateMetaTag('og:title', title);
    updateMetaTag('twitter:title', title);

    // Description
    updateMetaTag('description', description);
    updateMetaTag('og:description', description);
    updateMetaTag('twitter:description', description);

    // Keywords
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Image
    updateMetaTag('og:image', ogImage);
    updateMetaTag('twitter:image', ogImage);

    // URL
    updateMetaTag('og:url', ogUrl);
    updateCanonical(ogUrl);

    // Type
    updateMetaTag('og:type', type);

    // Author
    updateMetaTag('author', author);

    // Structured Data
    if (structuredData) {
      updateStructuredData(structuredData);
    }

    return () => {
      // Cleanup nếu cần
    };
  }, [title, description, keywords, ogImage, ogUrl, author, type, structuredData]);
}

function updateMetaTag(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`) ||
                document.querySelector(`meta[property="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      element.setAttribute('property', name);
    } else {
      element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateCanonical(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  
  canonical.href = url;
}

function updateStructuredData(data: Record<string, any>) {
  // Xóa script cũ
  const oldScript = document.querySelector('script[type="application/ld+json"]:not([data-preserve])');
  if (oldScript) {
    oldScript.remove();
  }

  // Thêm script mới
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
