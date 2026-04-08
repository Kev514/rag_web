# Test Case RAG Frontend

A Vue 3 + Vite frontend for managing a test-case knowledge base and generating reusable test ideas with RAG.

## Features

- Show backend health and model status (Chat / Embedding)
- Add test cases into the knowledge base
- Browse all indexed test cases
- Run reuse search and generation from new requirement text

## Tech Stack

- Vue 3
- Vite

## Requirements

- Node.js 18+ (LTS recommended)
- npm 9+
- A running backend API service (default: `http://127.0.0.1:5000`)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Start dev server:

```bash
npm run dev
```

Default URL: `http://127.0.0.1:5173`

## Environment Variable

`VITE_API_BASE_URL` is used as backend base URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
```

## Backend API Contract

The frontend currently calls:

- `GET /api/health`
- `GET /api/cases`
- `POST /api/cases`
- `POST /api/reuse`

If frontend and backend are deployed separately, make sure CORS is configured correctly on backend.

## Build and Preview

```bash
npm run build
npm run preview
```

## Project Structure

```text
.
|- src/
|  |- App.vue
|  |- main.js
|  `- style.css
|- .env.example
|- vite.config.js
`- package.json
```
