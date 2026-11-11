# DevOps & CI/CD Documentation

## Architecture Overview

**Server:** 51.79.124.60 (OVH VPS, Ubuntu + CloudPanel)  
**CI/CD Tool:** Dploy v1.0.0 (built into CloudPanel)  
**DNS / CDN:** Cloudflare (zone: uy4sdjn4f7.com)  
**Deployment trigger:** GitHub Actions → SSH → `dploy deploy <branch>`

---

## Branch → Environment Mapping

| Git Branch | Environment | What happens |
|------------|-------------|--------------|
| `main` | Production | Full build + deploy, ~2 min |
| `staging` | Staging | Full build + deploy, ~2 min |

## Repository → Site Mapping

| Repository | Branch | Environment | URL |
|------------|--------|-------------|-----|
| vue-frontend | main | Production | https://vue-build-prod.uy4sdjn4f7.com |
| vue-frontend | staging | Staging | https://vue-build-stage.uy4sdjn4f7.com |
| admin-dash | main | Production | https://admin-dash-prod.uy4sdjn4f7.com |
| admin-dash | staging | Staging | https://admin-dash-stage.uy4sdjn4f7.com |
| express-node | main | Production | https://node-build-prod.uy4sdjn4f7.com |
| express-node | staging | Staging | https://node-build-stage.uy4sdjn4f7.com |

---

## How Deployment Works

1. Developer pushes to `main` or `staging`
2. GitHub Actions triggers `.github/workflows/deploy.yml`
3. Actions SSHs into the server as the site-specific user
4. Runs `dploy deploy <branch>` which:
   - Clones the latest commit into a timestamped `releases/` folder
   - Runs `before_commands` (npm ci, npm run build)
   - Atomically swaps the `current` symlink to the new release
   - Runs `after_commands` (PM2 restart for Node.js sites)
5. nginx serves from the `current/` symlink (or `current/dist/` for Vue/React builds)

**Total deploy time:** ~2 minutes (vue/react builds), ~30 seconds (node)

---

## Node API — Endpoints Reference

Base URL (prod): `https://node-build-prod.uy4sdjn4f7.com`  
Base URL (stage): `https://node-build-stage.uy4sdjn4f7.com`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check — returns service status |
| POST | `/api/sqs/init` | Initialize SQS client with AWS region |
| POST | `/api/sqs/queue` | Create a new SQS queue |
| GET | `/api/sqs/queue-url` | Get queue URL by name (`?queueName=`) |
| POST | `/api/sqs/send` | Send message to queue (by flag or URL) |
| GET | `/api/sqs/receive` | Poll messages from queue |
| POST | `/api/sqs/delete-message` | Delete processed message by receipt handle |
| GET | `/api/sqs/dlq` | Inspect Dead Letter Queue |
| DELETE | `/api/sqs/queue` | Delete a queue |

### Test the API (after AWS credentials are set)

```bash
# Health check
curl https://node-build-prod.uy4sdjn4f7.com/health

# Initialize SQS client
curl -X POST -H "Content-Type: application/json" \
  -d '{"region": "us-east-1"}' \
  https://node-build-prod.uy4sdjn4f7.com/api/sqs/init

# Send a message
curl -X POST -H "Content-Type: application/json" \
  -d '{"flag": "email_notifications", "messageBody": {"event": "test"}}' \
  https://node-build-prod.uy4sdjn4f7.com/api/sqs/send

# Receive messages
curl "https://node-build-prod.uy4sdjn4f7.com/api/sqs/receive?flag=email_notifications&maxMessages=5"
```

### AWS Credentials Setup

The server reads credentials from `.env` in the shared folder on the server:

```
/home/uy4sdjn4f7-nbprod/htdocs/node-build-prod.uy4sdjn4f7.com/shared/.env
/home/uy4sdjn4f7-nbstage/htdocs/node-build-stage.uy4sdjn4f7.com/shared/.env
```

Required `.env` keys:
```env
PORT=3002
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

After editing `.env`, restart PM2:
```bash
# SSH as root, then:
sudo -u uy4sdjn4f7-nbprod pm2 restart node-build-prod
```

---

## Vue App Testing

The Vue app (`vue-build-prod.uy4sdjn4f7.com`) is the front-end interface.  
To test it, simply visit: https://vue-build-prod.uy4sdjn4f7.com

If the Vue app calls the Node API, make sure it points to:
- **Production:** `https://node-build-prod.uy4sdjn4f7.com`
- **Staging:** `https://node-build-stage.uy4sdjn4f7.com`

---

## Rollback Procedure

Dploy keeps the last 5 releases. To roll back:

```bash
# SSH into the server as root
ssh root@51.79.124.60

# List available releases for a site
ls /home/uy4sdjn4f7-vbprod/htdocs/vue-build-prod.uy4sdjn4f7.com/releases/

# Roll back by pointing current symlink to a previous release
sudo -u uy4sdjn4f7-vbprod ln -sfn \
  /home/uy4sdjn4f7-vbprod/htdocs/vue-build-prod.uy4sdjn4f7.com/releases/<timestamp> \
  /home/uy4sdjn4f7-vbprod/htdocs/vue-build-prod.uy4sdjn4f7.com/current
```

No nginx restart needed — symlink swap is atomic.

---

## Environment Variables / Shared Files

Sensitive config (`.env`) lives in the `shared/` folder on the server — not in Git.

| Site | Shared .env path |
|------|-----------------|
| node-build-prod | `/home/uy4sdjn4f7-nbprod/htdocs/node-build-prod.uy4sdjn4f7.com/shared/.env` |
| node-build-stage | `/home/uy4sdjn4f7-nbstage/htdocs/node-build-stage.uy4sdjn4f7.com/shared/.env` |

---

## GitHub Actions Secrets (per repo)

| Secret | Value |
|--------|-------|
| `DEPLOY_HOST` | `51.79.124.60` |
| `DEPLOY_KEY_PROD` | SSH private key for production site user |
| `DEPLOY_KEY_STAGE` | SSH private key for staging site user |

---

## CloudPanel Server Panel

Access: **https://51.79.124.60:8443**
