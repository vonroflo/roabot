#!/usr/bin/env node

/**
 * YouTube Search via YouTube Data API v3
 *
 * Searches YouTube for videos and returns structured results including
 * title, channel, description, URL, and published date.
 *
 * API Reference: https://developers.google.com/youtube/v3/docs/search/list
 *
 * Parameters used:
 *   part=snippet      - Returns basic info (title, description, channel, thumbnails)
 *   type=video        - Only return videos (not channels or playlists)
 *   order=relevance   - Sort by relevance to query (default API behavior)
 *   maxResults=N      - Number of results to return (1-50, default 5)
 *   q=<query>         - The search query string
 *
 * Authentication: API key only (no OAuth needed for public search)
 * Environment: YOUTUBE_API_KEY must be set
 */

const { execSync } = require("child_process");

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

// Parse -n <num> for result count
let maxResults = 5;
const nIndex = args.indexOf("-n");
if (nIndex !== -1 && args[nIndex + 1]) {
  maxResults = Math.max(1, Math.min(50, parseInt(args[nIndex + 1], 10) || 5));
  args.splice(nIndex, 2);
}

// Parse --order <order> for sort order
// Allowed values: relevance, date, rating, viewCount, title
let order = "relevance";
const orderIndex = args.indexOf("--order");
if (orderIndex !== -1 && args[orderIndex + 1]) {
  const allowed = ["relevance", "date", "rating", "viewCount", "title"];
  const val = args[orderIndex + 1];
  if (allowed.includes(val)) order = val;
  args.splice(orderIndex, 2);
}

// Parse --type <type> for resource type
// Allowed values: video, channel, playlist
let resourceType = "video";
const typeIndex = args.indexOf("--type");
if (typeIndex !== -1 && args[typeIndex + 1]) {
  const allowed = ["video", "channel", "playlist"];
  const val = args[typeIndex + 1];
  if (allowed.includes(val)) resourceType = val;
  args.splice(typeIndex, 2);
}

// Parse --duration <duration> for video length filter
// Allowed values: any, short (<4min), medium (4-20min), long (>20min)
let duration = null;
const durIndex = args.indexOf("--duration");
if (durIndex !== -1 && args[durIndex + 1]) {
  const allowed = ["any", "short", "medium", "long"];
  const val = args[durIndex + 1];
  if (allowed.includes(val)) duration = val;
  args.splice(durIndex, 2);
}

// Parse --published-after <date> for filtering by publish date (RFC 3339: YYYY-MM-DD)
let publishedAfter = null;
const pubIndex = args.indexOf("--published-after");
if (pubIndex !== -1 && args[pubIndex + 1]) {
  publishedAfter = args[pubIndex + 1];
  args.splice(pubIndex, 2);
}

// Remaining args form the search query
const query = args.join(" ");

if (!query) {
  console.log("Usage: search.js <query> [options]");
  console.log("");
  console.log("Options:");
  console.log("  -n <num>                   Number of results (default: 5, max: 50)");
  console.log("  --order <order>            Sort order: relevance, date, rating, viewCount, title");
  console.log("  --type <type>              Resource type: video, channel, playlist (default: video)");
  console.log("  --duration <dur>           Video length: any, short (<4m), medium (4-20m), long (>20m)");
  console.log("  --published-after <date>   Only results after date (YYYY-MM-DD)");
  console.log("");
  console.log("Environment:");
  console.log("  YOUTUBE_API_KEY            Required. Your YouTube Data API v3 key.");
  console.log("");
  console.log("Examples:");
  console.log('  search.js "javascript tutorial"');
  console.log('  search.js "rust programming" -n 10');
  console.log('  search.js "live coding" --order date');
  console.log('  search.js "quick tips" --duration short');
  console.log('  search.js "conference talks" --published-after 2025-01-01');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// API key check
// ---------------------------------------------------------------------------

const apiKey = process.env.YOUTUBE_API_KEY;
if (!apiKey) {
  console.error("Error: YOUTUBE_API_KEY environment variable is required.");
  console.error("");
  console.error("To get an API key:");
  console.error("  1. Go to https://console.cloud.google.com/apis/credentials");
  console.error("  2. Create a project (or select existing)");
  console.error("  3. Enable the YouTube Data API v3");
  console.error("  4. Create an API key");
  console.error("  5. Add YOUTUBE_API_KEY to your LLM_SECRETS");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Build API URL and make request
// ---------------------------------------------------------------------------

/**
 * Construct the YouTube Data API search URL with all parameters.
 */
function buildApiUrl(query, maxResults, order, resourceType, duration, publishedAfter) {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    key: apiKey,
    maxResults: maxResults.toString(),
    order: order,
    type: resourceType,
  });

  // videoDuration only applies when type=video
  if (duration && resourceType === "video") {
    params.append("videoDuration", duration);
  }

  // publishedAfter needs RFC 3339 format
  if (publishedAfter) {
    // Accept YYYY-MM-DD and convert to RFC 3339
    const dateStr = publishedAfter.includes("T")
      ? publishedAfter
      : `${publishedAfter}T00:00:00Z`;
    params.append("publishedAfter", dateStr);
  }

  return `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
}

/**
 * Execute curl and return parsed JSON response.
 * Uses child_process.execSync as required.
 */
function fetchJson(url) {
  try {
    const stdout = execSync(
      `curl -s -f --max-time 15 "${url}"`,
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );
    return JSON.parse(stdout);
  } catch (err) {
    // If curl failed (non-zero exit), try to extract useful info
    if (err.stdout) {
      try {
        const errorData = JSON.parse(err.stdout);
        if (errorData.error) {
          throw new Error(
            `YouTube API error ${errorData.error.code}: ${errorData.error.message}`
          );
        }
      } catch (parseErr) {
        if (parseErr.message.startsWith("YouTube API error")) throw parseErr;
      }
    }
    throw new Error(`Request failed: ${err.message}`);
  }
}

/**
 * Build a YouTube URL from a search result item.
 *
 * The search endpoint returns items with id.kind and id.videoId / id.channelId / id.playlistId
 */
function buildResultUrl(item) {
  const id = item.id;
  if (id.videoId) return `https://youtube.com/watch?v=${id.videoId}`;
  if (id.channelId) return `https://youtube.com/channel/${id.channelId}`;
  if (id.playlistId) return `https://youtube.com/playlist?list=${id.playlistId}`;
  return "(unknown)";
}

/**
 * Format a single search result item into readable output.
 */
function formatResult(item, index) {
  const snippet = item.snippet || {};
  const title = snippet.title || "(no title)";
  const channel = snippet.channelTitle || "(unknown channel)";
  const description = snippet.description || "(no description)";
  const publishedAt = snippet.publishedAt || "";
  const url = buildResultUrl(item);

  // Format the published date to something readable
  let publishedDate = "";
  if (publishedAt) {
    try {
      const d = new Date(publishedAt);
      publishedDate = d.toISOString().split("T")[0]; // YYYY-MM-DD
    } catch {
      publishedDate = publishedAt;
    }
  }

  const lines = [];
  lines.push(`--- Result ${index + 1} ---`);
  lines.push(`Title: ${title}`);
  lines.push(`Channel: ${channel}`);
  lines.push(`URL: ${url}`);
  if (publishedDate) lines.push(`Published: ${publishedDate}`);
  lines.push(`Description: ${description}`);
  lines.push("");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

try {
  const url = buildApiUrl(query, maxResults, order, resourceType, duration, publishedAfter);
  const data = fetchJson(url);

  // Check for API-level errors in the response body
  if (data.error) {
    console.error(`YouTube API error ${data.error.code}: ${data.error.message}`);
    if (data.error.errors && data.error.errors.length > 0) {
      for (const e of data.error.errors) {
        console.error(`  - ${e.reason}: ${e.message}`);
      }
    }
    process.exit(1);
  }

  const items = data.items || [];

  if (items.length === 0) {
    console.log("No results found.");
    process.exit(0);
  }

  // Print summary header
  console.log(`Found ${data.pageInfo?.totalResults || items.length} total results (showing ${items.length}):\n`);

  // Print each result
  for (let i = 0; i < items.length; i++) {
    console.log(formatResult(items[i], i));
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
