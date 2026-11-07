// one connector per platform a surface actually reaches.
//
// the control plane does not speak any platform protocol. it knows which
// surface owns which platform, which credential that platform needs, and
// whether the facts behind the connector were verified. that is enough to
// route work and to refuse to pretend a platform is ready.

import type { Surface } from "./surfaces.ts";

export type Api = "oauth" | "token" | "rtmp" | "webhook" | "feed";

export interface Connector {
  platform: string;
  surface: Surface;
  api: Api;
  // the environment names the credential lives under, in priority order
  env: string[];
  verified: boolean;
  note?: string;
}

export const CONNECTORS: Connector[] = [
  { platform: "tiktok", surface: "shortform", api: "oauth", env: ["CLAWBUZZ_TIKTOK_CLIENT_KEY", "CLAWBUZZ_TIKTOK_CLIENT_SECRET"], verified: false, note: "content posting api needs an app review before a third party can publish" },
  { platform: "instagram", surface: "shortform", api: "oauth", env: ["CLAWBUZZ_META_APP_ID", "CLAWBUZZ_META_APP_SECRET"], verified: false, note: "reels publish through the graph api, business account required" },
  { platform: "youtube", surface: "shortform", api: "oauth", env: ["CLAWBUZZ_YOUTUBE_OAUTH_CLIENT_ID"], verified: true, note: "shorts upload is the same data api upload endpoint" },
  { platform: "youtube", surface: "longform", api: "oauth", env: ["CLAWBUZZ_YOUTUBE_OAUTH_CLIENT_ID"], verified: true },
  { platform: "x", surface: "text", api: "oauth", env: ["CLAWBUZZ_X_API_KEY", "CLAWBUZZ_X_API_SECRET"], verified: false, note: "posting tier pricing changes; the connector is a seam until a plan is chosen" },
  { platform: "bluesky", surface: "text", api: "token", env: ["CLAWBUZZ_BLUESKY_HANDLE", "CLAWBUZZ_BLUESKY_APP_PASSWORD"], verified: true, note: "com.atproto.repo.createRecord, app password" },
  { platform: "threads", surface: "text", api: "oauth", env: ["CLAWBUZZ_META_APP_ID"], verified: false },
  { platform: "linkedin", surface: "text", api: "oauth", env: ["CLAWBUZZ_LINKEDIN_CLIENT_ID"], verified: false },
  { platform: "discord", surface: "text", api: "token", env: ["CLAWBUZZ_DISCORD_BOT_TOKEN"], verified: true },
  { platform: "twitch", surface: "streaming", api: "rtmp", env: ["CLAWBUZZ_TWITCH_STREAM_KEY"], verified: true },
  { platform: "kick", surface: "streaming", api: "rtmp", env: ["CLAWBUZZ_KICK_STREAM_URL", "CLAWBUZZ_KICK_STREAM_KEY"], verified: true },
  { platform: "rss", surface: "audio", api: "feed", env: ["CLAWBUZZ_RSS_BASE_URL"], verified: true, note: "a podcast publishes by feed, not by upload" },
  { platform: "zoom", surface: "meetings", api: "oauth", env: ["CLAWBUZZ_ZOOM_ACCOUNT_ID", "CLAWBUZZ_ZOOM_CLIENT_ID", "CLAWBUZZ_ZOOM_CLIENT_SECRET"], verified: true },
  { platform: "meet", surface: "meetings", api: "oauth", env: ["CLAWBUZZ_GOOGLE_OAUTH_CLIENT_ID"], verified: true },
  { platform: "pinterest", surface: "static", api: "oauth", env: ["CLAWBUZZ_PINTEREST_APP_ID"], verified: false },
];

export function connectorsFor(surface: Surface): Connector[] {
  return CONNECTORS.filter((c) => c.surface === surface);
}

export function connectorFor(platform: string, surface?: Surface): Connector | null {
  const found = CONNECTORS.filter((c) => c.platform === platform);
  if (!found.length) return null;
  if (!surface) return found[0];
  return found.find((c) => c.surface === surface) ?? null;
}

// what is still missing before this connector can run. no guessing: the names
// are declared on the connector.
export function missingCredentials(
  connector: Connector,
  env: (name: string) => string | undefined,
): string[] {
  return connector.env.filter((name) => !env(name));
}

export function readyConnectors(env: (name: string) => string | undefined): Connector[] {
  return CONNECTORS.filter((c) => missingCredentials(c, env).length === 0);
}
