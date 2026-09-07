/**
 * dsh-webchat — host half. Mounts the DeepSeek web engine (a real browser at
 * chat.deepseek.com driven through its own page, persistent login profile),
 * the /api/dsh-webchat route family, the agent tools (webchat_status,
 * webchat_send, webchat_import, webchat_transfer), the harness transfer
 * (seed a new session with a web transcript) and a system-prompt
 * announcement. The browser half (./client) renders the chat panel. All
 * transport rides the official NPM SDK packages — no dsh source changes.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { SettingsNamespace } from '@deepseek-ai/dsh-settings';
import z from 'schemastery';
/** Stable cordis plugin name. */
export declare const name = "webchat";
/** Services required before the web-chat surfaces can mount. */
export declare const inject: string[];
/**
 * Settings namespace of the web-chat capability — the section the web
 * settings surface edits. Spelled here rather than imported: the browser half
 * spells the same value and must not depend on a Host package. It is a plain
 * lowercase string on every dsh generation (rc.7's settingsNamespace() helper
 * was only a runtime regex check; 0.1.2-rc.1 removed the helper and brands the
 * string purely at the type level), so no version-gated construction is needed.
 */
export declare const WEBCHAT_SETTINGS_NAMESPACE: SettingsNamespace;
/** Plugin config, validated by the same-named schemastery schema. */
export interface Config {
    /** When true (default), a system-prompt section announces the plugin to every agent. */
    announceToAgent?: boolean;
    /** Master switch for the plugin (routes, tools, prompt section). */
    enabled?: boolean;
    /** Browser channel hint ('chrome' | 'msedge' | 'chromium' | 'auto'). */
    browserChannel?: string;
    /** Explicit browser executable path. */
    browserExecutablePath?: string;
    /** Proxy mode: 'direct' | 'system' | 'http://host:port'. */
    browserProxy?: string;
    /**
     * Run the chat browser headless (invisible). Default true: only the one-time
     * login window is visible, and it auto-closes once logged in. Set false to
     * keep a visible browser window during chatting too.
     */
    browserHeadless?: boolean;
    /** Max ms to wait for a web reply. */
    replyTimeoutMs?: number;
    /** Data directory override (tests). */
    dataDir?: string;
    /** When true (default), distill the transcript into an executable task brief before transfer. */
    transferDistill?: boolean;
    /** Provider route for the transfer distillation call (empty = auto-detect). */
    transferProvider?: string;
    /** Model id for the transfer distillation call (empty = auto-detect). */
    transferModel?: string;
    /** Output-token cap for the final distillation brief (default 4096). */
    transferMaxTokens?: number;
    /** Output-token cap per chunk summary in long-conversation map-reduce (default 1024). */
    transferChunkTokens?: number;
}
export declare const Config: z<Config>;
/** Model-facing announcement: plugin presence, capabilities, and limits. */
export declare const WEBCHAT_GUIDANCE = "\u672C\u673A\u5DF2\u5B89\u88C5 dsh-webchat \u63D2\u4EF6\uFF08Codex ChatGPT \u6A21\u5F0F \u00B7 DeepSeek \u7F51\u9875\u7AEF\u804A\u5929\uFF09\uFF1A\u4FA7\u8FB9\u680F\u300C\u7F51\u9875\u804A\u5929\u300D\u5165\u53E3\uFF1B\u901A\u8FC7\u771F\u5B9E\u6D4F\u89C8\u5668\u9A71\u52A8 chat.deepseek.com\uFF08DeepSeek \u7F51\u9875\u6A21\u578B\uFF0C\u6DF1\u5EA6\u601D\u8003/\u667A\u80FD\u641C\u7D22\u5F00\u5173\uFF0C\u7F51\u9875\u767B\u5F55\u4F1A\u8BDD\uFF0C\u65E0\u9700 API \u989D\u5EA6\uFF09\u3002\u80FD\u529B\uFF1Awebchat_status \u67E5\u770B\u767B\u5F55/\u4F1A\u8BDD\u72B6\u6001\u3001webchat_send \u901A\u8FC7\u7F51\u9875\u7AEF\u53D1\u9001\u6D88\u606F\u5E76\u6D41\u5F0F\u83B7\u53D6\u56DE\u590D\uFF08\u53EF\u9644\u5E26\u672C\u5730\u56FE\u7247\u8DEF\u5F84\u505A\u591A\u6A21\u6001\u63D0\u95EE\uFF09\u3001webchat_recover \u628A\u7F51\u9875\u7AEF\u5DF2\u6709\u4F1A\u8BDD\u540C\u6B65/\u6062\u590D\u5230\u672C\u5730\u3001webchat_import \u628A\u5B58\u50A8\u7684\u7F51\u9875\u5BF9\u8BDD\u5BFC\u5165\u4E3A markdown \u4E0A\u4E0B\u6587\u3001webchat_transfer \u628A\u7F51\u9875\u5BF9\u8BDD\u84B8\u998F\u6210\u53EF\u6267\u884C\u4EFB\u52A1\u7B80\u62A5\u5E76\u521B\u5EFA\u65B0 harness \u4F1A\u8BDD\uFF08\u9996\u6761\u6D88\u606F\u5373\u4EFB\u52A1\u7B80\u62A5\uFF0C\u800C\u975E\u539F\u59CB\u804A\u5929\u8BB0\u5F55\uFF09\uFF0C\u6216\u7ECF targetSessionId \u628A\u7B80\u62A5\u4F5C\u4E3A\u65B0\u6D88\u606F\u8FFD\u52A0\u5230\u5DF2\u6709\u4F1A\u8BDD\u5EF6\u7EED\u540C\u4E00\u4EFB\u52A1\uFF1BGUI \u9762\u677F\u53EF\u5C06\u5BF9\u8BDD\u968F\u65F6\u5BFC\u51FA\u4E3A\u5DE5\u4F5C\u533A\u6587\u4EF6\u6216\u8F6C\u5165 harness \u4F1A\u8BDD\u3002\u9650\u5236\uFF1A\u9996\u6B21\u4F7F\u7528\u9700\u7528\u6237\u5728\u5F39\u51FA\u7684\u6D4F\u89C8\u5668\u7A97\u53E3\u5B8C\u6210 DeepSeek \u7F51\u9875\u767B\u5F55\uFF1B\u7F51\u9875\u7AEF\u53D7 DeepSeek \u5B98\u65B9\u98CE\u63A7\uFF0C\u64CD\u4F5C\u5931\u8D25\u6216\u9875\u9762\u6539\u7248\u65F6\u8FD4\u56DE\u9519\u8BEF\u800C\u975E\u5D29\u6E83\uFF1B\u9762\u677F\u63D0\u4F9B\u300C\u6DF1\u5EA6\u601D\u8003\uFF08R1\uFF09\u300D\u4E0E\u300C\u667A\u80FD\u641C\u7D22\u300D\u5F00\u5173\uFF08\u7F51\u9875\u7AEF\u65E0\u6A21\u578B\u9009\u62E9\u5668\uFF09\u3002\u7528\u6237\u63D0\u5230\u300C\u7F51\u9875\u804A\u5929 / \u7F51\u9875\u7AEF / ChatGPT \u6A21\u5F0F / deepseek web / \u8F6C\u79FB\u5230 harness\u300D\u65F6\u5373\u6307\u672C\u63D2\u4EF6\uFF0C\u8BF7\u636E\u6B64\u534F\u4F5C\u3002";
/**
 * Mount the engine, routes, tools, and announcement.
 * @param ctx - host plugin context carrying webServer/tools/systemPrompt.
 * @param config - resolved plugin config (schema defaults applied by the loader).
 */
export declare function apply(ctx: Context, config?: Config): void;
