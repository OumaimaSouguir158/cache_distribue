require('dotenv').config();
const express   = require('express');
const MemoryCache = require('./cache');
const ReplicationManager = require('./replication');

const app      = express();
const cache    = new MemoryCache();
const NODE_ID  = process.env.NODE_ID || 'node-1';
const ROLE     = process.env.ROLE    || 'primary'; // primary | replica
const PORT     = parseInt(process.env.PORT) || 4000;

// Replicas (pour le nœud primaire)
const replicaUrls = (process.env.REPLICAS || '').split(',').filter(Boolean);
const replication = ROLE === 'primary' ? new ReplicationManager(replicaUrls) : null;

app.use(express.json());

// ── Endpoint interne pour recevoir les réplications ─────────────────────────
app.post('/_internal/replicate', (req, res) => {
  const { operation, key, value, ttl } = req.body;
  if (operation === 'set') cache.set(key, value, ttl);
  else if (operation === 'delete') cache.delete(key);
  res.json({ ok: true });
});

// ── API publique ─────────────────────────────────────────────────────────────
app.get('/cache/:key', (req, res) => {
  const value = cache.get(req.params.key);
  if (value === null) return res.status(404).json({ error: 'Clé non trouvée ou expirée' });
  res.json({ key: req.params.key, value });
});

app.post('/cache/:key', async (req, res) => {
  const { value, ttl } = req.body;
  if (value === undefined) return res.status(400).json({ error: 'value requis' });
  const key = req.params.key;
  cache.set(key, value, ttl);
  // Si primaire, répliquer vers les replicas
  if (replication) await replication.replicate('set', key, value, ttl);
  res.status(201).json({ key, value, ttl, node: NODE_ID });
});

app.delete('/cache/:key', async (req, res) => {
  const key = req.params.key;
  cache.delete(key);
  if (replication) await replication.replicate('delete', key);
  res.status(204).send();
});

app.get('/health', (_req, res) => res.json({
  status: 'ok', node: NODE_ID, role: ROLE, size: cache.size()
}));

app.get('/nodes', (_req, res) => {
  res.json({
    self: { id: NODE_ID, role: ROLE, cacheSize: cache.size() },
    replicas: replication ? replication.getStatus() : 'N/A (replica node)',
  });
});

app.listen(PORT, () => console.log(`📦  Nœud ${NODE_ID} [${ROLE}] démarré sur :${PORT}`));
