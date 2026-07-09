/// <reference types="vite/client" />

// Injected at build/dev-server-start time via `define` in vite.config.ts —
// see getRepoStats() there.
declare const __REPO_STATS__: { weeksSinceFirstCommit: number; commitCount: number }
