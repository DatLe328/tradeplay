#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://tiencotruong.com';

const pages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/accounts', priority: '0.9', changefreq: 'always' },
  { url: '/guide', priority: '0.7', changefreq: 'monthly' },
  { url: '/warranty', priority: '0.7', changefreq: 'monthly' },
  { url: '/auth', priority: '0.6', changefreq: 'monthly' },
  { url: '/accounts/play-together', priority: '0.8', changefreq: 'daily' },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
${pages
  .map(
    (p) => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

const publicDir = path.join(__dirname, 'public'); 
const sitemapPath = path.join(publicDir, 'sitemap.xml');

try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
  console.log('✅ Sitemap generated successfully at:', sitemapPath);
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}