# Docker Deployment Guide for Prism IPTV

This guide details how to build, run, and manage the Prism IPTV full-stack application using Docker.

## Prerequisites

*   **Docker Desktop** (or Engine) installed.
*   **Docker Compose** (V2 recommended).

## Quick Start

1.  **Build the Stack**:
    ```bash
    docker-compose build
    ```

2.  **Start the Application**:
    ```bash
    docker-compose up -d
    ```

3.  **Access the App**:
    *   Frontend: [http://localhost:8080](http://localhost:8080)
    *   Backend API Status: [http://localhost:3001/api/status](http://localhost:3001/api/status)

## Architecture

*   **Frontend**: Multi-stage build (Node.js Build -> Nginx Alpine).
    *   Port: `8080` (mapped to container `80`).
    *   Config: `docker/nginx.conf` (SPA routing enabled).
*   **Backend**: Multi-stage build (Node.js TypeScript Build -> Node.js Alpine Runtime).
    *   Port: `3001`.
    *   User: Runs as non-root `appuser`.
*   **Orchestration**: `docker-compose.yml` manages networking and startup order.

## Build Details

### optimization
*   **Multi-Stage**: Both services use multi-stage builds to exclude build tools and dev dependencies from the final image.
*   **Alpine Linux**: We use Alpine-based images for minimal footprint.
*   **Layer Caching**: `npm ci` is run before copying source code to maximize Docker layer caching.

### Security
*   **Non-Root**: The backend service runs as a non-privileged user (`appuser`).
*   **Minimal Surface**: Only production dependencies are installed in the runtime stage.

## Troubleshooting

### Build Failures
*   *Issue*: `npm ci` fails.
*   *Fix*: Ensure `package-lock.json` is perfectly in sync with `package.json`. Delete `node_modules` and `package-lock.json` locally, run `npm install`, and try again.

### Container Health
Check the status of services:
```bash
docker-compose ps
```

View logs for specific services:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Volumes & Persistence
*   `app_data`: A named volume is configured for the backend at `/app/data` to allow for future persistent storage needs (e.g., local database or config files).
