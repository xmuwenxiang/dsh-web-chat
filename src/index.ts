/**
 * dsh-webchat — host half. Mounts the DeepSeek web engine (a real browser at
 * chat.deepseek.com driven through its own page, persistent login profile),
 * the /api/dsh-webchat route family, the agent tools (webchat_status,
 * webchat_send, webchat_import, webchat_transfer), the harness transfer
 * (seed a new session with a web transcript) and a system-prompt
 * announcement. The browser half (./client) renders the chat panel. All
 * transport rides the official NPM SDK packages — no dsh source changes.
 */

import type { Context } from '@deepseek-ai/cordis'
// Type-only: the namespace brand is exported by every @deepseek-ai/dsh-settings
// generation (rc.7-era and 0.1.2-rc.1). It erases at build, so it never becomes
// a runtime import that could fail the module-link phase on a newer host.
import type { SettingsNamespace } from '@deepseek-ai/dsh-settings'
import z from 'schemastery'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-tools'
import { DeepSeekWebEngine } from './engine/engine.ts'
import { makeRoutes } from './routes.ts'
import { TranscriptStore } from './store.ts'
import { webChatImportTool, webChatRecoverTool, webChatSendTool, webChatStatusTool, webChatTransferTool } from './tools.ts'
import type { WorkspaceRef } from './tools.ts'
import type { DistillConfig } from './transfer.ts'

/** Stable cordis plugin name. */
export const name = 'webchat'

/** Services required before the web-chat surfaces can mount. */
export const inject = ['webServer', 'tools', 'systemPrompt', 'sessions']

/**
 * Settings namespace of the web-chat capability — the section the web
 * settings surface edits. Spelled here rather than imported: the browser half
 * spells the same value and must not depend on a Host package. It is a plain
 * lowercase string on every dsh generation (rc.7's settingsNamespace() helper
 * was only a runtime regex check; 0.1.2-rc.1 removed the helper and brands the
 * string purely at the type level), so no version-gated construction is needed.
 */
export const WEBCHAT_SETTINGS_NAMESPACE: SettingsNamespace = 'dsh-webchat' as SettingsNamespace

/** Plugin config, validated by the same-named schemastery schema. */
export interface Config {
  /** When true (default), a system-prompt section announces the plugin to every agent. */
  announceToAgent?: boolean
  /** Master switch for the plugin (routes, tools, prompt section). */
  enabled?: boolean
  /** Browser channel hint ('chrome' | 'msedge' | 'chromium' | 'auto'). */
  browserChannel?: string
  /** Explicit browser executable path. */
  browserExecutablePath?: string
  /** Proxy mode: 'direct' | 'system' | 'http://host:port'. */
  browserProxy?: string
  /**
   * Run the chat browser headless (invisible). Default true: only the one-time
   * login window is visible, and it auto-closes once logged in. Set false to
   * keep a visible browser window during chatting too.
   */
  browserHeadless?: boolean
  /** Max ms to wait for a web reply. */
  replyTimeoutMs?: number
  /** Data directory override (tests). */
  dataDir?: string
  /** When true (default), distill the transcript into an executable task brief before transfer. */
  transferDistill?: boolean
  /** Provider route for the transfer distillation call (empty = auto-detect). */
  transferProvider?: string
  /** Model id for the transfer distillation call (empty = auto-detect). */
  transferModel?: string
  /** Output-token cap for the final distillation brief (default 4096). */
  transferMaxTokens?: number
  /** Output-token cap per chunk summary in long-conversation map-reduce (default 1024). */
  transferChunkTokens?: number
}

export const Config: z<Config> = z.object({
  announceToAgent: z.boolean().default(true),
  enabled: z.boolean().default(true),
  browserChannel: z.string().default('auto'),
  browserExecutablePath: z.string().default(''),
  browserProxy: z.string().default('direct'),
  browserHeadless: z.boolean().default(true),
  replyTimeoutMs: z.number().default(180_000),
  dataDir: z.string().default(''),
  transferDistill: z.boolean().default(true),
  transferProvider: z.string().default(''),
  transferModel: z.string().default(''),
  transferMaxTokens: z.number().default(4096),
  transferChunkTokens: z.number().default(1024),
})

/** Schema default, re-read for hand-built test contexts (the loader applies them normally). */
const DEFAULT_ANNOUNCE = true

/** Order of the announcement section within the tool-guidance band. */
const SECTION_ORDER = 155

/** Model-facing announcement: plugin presence, capabilities, and limits. */
export const WEBCHAT_GUIDANCE = '本机已安装 dsh-webchat 插件（Codex ChatGPT 模式 · DeepSeek 网页端聊天）：侧边栏「网页聊天」入口；通过真实浏览器驱动 chat.deepseek.com（DeepSeek 网页模型，深度思考/智能搜索开关，网页登录会话，无需 API 额度）。能力：webchat_status 查看登录/会话状态、webchat_send 通过网页端发送消息并流式获取回复（可附带本地图片路径做多模态提问）、webchat_recover 把网页端已有会话同步/恢复到本地、webchat_import 把存储的网页对话导入为 markdown 上下文、webchat_transfer 把网页对话蒸馏成可执行任务简报并创建新 harness 会话（首条消息即任务简报，而非原始聊天记录），或经 targetSessionId 把简报作为新消息追加到已有会话延续同一任务；GUI 面板可将对话随时导出为工作区文件或转入 harness 会话。限制：首次使用需用户在弹出的浏览器窗口完成 DeepSeek 网页登录；网页端受 DeepSeek 官方风控，操作失败或页面改版时返回错误而非崩溃；面板提供「深度思考（R1）」与「智能搜索」开关（网页端无模型选择器）。用户提到「网页聊天 / 网页端 / ChatGPT 模式 / deepseek web / 转移到 harness」时即指本插件，请据此协作。'

/** Convert resolved config to engine config. */
function engineConfigOf(resolve: () => Config): ConstructorParameters<typeof DeepSeekWebEngine>[1] {
  const value = resolve()
  const dataDir = value.dataDir?.trim() ?? ''
  return {
    dataDir: dataDir !== '' ? dataDir : defaultDataDirOf(),
    channel: value.browserChannel === 'auto' ? undefined : (value.browserChannel || undefined),
    executablePath: value.browserExecutablePath !== '' ? value.browserExecutablePath : undefined,
    proxy: value.browserProxy,
    headless: value.browserHeadless,
    replyTimeoutMs: value.replyTimeoutMs,
  }
}

/** Default plugin data dir (mirrors store.defaultDataDir). */
function defaultDataDirOf(): string {
  const home = process.env.DSH_HOME ?? process.env.HOME ?? '.'
  return `${home}/.dsh/dsh-webchat`
}

/**
 * Mount the engine, routes, tools, and announcement.
 * @param ctx - host plugin context carrying webServer/tools/systemPrompt.
 * @param config - resolved plugin config (schema defaults applied by the loader).
 */
export function apply(ctx: Context, config?: Config): void {
  let current: () => Config = () => config ?? {}
  const resolve = (): Config => ({
    announceToAgent: current().announceToAgent ?? DEFAULT_ANNOUNCE,
    enabled: current().enabled ?? true,
    browserChannel: current().browserChannel ?? 'auto',
    browserExecutablePath: current().browserExecutablePath ?? '',
    browserProxy: current().browserProxy ?? 'direct',
    browserHeadless: current().browserHeadless ?? true,
    replyTimeoutMs: current().replyTimeoutMs ?? 180_000,
    dataDir: current().dataDir ?? '',
    transferDistill: current().transferDistill ?? true,
    transferProvider: current().transferProvider ?? '',
    transferModel: current().transferModel ?? '',
    transferMaxTokens: current().transferMaxTokens ?? 4_096,
    transferChunkTokens: current().transferChunkTokens ?? 1_024,
  })

  const distillConfigOf = (value: Config): DistillConfig => ({
    distill: value.transferDistill ?? true,
    provider: (value.transferProvider ?? '').trim(),
    model: (value.transferModel ?? '').trim(),
    maxTokens: value.transferMaxTokens ?? 4_096,
    chunkTokens: value.transferChunkTokens ?? 1_024,
  })

  const store = new TranscriptStore({ dataDir: resolve().dataDir !== '' ? resolve().dataDir : undefined })
  const engine = new DeepSeekWebEngine(store, engineConfigOf(resolve))
  ctx.effect(() => () => {
    void engine.disposeBrowser()
  }, 'dsh-webchat: engine')

  const routes = makeRoutes({ ctx, engine, store, distill: distillConfigOf(resolve()) })
  const listWorkspaces = (): WorkspaceRef[] | undefined => {
    const registry = ctx.get('workspaceRegistry') as { list(): Array<{ id: string; path: string; title: string }> } | undefined
    if (registry === undefined) return undefined
    return registry.list().map(ws => ({ id: ws.id, path: ws.path, title: ws.title }))
  }

  const tools = [
    webChatStatusTool(engine, store, listWorkspaces),
    webChatSendTool(engine),
    webChatRecoverTool(engine),
    webChatImportTool(store),
    webChatTransferTool(ctx, store, distillConfigOf(resolve())),
  ]

  let disposeSection: (() => void) | undefined
  let disposeRoutes: (() => void) | undefined
  let disposeTools: (() => void) | undefined

  // Register (or drop) every surface to match the current source. Each group
  // is kept under one disposer: re-registering first tears the old one down
  // so duplicate-name registrations never throw.
  const sync = (): void => {
    if (disposeSection !== undefined) { disposeSection(); disposeSection = undefined }
    if (disposeRoutes !== undefined) { disposeRoutes(); disposeRoutes = undefined }
    if (disposeTools !== undefined) { disposeTools(); disposeTools = undefined }
    const value = resolve()
    if (!value.enabled) return
    if (value.announceToAgent) {
      disposeSection = ctx.systemPrompt.section({
        name: 'plugin:dsh-webchat',
        order: SECTION_ORDER,
        text: WEBCHAT_GUIDANCE,
      })
    }
    disposeRoutes = ctx.effect(
      () => {
        const disposers = routes.map(route => ctx.webServer.register(route))
        return () => { for (const dispose of disposers) dispose() }
      },
      'dsh-webchat: routes',
    )
    disposeTools = ctx.effect(
      () => {
        const disposers = tools.map(tool => ctx.tools.register(tool))
        return () => { for (const dispose of disposers) dispose() }
      },
      'dsh-webchat: tools',
    )
  }

  // Attach the optional user-settings section. The registration API changed
  // between dsh generations and the module-link phase is version-sensitive:
  //  - dsh ≤ 0.1.0-rc.8 exported a standalone installSettingsSection(ctx, ...);
  //  - dsh 0.1.2-rc.1 removed that export and moved registration onto the
  //    settings provider service as SettingsProvider.installSection(ctx, ...).
  // A static named import of the legacy helper would therefore fail to link on
  // 0.1.2-rc.1 hosts (the crash this file caused before the adapter), so the
  // legacy helper is reached only through a dynamic import — never folded into
  // a static import by the bundler — and only on hosts whose provider still
  // lacks installSection. ctx.inject(['settings']) keeps the section optional,
  // exactly like the legacy helper: no settings service ever mounted means the
  // callback never runs and the plugin simply keeps its composition config.
  ctx.inject(['settings'], (settingsCtx) => {
    const provider = (settingsCtx as unknown as {
      settings?: { installSection?: unknown }
    }).settings
    // Generation-spanning hooks shape: identical in the rc.7-era standalone
    // helper and in SettingsProvider.installSection (source sink + re-judge).
    interface SettingsHooks {
      setSource: (source: () => Config) => void
      onChange: () => void
    }
    const hooks: SettingsHooks = {
      setSource: (source: () => Config) => {
        current = source
        sync()
      },
      onChange: sync,
    }
    if (typeof provider?.installSection === 'function') {
      // dsh 0.1.2-rc.1+: SettingsProvider.installSection(ctx, ns, schema, entry, hooks).
      ;(provider as { installSection: (owner: Context, ns: SettingsNamespace, schema: typeof Config, entry: Config, hooks: SettingsHooks) => void })
        .installSection(ctx, WEBCHAT_SETTINGS_NAMESPACE, Config, config ?? {}, hooks)
      return
    }
    // dsh ≤ 0.1.0-rc.8: the legacy standalone helper still exported there.
    void import('@deepseek-ai/dsh-settings').then((module) => {
      const legacy = (module as unknown as {
        installSettingsSection?: (owner: Context, ns: SettingsNamespace, schema: typeof Config, entry: Config, hooks: SettingsHooks) => void
      }).installSettingsSection
      if (typeof legacy === 'function') {
        legacy(ctx, WEBCHAT_SETTINGS_NAMESPACE, Config, config ?? {}, hooks)
      }
    })
  })

  // Initial registration from the composition entry (covers deployments with
  // no settings service, whose settings section never attaches — the inject
  // callback above never fires, so nothing has re-synced from a resolved
  // section yet).
  sync()
}
