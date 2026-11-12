# Deployment Architecture - Zibonbaba.com

This document describes the hosting, servers, CDN pipelines, and database replication configurations for the Zibonbaba enterprise web application.

## 1. Hosting Topology Map

```
                             [ User Browser ]
                                     |
                                     v
                          [ Cloudflare Edge CDN ]
                         /                       \
        (Frontend Asset Requests)          (API Requests / POS Sync)
                       /                           \
                      v                             v
           [ Vercel CDN Hosting ]            [ Docker Load Balancer (Nginx) ]
                                            /               |              \
                                           v                v               v
                                     [ Express Server ] [ Express ] [ Express ]
                                           |                |               |
                                           +----------------+---------------+
                                                            |
                                                            v
                                                  [ Primary PG Database ]
                                                 /                       \
                                                v                         v
                                    [ Read-Replica DB ]          [ Redis Cache Server ]
```

---

## 2. Platform Infrastructure Roles

### 2.1 Client Frontend: Vercel CDN
* **Technology**: Next.js 15, optimized with Static Site Generation (SSG) for storefront catalog search paths and Server-Side Rendering (SSR) for real-time customer/vendor dashboards.
* **Benefits**: Instant global load velocities, automatic edge routing, and continuous integration (CI/CD) hooks.

### 2.2 Application Backend API: VPS + Docker
* **Technology**: Node.js/Express, deployed in isolated Docker containers on a Virtual Private Server (VPS) (e.g. DigitalOcean, AWS EC2, or Hetzner).
* **Load Balancing**: Nginx acts as a reverse proxy, termination point for SSL/TLS certificates, and distributor of traffic across three node clusters.

### 2.3 Storage Engine: AWS S3 / Cloudinary
* **Role**: Houses static assets, vendor banner images, and user profile pictures.
* **Benefits**: Cloudinary provides automatic image resizing, formats (WebP/AVIF), and CDN delivery.

### 2.4 Database & Cache Layer: PostgreSQL & Redis
* **PostgreSQL Server**: Configured with a Primary database node for writes and an secondary read-replica to scale heavy storefront query traffic.
* **Redis Instance**: Stores customer session states, JWT blacklists, shopping cart structures, and frequently viewed product schemas.
