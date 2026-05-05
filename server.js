/**
 * wayexam.com landing service
 *
 * - Serves a static hub page (index.html) listing the 4 exam sites.
 * - Serves /ads.txt dynamically from ADSENSE_PUBLISHER_ID env var
 *   so Google AdSense can verify ownership of wayexam.com.
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

// /ads.txt — required for AdSense site ownership verification
const ADSENSE_PUBLISHER_ID = process.env.ADSENSE_PUBLISHER_ID || '';
app.get('/ads.txt', (req, res) => {
  if (!ADSENSE_PUBLISHER_ID) return res.status(404).send('Not Found');
  const pubId = ADSENSE_PUBLISHER_ID.startsWith('ca-pub-')
    ? ADSENSE_PUBLISHER_ID.replace('ca-pub-', 'pub-')
    : ADSENSE_PUBLISHER_ID;
  res.type('text/plain').send(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`);
});

// Health endpoint (Railway healthcheck)
app.get('/healthz', (req, res) => res.json({ ok: true }));

// Static hub page
app.use(express.static(__dirname, {
  extensions: ['html'],
  index: 'index.html'
}));

// Fallback to index.html for any unknown path (so /xyz still shows hub)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[wayexam-landing] running on :${PORT}`);
  if (!ADSENSE_PUBLISHER_ID) console.log('[ads.txt] ADSENSE_PUBLISHER_ID not set — /ads.txt → 404');
});
