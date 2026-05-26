/**
 * wayexam.com landing service (multi-page)
 *
 * Routes:
 *   /              hub (4 exam cards + about + FAQ)
 *   /about         about page
 *   /contact       contact page
 *   /privacy       privacy policy
 *   /terms         terms of service
 *   /exams         exam guides index
 *   /exams/:slug   pmp | cpla | safety | health
 *   /blog          blog index (article list)
 *   /blog/:slug    individual blog article
 *   /sitemap.xml   auto-generated sitemap (all routes above)
 *   /robots.txt    allow Googlebot + sitemap pointer
 *   /ads.txt       AdSense ownership verification
 *   /healthz       Railway healthcheck
 *
 * 환경변수:
 *   PORT                  (Railway 자동 주입)
 *   ADSENSE_PUBLISHER_ID  ca-pub-XXXXXXXXXXXXXXXX (없으면 ads.txt 404)
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1);

// ────────────────────────────────────────────────────────────────────
// /ads.txt — required for AdSense site ownership verification
// ────────────────────────────────────────────────────────────────────
const ADSENSE_PUBLISHER_ID = process.env.ADSENSE_PUBLISHER_ID || '';
app.get('/ads.txt', (req, res) => {
  if (!ADSENSE_PUBLISHER_ID) return res.status(404).send('Not Found');
  const pubId = ADSENSE_PUBLISHER_ID.startsWith('ca-pub-')
    ? ADSENSE_PUBLISHER_ID.replace('ca-pub-', 'pub-')
    : ADSENSE_PUBLISHER_ID;
  res.type('text/plain').send(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`);
});

// ────────────────────────────────────────────────────────────────────
// /robots.txt — allow all crawlers, point to sitemap
// ────────────────────────────────────────────────────────────────────
app.get('/robots.txt', (req, res) => {
  res
    .type('text/plain')
    .send('User-agent: *\nAllow: /\n\nSitemap: https://wayexam.com/sitemap.xml\n');
});

// ────────────────────────────────────────────────────────────────────
// /sitemap.xml — list every public URL
// ────────────────────────────────────────────────────────────────────
const SITE_URL = 'https://wayexam.com';
const BLOG_SLUGS = [
  '4-korean-professional-exams-compared',
  'pmp-jobs-salary-korea-2026',
  'cpla-overview-eligibility-2026',
  'industrial-safety-6-month-plan',
  'exam-fees-pass-rates-comparison',
];
const EXAM_SLUGS = ['pmp', 'cpla', 'safety', 'health'];

app.get('/sitemap.xml', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/about', priority: '0.7', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
    { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
    { loc: '/exams', priority: '0.8', changefreq: 'monthly' },
    ...EXAM_SLUGS.map((s) => ({ loc: `/exams/${s}`, priority: '0.8', changefreq: 'monthly' })),
    { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
    ...BLOG_SLUGS.map((s) => ({ loc: `/blog/${s}`, priority: '0.7', changefreq: 'monthly' })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${SITE_URL}${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
  )
  .join('\n')}
</urlset>
`;
  res.type('application/xml').send(xml);
});

// ────────────────────────────────────────────────────────────────────
// Health endpoint (Railway healthcheck)
// ────────────────────────────────────────────────────────────────────
app.get('/healthz', (req, res) => res.json({ ok: true }));

// ────────────────────────────────────────────────────────────────────
// Pretty URLs (no .html in URL bar)
//   /about            → public/about.html
//   /exams            → public/exams/index.html
//   /exams/pmp        → public/exams/pmp.html
//   /blog             → public/blog/index.html
//   /blog/some-slug   → public/blog/some-slug.html
// ────────────────────────────────────────────────────────────────────
app.use(
  express.static(path.join(__dirname, 'public'), {
    extensions: ['html'],
    index: 'index.html',
  })
);

// ────────────────────────────────────────────────────────────────────
// 404 — unknown path
// ────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'), (err) => {
    if (err) res.status(404).type('text/plain').send('404 Not Found');
  });
});

app.listen(PORT, () => {
  console.log(`[wayexam-landing] running on :${PORT}`);
  if (!ADSENSE_PUBLISHER_ID) console.log('[ads.txt] ADSENSE_PUBLISHER_ID not set — /ads.txt → 404');
});
