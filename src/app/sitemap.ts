import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// 정적 진입 페이지만 색인 대상. /r/[id] 결과 페이지는 개인 결과라 제외(noindex).
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/test`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/stats`, lastModified, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
