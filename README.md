# dsh-webchat

A "Codex ChatGPT mode" plugin for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): drive [chat.deepseek.com](https://chat.deepseek.com) with a real browser, chat with `deepseek-chat` (and `deepseek-reasoner`) using your DeepSeek **web session** — no API billing. Transfer a conversation into a harness session as development context (distilled into an executable task brief), import stored web conversations as markdown context, or let the harness agent keep chatting through the same web session.

## Features

- **Web chat** over your DeepSeek web login, with streaming replies and "Deep Think (R1)" / "Web Search" toggles.
- **Transfer to Harness**: distill the current conversation into a task brief and open it as a new harness session to continue development, or "continue into" an existing session (append the brief as a new message); pick a target workspace (or leave it ungrouped).
- **Recover web conversations**: pull web-side conversations not yet stored locally into the local store (panel "Recover from web" / `webchat_recover`).
- **Import as context**: export a stored web conversation to markdown.
- **Agent tools**: `webchat_status`, `webchat_send`, `webchat_recover`, `webchat_import`, `webchat_transfer` — the harness agent can chat via the web, inspect transcripts, list workspaces and web conversations, and transfer a conversation into a new or existing session (optionally into a target workspace).
- **Hands-free login**: first use opens a visible browser window for login, which auto-closes afterward; chat then runs headless.

## Install

### From npm (once published)

```bash
dsh plugin --profile web add dsh-webchat
```

### From GitHub

```bash
dsh plugin --profile web add github:xmuwenxiang/dsh-web-chat
```

> `lib/` is committed, so git installs need no build step.

## First use
<img width="1920" height="958" alt="image" src="https://github.com/user-attachments/assets/2df5acdb-b0b5-404a-a381-3dba98650baa" />

<img width="1920" height="958" alt="image" src="https://github.com/user-attachments/assets/7516776d-0b58-452c-bd58-e35ea39dc4ac" />


1. Open the "网页聊天" (Web Chat) sidebar entry in the Web GUI.
2. Click "打开登录窗口" and sign in to DeepSeek in the browser window that appears.
3. The window auto-closes after login; you can then chat and transfer normally.

## Config

Settings expose: `browserChannel` (default `auto`), `browserExecutablePath`, `browserProxy`, `browserHeadless` (chat headless; default `true` — the login window is always visible and auto-closes), `replyTimeoutMs`, `transferDistill` / `transferProvider` / `transferModel` (distillation model for transfer), `transferMaxTokens` (final brief cap, default 4096), and `transferChunkTokens` (per-chunk cap for long-conversation map-reduce, default 1024).

## Requirements

- Node.js >= 22
- Google Chrome or Microsoft Edge installed
- A graphical session for the one-time login window

### dsh (host) compatibility

The host half adapts to the settings-section API of the running dsh, and the
published `lib/` never statically imports names that newer dsh versions removed —
so module linking succeeds on every supported generation:

- **dsh ≥ 0.1.2-rc.1** — settings registration moved to
  `SettingsProvider.installSection` (the rc.7-era standalone
  `installSettingsSection`/`settingsNamespace` exports were removed); supported.
- **dsh 0.1.0-rc.7 / rc.8** — legacy `installSettingsSection` API; supported via
  a runtime fallback, so no behavior change on older hosts.

`dsh.client.inject` lists only client packages that exist on all supported
generations (`@deepseek-ai/dsh-client-runtime` no longer ships at 0.1.2-rc.1 and
is therefore not referenced). The browser half reads `sessions`/`workspaces` off
the client context, whose provider package changed across generations — if the
GUI of a given dsh version does not mount those services, the panel simply does
not attach (an error is logged) while host-side tools and routes keep working;
it never takes the GUI down.

## Limitations

- The web app is subject to DeepSeek's own risk controls; failures or page changes return errors rather than crashing.
- Session credentials live in a local private profile directory.

## Development

```bash
pnpm install
pnpm typecheck   # type-check src/ and test/
pnpm test        # run unit tests (Node built-in test runner)
pnpm build       # emit lib/ (host half) and lib/client.js (browser bundle)
```

`lib/` is committed, so git installs need no build step.

## License

[Apache-2.0](./LICENSE)
