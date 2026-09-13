/**
 * Cache en mémoire simple avec TTL (Time To Live)
 */
class MemoryCache {
  constructor() {
    this.store = new Map();
    // Nettoyage des entrées expirées toutes les 30 secondes
    setInterval(() => this.cleanup(), 30_000);
  }

  set(key, value, ttlSeconds = null) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt, createdAt: Date.now() });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  delete(key) {
    return this.store.delete(key);
  }

  keys() {
    return [...this.store.keys()];
  }

  size() {
    return this.store.size;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  // Exporter tout le cache pour la synchronisation
  dump() {
    const result = {};
    for (const [key, entry] of this.store.entries()) {
      if (!entry.expiresAt || Date.now() <= entry.expiresAt) {
        result[key] = entry;
      }
    }
    return result;
  }

  // Importer un dump (sync complète)
  load(dump) {
    this.store.clear();
    for (const [key, entry] of Object.entries(dump)) {
      this.store.set(key, entry);
    }
  }
}

module.exports = MemoryCache;
