Vercel From Scratch
A minimal clone of Vercel: paste a GitHub repo URL, and it gets cloned, built, and served on its own unique URL.
Built with TypeScript, Bun, Express, simple-git, AWS SDK (S3) and Redis.
Architecture
<img width="972" height="365" alt="Screenshot 2026-11-09 at 10 45 04 PM" src="https://github.com/user-attachments/assets/9433ef49-b957-4f2a-81fe-5fd7669e1dc0" />
The system is split into three independent services:
1. Upload Service
Takes a GitHub repository URL and gets the source code into object storage.
Client sends a repo URL (e.g. https://github.com/<user>/<repo>) to the upload service.
The service generates a unique deployment ID.
It clones the repo locally using simple-git.
It walks the cloned directory and uploads every file (assets like .jpg, .js, etc.) to S3 under repos/<id>/.
It pushes the id onto a Redis queue so the deployment service can pick it up.
It returns the id to the client.
2. Deployment Service
Builds the uploaded project.
Polls the Redis queue for new deployment IDs.
Downloads repos/<id>/ from S3 to a local working directory.
Runs the build (bun install && bun run build).
Uploads the resulting dist/ (or build/) folder back to S3 under dist/<id>/.
Updates the deployment status in Redis (uploaded → building → deployed).
3. Request Service
Serves the deployed sites.
Receives a request on a subdomain, e.g. <id>.yourdomain.com/index.html.
Extracts the id from the hostname.
Fetches the matching file from dist/<id>/ in S3 (checking the cache first).
Streams the file back with the correct Content-Type.
Getting Started
Prerequisites
Bun 1.0+
Redis running locally (or a hosted instance)
An AWS account with an S3 bucket and IAM credentials
Installation
git clone https://github.com/GaneshDeshmane/<your-repo>.git
cd <your-repo>

# install dependencies for each service
cd upload-service && bun install && cd ..
cd deployment-service && bun install && cd ..
cd request-service && bun install && cd ..

Dependencies (if starting from scratch)
bun add express simple-git @aws-sdk/client-s3 redis cors
bun add -d typescript @types/express @types/cors bun-types

Environment Variables
Create a .env file in each service (Bun loads .env automatically, no dotenv needed):
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
S3_BUCKET=your-bucket-name
REDIS_URL=redis://localhost:6379
PORT=3000

Running the Services
Add this script to each service's package.json:
{
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "start": "bun src/index.ts"
  }
}

Bash
# Terminal 1 - Redis
redis-server

# Terminal 2 - Upload service
cd upload-service && bun run dev

# Terminal 3 - Deployment service
cd deployment-service && bun run dev

# Terminal 4 - Request service
cd request-service && bun run dev

API
POST /deploy (Upload Service)
Request
Json
{ "repoUrl": "https://github.com/<user>/<repo>" }
Response
Json
{ "id": "k3j9x2a" }
GET /status?id=<id> (Upload Service)
Response
Json
{ "status": "deployed" }
GET <id>.localhost:3001/ (Request Service)
Serves the built site for that deployment.

Author
Ganesh Deshmane
github.com/GaneshDeshmane
