---
name: youtube-search
description: Search YouTube for videos, channels, and playlists using the YouTube Data API v3. Use when you need to find YouTube content, look up tutorials, music, talks, or any video content.
---

# YouTube Search

Search YouTube for videos, channels, and playlists using the YouTube Data API v3. No browser required.

## Setup

Requires a Google Cloud project with the YouTube Data API v3 enabled.

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a project (or select an existing one)
3. Enable the **YouTube Data API v3**
4. Create an API key
5. Add `YOUTUBE_API_KEY` to your `LLM_SECRETS` so the agent can access it

## Search

```bash
node {baseDir}/search.js "query"                                # Basic search (5 video results)
node {baseDir}/search.js "query" -n 10                          # More results (max 50)
node {baseDir}/search.js "query" --order date                   # Sort by upload date (newest first)
node {baseDir}/search.js "query" --order viewCount              # Sort by view count
node {baseDir}/search.js "query" --type channel                 # Search for channels instead of videos
node {baseDir}/search.js "query" --type playlist                # Search for playlists
node {baseDir}/search.js "query" --duration short               # Only short videos (<4 min)
node {baseDir}/search.js "query" --duration long                # Only long videos (>20 min)
node {baseDir}/search.js "query" --published-after 2025-01-01   # Only videos after a date
node {baseDir}/search.js "query" -n 10 --order date --duration medium  # Combined options
```

### Options

- `-n <num>` — Number of results (default: 5, max: 50)
- `--order <order>` — Sort order: `relevance` (default), `date`, `rating`, `viewCount`, `title`
- `--type <type>` — Resource type: `video` (default), `channel`, `playlist`
- `--duration <dur>` — Video length filter: `any`, `short` (<4 min), `medium` (4–20 min), `long` (>20 min)
- `--published-after <date>` — Only results published after this date (`YYYY-MM-DD`)

## Output Format

```
Found 1000000 total results (showing 5):

--- Result 1 ---
Title: Learn JavaScript in 1 Hour
Channel: Programming with Mosh
URL: https://youtube.com/watch?v=W6NZfCO5SIk
Published: 2024-03-15
Description: JavaScript tutorial for beginners. Learn JavaScript basics in 1 hour...

--- Result 2 ---
...
```

## When to Use

- Finding tutorial videos on a specific topic
- Looking up conference talks or presentations
- Searching for music or entertainment
- Finding channels related to a subject
- Discovering recent uploads on a topic (use `--order date`)
- Any task that requires discovering YouTube content
