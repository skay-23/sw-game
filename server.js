/* ══════════════════════════════════════════════
   SW Game — Servidor Express
   Uso: npm install && npm start
   Admin: http://localhost:3000/admin.html
══════════════════════════════════════════════ */
const express    = require('express');
const fs         = require('fs');
const path       = require('path');
const https      = require('https');
const { execSync } = require('child_process');

const app            = express();
const PORT           = process.env.PORT || 3000;
const CONFIG_PATH    = path.join(__dirname, 'data', 'config.json');
const ACTIVITIES_PATH = path.join(__dirname, 'data', 'activities.json');
const TOKEN_PATH      = path.join(__dirname, 'data', '.gh-token');

app.use(express.json());

// Archivos HTML y JS nunca en caché (siempre la versión más nueva)
app.use((req, res, next) => {
  if (/\.(html|js)$/.test(req.path)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
  }
  next();
});

app.use(express.static(__dirname));

// ── GET /api/config ──────────────────────────
app.get('/api/config', (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')));
  } catch (e) {
    res.status(500).json({ error: 'No se pudo leer la configuración.' });
  }
});

// ── POST /api/config ─────────────────────────
app.post('/api/config', (req, res) => {
  const { categories } = req.body || {};
  if (!Array.isArray(categories)) {
    return res.status(400).json({ error: 'Se necesita categories[].' });
  }
  for (const cat of categories) {
    if (!cat.key || typeof cat.key !== 'string') {
      return res.status(400).json({ error: 'Categoría con key inválida.' });
    }
  }
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ categories }, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo guardar la configuración.' });
  }
});

// ── GET /api/activities ──────────────────────
app.get('/api/activities', (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(ACTIVITIES_PATH, 'utf8')));
  } catch (e) {
    res.status(500).json({ error: 'No se pudo leer las actividades.' });
  }
});

// ── POST /api/activities ─────────────────────
app.post('/api/activities', (req, res) => {
  const activities = req.body;
  if (!Array.isArray(activities)) {
    return res.status(400).json({ error: 'Se esperaba un array de actividades.' });
  }
  for (const a of activities) {
    if (!a.id || !a.text || !a.category || !a.target || !a.intensity) {
      return res.status(400).json({ error: `Actividad incompleta: ${JSON.stringify(a)}` });
    }
  }
  try {
    fs.writeFileSync(ACTIVITIES_PATH, JSON.stringify(activities, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo guardar las actividades.' });
  }
});

// Obtiene el token: archivo local → gh CLI → vacío
function resolveGhToken() {
  // 1) Archivo guardado manualmente
  if (fs.existsSync(TOKEN_PATH)) {
    const t = fs.readFileSync(TOKEN_PATH, 'utf8').trim();
    if (t) return t;
  }
  // 2) Token del CLI de gh (ya autenticado)
  try {
    const t = execSync('"C:\\Program Files\\GitHub CLI\\gh.exe" auth token', { encoding: 'utf8' }).trim();
    if (t) return t;
  } catch (_) {}
  return '';
}

// ── Proxy GitHub OAuth (evita CORS en browser) ──
function ghPost(urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = new URLSearchParams(body).toString();
    const req = https.request({
      hostname: 'github.com', path: urlPath, method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

app.post('/api/github/device/code', async (req, res) => {
  try {
    const data = await ghPost('/login/device/code', req.body);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/github/oauth/token', async (req, res) => {
  try {
    const data = await ghPost('/login/oauth/access_token', req.body);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/gh-token ────────────────────────
app.get('/api/gh-token', (req, res) => {
  res.json({ token: resolveGhToken() });
});

// ── POST /api/gh-token ───────────────────────
app.post('/api/gh-token', (req, res) => {
  const { token } = req.body || {};
  try {
    fs.writeFileSync(TOKEN_PATH, (token || '').trim(), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo guardar el token.' });
  }
});

app.listen(PORT, () => {
  console.log(`\n  SW Game corriendo en http://localhost:${PORT}`);
  console.log(`  Panel admin:          http://localhost:${PORT}/admin.html\n`);
});
