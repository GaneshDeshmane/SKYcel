# Vercel From Scratch

A from-scratch clone of Vercel's core deployment pipeline. Paste a GitHub repo URL, and the system clones it, builds it, and serves the result on its own URL.

Built with **TypeScript**, **Bun**, **Express**, **simple-git**, **AWS SDK (S3)** and **Redis**.

---

## Architecture
<<<<<<< HEAD

<img width="1097" height="447" alt="Screenshot 2026-11-10 at 9 20 26 AM" src="https://github.com/user-attachments/assets/9a561718-1c5d-4d3f-8ef4-2e581020e2a6" />


=======
<img width="1097" height="447" alt="Screenshot 2026-11-10 at 9 20 26 AM" src="https://github.com/user-attachments/assets/9a561718-1c5d-4d3f-8ef4-2e581020e2a6" />

>>>>>>> 570a649 (added get all file function)
The system is split into three independent services:

| # | Service | Responsibility |
|---|---------|----------------|
| 1 | **Upload Service** | Accepts a GitHub URL, clones the repo, uploads the source to S3, returns a deployment `id` |
| 2 | **Deployment Service** | Picks up a queued deployment, pulls source from S3, builds it into `dist/`, uploads the build output back to S3 |
| 3 | **Request Service** | Serves the deployed site by reading build artifacts from S3, with a caching layer in front |

### High-level flow

```
                 ┌──────────────────┐   clone    ┌──────────┐
  GitHub URL ───▶│  Upload Service  │◀──────────▶│  GitHub  │
                 └────────┬─────────┘            └──────────┘
                          │ upload source (assets: jpg/js/...)
                          ▼
                 ┌──────────────────┐
                 │  S3 (object      │◀──────────────┐
                 │  storage)        │               │
                 └────────┬─────────┘               │
                          │ id pushed to queue      │ upload dist/
                          ▼                         │
                 ┌──────────────────┐   build   ┌────┴─────────────┐
                 │      Redis       │──────────▶│ Deployment Svc   │
                 │  (queue/status)  │           │  (build → dist)  │
                 └──────────────────┘           └──────────────────┘

   Browser ───▶ ┌──────────────────┐  fetch  ┌──────────────────┐
                │ Request Service  │◀───────▶│ S3 (dist files)  │
   Browser ◀─── │  (RS + cache)    │         └──────────────────┘
                └──────────────────┘
```

### 1. Upload Service
1. Client sends a GitHub repository URL (e.g. `https://github.com/<user>/<repo>`).
2. The service generates a unique deployment `id`.
3. The repo is cloned locally using **simple-git**.
4. Every file (assets such as `.jpg`, `.js`, etc.) is uploaded to **S3 object storage** under `repos/<id>/...`.
5. The `id` is pushed onto a **Redis** queue and returned to the client.

### 2. Deployment Service
1. Polls the Redis queue for new deployment ids.
2. Downloads `repos/<id>/` from S3.
3. Runs the project's install and build steps.
4. Uploads the generated `dist/` folder back to S3 under `dist/<id>/...`.
5. Updates the deployment status in Redis (`uploaded` → `building` → `deployed`).

### 3. Request Service
1. Receives requests on `<id>.yourdomain.com`.
2. Extracts the `id` from the hostname.
3. Looks up the requested file in the cache, falling back to `dist/<id>/...` in S3.
4. Streams the file back with the correct `Content-Type`.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **TypeScript** | Type-safe code across all services |
| **Bun** | Runtime, package manager and script runner |
| **Express** | HTTP servers for the upload and request services |
| **simple-git** | Cloning GitHub repositories |
| **AWS SDK (S3)** | Storing source files and build output |
| **Redis** | Deployment queue, status tracking and caching |

---

## Project Structure

```
.
├── upload-service/        # Clones repos and uploads to S3
├── deployment-service/    # Builds projects and uploads dist/
├── request-service/       # Serves deployed sites
├── docs/
│   └── architecture.png
└── README.md
```

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) installed
- A running Redis instance (local or hosted)
- An AWS account with an S3 bucket and access keys

### Installation

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# install dependencies for each service
cd upload-service && bun install && cd ..
cd deployment-service && bun install && cd ..
cd request-service && bun install && cd ..
```

### Environment Variables

Create a `.env` file in each service:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
S3_BUCKET=your-bucket-name
REDIS_URL=redis://localhost:6379
PORT=3000
```

### Running the services

```bash
# Terminal 1
cd upload-service && bun run dev

# Terminal 2
cd deployment-service && bun run dev

# Terminal 3
cd request-service && bun run dev
```

---

## API

### `POST /deploy`

Starts a new deployment.

**Request**
```json
{
  "repoUrl": "https://github.com/<user>/<repo>"
}
```

**Response**
```json
{
  "id": "k3j9x2m"
}
```

### `GET /status?id=<id>`

Returns the deployment status (`uploaded`, `building`, `deployed`).

### Viewing a deployment

Open `http://<id>.localhost:3001` (request service) to see the deployed site.

---

## Roadmap

- [x] Upload service (clone + S3 upload)
- [x] Deployment service (build + dist upload)
- [x] Request service with caching
- [ ] Framework detection (React, Vite, Next.js)
- [ ] Build logs streaming
- [ ] Custom domains
- [ ] Environment variables per project
- [ ] Auto-deploy on GitHub push (webhooks)

---
