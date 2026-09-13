#  Projet 3 — Cache distribué avec réplication

> **Statut** : À construire | **Niveau** : Avancé | **Durée** : 6 semaines

## Objectif
Implémenter un cache clé-valeur distribué sur plusieurs nœuds, avec réplication
et tolérance aux pannes basique.

## Architecture multi-nœuds
```
          ┌─────────────────────────────┐
          │         Client API          │
          └──────────────┬──────────────┘
                         │ HTTP
          ┌──────────────▼──────────────┐
          │     Node Primaire (:4000)   │  ← coordonne les écritures
          │     cache en mémoire        │
          └──────┬────────────┬─────────┘
       Réplication│            │Réplication
     ┌────────────▼──┐     ┌───▼────────────┐
     │ Replica 1     │     │ Replica 2      │
     │  (:4001)      │     │  (:4002)       │
     └───────────────┘     └────────────────┘
```

## Démarrage
```bash
docker-compose up --build
# Le cluster démarre avec 1 nœud primaire + 2 replicas
```

## API REST
```
GET  /cache/:key          → Lire une valeur
POST /cache/:key          → Écrire (corps : { "value": "...", "ttl": 60 })
DEL  /cache/:key          → Supprimer
GET  /health              → Santé du nœud
GET  /nodes               → État du cluster
```

## Question d'entretien
> **Comment votre système se comporte-t-il si un nœud tombe en panne pendant une écriture ?**
>
> L'écriture sur le primaire est confirmée en premier. La réplication vers les replicas est
> asynchrone (eventual consistency). Si un replica est injoignable, le primaire le marque
> comme "down" et continue à servir les requêtes. À la reconnexion, le replica demande un
> full-sync pour rattraper les entrées manquées.

## Ligne CV
> « Cache distribué avec réplication — tolérance aux pannes, cohérence éventuelle, communication inter-nœuds. »
