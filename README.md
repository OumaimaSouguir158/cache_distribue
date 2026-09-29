# Project 3 — Distributed Cache with Replication

## Objective

Implement a distributed key-value cache running across multiple nodes, with data replication and basic fault tolerance.

The project demonstrates core distributed-systems concepts including:

* Primary/replica architecture
* Asynchronous replication
* Eventual consistency
* Node health monitoring
* Failure handling
* Data synchronization after node recovery
* Inter-node HTTP communication

## Architecture

```text
                         ┌─────────────────────────────┐
                         │         Client API          │
                         └──────────────┬──────────────┘
                                        │ HTTP
                         ┌──────────────▼──────────────┐
                         │     Primary Node (:4000)    │
                         │     In-memory cache          │
                         │     Coordinates writes       │
                         └──────┬────────────┬─────────┘
                                │            │
                         Replication    Replication
                                │            │
                  ┌─────────────▼──┐    ┌───▼─────────────┐
                  │   Replica 1    │    │    Replica 2    │
                  │     :4001      │    │      :4002      │
                  │  In-memory     │    │   In-memory     │
                  │     cache      │    │      cache      │
                  └────────────────┘    └─────────────────┘
```

## How It Works

The system consists of one **primary node** and two **replica nodes**.

### Primary Node

The primary node:

* Receives client requests.
* Stores data in its local in-memory cache.
* Coordinates write operations.
* Asynchronously replicates changes to the replicas.
* Monitors r
