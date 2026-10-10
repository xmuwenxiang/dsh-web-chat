/**
 * DeepSeek web engine — the "Codex ChatGPT mode" analog for DeepSeek Harness.
 *
 * Drives a real browser (system Chrome/Edge via playwright-core) against
 * chat.deepseek.com with a dedicated persistent profile, so the user logs in
 * once with their own DeepSeek account (phone / password / Apple / WeChat QR)
 * and the session persists. Chatting happens THROUGH the real web page —
 * messages are typed into the real composer — so the plugin needs no API key,
 * no billing, and stays immune to DeepSeek's private-API PoW challenge.
 *
 * Replies are read by teeing the page's own SSE stream: an injected init
 * script wraps XMLHttpRequest and captures the `/api/v0/chat/completion`
 * response as it streams (the page has already solved PoW + auth, so we get
 * the model's raw markdown for free). DOM scraping of `.ds-markdown` is kept
 * only as a fallback for when the capture cannot install. The web chat runs
 * the `deepseek-chat` model by default (switchable to deepseek-reasoner).
 *
 * All page interactions are best-effort and selector-defensive: failures
 * produce readable errors (never crashes) and the caller decides how to
 * degrade.
 */

import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { chromium, type BrowserContext, type Page } from 'playwright-core'
import type { TranscriptStore } from '../store.ts'
import type { EngineState, SendResult, WebChatErrorCode, WebChatMessage, WebChatTranscript } from '../protocol.ts'
import { serializeToMarkdown } from './html-md.ts'

/** Engine configuration (resolved from the plugin settings surface). */
export interface WebChatEngineConfig {
  /** Data dir root (browser profile lives under it). */
  dataDir: string
  /** Browser channel hint: 'chrome' | 'msedge' | 'chromium' | undefined (auto-detect). */
  channel?: string
  /** Explicit browser executable path (overrides channel detection). */
  executablePath?: string
  /** Proxy mode: 'direct' (--no-proxy-server), 'system' (browser default), or a proxy URL. */
  proxy?: string
  /** Visible browser window (required for the one-time login; defaults true). */
  headless?: boolean
  /** Max seconds to wait for a reply before returning the partial. */
  replyTimeoutMs?: number
  /** DeepSeek web origin. */
  baseUrl?: string
}

/** One scraped message from the page. */
interface ScrapedMessage {
  role: 'user' | 'assistant'
  parts: Array<{ kind: 'think' | 'body'; markdown: string; text: string }>
}

const DEFAULT_TIMEOUT_MS = 180_000

/**
 * Injected before any page script: tee the chat/completion XHR stream into
 * `window.__wcStream`. The DeepSeek web app reads its reply through an
 * XMLHttpRequest (POST /api/v0/chat/completion, responseType "text", SSE
 * body), so wrapping XHR `progress` events captures the raw `event:`/`data:`
 * stream exactly as the page receives it — no PoW, no auth, no selectors.
 * The function must stay self-contained (playwright serializes its source).
 */
function streamCaptureInit(): void {
  const w = window as unknown as {
    __wcCaptureInstalled?: boolean
    __wcStream?: StreamCapture
    XMLHttpRequest: typeof XMLHttpRequest
    fetch: typeof fetch
    TextDecoder: typeof TextDecoder
    Response: typeof Response
  }
  if (w.__wcCaptureInstalled === true) return
  w.__wcCaptureInstalled = true
  w.__wcStream = { text: '', done: false, started: false, status: 0, error: '' }
  // Deliberately `any`: this function is serialized by playwright and executed
  // in the page, so its signature is runtime JS rather than typed host code.
  const X: any = w.XMLHttpRequest
  const origOpen: any = X.prototype.open
  const origSend: any = X.prototype.send
  X.prototype.open = function (this: any, method: string, url: string | URL, ...rest: any[]) {
    this.__wcIsChat = typeof url === 'string' && url.includes('/chat/completion')
    return origOpen.call(this, method, url, ...rest)
  }
  X.prototype.send = function (this: any, ...args: any[]) {
    if (this.__wcIsChat === true) {
      let lastLen = 0
      this.addEventListener('progress', () => {
        const stream = w.__wcStream
        if (stream === undefined) return
        const text = this.responseText ?? ''
        if (text.length > lastLen) {
          stream.text += text.slice(lastLen)
          lastLen = text.length
        }
        stream.started = true
      })
      this.addEventListener('loadend', () => {
        const stream = w.__wcStream
        if (stream === undefined) return
        stream.done = true
        stream.status = this.status
        if (this.status >= 400) stream.error = `HTTP ${this.status}`
      })
    }
    return origSend.apply(this, args)
  }

  // Also tee `fetch` — newer page builds may switch from XHR to fetch for the
  // same /chat/completion stream. response.body.tee() mirrors the stream to the
  // page untouched while we read the twin for capture. A capture failure must
  // never break the page's own consumption, so every step is try/caught.
  const origFetch: any = w.fetch.bind(w)
  w.fetch = function (this: any, input: any, init: any) {
    const url = typeof input === 'string' ? input : (input?.url ?? String(input))
    const isChat = typeof url === 'string' && url.includes('/chat/completion')
    return origFetch(input, init).then((response: any) => {
      if (!isChat || response === null || response === undefined) return response
      const body = response.body
      if (body === null || body === undefined || typeof body.tee !== 'function') return response
      try {
        const [pageStream, captureStream] = body.tee()
        const decoder = new w.TextDecoder()
        const reader = captureStream.getReader()
        void (async () => {
          try {
            for (;;) {
              const { done, value } = await reader.read()
              if (done) break
              const stream = w.__wcStream
              if (stream !== undefined) {
                stream.text += decoder.decode(value, { stream: true })
                stream.started = true
              }
            }
            const stream = w.__wcStream
            if (stream !== undefined) {
              stream.text += decoder.decode()
              stream.done = true
              stream.status = response.status
              if (response.status >= 400) stream.error = `HTTP ${response.status}`
            }
          } catch {
            // capture failure must never break the page's own consumption
          }
        })()
        return new w.Response(pageStream, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        })
      } catch {
        return response
      }
    })
  }
}

/** Live capture buffer shape (mirrors window.__wcStream). */
interface StreamCapture {
  text: string
  done: boolean
  started: boolean
  status: number
  error: string
}

/** Parsed reply from the accumulated SSE text. */
export interface ParsedStreamReply {
  /** Markdown body (thinking wrapped in a <details> block). */
  markdown: string
  /** Raw thinking text (empty when the model has none). */
  thinking: string
  /** True once the stream reported FINISHED. */
  finished: boolean
}

/**
 * DeepSeek citation numbering. The web numbers the *sources* (search results)
 * 1..M, not the `[reference:N]` markers. Each `[reference:N]` marker is paired
 * with a `references` op `{id,type}`:
 *   - `TOOL_OPEN`  → a specific opened page whose `result.url` matches one of
 *                    the search results; the citation number is that result's
 *                    1-based position in the search-results list.
 *   - `TOOL_SEARCH` → the search step itself, rendered by the web as a search
 *                    icon (no number) rather than a citation.
 * This is resolved inside `parseStreamReply`, which holds the search-results
 * list and the opened-page id→url map.
 */

/**
 * Defensive clean-up of the DeepSeek search-agent trace tokens. The parser
 * already routes `DEEP_SEARCH` (conversation_mode) and `FINISHED` (status)
 * events away from content, so this normally runs as a no-op; it exists for
 * the DOM-scrape fallback and any residual markers.
 */
function stripSearchTrace(text: string): string {
  return text
    .replace(/DEEP_SEARCH/g, '')
    .replace(/FINISHED+/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** True when a fragment type is the R1 reasoning (THINK / THINKING). */
function isThinkingType(type: unknown): boolean {
  return typeof type === 'string' && type.toUpperCase().includes('THINK')
}

/**
 * Parse the accumulated `/api/v0/chat/completion` SSE body into reply text.
 * The stream is `event:` / `data:` lines; each `data:` payload is JSON. The
 * protocol distinguishes the R1 reasoning fragment (type `THINK`) from the
 * answer fragment (type `RESPONSE`), and carries search steps as `TOOL_SEARCH`
 * / `TOOL_OPEN` fragments:
 *   - {"v":{"response":{"fragments":[{"type":"THINK","content":"…"}]}}}
 *     a snapshot carrying the fragment list and their types.
 *   - {"p":"response/fragments","o":"APPEND","v":[{"type":"RESPONSE",…}]}
 *     appends a NEW fragment (reasoning / search / answer); `-1/content`
 *     deltas after this belong to that new fragment.
 *   - {"p":"response/fragments/-1/content","o":"APPEND","v":"是一座"} — appends
 *     a text delta to the CURRENT fragment's content.
 *   - {"p":"response/fragments/-1/results","o":"SET","v":[…]} — search results
 *     for a TOOL_SEARCH step (rendered as "搜索到 N 个网页").
 *   - {"v":"将"} — a bare delta continuing the current fragment; a bare
 *     `{"v":[{p:"content",o:"APPEND",v:"[reference:N]"},…]}` carries citation
 *     markers.
 *   - {"p":"response/status","o":"SET","v":"FINISHED"} — generation complete.
 */
export function parseStreamReply(raw: string): ParsedStreamReply {
  let body = ''
  let thinking = ''
  let finished = false
  let currentType: unknown = 'RESPONSE'

  // Citation-resolution state. `searchResults` holds the URLs of every search
  // result in stream order (1-based position = the web's citation number);
  // `openById` maps a TOOL_OPEN fragment id → its opened page url.
  const searchResults: string[] = []
  const openById = new Map<number, string>()
  let urlToIndex: Map<string, number> | undefined

  const buildUrlIndex = (): Map<string, number> => {
    if (urlToIndex === undefined) {
      urlToIndex = new Map()
      searchResults.forEach((url, i) => {
        if (url !== '' && !urlToIndex!.has(url)) urlToIndex!.set(url, i)
      })
    }
    return urlToIndex
  }

  // Resolve `[reference:N]` markers to `[citation:K]` using their paired
  // `references` op. TOOL_OPEN → the search result's 1-based number;
  // TOOL_SEARCH (and anything unresolved) → dropped (the web shows an icon).
  const resolveCitations = (text: string, refs: unknown[] | null): string => {
    if (!Array.isArray(refs) || refs.length === 0) return text
    let i = 0
    return text.replace(/\[reference:\d+\]/g, () => {
      const ref = refs[i] as Record<string, unknown> | undefined
      i++
      if (typeof ref !== 'object' || ref === null) return ''
      if (ref['type'] !== 'TOOL_OPEN') return ''
      const id = ref['id']
      const url = typeof id === 'number' ? openById.get(id) : undefined
      if (url === undefined) return ''
      const idx = buildUrlIndex().get(url)
      return idx === undefined ? '' : `[citation:${idx + 1}]`
    })
  }

  // Route a content delta to the reasoning (R1) or the answer body. Citation
  // markers are resolved only inside `applyBatchOps`, which has the paired
  // `references` op; plain deltas never carry them.
  const appendContent = (text: string): void => {
    if (isThinkingType(currentType)) thinking += text
    else body += text
  }

  // Append newly-arrived fragments, tracking the current type and rendering
  // TOOL_OPEN steps as a "浏览 N 个页面" status block.
  const appendFragments = (fragments: unknown[]): void => {
    const opened: string[] = []
    for (const frag of fragments) {
      if (typeof frag !== 'object' || frag === null) continue
      const f = frag as Record<string, unknown>
      const type = f['type']
      if (typeof type === 'string') currentType = type
      const content = f['content']
      if (typeof content === 'string' && content !== '') {
        if (isThinkingType(type)) thinking += content
        else if (type === 'RESPONSE' || type === 'TEXT') body += content
      }
      if (type === 'TOOL_OPEN') {
        const result = f['result'] as Record<string, unknown> | undefined
        const title = result?.['title']
        if (typeof title === 'string' && title !== '') opened.push(title)
        const id = f['id']
        const url = result?.['url']
        if (typeof id === 'number' && typeof url === 'string' && url !== '') {
          openById.set(id, url)
        }
      }
    }
    if (opened.length > 0) {
      thinking += `\n\n浏览 ${opened.length} 个页面\n${opened.map(t => `- ${t}`).join('\n')}\n\n`
    }
  }

  // Apply the ops inside a BATCH payload (bare or path-addressed). Citation
  // batches pair a `content` APPEND (`[reference:N]`) with a `references`
  // op, so collect them and resolve after the loop.
  const applyBatchOps = (ops: unknown[]): void => {
    let contentText = ''
    let hasContent = false
    let refs: unknown[] | null = null
    const fragmentsList: unknown[][] = []
    for (const item of ops) {
      if (typeof item !== 'object' || item === null) continue
      const it = item as Record<string, unknown>
      const ip = it['p']
      const iop = it['o']
      const iv = it['v']
      if (ip === 'content' && iop === 'APPEND' && typeof iv === 'string') {
        contentText += iv
        hasContent = true
      } else if (ip === 'references' && Array.isArray(iv)) {
        refs = iv
      } else if (ip === 'fragments' && iop === 'APPEND' && Array.isArray(iv)) {
        fragmentsList.push(iv)
      }
    }
    for (const fr of fragmentsList) appendFragments(fr)
    if (hasContent) {
      if (isThinkingType(currentType)) thinking += contentText
      else body += resolveCitations(contentText, refs)
    }
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) continue
    const payload = trimmed.slice(5).trim()
    if (payload === '') continue
    let obj: unknown
    try {
      obj = JSON.parse(payload)
    } catch {
      continue
    }
    if (typeof obj !== 'object' || obj === null) continue
    const o = obj as Record<string, unknown>
    const v = o['v']

    // 1. Snapshot — the full fragment list (normally only at reply start).
    if (typeof v === 'object' && v !== null && !Array.isArray(v) && 'response' in v) {
      const resp = (v as Record<string, unknown>)['response'] as Record<string, unknown> | undefined
      const fragments = resp?.['fragments']
      if (Array.isArray(fragments)) {
        let newBody = ''
        let newThinking = ''
        for (const frag of fragments) {
          if (typeof frag !== 'object' || frag === null) continue
          const f = frag as Record<string, unknown>
          const type = f['type']
          if (typeof type === 'string') currentType = type
          const content = f['content']
          if (typeof content !== 'string' || content === '') continue
          if (isThinkingType(type)) newThinking += content
          else if (type === 'RESPONSE' || type === 'TEXT') newBody += content
        }
        if (newBody !== '') body = newBody
        if (newThinking !== '') thinking = newThinking
      }
      continue
    }

    const p = o['p']
    const op = o['o']

    // 2. Direct fragment append — a new fragment (reasoning / search / answer).
    if (p === 'response/fragments' && op === 'APPEND' && Array.isArray(v)) {
      appendFragments(v)
      continue
    }

    // 3. Path-addressed events — content deltas, search results, status, mode.
    if (typeof p === 'string') {
      // A `-1/content` delta may omit the `o` field (implied APPEND); accept it
      // whenever `o` is absent or "APPEND".
      if (typeof v === 'string' && p === 'response/fragments/-1/content' && op !== 'SET') {
        appendContent(v)
      } else if (op === 'SET' && p === 'response/fragments/-1/results' && Array.isArray(v)) {
        for (const r of v) {
          if (typeof r === 'object' && r !== null) {
            const url = (r as Record<string, unknown>)['url']
            if (typeof url === 'string' && url !== '') searchResults.push(url)
          }
        }
        thinking += `\n\n搜索到 ${v.length} 个网页\n\n`
      } else if (op === 'SET' && p === 'response/status' && v === 'FINISHED') {
        finished = true
      } else if (op === 'BATCH' && Array.isArray(v)) {
        applyBatchOps(v)
      }
      // conversation_mode / elapsed_secs / fragment status FINISHED / references → ignored
      continue
    }

    // 4. Bare batch — {"v":[{p:"content",o:"APPEND",v:"[reference:N]"},…]}
    if (Array.isArray(v)) {
      applyBatchOps(v)
      continue
    }

    // 5. Bare delta — {"v":"…"} continues the current fragment.
    if (typeof v === 'string') appendContent(v)
  }

  const thinkMd = thinking.trim() === ''
    ? ''
    : `<details><summary>思考过程</summary>\n\n${thinking.trim()}\n\n</details>`
  const markdown = [thinkMd, body.trim()].filter(s => s !== '').join('\n\n')
  return { markdown, thinking, finished }
}

/** Order-preserving promise queue — the browser page handles one chat op at a time. */
class SerialQueue {
  private tail: Promise<unknown> = Promise.resolve()
  run<T>(task: () => Promise<T>): Promise<T> {
    const next = this.tail.then(task, task)
    this.tail = next.catch(() => undefined)
    return next
  }
}

export class DeepSeekWebEngine {
  private readonly store: TranscriptStore
  private readonly config: WebChatEngineConfig
  private readonly profileDir: string
  private context: BrowserContext | undefined
  private page: Page | undefined
  private readonly queue = new SerialQueue()
  private state: EngineState = 'stopped'
  private engineError: string | undefined
  private busy = false
  private lastError: string | undefined
  private lastErrorCode: WebChatErrorCode | undefined
  private launchedOnce = false
  /** True while a headed one-time login window is open (auto-closes on login). */
  private loginMode = false
  /** Remembered login state — survives the auto-close so the panel stays "已登录". */
  private loggedInOnce = false
  /** Commanded toggle state (best-effort read-back overrides on status). */
  private deepThink = false
  private search = false

  constructor(store: TranscriptStore, config: WebChatEngineConfig) {
    this.store = store
    this.config = config
    this.profileDir = join(config.dataDir, 'browser-profile')
  }

  /** Coarse state for status snapshots. */
  getState(): EngineState {
    return this.state
  }

  getEngineError(): string | undefined {
    return this.engineError
  }

  getBusy(): boolean {
    return this.busy
  }

  getLastError(): string | undefined {
    return this.lastError
  }

  getLastErrorCode(): WebChatErrorCode | undefined {
    return this.lastErrorCode
  }

  /** Set the last error + its structured code together (keeps them in sync). */
  private setLastError(message: string | undefined, code?: WebChatErrorCode): void {
    this.lastError = message
    this.lastErrorCode = code
  }

  private setState(next: EngineState, error?: string): void {
    this.state = next
    this.engineError = error
  }

  /** Resolve a browser launch descriptor (executable + args). */
  private launchOptions(): { channel?: string; executablePath?: string; args: string[] } {
    const args: string[] = []
    const proxy = this.config.proxy ?? 'direct'
    if (proxy === 'direct') args.push('--no-proxy-server')
    else if (proxy.startsWith('http')) args.push(`--proxy-server=${proxy}`)
    // channel wins; explicit path beats both.
    if (this.config.executablePath !== undefined) return { executablePath: this.config.executablePath, args }
    if (this.config.channel !== undefined && this.config.channel !== 'auto') return { channel: this.config.channel, args }
    // Auto: probe the known system browsers in order (playwright channels first,
    // then explicit paths on each OS).
    const candidates: Array<{ channel?: string; executablePath?: string }> = [
      { channel: 'chrome' },
      { channel: 'msedge' },
      { channel: 'chromium' },
      { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' },
      { executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge' },
      { executablePath: '/usr/bin/google-chrome' },
      { executablePath: '/usr/bin/google-chrome-stable' },
      { executablePath: '/usr/bin/microsoft-edge' },
      { executablePath: '/usr/bin/chromium' },
      { executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
      { executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' },
    ]
    return { ...candidates[0], args }
  }

  /**
   * Ensure the browser + chat.deepseek.com page exist. Launches the persistent
   * context on first call; subsequent calls reuse the page.
   */
  /** True when the cached page/context are still connected (not closed by the user). */
  private isPageAlive(): boolean {
    if (this.page === undefined || this.context === undefined) return false
    try {
      return !this.page.isClosed()
    } catch {
      return false
    }
  }

  async ensureBrowser(headed = false): Promise<Page> {
    if (this.isPageAlive()) return this.page!
    if (this.state === 'launching') {
      // Another call is already launching; wait for it.
      for (let attempt = 0; attempt < 100 && !this.isPageAlive(); attempt++) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      if (this.isPageAlive()) return this.page!
      throw new Error('浏览器启动超时')
    }
    // Clear any stale (dead) page/context before relaunching.
    if (this.page !== undefined || this.context !== undefined) await this.disposeBrowser()
    this.setState('launching')
    try {
      mkdirSync(this.profileDir, { recursive: true, mode: 0o700 })
      const options = this.launchOptions()
      const attemptOrder: Array<{ channel?: string; executablePath?: string }> =
        this.config.executablePath !== undefined || (this.config.channel !== undefined && this.config.channel !== 'auto')
          ? [options]
          : this.launchOptionsCandidates()
      let lastError: unknown
      for (const attempt of attemptOrder) {
        try {
          this.context = await chromium.launchPersistentContext(this.profileDir, {
            ...attempt,
            // The one-time login window must be visible; normal (chat) launches
            // are headless by default so the browser stays out of the way.
            headless: (headed || this.loginMode) ? false : (this.config.headless ?? true),
            viewport: null,
            args: options.args,
          })
          lastError = undefined
          break
        } catch (error) {
          lastError = error
          await this.disposeBrowser()
        }
      }
      if (lastError !== undefined) {
        this.setState('error', `无法启动浏览器（请检查 Chrome/Edge 是否已安装，或在插件设置中指定可执行文件路径）: ${String(lastError)}`)
        throw new Error(this.engineError)
      }
      const pages = this.context!.pages()
      this.page = pages[0] ?? (await this.context!.newPage())
      this.page.setDefaultTimeout(15_000)
      await this.page.addInitScript(streamCaptureInit)
      await this.openDeepSeekPage()
      this.setState('ready')
      this.launchedOnce = true
      return this.page
    } catch (error) {
      if (this.state !== 'error') this.setState('error', String(error))
      throw error
    }
  }

  /** The candidate list used during auto-detection. */
  private launchOptionsCandidates(): Array<{ channel?: string; executablePath?: string }> {
    const all: Array<{ channel?: string; executablePath?: string }> = [
      { channel: 'chrome' },
      { channel: 'msedge' },
      { channel: 'chromium' },
      { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' },
      { executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge' },
      { executablePath: '/usr/bin/google-chrome' },
      { executablePath: '/usr/bin/google-chrome-stable' },
      { executablePath: '/usr/bin/microsoft-edge' },
      { executablePath: '/usr/bin/chromium' },
      { executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
      { executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' },
    ]
    return all.filter(candidate => {
      if (candidate.channel !== undefined) return true
      return candidate.executablePath !== undefined && existsSync(candidate.executablePath)
    })
  }

  /** Navigate to the DeepSeek chat root. */
  private async openDeepSeekPage(): Promise<void> {
    if (this.page === undefined) throw new Error('浏览器尚未启动')
    const baseUrl = this.config.baseUrl ?? 'https://chat.deepseek.com'
    try {
      await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 })
      // Let the SPA settle; login redirects to /sign_in when not authenticated.
      await this.page.waitForTimeout(2_500)
    } catch (error) {
      this.setState('error', `无法打开 ${baseUrl}：${String(error)}`)
      throw new Error(this.engineError)
    }
  }

  /** True when the page shows the chat UI (not the login page). */
  async isLoggedIn(): Promise<boolean | null> {
    if (!this.isPageAlive()) return null
    try {
      const url = this.page!.url()
      if (url.includes('/sign_in') || url.includes('/auth')) return false
      const hasComposer = await this.page!.locator('textarea').count().then(count => count > 0).catch(() => false)
      return hasComposer
    } catch {
      return null
    }
  }

  /**
   * Open a visible browser window for the one-time login. The window is forced
   * headed (login needs a user) and auto-closes as soon as the page reaches the
   * chat UI; normal chatting then runs headless on the persisted profile.
   */
  async openLoginWindow(): Promise<{ ok: boolean; error?: string }> {
    try {
      // Close any running (possibly headless) browser first so we always open a
      // fresh *visible* window for the one-time login. loginMode is set before
      // the dispose so concurrent status() polls cannot relaunch a headless
      // browser in the gap while the old page is closing.
      this.loginMode = true
      if (this.page !== undefined || this.context !== undefined) await this.disposeBrowser()
      await this.ensureBrowser(true)
      await this.page?.bringToFront()
      void this.watchLoginAndClose()
      return { ok: true }
    } catch (error) {
      this.loginMode = false
      return { ok: false, error: String(error) }
    }
  }

  /** Poll the login window and close it once the user has logged in. */
  private async watchLoginAndClose(): Promise<void> {
    for (let attempt = 0; attempt < 600; attempt++) {
      if (!this.loginMode) return
      if (!this.isPageAlive()) {
        // The user closed the window manually; stop watching.
        this.loginMode = false
        return
      }
      if (await this.isLoggedIn() === true) {
        this.loginMode = false
        this.loggedInOnce = true
        await this.disposeBrowser().catch(() => undefined)
        return
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  /** Current page URL (for status/debug). */
  pageUrl(): string | undefined {
    if (!this.isPageAlive()) return undefined
    try {
      return this.page?.url()
    } catch {
      return undefined
    }
  }

  /**
   * Best-effort read of the deep-think (R1) and search toggle state from the
   * page. The toggles are `div.ds-toggle-button` elements (NOT `<button>`)
   * carrying `aria-pressed` plus a `ds-toggle-button--selected` class when on;
   * the search toggle is labeled 智能搜索. Falls back to the last commanded
   * state when the page gives no clear signal.
   */
  private async readToggles(): Promise<{ deepThink: boolean; search: boolean }> {
    if (!this.isPageAlive()) return { deepThink: this.deepThink, search: this.search }
    try {
      const pageState = await this.page!.evaluate(() => {
        const read = (candidates: string[]): boolean | undefined => {
          for (const el of Array.from(document.querySelectorAll<HTMLElement>('[aria-pressed]'))) {
            const label = `${el.textContent ?? ''} ${el.getAttribute('aria-label') ?? ''}`
            if (!candidates.some(candidate => label.includes(candidate))) continue
            const pressed = el.getAttribute('aria-pressed')
            if (pressed === 'true') return true
            if (pressed === 'false') return false
            const cls = typeof el.className === 'string' ? el.className : ''
            if (/ds-toggle-button--selected|--selected|active|checked/i.test(cls)) return true
          }
          return undefined
        }
        return {
          deepThink: read(['深度思考', 'DeepThink', 'Deep Think', 'R1']),
          search: read(['智能搜索', '联网搜索', '搜索', 'Search']),
        }
      })
      return {
        deepThink: pageState.deepThink ?? this.deepThink,
        search: pageState.search ?? this.search,
      }
    } catch {
      return { deepThink: this.deepThink, search: this.search }
    }
  }

  /** Serialized page evaluation guarded against a dead page. */
  private async evalPage<T>(fn: () => T | Promise<T>): Promise<T> {
    if (this.page === undefined) throw new Error('浏览器尚未启动')
    return this.page.evaluate(fn)
  }

  /**
   * In-page scraper: returns the ordered rendered messages currently in the
   * DOM. Uses the virtual-list item keys as message boundaries and the
   * assistant-main-content class to split roles. Fallback only — the primary
   * reply source is the teed SSE stream.
   */
  private async scrapeConversation(): Promise<ScrapedMessage[]> {
    if (this.page === undefined) return []
    interface RawMessage {
      role: 'user' | 'assistant'
      parts: Array<{ kind: 'think' | 'body'; markdown: string; text: string }>
    }
    const raw = await this.page.evaluate((): RawMessage[] => {
      const extract = (element: Element): { markdown: string; text: string } => {
        const clone = element.cloneNode(true) as HTMLElement
        for (const junk of clone.querySelectorAll('.ds-markdown-code-copy-button, button, svg, [class*="copy"]')) {
          junk.remove()
        }
        return { markdown: clone.innerHTML, text: clone.innerText }
      }
      const out: RawMessage[] = []
      const items = document.querySelectorAll('[data-virtual-list-item-key]')
      for (const item of Array.from(items)) {
        const assistant = item.querySelector('.ds-assistant-message-main-content')
        if (assistant !== null) {
          const parts: Array<{ kind: 'think' | 'body'; markdown: string; text: string }> = []
          const think = item.querySelector('.ds-think-content')
          if (think !== null) {
            parts.push({ kind: 'think', ...extract(think) })
          }
          // The assistant container may itself carry .ds-markdown (current
          // DOM) or contain a .ds-markdown descendant (older DOM).
          const body = assistant.classList.contains('ds-markdown')
            ? assistant
            : assistant.querySelector('.ds-markdown')
          if (body !== null) parts.push({ kind: 'body', ...extract(body) })
          if (parts.length > 0) out.push({ role: 'assistant', parts })
        } else {
          // User message: no .ds-markdown wrapper in the current DOM.
          const clone = item.cloneNode(true) as HTMLElement
          for (const junk of clone.querySelectorAll('button, svg, [class*="copy"]')) {
            junk.remove()
          }
          const text = (clone.innerText ?? '').trim()
          if (text !== '') out.push({ role: 'user', parts: [{ kind: 'body', markdown: '', text }] })
        }
      }
      return out
    })
    return raw
  }

  /** Convert scraped DOM messages into transcript messages (markdown content). */
  private scrapedToMessages(scraped: ScrapedMessage[]): WebChatMessage[] {
    return scraped.map(message => {
      if (message.role === 'user') {
        const text = message.parts.map(part => part.text).join('\n\n').trim()
        return { id: randomUUID(), role: 'user', content: text === '' ? '（无内容）' : text, ts: Date.now() }
      }
      const think = message.parts.filter(part => part.kind === 'think').map(part => part.text).join('\n\n').trim()
      const bodyHtml = message.parts.find(part => part.kind === 'body')?.markdown ?? ''
      const bodyMd = bodyHtml === '' ? '' : serializeToMarkdown(parseMarkup(bodyHtml))
      const thinkMd = think === '' ? '' : `<details><summary>思考过程</summary>\n\n${think}\n\n</details>`
      return { id: randomUUID(), role: 'assistant', content: [thinkMd, bodyMd].filter(Boolean).join('\n\n'), ts: Date.now() }
    })
  }

  /**
   * Scrape the DeepSeek sidebar conversation titles (best effort). The web
   * conversation list has no stable contract, so several candidate selectors
   * are probed and short non-menu texts are returned.
   */
  async listWebConversations(): Promise<Array<{ title: string }>> {
    if (this.page === undefined) return []
    const titles = await this.page.evaluate(() => {
      const found = new Set<string>()
      const selectors = [
        'a[href*="/a/chat/s/"]',
        '[class*="conversation"]',
        '[class*="chat-item"]',
        '[class*="session-item"]',
        'nav a',
        'aside a',
        '[class*="sidebar"] a',
      ]
      for (const selector of selectors) {
        for (const el of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
          const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ')
          if (text.length >= 1 && text.length <= 80 && !/^(新对话|New chat|删除|重命名|清空|设置|登出)/i.test(text)) {
            found.add(text)
          }
        }
      }
      return Array.from(found).slice(0, 50)
    }).catch(() => [] as string[])
    return titles.map(title => ({ title }))
  }

  /** Click a sidebar conversation whose text contains the given title. */
  private async clickConversationByTitle(title: string): Promise<boolean> {
    if (this.page === undefined) return false
    const selectors = [
      'a[href*="/a/chat/s/"]',
      '[class*="conversation"]',
      '[class*="chat-item"]',
      '[class*="session-item"]',
      'nav a',
      'aside a',
    ]
    for (const selector of selectors) {
      const locator = this.page.locator(selector).filter({ hasText: title }).first()
      if (await locator.count().catch(() => 0) > 0) {
        await locator.click({ timeout: 5_000 }).catch(() => undefined)
        return true
      }
    }
    return false
  }

  /**
   * Recover a web conversation into the local transcript store: open it in the
   * sidebar, scrape its history, and import it (idempotent by title).
   */
  async recoverWebConversation(title: string): Promise<{ ok: boolean; chatId?: string; title?: string; created?: boolean; error?: string }> {
    if (this.page === undefined) {
      try {
        await this.ensureBrowser()
      } catch (error) {
        return { ok: false, error: String(error) }
      }
    }
    if (await this.isLoggedIn() !== true) {
      return { ok: false, error: '尚未登录 DeepSeek 网页端' }
    }
    try {
      const clicked = await this.clickConversationByTitle(title)
      if (!clicked) return { ok: false, error: `未在网页端找到会话「${title}」` }
      // The SPA re-renders the message list after navigation; wait, then retry
      // a few times because larger conversations can take a while to appear in
      // the virtual list.
      await this.page!.waitForTimeout(2_000)
      let scraped = await this.scrapeConversation()
      for (let attempt = 0; attempt < 4 && scraped.length === 0; attempt++) {
        await this.page!.waitForTimeout(2_000)
        scraped = await this.scrapeConversation()
      }
      if (scraped.length === 0) return { ok: false, error: '读取网页会话历史失败（页面可能已改版）' }
      const messages = this.scrapedToMessages(scraped)
      const model = this.deepThink ? 'deepseek-reasoner' : 'deepseek-chat'
      const result = this.store.importTranscript({ title, model, messages })
      return { ok: true, chatId: result.chat.id, title: result.chat.title, created: result.created }
    } catch (error) {
      return { ok: false, error: String(error) }
    }
  }

  /** Detect whether the page is currently generating (stop affordance visible). */
  private async isGenerating(): Promise<boolean> {
    if (this.page === undefined) return false
    try {
      const stopSelectors = [
        'button[aria-label*="停止"]',
        '[aria-label*="stop generating" i]',
        'button:has-text("停止生成")',
        'button:has-text("Stop generating")',
      ]
      for (const selector of stopSelectors) {
        if (await this.page.locator(selector).count().catch(() => 0) > 0) return true
      }
      return false
    } catch {
      return false
    }
  }

  /** Click the stop-generation affordance, best effort. */
  async stop(): Promise<void> {
    await this.queue.run(async () => {
      if (this.page === undefined) return
      const stopSelectors = [
        'button[aria-label*="停止"]',
        '[aria-label*="stop generating" i]',
        'button:has-text("停止生成")',
        'button:has-text("Stop generating")',
      ]
      for (const selector of stopSelectors) {
        const locator = this.page.locator(selector).first()
        if (await locator.count().catch(() => 0) > 0) {
          await locator.click({ timeout: 5_000 }).catch(() => undefined)
          return
        }
      }
    })
  }

  /** Find the composer textarea (defensive selector list). */
  private async composerLocator(): Promise<ReturnType<Page['locator']>> {
    const selectors = [
      '#chat-input',
      'textarea[placeholder*="给 DeepSeek"]',
      'textarea[placeholder*="发送消息"]',
      'textarea[placeholder*="Send a message"]',
      'textarea',
    ]
    for (const selector of selectors) {
      const locator = this.page!.locator(selector).first()
      if (await locator.count().catch(() => 0) > 0) return locator
    }
    return this.page!.locator('textarea').first()
  }

  /**
   * Upload local image files into the composer through the page's (usually
   * hidden) file input. `setInputFiles` fires the input's change event, which
   * is how DeepSeek picks up attachments without clicking its native dialog.
   */
  private async attachImages(paths: string[]): Promise<{ ok: boolean; error?: string }> {
    if (this.page === undefined) return { ok: false, error: '浏览器未启动' }
    if (paths.length === 0) return { ok: true }
    const selectors = [
      'input[type="file"][accept*="image" i]',
      'input[type="file"]',
    ]
    for (const selector of selectors) {
      const input = this.page.locator(selector).first()
      if (await input.count().catch(() => 0) === 0) continue
      try {
        await input.setInputFiles(paths)
        // Let the upload + preview render settle before submitting.
        await this.page.waitForTimeout(1_000)
        return { ok: true }
      } catch (error) {
        return { ok: false, error: `图片上传失败：${String(error)}` }
      }
    }
    return { ok: false, error: '未找到图片上传入口（页面可能已改版或当前会话不支持图片）' }
  }

  /**
   * Send a message through the real web page.
   * @param text - message text.
   * @param wait - when true (agent tools), resolve with the final reply after
   *   streaming completes; when false (GUI), resolve right after the message
   *   is submitted — the reply streams in the background into the transcript
   *   and the panel polls it live.
   */
  send(text: string, wait = false, images?: string[]): Promise<SendResult> {
    return this.queue.run(() => this.sendImpl(text, wait, images))
  }

  private async sendImpl(text: string, wait: boolean, images?: string[]): Promise<SendResult> {
    this.setLastError(undefined)
    if (this.page === undefined) {
      try {
        await this.ensureBrowser()
      } catch (error) {
        const message = String(error)
        this.setLastError(message, 'NETWORK')
        return { ok: false, error: message, code: 'NETWORK' }
      }
    }
    const loggedIn = await this.isLoggedIn()
    if (loggedIn !== true) {
      const message = '尚未登录 DeepSeek 网页端。请在插件面板点击「打开登录窗口」，在弹出的浏览器中完成登录后重试。'
      this.setLastError(message, 'NEED_LOGIN')
      return { ok: false, error: message, code: 'NEED_LOGIN' }
    }
    try {
      const chat = this.store.ensureActiveChat(this.deepThink ? 'deepseek-reasoner' : 'deepseek-chat')
      const userMessage: WebChatMessage = {
        id: randomUUID(), role: 'user', content: text, ts: Date.now(),
        ...(images !== undefined && images.length > 0 ? { attachments: images } : {}),
      }
      this.store.appendMessage(chat.id, userMessage)
      if (chat.title === '新的对话') {
        this.store.renameChat(chat.id, text.replace(/\s+/g, ' ').slice(0, 40))
      }

      // Type into the real composer and submit with Enter.
      const page = this.page
      if (page === undefined) return { ok: false, error: '浏览器未启动' }
      const composer = await this.composerLocator()
      await composer.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined)
      await composer.click({ timeout: 5_000 }).catch(() => undefined)
      await composer.fill(text, { timeout: 10_000 }).catch(async () => {
        await composer.type(text, { delay: 5 })
      })
      // Attach any images before submitting (setInputFiles on the page's file input).
      if (images !== undefined && images.length > 0) {
        const attach = await this.attachImages(images)
        if (!attach.ok) {
          const message = attach.error ?? '图片上传失败'
          this.setLastError(message, 'NETWORK')
          return { ok: false, error: message, code: 'NETWORK' }
        }
      }
      // Reset the stream capture so the reply loop only sees this request.
      await page.evaluate(() => {
        const w = window as unknown as { __wcStream?: StreamCapture }
        w.__wcStream = { text: '', done: false, started: false, status: 0, error: '' }
      }).catch(() => undefined)
      await page.keyboard.press('Enter')

      const assistantId = randomUUID()
      if (!wait) {
        // Fire-and-forget for the GUI: the background loop streams into the
        // transcript; the panel polls /state and renders live.
        void this.streamReply(chat.id, assistantId)
        return { ok: true, chatId: chat.id }
      }
      const result = await this.streamReply(chat.id, assistantId)
      return result
    } catch (error) {
      const message = `发送失败：${String(error)}`
      this.setLastError(message)
      return { ok: false, error: message }
    }
  }

  /**
   * Background reply loop. Primary source is the teed SSE stream (raw model
   * markdown, no selectors); if the capture never installs, falls back to
   * scraping the rendered DOM. Writes the growing reply into the transcript
   * until the stream reports done/FINISHED or the timeout hits.
   */
  private async streamReply(chatId: string, assistantId: string): Promise<SendResult> {
    if (this.page === undefined) return { ok: false, error: '浏览器未启动' }
    this.busy = true
    const started = Date.now()
    const timeout = this.config.replyTimeoutMs ?? DEFAULT_TIMEOUT_MS
    let replyMarkdown = ''
    let replyError: string | undefined
    let replyCode: WebChatErrorCode | undefined
    let domStable = 0
    let lastDom = ''

    const readCapture = async (): Promise<StreamCapture | null> => {
      if (this.page === undefined) return null
      return this.page.evaluate(() => {
        const w = window as unknown as { __wcStream?: StreamCapture }
        return w.__wcStream ?? null
      }).catch(() => null)
    }

    const domSnapshot = async (): Promise<{ markdown: string }> => {
      const scraped = await this.scrapeConversation()
      const assistant = [...scraped].reverse().find(message => message.role === 'assistant')
      if (assistant === undefined) return { markdown: '' }
      const think = stripSearchTrace(assistant.parts.filter(part => part.kind === 'think').map(part => part.text).join('\n\n')).trim()
      const bodyHtml = assistant.parts.find(part => part.kind === 'body')?.markdown ?? ''
      const bodyMd = bodyHtml === '' ? '' : stripSearchTrace(serializeToMarkdown(parseMarkup(bodyHtml)))
      const thinkMd = think === '' ? '' : `<details><summary>思考过程</summary>\n\n${think}\n\n</details>`
      return { markdown: [thinkMd, bodyMd].filter(Boolean).join('\n\n') }
    }

    try {
      await this.page.waitForTimeout(700)
      let captureSeen = false
      let captureCompleted = false
      while (Date.now() - started < timeout) {
        const capture = await readCapture()
        if (capture !== null && capture.started) {
          captureSeen = true
          // Primary: parse the teed SSE stream.
          const parsed = parseStreamReply(capture.text)
          if (parsed.markdown !== '') {
            replyMarkdown = parsed.markdown
            this.store.upsertMessage(chatId, {
              id: assistantId, role: 'assistant', content: replyMarkdown, ts: Date.now(),
              streaming: !(capture.done || parsed.finished),
            })
          }
          if (capture.done || parsed.finished) {
            captureCompleted = true
            break
          }
          if (capture.error !== '') {
            replyError = capture.error
            replyCode = 'NETWORK'
            break
          }
        } else {
          // Fallback: scrape the rendered DOM until the capture produces data.
          const dom = await domSnapshot()
          if (dom.markdown !== '') {
            if (dom.markdown !== lastDom) {
              lastDom = dom.markdown
              domStable = 0
              replyMarkdown = dom.markdown
            } else {
              domStable += 1
            }
            this.store.upsertMessage(chatId, {
              id: assistantId, role: 'assistant', content: replyMarkdown, ts: Date.now(), streaming: true,
            })
          }
          if (replyMarkdown !== '' && domStable >= 3) break
        }
        await this.page.waitForTimeout(350)
      }
      if (replyMarkdown === '' && replyCode === undefined) {
        if (captureSeen && captureCompleted) {
          replyError = '页面协议疑似改版：已捕获到回复流但无法解析出内容，请升级 dsh-webchat 插件'
          replyCode = 'PAGE_CHANGED'
        } else {
          replyError = '等待回复超时（未捕获到网页回复流；可能未登录或页面结构已变化）'
          replyCode = 'TIMEOUT'
        }
      } else if (replyCode === undefined && Date.now() - started >= timeout) {
        replyError = '生成超时，已返回部分内容'
        replyCode = 'TIMEOUT'
      }
      this.store.upsertMessage(chatId, {
        id: assistantId, role: 'assistant', content: replyMarkdown, ts: Date.now(),
        streaming: false, error: replyError,
      })
      this.store.setStreaming(chatId, false)
      if (replyError !== undefined) this.setLastError(replyError, replyCode)
      return { ok: replyError === undefined, chatId, reply: replyMarkdown, error: replyError, code: replyCode }
    } catch (error) {
      const message = `生成过程中断：${String(error)}`
      this.setLastError(message)
      this.store.upsertMessage(chatId, {
        id: assistantId, role: 'assistant', content: replyMarkdown, ts: Date.now(),
        streaming: false, error: message,
      })
      this.store.setStreaming(chatId, false)
      return { ok: false, chatId, reply: replyMarkdown, error: message }
    } finally {
      this.busy = false
    }
  }

  /** Start a new chat on the web page (best effort) + a fresh local transcript. */
  async newChat(): Promise<{ ok: boolean; chatId?: string; error?: string }> {
    if (this.busy) return { ok: false, error: '正在生成回复，请先停止或等待完成' }
    return this.queue.run(async () => {
      try {
        await this.ensureBrowser()
        const chat = this.store.createChat(this.deepThink ? 'deepseek-reasoner' : 'deepseek-chat')
        if (this.page !== undefined) {
          const clickSelectors = ['button:has-text("新对话")', 'button:has-text("New chat")', '[class*="newChat"]']
          let clicked = false
          for (const selector of clickSelectors) {
            const locator = this.page.locator(selector).first()
            if (await locator.count().catch(() => 0) > 0) {
              await locator.click({ timeout: 5_000 }).catch(() => undefined)
              clicked = true
              break
            }
          }
          if (!clicked) {
            await this.openDeepSeekPage()
          }
          await this.page.waitForTimeout(1_500)
        }
        return { ok: true, chatId: chat.id }
      } catch (error) {
        return { ok: false, error: String(error) }
      }
    })
  }

  /**
   * Click a toggle on the page by label candidates (best effort — the DeepSeek
   * web UI has no stable contract, so a miss is not an error). The toggles are
   * `div.ds-toggle-button` elements (not `<button>`), so those selectors come
   * first; `<button>` variants remain as fallbacks for older page versions.
   * @returns true when a candidate was clicked.
   */
  private async clickToggle(labels: string[]): Promise<boolean> {
    if (!this.isPageAlive()) return false
    const selectors: string[] = []
    for (const label of labels) {
      selectors.push(
        `div.ds-toggle-button:has-text("${label}")`,
        `[aria-pressed]:has-text("${label}")`,
        `button:has-text("${label}")`,
        `[aria-label*="${label}"]`,
      )
    }
    for (const selector of selectors) {
      const locator = this.page!.locator(selector).first()
      if (await locator.count().catch(() => 0) > 0) {
        await locator.click({ timeout: 5_000 }).catch(() => undefined)
        return true
      }
    }
    return false
  }

  /** Toggle deep-think (R1) mode on the web page. */
  async setDeepThink(enabled: boolean): Promise<{ ok: boolean; error?: string }> {
    if (this.busy) return { ok: false, error: '正在生成回复，请先等待完成' }
    return this.queue.run(async () => {
      try {
        await this.ensureBrowser()
        const current = await this.readToggles()
        if (current.deepThink !== enabled) {
          await this.clickToggle(['深度思考', 'DeepThink', 'Deep Think'])
        }
        this.deepThink = enabled
        return { ok: true }
      } catch (error) {
        return { ok: false, error: String(error) }
      }
    })
  }

  /** Toggle internet search on the web page (web label: 智能搜索). */
  async setSearch(enabled: boolean): Promise<{ ok: boolean; error?: string }> {
    if (this.busy) return { ok: false, error: '正在生成回复，请先等待完成' }
    return this.queue.run(async () => {
      try {
        await this.ensureBrowser()
        const current = await this.readToggles()
        if (current.search !== enabled) {
          await this.clickToggle(['智能搜索', '联网搜索', 'Search'])
        }
        this.search = enabled
        return { ok: true }
      } catch (error) {
        return { ok: false, error: String(error) }
      }
    })
  }

  /** Close the browser (releases the profile lock). */
  async disposeBrowser(): Promise<void> {
    try {
      await this.context?.close()
    } catch {
      // already closed
    }
    this.context = undefined
    this.page = undefined
    if (this.state !== 'error') this.setState('stopped')
  }

  /** Engine snapshot for status routes and agent tools. */
  async status(): Promise<{
    engine: EngineState
    engineError?: string
    loggedIn: boolean | null
    pageUrl?: string
    deepThink: boolean
    search: boolean
    busy: boolean
    lastError?: string
    lastErrorCode?: WebChatErrorCode
  }> {
    // Self-heal: if the browser was up but the page died (e.g. the user closed
    // the window), relaunch so the panel reconnects. Explicit disposeBrowser()
    // leaves state 'stopped', which we leave alone until the next user action.
    if (this.state === 'ready' && !this.isPageAlive() && !this.loginMode) {
      await this.ensureBrowser().catch(() => undefined)
    }
    let loggedIn = await this.isLoggedIn()
    if (loggedIn === true) this.loggedInOnce = true
    else if (loggedIn === false) this.loggedInOnce = false
    else if (loggedIn === null && this.loggedInOnce) loggedIn = true
    const toggles = await this.readToggles()
    this.deepThink = toggles.deepThink
    this.search = toggles.search
    return {
      engine: this.state,
      engineError: this.engineError,
      loggedIn,
      pageUrl: this.pageUrl(),
      deepThink: this.deepThink,
      search: this.search,
      busy: this.busy,
      lastError: this.lastError,
      lastErrorCode: this.lastErrorCode,
    }
  }
}

/**
 * Minimal HTML fragment parser used to round-trip scraped `.ds-markdown`
 * innerHTML through htmlToMarkdown (the in-page evaluate returns HTML
 * strings; the converter consumes a light DOM-shaped object graph).
 */
function parseMarkup(html: string): MarkupNode {
  return new MarkupParser(html).parse()
}

export interface MarkupNode {
  readonly tagName?: string
  readonly nodeType: number
  readonly textContent?: string
  readonly children: MarkupNode[]
  readonly attributes: Record<string, string | undefined>
  readonly parent?: MarkupNode
}

/** Tiny HTML tokenizer → light DOM graph (sufficient for DeepSeek's markdown HTML). */
class MarkupParser {
  private readonly tokens: string[]
  private index = 0

  constructor(html: string) {
    // Tokenize into tags and text (naive but adequate: DeepSeek renders
    // well-formed HTML with no unescaped '<' in text).
    this.tokens = html.split(/(<[^>]+>)/).filter(token => token !== '')
  }

  parse(): MarkupNode {
    const root = this.parseChildren(undefined)
    return root
  }

  private parseChildren(parent: MarkupNode | undefined): MarkupNode {
    const node: MarkupNode = { nodeType: 1, children: [], attributes: {}, parent }
    while (this.index < this.tokens.length) {
      const token = this.tokens[this.index]
      if (!token.startsWith('<')) {
        node.children.push({ nodeType: 3, textContent: token, children: [], attributes: {}, parent: node })
        this.index++
        continue
      }
      const close = /^<\/([a-zA-Z0-9]+)>$/.exec(token)
      if (close !== null) {
        this.index++
        if (close[1].toLowerCase() === (node.tagName ?? '').toLowerCase()) return node
        continue // mismatched close: ignore
      }
      const open = /^<([a-zA-Z0-9]+)((?:\s+[a-zA-Z0-9-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?)*)\s*(\/?)>$/.exec(token)
      if (open === null) {
        this.index++
        continue
      }
      const [, rawTag, attrsRaw] = open
      const tag = rawTag.toLowerCase()
      const attributes: Record<string, string | undefined> = {}
      if (attrsRaw !== undefined) {
        const attrRe = /([a-zA-Z0-9-]+)(?:=("[^"]*"|'[^']*'|[^\s>]*))?/g
        let match: RegExpExecArray | null
        while ((match = attrRe.exec(attrsRaw)) !== null) {
          const value = match[2] === undefined ? undefined : match[2].replace(/^["']|["']$/g, '')
          attributes[match[1]] = value
        }
      }
      this.index++
      const element: MarkupNode = { tagName: tag, nodeType: 1, children: [], attributes, parent }
      if (!open[3].endsWith('/')) {
        const child = this.parseChildren(element)
        for (const grandchild of child.children) element.children.push(grandchild)
      }
      node.children.push(element)
    }
    return node
  }
}

/** Convert a scraped markdown-HTML string to markdown (used by send). */
export function scrapedHtmlToMarkdown(html: string): string {
  return serializeToMarkdown(parseMarkup(html))
}
