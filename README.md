# Headscale UI

A modern, responsive web interface for managing Headscale, built with Next.js 14 and React 18.

**This repository is a standalone Docker image** that works in conjunction with the [headscale-server](https://github.com/yourusername/headscale-server) infrastructure repository.

## Features

- View and manage machines (nodes)
- Approve, expire, or delete machine registrations
- View API key status
- Clean, fast UI with Next.js server-side rendering
- Production-ready Docker image

## Architecture

- **Server Repo**: `headscale-server` (infrastructure: Nginx, Headscale, Certbot)
- **UI Repo**: `lykabala-headscale-ui` (this repo - Next.js application)

The server repo's `docker-compose.yml` pulls this UI image (`yourname/headscale-ui:latest`) and serves it via Nginx. The UI communicates with Headscale through the Docker internal network.

## Quick Start (Development)

### Prerequisites

- Node.js 18+ and npm

### Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment example and edit as needed:

   ```bash
   cp .env.local.example .env.local
   ```

   At minimum, set `HEADSCALE_URL` to your Headscale API endpoint (e.g., `http://localhost:8080` for local Docker setup).

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

The UI will hot-reload as you edit files.

## Building the Docker Image

### Build locally

```bash
docker build -t yourname/headscale-ui:latest .
```

### Push to Docker Hub

1. Log in to Docker Hub:

   ```bash
   docker login
   ```

2. Tag and push:

   ```bash
   docker tag yourname/headscale-ui:latest yourname/headscale-ui:latest
   docker push yourname/headscale-ui:latest
   ```

   The GitHub Actions workflow automates this on push to `main`/`master` or tags.

## Environment Variables

For local development, create `.env.local` based on `.env.local.example`:

| Variable | Description | Default / Required |
|----------|-------------|-------------------|
| `HEADSCALE_URL` | Headscale API URL (internal Docker hostname) | `http://headscale:8080` (in Docker) |
| `HEADSCALE_API_KEY` | Optional: explicit API key (if not using file) | - |
| `HEADSCALE_API_KEY_FILE` | Path to file containing API key (mounted volume) | `/var/lib/headscale/apikey.txt` (in Docker) |
| `SESSION_SECRET` | Secret for signing session cookies | *Required for production* |
| `UI_USERNAME` | Admin username (optional, for basic auth) | `admin` |
| `UI_PASSWORD` | Admin password (optional) | `change_me` |
| `COOKIE_SECURE` | Set `true` for HTTPS, `false` for HTTP | `false` (local), `true` (production) |
| `USERS_FILE` | Path to JSON file for user management | `./users.json` (local), `/var/lib/headscale/users.json` (Docker) |

In production, the server's `docker-compose.yml` injects these via `environment:` section. Most values come from the server's `.env` file.

## Production Deployment

**This UI image is deployed by the `headscale-server` repository.**

You do **not** need to manually deploy this UI. The CI/CD pipeline in this repo builds and pushes the Docker image to Docker Hub. Then, when you push changes to the **server repository**, its CI/CD pulls the latest UI image and restarts the stack.

To update the UI:

1. Make changes in this repository
2. Commit and push to `main` (or create a tag)
3. GitHub Actions builds and pushes `yourname/headscale-ui:latest`
4. (Optional) Trigger the server's deploy by pushing to its `main` branch, or rely on the UI's own deploy step if configured

## Docker Details

The Dockerfile (`Dockerfile`) uses a multi-stage build:

1. **Builder**: Node.js 20 Alpine, runs `npm ci` and `npm run build`
2. **Runner**: Node.js 20 Alpine, copies built app, runs `npm start`

The container exposes port 3000 and starts the Next.js production server.

## Tech Stack

- **Framework**: Next.js 14 (App Router not used, uses Pages Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: CSS Modules / plain CSS (as provided)
- **State**: React hooks (useState, useEffect)
- **HTTP Client**: Fetch API / axios (as in code)

## Project Structure

```
lykabala-headscale-ui/
├── components/      # Reusable React components
├── features/        # Feature-specific modules
├── lib/             # Utilities, API clients, helpers
├── pages/           # Next.js pages (Pages Router)
│   ├── index.tsx    # Home page
│   └── machines/    # Machines list page
├── public/          # Static assets
├── styles/          # Global styles
├── utils/           # Helper functions
├── Dockerfile
├── next.config.cjs
├── tsconfig.json
├── package.json
└── .env.local.example
```

## Contributing

When modifying the UI:

- Follow the existing code style (TypeScript, React hooks)
- Do not introduce new heavy dependencies without discussion
- Keep components small and focused
- Update documentation as needed

## License

[Your license here]
