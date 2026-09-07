# dsh-webchat

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 提供的「Codex ChatGPT 模式」插件：通过真实浏览器驱动 [chat.deepseek.com](https://chat.deepseek.com)，用你的 DeepSeek 网页登录会话与 `deepseek-chat`（及 `deepseek-reasoner`）对话，**无需 API 额度**。对话可随时「转移到 Harness」——蒸馏成可执行任务简报并新建一个 harness 会话作为开发上下文，也可把网页对话导入为 markdown 上下文，或让 harness agent 直接通过同一个网页会话继续提问。

## 特性

- **网页聊天**：复用 DeepSeek 网页端登录，流式获取回复，支持「深度思考（R1）」与「智能搜索」开关。
- **转移到 Harness**：一键把当前网页对话蒸馏成任务简报（首条消息即简报）并创建新 harness 会话继续开发，或「延续到已有会话」——把简报作为新消息追加进指定会话（多轮续入）；转移时可选择目标工作区（未选则归入「未分组」）。
- **从网页恢复会话**：把网页端已存在但本地未收录的会话拉回本地存储（面板「从网页恢复」按钮 / `webchat_recover`）。
- **导入为上下文**：把存储的网页对话导出为 markdown 上下文。
- **Agent 工具**：`webchat_status` / `webchat_send` / `webchat_recover` / `webchat_import` / `webchat_transfer`，harness agent 可直接调用；`webchat_status` 列出工作区与网页会话，`webchat_transfer` 可指定目标工作区或目标会话（延续）。
- **无感登录**：首次使用弹出可见浏览器窗口完成登录，登录后窗口自动关闭，后续聊天在无头浏览器中进行。

## 安装

### 从 npm（发布后）

```bash
dsh plugin --profile web add dsh-webchat
```

### 从 GitHub

```bash
dsh plugin --profile web add github:xmuwenxiang/dsh-web-chat
```

> 仓库已提交编译产物 `lib/`，从 git 安装无需额外构建。

## 首次使用

1. 打开 Web GUI 侧边栏「网页聊天」入口。
2. 点击「打开登录窗口」，在弹出的浏览器中完成 DeepSeek 网页登录。
3. 登录成功后窗口会自动关闭，之后即可正常聊天 / 转移。

## 配置

插件设置中可调整：`browserChannel`（浏览器渠道，默认 auto）、`browserExecutablePath`（显式浏览器路径）、`browserProxy`（代理）、`browserHeadless`（聊天是否无头，默认 true——登录窗口始终可见且登录后自动关闭）、`replyTimeoutMs`（回复等待上限）、`transferDistill` / `transferProvider` / `transferModel`（转移时的蒸馏模型）、`transferMaxTokens`（最终简报输出上限，默认 4096）、`transferChunkTokens`（长对话分块摘要每段上限，默认 1024）。

## 环境要求

- Node.js >= 22
- 已安装 Google Chrome 或 Microsoft Edge
- 首次登录需要可交互的图形环境（弹出登录窗口）

### dsh（宿主）兼容性

宿主半区会按运行中的 dsh 版本自动适配设置注册 API；发布产物 `lib/` 从不静态
import 新版 dsh 已移除的导出名，因此在下列版本上模块链接都不会失败：

- **dsh ≥ 0.1.2-rc.1** —— 设置注册已改为 `SettingsProvider.installSection`
  （rc.7 时代的独立导出 `installSettingsSection` / `settingsNamespace` 已移除），支持；
- **dsh 0.1.0-rc.7 / rc.8** —— 旧版 `installSettingsSection` API，通过运行时
  回退兼容，老宿主行为不变。

`dsh.client.inject` 只列出在所有受支持版本中都存在的客户端包（`@deepseek-ai/dsh-client-runtime`
在 0.1.2-rc.1 已不再发布，故不再引用）。浏览器半区从客户端 context 读取
`sessions`/`workspaces` 服务，而这两者的提供方包在不同 dsh 代际间有变化——若某个 dsh 版本的
GUI 未挂载这些服务，面板只是不挂载（记录错误），宿主侧工具与路由照常工作，绝不影响 GUI 启动。

## 限制

- 网页端受 DeepSeek 官方风控；页面改版或操作失败时返回错误而非崩溃。
- 密码/会话凭据保存在本地私有目录（profile），请勿外泄。

## 开发

```bash
pnpm install
pnpm typecheck   # 类型检查 src/ 与 test/
pnpm test        # 运行单元测试（Node 内置测试运行器）
pnpm build       # 产出 lib/（宿主半区）与 lib/client.js（浏览器 bundle）
```

仓库已提交编译产物 `lib/`，从 git 安装无需额外构建。

## License

[Apache-2.0](./LICENSE)
