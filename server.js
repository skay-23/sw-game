/* ══════════════════════════════════════════════
   SW Game — Servidor Express
   Uso: npm install && npm start
   Admin: http://localhost:3000/admin.html
══════════════════════════════════════════════ */
const express = require('express');
const fs      = require('fs');
const path    = require('path');

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

// ── GET /api/gh-token ────────────────────────
app.get('/api/gh-token', (req, res) => {
  try {
    const token = fs.existsSync(TOKEN_PATH) ? fs.readFileSync(TOKEN_PATH, 'utf8').trim() : '';
    res.json({ token });
  } catch (e) {
    res.json({ token: '' });
  }
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
