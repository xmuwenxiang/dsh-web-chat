# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-08-25

### Added

- **Transfer target workspace**: the "Transfer to Harness" panel and the `webchat_transfer` tool now let you pick a target workspace (or leave the new session ungrouped). The transferred session is created with the workspace's canonical path as its working directory and attached to the workspace's account, so it is grouped under that workspace in the sidebar instead of "Ungrouped".
- **Workspace listing in `webchat_status`**: the status tool now reports the harness workspaces (`id | title | path`) available as `webchat_transfer` targets.
- **Dual-channel reply capture**: the injected capture now tees both `XMLHttpRequest` and `fetch` for the `/chat/completion` stream, so replies keep streaming even if the page switches from XHR to `fetch` (DOM scraping remains the last-resort fallback).
- **Structured error codes**: send results and state now carry a `code` (`NEED_LOGIN` / `PAGE_CHANGED` / `TIMEOUT` / `NETWORK`) so the panel and `webchat_send` can act on a failure — prompt the login window vs. suggest a plugin upgrade — instead of only printing a generic timeout.
- **Parser unit tests**: fixtures pin the SSE ops protocol shapes (`test/parse-stream.test.ts`) — snapshot, fragment append, content delta, search/TOOL_OPEN steps, citation resolution, and malformed streams.
- **Image input (multimodal)**: `webchat_send` and the panel composer can attach local images (absolute paths) to a prompt; the engine uploads them through the page's file input and records them in the transcript.
- **Web conversation recovery/sync**: `webchat_recover` and the panel "从网页恢复" button list the web-side conversations missing locally and import one (idempotent by title); `webchat_status` now lists web conversations and flags the unimported ones.
- **Continue into an existing session**: `webchat_transfer` (and the panel "延续到会话" picker) can append the distilled brief as a fresh user message to an existing harness session (`targetSessionId`) instead of always creating a new one — multi-round "same task, another web round" resume.
- **Long-conversation distillation (map-reduce)**: long transcripts are split into character-budgeted chunks (never splitting a message), each summarized then merged into the final brief; new settings `transferMaxTokens` (final brief cap, default 4096) and `transferChunkTokens` (per-chunk cap, default 1024).
- **Workspace-scoped continuation picker**: the "延续到会话" list follows the transfer-target workspace selector (defaulting to the active workspace and re-syncing as it moves, until the user picks one), so a continued task stays inside the chosen workspace.

### Changed

- `webchat_transfer` accepts optional `workspaceId` and `cwd` parameters.
- `webchat_send` reports a structured `code` alongside its error for actionable handling.

### Fixed

- `webchat_send` now waits for the completed reply (`wait=true`) instead of returning immediately with an empty reply.
- `webchat_send` and `webchat_transfer` tool results now omit `undefined` fields (`error`, `code`, `workspaceId`). The harness rejects tool output that is not lossless JSON, so a successful call previously failed with "value is not lossless JSON".

## [0.1.0] - 2026-08-20

### Added

- Initial release: browser-driven DeepSeek web chat, transfer-to-Harness (distill/raw), import-as-context, agent tools (`webchat_status` / `webchat_send` / `webchat_import` / `webchat_transfer`), and one-time hands-free login.
