# AGENTS.md

## 构建

```bash
npm run dev        # watch 模式
npm run build      # 生产构建，输出到 dist/
```

无 lint、无类型检查、无测试命令。构建通过即验证。

## Node 版本

锁定 **14.20.1**（`engines` 字段 + BCrypt 编译产物依赖）。不要升级。

## 架构要点

- **React Class Component**，不用 hooks/函数组件。拖拽组件用 ES decorator 语法（`@DragSource`/`@DropTarget`），babel 已配置 `legacy` 模式。
- **无路由库**。`App.js` 根据 uTools `onPluginEnter` 的 `code` 切换：`passwords` → `<Passwords />`，`random` → `<Random />`。
- **Passwords.js** 内部状态机：无密码 → `<Setting />` → 有密码未验证 → `<Door />` → 已验证 → `<Home />`。
- **无状态管理库**。状态全在 Class Component `this.state`，跨组件通信用 `window.emitter`（mitt）。
- **数据持久化**：`window.utools.db`（uTools 内置文档数据库），不是 localStorage。更新文档必须带 `_rev`，冲突需重试（见 `accountOperations.js`）。
- **加密**：`window.services`（定义在 `public/preload.js`，运行在 Node.js 环境）。渲染进程只能通过它调用，不要自己实现加解密。加密字段：title/username/password/link/remark。

## 主题系统

双轨驱动：
1. **CSS Custom Properties**（`src/themes/variables.css`）：25 个 token，`[data-theme='light']` / `[data-theme='dark']` 双套值。Less、inline style、Tailwind 都用 `var(--xxx)`。
2. **MUI ThemeProvider**（`src/themes/muiTheme.js`）：MUI 组件跟随暗色模式。

主题切换流程：
- `Header.js` 操作 `document.documentElement.setAttribute('data-theme', mode)` + `localStorage.setItem('theme-mode', mode)`
- `App.js` 用 `MutationObserver` 监听 `data-theme` 变化 → 更新 MUI theme → `ThemeProvider key={themeVersion}` 强制刷新
- `currentThemeRef` 防止 Observer 无限循环

Tailwind `darkMode: 'class'`，colors 映射 CSS 变量。

## uTools 平台约束

- 代码依赖 `window.utools` 和 `window.services`，**无法在普通浏览器中运行**。
- `public/preload.js` 运行在 Node.js 环境，可用 `require`；渲染进程代码不能用 Node API。
- 调试方式：uTools 开发者工具加载 `dist/plugin.json`。

## .env 文件

- 构建时 `dotenv-webpack` safe mode 注入环境变量（Cloudflare D1 埋点）。
- **若不需要埋点**：不要有 `.env` 文件，webpack 配置会跳过 DotenvPlugin。
- **若需要埋点**：必须有 `.env` 且与 `.env.example` 一致，否则构建失败。

## 关键数据流

```
preload.js (window.services)
  → Passwords.js (keyIV 生成/传递)
    → Home.js (核心视图)
      → 子组件 (props 向下, window.emitter 向上)
```

`initializeData(keyIV)` 从 uTools DB 读取并解密，返回 `{ groupTree, groupIds, group2Accounts, decryptAccountDic }`。

## 常见陷阱

- uTools DB `put` 更新必须带 `_rev`，否则冲突。`accountOperations.js` 有冲突重试模式。
- 登录状态持久化在 `localStorage`（`LOGIN_INFO`），含 1 天过期时间，不是 uTools DB。
- `Home.js` 是核心大组件（已拆分至 ~263 行），逻辑分散在 `HomeBody.js`、`HomeDialogs.js` 等子组件。
- `@arco-design/web-react` 已移除，全部使用 MUI。不要重新引入 Arco Design。
