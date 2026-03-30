# Agent Guidelines for Headscale UI

This document provides guidelines for AI coding agents working on the Headscale UI project (Next.js + React + TypeScript).

## Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **UI**: React 18
- **Language**: TypeScript
- **Styling**: CSS Modules / plain CSS
- **State**: Local state with React hooks (useState, useEffect)
- **HTTP**: Fetch API (or axios if installed)

## Repository Relationship

This is a **standalone Docker image** consumed by the `headscale-server` infrastructure repository.

- Server: `headscale-server/` (Docker Compose, Nginx, Headscale)
- UI: `lykabala-headscale-ui/` (this repo)

The server's docker-compose references this image as `yourname/headscale-ui:latest`. Changes pushed here will be built and pushed to Docker Hub independently.

## Commands

**Development**:
```bash
npm install          # Install dependencies
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Create production build in .next/
npm start            # Start production server (after build)
```

**Lint / Type Check**:
```bash
npx tsc --noEmit     # Type check
# If ESLint is configured: npx eslint .
```

## Code Style

- Use TypeScript; avoid `any` types
- Prefer functional components and hooks
- Use meaningful component and variable names
- Keep components small and single-purpose
- Follow the existing pattern for API calls (usually fetch from `HEADSCALE_URL`)
- Use CSS modules for component-scoped styles when appropriate

### TypeScript Configuration

- Strict mode is likely enabled
- Target ES2015+ for browser compatibility
- Always return proper types from functions

### Imports

Use absolute imports if configured, otherwise relative imports. Typical order:

1. React imports (`import React, { useState } from 'react'`)
2. Third-party libraries
3. Internal modules (`import { api } from '@/lib/api'`)

### Components

- Place components in `components/` directory if reusable
- Place page-specific components in `pages/` subfolders or alongside page files
- Define props interfaces with `I` prefix: `interface IButtonProps { ... }`
- Use `export default` for primary component

### Pages

- Located in `pages/`
- Default export should be the page component
- Use `getServerSideProps` or `getStaticProps` only if needed (this app likely uses client-side fetch)
- Keep page logic minimal; delegate to components and services

### API Interaction

The UI talks to Headscale via an internal URL. Typical pattern:

```ts
const response = await fetch(`${process.env.HEADSCALE_URL}/api/v1/machines`);
const data = await response.json();
```

Handle errors gracefully and display user-friendly messages.

### Environment Variables

- Client-side accessible vars must be prefixed with `NEXT_PUBLIC_` (not currently used)
- Server-side env (Node runtime) can be used directly via `process.env`
- The Docker image injects necessary vars at runtime through `docker-compose.yml`

## Docker Guidelines

- The provided `Dockerfile` builds a production image using Node.js Alpine
- Multi-stage build: `as build` then clean runtime
- Expose port 3000
- Start with `npm start`
- Do not modify container internals manually; update Dockerfile if needed

## CI/CD

- On push to `main`/`master` or tags `v*.*.*`, GitHub Actions builds and pushes:
  - `yourname/headscale-ui:latest`
  - `yourname/headscale-ui:<commit-sha>`
  - `yourname/headscale-ui:<tag>` (if tag matches `v*.*.*`)
- After push, the workflow optionally deploys to VPS via SSH:
  - SSH into VPS (secrets: `VPS_HOST`, `VPS_USERNAME`, `VPS_SSH_KEY`, `DEPLOY_PATH`)
  - Run `docker compose pull ui && docker compose up -d ui`
  - Prune old images

## Testing

Currently no test framework is configured.

If tests are needed, consider adding Jest + React Testing Library. Place tests as `*.test.tsx` next to components or in a `__tests__/` folder. Add `"test"` script to `package.json`.

## Security

- Never commit secrets to the repository
- Do not store API keys in source code
- Use environment variables for runtime configuration
- Validate user input (if any)
- Sanitize data before rendering to prevent XSS (React does this by default)

## Future Improvements

If extending:

- Add proper error boundaries
- Implement loading states and skeletons
- Add input validation (e.g., Zod)
- Consider i18n if needed
- Add accessibility features (ARIA labels, keyboard nav)
- Write tests for critical components

## Cursor / Copilot Rules

No agent-specific rules file exists in this repository. If added later, follow those instructions, giving them priority over this document.

## End of AGENTS.md
