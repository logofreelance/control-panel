import type { Context } from 'hono';

// Minimal interface to satisfy SystemService usage
// We don't implement the full loader logic here, just the types interface
// if logic requires it. But looking at usage, we might just need the basic AppEnv.
// If SystemService imports EnvCore, we should provide it or refactor SystemService.

export type EnvCore = any; // Placeholder if strictly needed, but better refactor usage.
