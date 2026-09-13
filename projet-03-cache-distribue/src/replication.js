const axios = require('axios');

/**
 * Gestion de la réplication vers les nœuds réplicas
 */
class ReplicationManager {
  constructor(replicas = []) {
    this.replicas = replicas; // URLs des replicas
    this.nodeStatus = {};
    replicas.forEach(url => { this.nodeStatus[url] = 'unknown'; });
    // Heartbeat toutes les 5 secondes
    setInterval(() => this.checkHealth(), 5000);
  }

  async checkHealth() {
    for (const url of this.replicas) {
      try {
        await axios.get(`${url}/health`, { timeout: 1000 });
        this.nodeStatus[url] = 'up';
      } catch {
        if (this.nodeStatus[url] === 'up') {
          console.warn(`⚠️   Nœud ${url} hors ligne`);
        }
        this.nodeStatus[url] = 'down';
      }
    }
  }

  /** Répliquer une opération sur tous les replicas actifs */
  async replicate(operation, key, value = null, ttl = null) {
    const upReplicas = this.replicas.filter(url => this.nodeStatus[url] !== 'down');
    const promises = upReplicas.map(url =>
      axios.post(`${url}/_internal/replicate`, { operation, key, value, ttl }, { timeout: 2000 })
        .catch(err => console.error(`❌  Réplication vers ${url} échouée : ${err.message}`))
    );
    await Promise.allSettled(promises);
  }

  getStatus() {
    return this.nodeStatus;
  }
}

module.exports = ReplicationManager;
