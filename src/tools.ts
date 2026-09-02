/**
 * Agent tools: the DSH-native counterpart of the web-chat panel. The harness
 * agent can chat through the DeepSeek web session (webchat_send), inspect
 * stored transcripts (webchat_status / webchat_import), and hand a web
 * conversation into a new harness session (webchat_transfer) — mirroring how
 * Codex's chatgpt mode lets the agent itself use the web subscription.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import type { DeepSeekWebEngine } from './engine/engine.ts'
import type { TranscriptStore } from './store.ts'
import { renderTranscriptMarkdown, transferToHarnessSession } from './transfer.ts'
import type { DistillConfig } from './transfer.ts'
import type { WebChatErrorCode } from './protocol.ts'

/** Actionable hint for a structured engine error code (surfaced to the agent). */
function errorCodeHint(code: WebChatErrorCode | undefined): string {
  switch (code) {
    case 'NEED_LOGIN': return '需要先登录：请在插件面板点击「打开登录窗口」完成 DeepSeek 网页登录。'
    case 'PAGE_CHANGED': return '页面/协议疑似改版：请升级 dsh-webchat 插件。'
    case 'TIMEOUT': return '生成超时：可稍后重试。'
    case 'NETWORK': return '网络/浏览器错误：请检查网络或浏览器是否可用。'
    default: return ''
  }
}

/** One text content block (the only render shape these tools emit). */
function text(value: string): ContentBlock[] {
  return [{ type: 'text', text: value }]
}

/** Minimal workspace projection surfaced to the agent (id/path/title only). */
export interface WorkspaceRef {
  id: string
  path: string
  title: string
}

/** Render the chat list compactly. */
function renderChats(store: TranscriptStore): string {
  const chats = store.list()
  if (chats.length === 0) return '还没有任何网页端对话记录'
  return chats.map(chat => {
    const messages = chat.messages.length
    const last = chat.messages.at(-1)
    const preview = last === undefined ? '' : ` · 最后: ${last.content.replace(/\s+/g, ' ').slice(0, 60)}`
    return `${chat.id} | ${chat.title} | ${chat.model} | ${messages} 条消息 | ${new Date(chat.updatedAt).toLocaleString()}${preview}`
  }).join('\n')
}

/** The engine-status tool. */
export function webChatStatusTool(engine: DeepSeekWebEngine, store: TranscriptStore, listWorkspaces?: () => WorkspaceRef[] | undefined) {
  return defineTool({
    name: 'webchat_status',
    description: 'Report the DeepSeek 网页端 (chat.deepseek.com) web-chat state: engine status, login state, active chat, stored transcripts, and the harness workspaces available as webchat_transfer targets. Triggers: webchat, deepseek 网页端, 网页聊天. Use before webchat_send to confirm login.',
    parameters: {},
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          report: { type: 'string', required: true },
        },
      },
      render: (_args, value: { report?: string }) => text(value.report ?? ''),
    },
    async execute(): Promise<{ report: string }> {
      const status = await engine.status()
      const active = store.activeChat()
      const lines = [
        `engine: ${status.engine}${status.engineError !== undefined ? ` (${status.engineError})` : ''}`,
        `loggedIn: ${String(status.loggedIn)}`,
        `pageUrl: ${status.pageUrl ?? '-'}`,
        `deepThink: ${String(status.deepThink)}`,
        `search: ${String(status.search)}`,
        `busy: ${String(status.busy)}`,
        `activeChat: ${active === undefined ? '-' : `${active.id} (${active.title})`}`,
        `chats:\n${renderChats(store)}`,
      ]
      const web = await engine.listWebConversations().catch(() => [] as Array<{ title: string }>)
      if (web.length > 0) {
        const localTitles = new Set(store.list().map(chat => chat.title))
        const missing = web.filter(item => !localTitles.has(item.title)).map(item => item.title)
        lines.push(`webChats:\n${web.map(item => `  - ${item.title}`).join('\n')}`)
        if (missing.length > 0) lines.push(`webChatsNotImported (use webchat_recover):\n${missing.map(title => `  - ${title}`).join('\n')}`)
      }
      const workspaces = listWorkspaces?.()
      if (workspaces !== undefined) {
        lines.push('workspaces:')
        if (workspaces.length === 0) lines.push('  (none)')
        else for (const ws of workspaces) lines.push(`  ${ws.id} | ${ws.title} | ${ws.path}`)
      }
      return { report: lines.join('\n') }
    },
  })
}

/** The send-via-web tool. */
export function webChatSendTool(engine: DeepSeekWebEngine) {
  return defineTool({
    name: 'webchat_send',
    description: 'Send one message through the DeepSeek 网页端 (chat.deepseek.com) using the web model — your web session, no API billing. The assistant reply streams until complete and returns as markdown. Optionally attach local image files (absolute paths) for multimodal prompts. Requires the user to have logged into the web chat once (webchat_status → loggedIn true). Best for asking the web model to explain/design/review; do not use for file operations. Triggers: 网页端提问, deepseek web, chatgpt mode.',
    parameters: {
      text: { type: 'string', required: true, description: 'The message to send to deepseek-chat on the web.' },
      images: { type: 'array', items: { type: 'string' }, description: 'Optional local absolute paths of image files to attach (multimodal prompt).' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          reply: { type: 'string', required: true },
          error: { type: 'string' },
          code: { type: 'string' },
          partial: { type: 'boolean' },
        },
      },
      render: (_args, value: { reply?: string; error?: string; code?: string; partial?: boolean }) => {
        const partial = value.partial === true
        const hint = errorCodeHint(value.code as WebChatErrorCode | undefined)
        return text([
          `webchat_send: 已通过 DeepSeek 网页端发送并收到回复${partial ? '（生成可能不完整）' : ''}`,
          value.error !== undefined ? `（注意：${value.error}）` : '',
          hint !== '' ? `（${hint}）` : '',
          '',
          '--- 网页端回复 ---',
          (value.reply ?? '').trim() === '' ? '（空回复）' : (value.reply ?? '').trim(),
          '--- 回复结束 ---',
          '',
          '会话已保存，可用 webchat_transfer 将整段对话转移到 harness 会话。',
        ].join('\n'))
      },
    },
    async execute(args: { text?: string; images?: unknown }): Promise<{ reply: string; error?: string; code?: string; partial: boolean }> {
      const textValue = typeof args?.text === 'string' ? args.text.trim() : ''
      if (textValue === '') return { reply: '', error: '缺少 text 参数', partial: false }
      const images = Array.isArray(args?.images)
        ? args.images.filter(value => typeof value === 'string').map(value => value as string)
        : undefined
      // wait=true so the tool returns the completed reply (the GUI path is fire-and-forget).
      const result = await engine.send(textValue, true, images)
      const sent: { reply: string; error?: string; code?: string; partial: boolean } = {
        reply: result.reply ?? '',
        partial: result.error !== undefined,
      }
      if (result.error !== undefined) sent.error = result.error
      if (result.code !== undefined) sent.code = result.code
      return sent
    },
  })
}

/** The web-conversation recover tool (sync web sidebar → local store). */
export function webChatRecoverTool(engine: DeepSeekWebEngine) {
  return defineTool({
    name: 'webchat_recover',
    description: 'Recover a DeepSeek 网页端 conversation into the local store so it can be imported/transferred. With no title, lists the web-side conversations. Triggers: 同步网页会话, 恢复网页对话, sync webchat.',
    parameters: {
      title: { type: 'string', description: 'Conversation title (from the web sidebar or webchat_status webChats list). Omit to list web conversations.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: { report: { type: 'string', required: true } } },
      render: (_args, value: { report?: string }) => text(value.report ?? ''),
    },
    async execute(args: { title?: string }): Promise<{ report: string }> {
      if (typeof args?.title === 'string' && args.title.trim() !== '') {
        const result = await engine.recoverWebConversation(args.title.trim())
        if (!result.ok) return { report: `webchat_recover: 恢复失败 — ${result.error ?? ''}` }
        const dedup = result.created === false ? '（本地已存在，未重复导入）' : ''
        return { report: `webchat_recover: 已恢复「${result.title ?? ''}」为本地对话 ${result.chatId ?? ''}${dedup}。可用 webchat_transfer 转移。` }
      }
      const web = await engine.listWebConversations().catch(() => [] as Array<{ title: string }>)
      if (web.length === 0) return { report: 'webchat_recover: 未在网页端读到会话（可能未登录或页面已改版）' }
      return { report: web.map(item => `- ${item.title}`).join('\n') }
    },
  })
}

/** The transcript import tool. */
export function webChatImportTool(store: TranscriptStore) {
  return defineTool({
    name: 'webchat_import',
    description: 'Import one stored DeepSeek 网页端 transcript as markdown so the agent can continue the discussion itself. Triggers: 读取网页对话, import webchat, 把网页聊天作为上下文. Use webchat_status to list chat ids first.',
    parameters: {
      chatId: { type: 'string', description: 'Transcript id (from webchat_status). Omit for the active chat.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          transcript: { type: 'string', required: true },
          error: { type: 'string' },
        },
      },
      render: (_args, value: { transcript?: string; error?: string }) => {
        if (value.error !== undefined) return text(value.error)
        return text(value.transcript ?? '')
      },
    },
    async execute(args: { chatId?: string }): Promise<{ transcript: string; error?: string }> {
      const chat = typeof args?.chatId === 'string' ? store.getChat(args.chatId) : store.activeChat()
      if (chat === undefined) return { transcript: '', error: 'webchat_import: 找不到对话记录（用 webchat_status 查看列表）' }
      return { transcript: renderTranscriptMarkdown(chat) }
    },
  })
}

/** The transfer tool (closes over the host context so it can create sessions). */
export function webChatTransferTool(hostCtx: Context, store: TranscriptStore, distill: DistillConfig) {
  return defineTool({
    name: 'webchat_transfer',
    description: 'Transfer a stored DeepSeek 网页端 transcript into harness mode: distills the web conversation into an executable task brief (goal, established context, current state, next steps) and creates a NEW harness session whose first message is that brief (not the raw chat log), OR appends it as a fresh user message to an EXISTING session via targetSessionId (continue the same task). Optionally target a workspace (workspaceId from webchat_status workspaces list) so the new session is grouped under it. Returns the (new or target) session id. Triggers: 转移到 harness, 转成开发会话, transfer webchat.',
    parameters: {
      chatId: { type: 'string', description: 'Transcript id (from webchat_status). Omit for the active chat.' },
      targetSessionId: { type: 'string', description: 'Optional existing harness session id to CONTINUE (append the brief as a new user message) instead of creating a new session. Omit to create a new session.' },
      workspaceId: { type: 'string', description: 'Optional target workspace id (from the workspaces list in webchat_status). Omit to leave the new session ungrouped. Ignored when targetSessionId is given.' },
      cwd: { type: 'string', description: 'Optional absolute working directory for the new session; ignored when workspaceId or targetSessionId is given.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          sessionId: { type: 'string', required: true },
          distilled: { type: 'boolean' },
          attached: { type: 'boolean' },
          continued: { type: 'boolean' },
          workspaceId: { type: 'string' },
          error: { type: 'string' },
        },
      },
      render: (_args, value: { sessionId?: string; distilled?: boolean; attached?: boolean; continued?: boolean; workspaceId?: string; error?: string }) => {
        if (value.error !== undefined) return text(value.error)
        const note = value.distilled === true ? '（已蒸馏为任务简报）' : '（蒸馏不可用，已回退为原始对话记录）'
        if (value.continued === true) {
          return text(`webchat_transfer: 已把网页对话作为新的用户消息延续到 harness 会话 ${value.sessionId ?? ''}${note}。请告知用户打开该会话继续开发。`)
        }
        const where = value.workspaceId !== undefined ? `已归入工作区 ${value.workspaceId}` : '未分组'
        return text(`webchat_transfer: 已创建新 harness 会话 ${value.sessionId ?? ''}${note}（${where}）。请告知用户从侧边栏打开该会话继续开发。`)
      },
    },
    async execute(args: { chatId?: string; targetSessionId?: string; workspaceId?: string; cwd?: string }): Promise<{ sessionId: string; distilled: boolean; attached: boolean; continued?: boolean; workspaceId?: string; error?: string }> {
      const chat = typeof args?.chatId === 'string' ? store.getChat(args.chatId) : store.activeChat()
      if (chat === undefined) return { sessionId: '', distilled: false, attached: false, error: 'webchat_transfer: 找不到对话记录（用 webchat_status 查看列表）' }
      const targetSessionId = typeof args?.targetSessionId === 'string' && args.targetSessionId !== '' ? args.targetSessionId : undefined
      const workspace = targetSessionId === undefined && typeof args?.workspaceId === 'string' && args.workspaceId !== '' ? { workspaceId: args.workspaceId } : undefined
      try {
        const { sessionId, distilled, attached, workspaceId } = await transferToHarnessSession(hostCtx, { transcript: chat, cwd: args?.cwd, workspace, targetSessionId }, distill)
        const transferred: { sessionId: string; distilled: boolean; attached: boolean; continued: boolean; workspaceId?: string } = { sessionId, distilled, attached, continued: targetSessionId !== undefined }
        if (workspaceId !== undefined) transferred.workspaceId = workspaceId
        return transferred
      } catch (error) {
        return { sessionId: '', distilled: false, attached: false, continued: targetSessionId !== undefined, error: `webchat_transfer: 转移失败 — ${String(error)}` }
      }
    },
  })
}
