# Roabot

**Autonomous AI agents. All the power. None of the leaked API keys.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Actions](https://img.shields.io/badge/Powered%20by-GitHub%20Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

An autonomous AI agent framework by [Vonroflo](https://vonroflo.com) that puts security first, uses your repository as the agent's memory, and runs on GitHub Actions' free compute.

---

## Overview

Roabot is a two-layer autonomous AI agent framework that enables you to deploy secure, self-evolving AI agents without managing infrastructure. Unlike other frameworks that hand credentials to the LLM and hope for the best, Roabot filters secrets at the process level - the AI literally cannot access your API keys, even if it tries.

Every action your agent takes is a git commit. You can see exactly what it did, when, and why. If it screws up, revert it. Want to clone your agent? Fork the repo - code, personality, scheduled jobs, full history, all of it comes with you.

---

## Why Roabot?

### 🔐 Secure by Default

Other frameworks hand credentials to the LLM and hope for the best. Roabot is different: the AI literally cannot access your secrets, even if it tries. Secrets are filtered at the process level before the agent's shell even starts.

```bash
# What the AI tries → What happens
echo $ANTHROPIC_API_KEY  # → Empty
echo $GH_TOKEN          # → Empty
cat /proc/self/environ  # → Secrets missing
```

But the agent still works normally - SDKs and tools have access to what they need. The LLM just can't leak them.

### 📝 The Repository IS the Agent

Every action your agent takes is a git commit. You can:
- See exactly what it did, when, and why
- Revert mistakes with `git revert`
- Clone your agent by forking the repo
- Track its evolution through commit history
- Review PRs before they merge

### 💰 Free Compute, Built In

| | Roabot | Other Platforms |
|---|---|---|
| **Public repos** | Free. $0. GitHub Actions doesn't charge. | $20-100+/month |
| **Private repos** | 2,000 free minutes/month (every GitHub plan, including free) | $20-100+/month |
| **Infrastructure** | GitHub Actions (already included) | Dedicated servers |

You just bring your own [Anthropic API key](https://console.anthropic.com/).

### 🧬 Self-Evolving

The agent modifies its own code through pull requests. Every change is auditable, every change is reversible. You stay in control through the `AUTO_MERGE` and `ALLOWED_PATHS` safety controls.

---

## Architecture

Roabot uses a **two-layer architecture**:

1. **Event Handler** - Node.js server for orchestration (webhooks, Telegram chat, cron scheduling)
2. **Docker Agent** - Autonomous task execution via the [Pi coding agent](https://github.com/mariozechner/pi-coding-agent)

```
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ┌─────────────────┐         ┌─────────────────┐                     │
│  │  Event Handler  │ ──1──►  │     GitHub      │                     │
│  │  • Telegram     │         │ (job/* branch)  │                     │
│  │  • Webhooks     │         └────────┬────────┘                     │
│  │  • Cron         │                  │                              │
│  └────────▲────────┘                  2 (triggers run-job.yml)       │
│           │                           │                              │
│           │                           ▼                              │
│           │                  ┌─────────────────┐                     │
│           │                  │  Docker Agent   │                     │
│           │                  │  • Clone repo   │                     │
│           │                  │  • Run Pi       │                     │
│           │                  │  • Commit       │                     │
│           │                  │  • Create PR    │                     │
│           │                  └────────┬────────┘                     │
│           │                           │                              │
│           │                           3 (PR opened)                  │
│           │                           │                              │
│           │                           ▼                              │
│           │                  ┌─────────────────┐                     │
│           │                  │     GitHub      │                     │
│           │                  │   • auto-merge  │                     │
│           │                  │   • notify      │                     │
│           │                  └────────┬────────┘                     │
│           │                           │                              │
│           5 (Telegram notification)   │                              │
│           └───────────────────────────┘                              │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

**How it works:**

1. You message your bot on Telegram (or hit a webhook)
2. Event Handler creates a `job/*` branch on GitHub
3. GitHub Actions spins up a Docker container with the Pi agent
4. Agent executes the task, commits results, opens a PR
5. `auto-merge.yml` validates and merges (if allowed)
6. `update-event-handler.yml` sends notification to Telegram

[→ Full Architecture Documentation](docs/ARCHITECTURE.md)

---

## Features

### 🤖 Multiple Interaction Methods

- **Telegram Chat** - Conversational interface with Claude (text and voice messages)
- **Webhooks** - Programmatic job creation via HTTP API
- **Scheduled Jobs** - Cron-based recurring tasks
- **GitHub Webhooks** - React to repository events

### 🎯 Three Action Types

Every task can use one of three execution modes:

| Type | Description | Use Case | Cost |
|------|-------------|----------|------|
| **`agent`** | Full LLM-powered Docker container | Complex tasks requiring reasoning | LLM + GitHub Actions |
| **`command`** | Direct shell execution | Simple scripts, no LLM needed | Free |
| **`http`** | HTTP request to external service | API calls, webhook forwarding | Free |

### ⏰ Cron Scheduling

Define recurring jobs in `operating_system/CRONS.json`:

```json
{
  "name": "daily-check",
  "schedule": "0 9 * * *",
  "type": "agent",
  "job": "Check for dependency updates and create a summary",
  "enabled": true
}
```

### 🎣 Webhook Triggers

React to incoming webhooks in `operating_system/TRIGGERS.json`:

```json
{
  "name": "on-github-event",
  "watch_path": "/github/webhook",
  "actions": [
    { "type": "agent", "job": "Review this GitHub event: {{body}}" }
  ],
  "enabled": true
}
```

### 🛠️ Custom Skills

Extend the agent with specialized capabilities in `.pi/skills/`:

```
.pi/skills/
├── brave-search/      # Web search via Brave API
├── llm-secrets/       # Access LLM-visible credentials
└── modify-self/       # Self-modification capabilities
```

### 🎤 Voice Messages

Send voice notes to your Telegram bot - they're automatically transcribed using OpenAI Whisper (requires `OPENAI_API_KEY`).

### 🔒 Secret Management

Two-tier secret system:

- **`SECRETS`** - Filtered from LLM (API keys, tokens, credentials)
- **`LLM_SECRETS`** - Accessible to LLM (browser passwords, skill API keys)

### 📊 Session Logs

Every job creates a directory at `logs/{JOB_ID}/` with:
- `job.md` - Task description
- Session logs (`.jsonl`) - Full execution trace
- Can be used to resume sessions with `--session-dir`

### 🔄 Auto-Merge Controls

Fine-grained control over what the agent can merge:

- `AUTO_MERGE` variable - Enable/disable auto-merge
- `ALLOWED_PATHS` variable - Restrict which paths can be modified

[→ Auto-Merge Documentation](docs/AUTO_MERGE.md)

---

## Getting Started

### Prerequisites

| Requirement | Install |
|-------------|---------|
| **Node.js 18+** | [nodejs.org](https://nodejs.org) |
| **npm** | Included with Node.js |
| **Git** | [git-scm.com](https://git-scm.com) |
| **GitHub CLI** | [cli.github.com](https://cli.github.com) |
| **ngrok*** | [ngrok.com](https://ngrok.com/download) |

*\*ngrok is only required for local development. Production deployments don't need it.*

### Quick Start

**Step 1** — Fork this repository:

[![Fork this repo](https://img.shields.io/badge/Fork_this_repo-238636?style=for-the-badge&logo=github&logoColor=white)](https://github.com/vonroflo/roabot/fork)

> ⚠️ **Important:** GitHub Actions are disabled by default on forks. Go to the **Actions** tab in your fork and enable them.

**Step 2** — Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/roabot.git
cd roabot
```

**Step 3** — Run the setup wizard:

```bash
npm run setup
```

The wizard handles everything:
- ✅ Checks prerequisites (Node.js, Git, GitHub CLI, ngrok)
- ✅ Creates a GitHub Personal Access Token
- ✅ Collects API keys (Anthropic required; OpenAI, Groq, Brave Search optional)
- ✅ Sets GitHub repository secrets and variables
- ✅ Sets up Telegram bot
- ✅ Starts the server + ngrok, generates `event_handler/.env`
- ✅ Registers webhooks and verifies everything works

**Step 4** — Message your Telegram bot to create jobs!

```
You: Create a job to add a hello world Python script

Bot: ✓ Job created! I'll notify you when it's done.
     Job ID: abc123-def456
```

---

## Usage

### Via Telegram

Message your bot directly:

```
You: What can you do?

Bot: I can help you create and manage autonomous jobs...
```

Create a job:

```
You: Create a job to update the README with installation instructions

Bot: ✓ Job created! Job ID: abc123
```

### Via Webhook

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"job": "Update the README with installation instructions"}'
```

### Via Cron

Add to `operating_system/CRONS.json`:

```json
{
  "name": "weekly-maintenance",
  "schedule": "0 0 * * 0",
  "type": "agent",
  "job": "Review repository health and create maintenance tasks",
  "enabled": true
}
```

---

## Customization

### Personality

Edit `operating_system/SOUL.md` to define your agent's:
- Identity and role
- Personality traits
- Values and priorities
- Technical strengths

### Chat Behavior

Modify `operating_system/CHATBOT.md` to customize how your agent:
- Responds to questions
- Creates jobs
- Handles errors

### Scheduled Jobs

Define recurring tasks in `operating_system/CRONS.json`:

```json
[
  {
    "name": "heartbeat",
    "schedule": "*/30 * * * *",
    "type": "agent",
    "job": "Read operating_system/HEARTBEAT.md and complete tasks",
    "enabled": true
  },
  {
    "name": "cleanup",
    "schedule": "0 0 * * 0",
    "type": "command",
    "command": "ls -la logs/",
    "enabled": true
  },
  {
    "name": "ping-status",
    "schedule": "*/5 * * * *",
    "type": "http",
    "url": "https://example.com/status",
    "method": "POST",
    "enabled": true
  }
]
```

### Webhook Triggers

React to events in `operating_system/TRIGGERS.json`:

```json
[
  {
    "name": "on-github-event",
    "watch_path": "/github/webhook",
    "actions": [
      { "type": "command", "command": "echo 'Event received'" },
      { "type": "agent", "job": "Review this event: {{body}}" }
    ],
    "enabled": true
  }
]
```

### Custom Skills

Add specialized capabilities in `.pi/skills/`:

```
.pi/skills/my-skill/
├── SKILL.md          # Skill instructions
├── tool.js           # Tool implementation
└── README.md         # Documentation
```

[→ Full Customization Guide](docs/CUSTOMIZATION.md)

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | Two-layer design, file structure, API endpoints, workflows |
| [Configuration](docs/CONFIGURATION.md) | Environment variables, GitHub secrets, ngrok, Telegram setup |
| [Customization](docs/CUSTOMIZATION.md) | Personality, skills, operating system files, security |
| [Auto-Merge](docs/AUTO_MERGE.md) | Auto-merge controls, ALLOWED_PATHS configuration |
| [How to Use Pi](docs/HOW_TO_USE_PI.md) | Guide to the Pi coding agent |
| [Security](docs/SECURITY_TODO.md) | Security hardening roadmap |

---

## Security

### How Secrets Are Protected

1. GitHub passes a single `SECRETS` environment variable (base64-encoded JSON)
2. The entrypoint decodes and exports each key as an environment variable
3. Pi starts - SDKs read their variables (ANTHROPIC_API_KEY, GH_TOKEN)
4. The `env-sanitizer` extension filters ALL secret keys from bash subprocess environment
5. The LLM can't `echo $ANYTHING` - subprocess environment is filtered
6. Extensions still have full `process.env` access for legitimate operations

### Two-Tier Secret System

| Secret Type | Variable | Filtered from LLM? | Use Case |
|-------------|----------|-------------------|----------|
| Protected | `SECRETS` | ✅ Yes | API keys, tokens, credentials |
| LLM-Accessible | `LLM_SECRETS` | ❌ No | Browser passwords, skill API keys |

**Example:**

```bash
# Protected (filtered from LLM)
SECRETS='{"GH_TOKEN":"ghp_xxx","ANTHROPIC_API_KEY":"sk-ant-xxx"}'

# Accessible (not filtered)
LLM_SECRETS='{"BROWSER_PASSWORD":"mypass123","SKILL_API_KEY":"sk-xxx"}'
```

The agent can use browser passwords for web automation and skill API keys for external services, but it cannot access core infrastructure credentials.

[→ Full Security Documentation](docs/CUSTOMIZATION.md#security)

---

## API Reference

### Event Handler Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/ping` | GET | API_KEY | Health check |
| `/webhook` | POST | API_KEY | Create job |
| `/telegram/webhook` | POST | TELEGRAM_WEBHOOK_SECRET | Telegram bot |
| `/telegram/register` | POST | API_KEY | Register Telegram webhook |
| `/github/webhook` | POST | GH_WEBHOOK_SECRET | GitHub notifications |
| `/jobs/status` | GET | API_KEY | Check job status |

### Create a Job

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "job": "Update README with installation instructions"
  }'
```

Response:

```json
{
  "status": "created",
  "job_id": "abc123-def456",
  "branch": "job/abc123-def456"
}
```

### Check Job Status

```bash
curl "http://localhost:3000/jobs/status?job_id=abc123-def456" \
  -H "x-api-key: YOUR_API_KEY"
```

Response:

```json
{
  "job_id": "abc123-def456",
  "status": "running",
  "branch": "job/abc123-def456",
  "pr_url": "https://github.com/owner/repo/pull/123"
}
```

---

## GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `docker-build.yml` | Push to `main` | Builds Docker image, pushes to GHCR |
| `run-job.yml` | `job/*` branch created | Runs Docker agent container |
| `auto-merge.yml` | PR opened from `job/*` | Validates and merges PR |
| `update-event-handler.yml` | After auto-merge | Sends notification |

All workflows are fully automated - no manual configuration needed beyond the initial setup.

---

## Environment Variables

### Event Handler

| Variable | Description | Required |
|----------|-------------|----------|
| `API_KEY` | Authentication for /webhook endpoint | Yes |
| `GH_TOKEN` | GitHub PAT for creating branches | Yes |
| `GH_OWNER` | GitHub repository owner | Yes |
| `GH_REPO` | GitHub repository name | Yes |
| `PORT` | Server port (default: 3000) | No |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | For Telegram |
| `TELEGRAM_WEBHOOK_SECRET` | Webhook validation secret | No |
| `GH_WEBHOOK_SECRET` | GitHub webhook auth | For notifications |
| `ANTHROPIC_API_KEY` | Claude API key for chat | For chat |
| `EVENT_HANDLER_MODEL` | Claude model (default: claude-sonnet-4) | No |
| `OPENAI_API_KEY` | OpenAI API key for voice transcription | For voice |

### Docker Agent

| Variable | Description | Required |
|----------|-------------|----------|
| `REPO_URL` | Git repository URL | Yes |
| `BRANCH` | Branch to work on | Yes |
| `SECRETS` | Base64 JSON with protected credentials | Yes |
| `LLM_SECRETS` | Base64 JSON with LLM-accessible credentials | No |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Pi coding agent](https://github.com/mariozechner/pi-coding-agent) by Mario Zechner
- Powered by [Anthropic Claude](https://www.anthropic.com)
- Hosted on [GitHub Actions](https://github.com/features/actions)

---

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issues](https://github.com/vonroflo/roabot/issues)
- 💬 [Discussions](https://github.com/vonroflo/roabot/discussions)

---

<div align="center">

**Built with ❤️ by [Vonroflo](https://vonroflo.com)**

</div>
