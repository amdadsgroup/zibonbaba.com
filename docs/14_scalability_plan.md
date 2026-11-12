# Scalability Plan - Zibonbaba.com

This document describes the scaling strategies for the Zibonbaba multi-vendor platform to handle massive catalog growth and concurrent POS checkouts.

## 1. Caching Architectures
* **Static Assets**: All public images, JS files, and CSS components are cached at Cloudflare Edge CDNs for 30 days.
* **Storefront API Caching**: Redis caches the top 10% most viewed product detail models (TTL: 1 hour, auto-evicted on inventory changes).
* **Homepage Cache**: Homepage listings, category index menus, and featured vendors lists are built using ISR (Incremental Static Regeneration) on Vercel (revalidated every 5 minutes).

---

## 2. Database Scaling Strategy

As operations scale, database load is split using three methods:

### 2.1 Read/Write Separation
* The Express server redirects modification queries (e.g. `INSERT`, `UPDATE`, `DELETE`) to the primary database server, while search/view requests are sent to two read-replicas.

### 2.2 Table Sharding (Horizontal Partitioning)
* Once orders exceed 50 million rows, the database partitions the `Order` and `OrderItem` tables horizontally by `storeId`. This limits table scans to specific vendor sub-tables.

### 2.3 Connection Pooling (pgBouncer)
* A pgBouncer server sits in front of the PostgreSQL cluster to manage thousands of concurrent POS checkouts without exhausting database connections.

---

## 3. High Availability (HA) & Disaster Recovery
* **Auto-Scaling**: Docker backend clusters scale up when average CPU load exceeds 70%.
* **Database Backup Policy**: Live WAL (Write-Ahead Logging) archiving ensures zero transaction loss. Hourly snapshots are stored in distinct AWS S3 regions.
* **Regional Failover**: Nginx redirects traffic to a backup VPS cluster if primary server clusters encounter failures.
