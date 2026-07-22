# 项目上下文

## 项目概览

- 项目名称：密码管家（Password Manager）
- 仓库位置：`/Users/lihai/Desktop/工作/项目/password`
- 核心产品/业务目标：uTools 平台的密码管理插件，提供安全的账号密码加密存储、分组管理、自动填充、随机密码生成等功能
- 当前阶段：持续开发
- 主要用户角色：桌面用户（通过 uTools 使用）
- 支持平台：`桌面 Web`（作为 uTools 插件运行在 Electron WebView 中）

## 技术栈

- 框架：React 18（Class Component 风格，非 hooks）
- 构建工具：Webpack 5
- 语言：JavaScript（`.js` 文件，有 `tsconfig.json` 但仅用于 utools-api-types 类型提示）
- UI 组件库：MUI (Material-UI) v5 + Arco Design（`@arco-design/web-react` 部分使用）
- 样式方案：Less + Tailwind CSS 3 + Emotion（MUI 内置）
- 状态管理：无独立状态库，仅 React Class Component `this.state` + `this.setState`
- 路由：无路由库，通过 uTools `plugin.json` 的 `features` 定义多个入口（每个 feature code 对应一个组件分支）
- 请求层：原生 `fetch`（仅 `src/api/d1.js` 中用于 Cloudflare D1 API 埋点）
- 加密：BCrypt（密码哈希）、AES-256-CBC（数据加解密），通过 `preload.js` 注入 `window.services`
- 拖拽：react-dnd + react-dnd-html5-backend
- 测试：无
- 包管理器：npm（`package-lock.json` 被 gitignore）

## 运行手册

- 安装依赖：`npm install`
- 启动开发（watch 模式）：`npm run dev`
- 构建产物：`npm run build`
- 产物目录：`dist/`
- 本地调试方式：在 **uTools 开发者工具** 中将 `dist/plugin.json` 加入本地开发
- 无 lint、类型检查、单元测试命令

## 仓库地图

- `src/index.js`：应用入口，挂载 React 到 DOM，初始化 mitt 事件总线（`window.emitter`）
- `src/App.js`：根组件，根据 uTools `onPluginEnter` 的 `code` 切换 `Passwords` / `Random` 两个主界面；处理明暗主题切换
- `src/Passwords.js`：密码管理主流程控制——首次设置密码（`Setting`）→ 开门验证（`Door`）→ 主界面（`Home`）
- `src/Home.js`：核心页面，管理分组树 + 账号列表 + 搜索 + 导出/导入 + 批量操作 + 备份设置 + 密码生成器等所有核心交互
- `src/Door.js`：开门密码验证页面，含免登录、找回密码、修改密码功能
- `src/Setting.js`：首次设置开门密码页面
- `src/Tree.js`：分组树组件，渲染树结构、管理展开收起、选中、新增/编辑/删除分组、导入导出
- `src/TreeNode.js`：单个树节点组件（含拖拽）
- `src/TreeRoot.js`：树根节点拖拽目标
- `src/AccountArea.js`：账号列表区域，键盘导航、新增/删除账号、OCR 输入
- `src/AccountItem.js`：单个账号卡片（含拖拽排序）
- `src/AccountRoot.js`：账号列表拖拽目标
- `src/AccountForm.js`：账号编辑表单
- `src/Search.js`：全局搜索组件
- `src/Random.js`：随机密码生成独立入口
- `src/RandomPassword.js`：随机密码生成器组件
- `src/components/`：公共组件（`Header`、`BackupRestore`、`BackupSettings`、`BatchOperations`、`FavoriteAccounts`、`LazyAvatar`、`NewBadge`、`OCRInputDialog`、`PasswordGeneratorDialog`、`PasswordStrengthIndicator`、`ShareButton`）
- `src/utils/`：工具函数（`initializeData` 从 uTools DB 初始化分组/账号数据、`autoFill` 浏览器/utools 自动填充、`const` 常量、`csvParser`、`getFavicon` 等）
- `src/api/d1.js`：Cloudflare D1 数据库埋点 API（event tracking）
- `src/api/ocr.js`：OCR 识别 API
- `public/`：静态资源和 uTools 插件配置
  - `public/plugin.json`：插件声明，定义 features 和 commands
  - `public/preload.js`：uTools preload 脚本，注册 `window.services`（加密/备份/浏览器自动填充等服务）
  - `public/bcrypt/`：BCrypt 库（自行编译的 js 版本）
  - `public/browser/`：浏览器自动填充逻辑（Edge/Chrome）
  - `public/backup.js`：自动备份逻辑
  - `public/webdavServices.js`：WebDAV 云备份服务

## 架构规则

- 这是一个 **React Class Component** 项目，不使用 hooks 或函数组件
- 无路由库，依赖 `App.js` 中根据 uTools feature code 进行条件渲染
- 状态完全由 Class Component 的 `this.state` 管理，无 Pinia/Vuex/store
- 跨组件通信：通过 props 向下传递，通过事件总线 `window.emitter`（mitt）进行非父子通信
- 所有数据持久化通过 `window.utools.db`（uTools 内置文档数据库），不是 localStorage
- 加密逻辑集中在 `public/preload.js` 的 `window.services` 中，渲染进程通过它调用
- 组件拖拽使用 react-dnd（`AccountRoot` 和 `AccountItem` 用 ES decorator 语法写 DropTarget/DragSource）
- 支持实验性 ES decorator 语法（`@DropTarget`、`@DragSource`），对应的 babel 插件已配置

## 路由约定

- 无传统路由。入口切换在 `src/App.js` 的 `render()` 中：
  - `code === 'passwords'` → `<Passwords />`
  - `code === 'random'` → `<Random />`
- `Passwords.js` 内部状态流转：
  - 无密码 → `<Setting />`（设置密码）
  - 有密码但未验证 → `<Door />`（输入密码）
  - 已验证 → `<Home />`（主界面）
- 所有 feature code 对应 `public/plugin.json` 中的 features 声明

## 状态管理约定

- 所有状态在 Class Component 的 `state` 中，通过 `setState` 更新
- 关键全局状态：
  - `keyIV`：AES 加密密钥，由用户密码派生，在 `Passwords.js` 中持有，向下传给 `Home`
  - `decryptAccountDic`：解密后的账号字典（`{ [accountId]: { account, title, username } }`）
  - `group2Accounts`：分组到账号的映射
  - `groupTree`：分组树结构
  - `searchKey`：当前搜索关键词
- 数据初始化统一通过 `initializeData(keyIV)` 从 uTools DB 读取并解密
- 登录状态持久化：`localStorage` 存储加密后的登录信息（`LOGIN_INFO`），含过期时间（1天）

## API 约定

- 无传统 REST API 调用。插件是纯本地应用，数据存储在 uTools 内置数据库
- `src/api/d1.js`：通过 Cloudflare D1 REST API 发送埋点事件（`trackEvent`），需要环境变量配置
- `src/api/ocr.js`：OCR 识别接口
- 请求层使用原生 `fetch`，无 axios
- 环境变量通过 `dotenv-webpack` 在构建时注入，从 `.env` 文件读取

## UI 约定

- 主要 UI 库：**MUI (Material-UI) v5**，使用其 sx prop 写内联样式
- 辅助组件库：`@arco-design/web-react`（部分场景使用）
- 样式方案混合：Less（`.less` 文件）+ Tailwind CSS 工具类 + Emotion（MUI sx prop 经 emotion 处理）
- 主题：支持亮色/暗色/跟随系统，通过 `document.documentElement.setAttribute('data-theme', ...)` 和 CSS 变量实现，非 MUI ThemeProvider
- Dialog 用于弹窗（备份设置、批量操作、删除确认、密码生成器）
- Snackbar 用于消息提示
- 表单使用 MUI `TextField`、`InputBase`
- 内联样式大量使用，inline style 和 sx prop 混用

## 编码约定

- 命名规则：
  - 组件：PascalCase（`Passwords`、`AccountArea`、`PasswordGeneratorDialog`）
  - 工具函数：camelCase（`initializeData`、`autoFill`）
  - 常量：UPPER_SNAKE（`WEBDAV_DOCS_URL`）
- Import 别名：`@` 映射到 `src/`（webpack alias）
- 使用 ES6 class 语法 + decorators
- 组件生命周期使用 `componentDidMount`、`componentWillUnmount`、`UNSAFE_componentWillReceiveProps`
- 事件处理函数命名：`handle{Event}`（`handleCreate`、`handleAccountUpdate`）
- 避免模式：
  - 不要在渲染进程中直接操作 uTools DB，优先通过 `initializeData` + setState
  - 加密解密必须通过 `window.services`，不要自己实现
  - 不要引入新的状态管理库

## 质量门禁

- 无 lint 配置
- 无类型检查（`tsconfig.json` 仅用于 utools-api-types 类型提示，不参与编译）
- 无测试
- Webpack 构建通过即可（`npm run build`）
- 开发验证方式：在 uTools 开发者工具中加载插件，手工验证

## 发布流程

- 构建：`npm run build`（输出到 `dist/`）
- 产物：`dist/index.js` + `dist/plugin.json` + `dist/index.html` + `dist/preload.js` + 其他 public 目录下的静态资源
- 部署目标：uTools 插件市场
- 关键：构建时需要 `.env` 文件（含 Cloudflare D1 配置），否则 `dotenv-webpack` 会因 safe mode 失败；
  - 若不需要埋点功能，构建时不能存在 `.env` 文件（webpack 配置中 `.env` 不存在则跳过 `DotenvPlugin`）

## 环境说明

- 环境变量文件：`.env`（gitignore，不提交），模板：`.env.example`
- 必需变量（如果使用埋点功能）：
  - `D1_DATABASE_ID`
  - `D1_ACCOUNT_ID`
  - `D1_AUTH_TOKEN`
  - `D1_AUTH_KEY`
  - `D1_AUTH_EMAIL`
- 构建时注入（`dotenv-webpack` safe mode），运行时通过 `process.env.*` 访问
- Node.js 版本：14.20.1（`engines` 字段指定）

## 已知约束

- **Node 版本锁定**：必须使用 Node 14.20.1（`engines` 字段 + BCrypt 编译产物依赖）
- **uTools 平台约束**：代码依赖 `window.utools` API，无法在普通浏览器中运行
- **preload 脚本**：`public/preload.js` 运行在 Node.js 环境，可用 `require` 和 Node API；渲染进程代码不能直接用 Node API
- **BCrypt**：使用 `public/bcrypt/bcrypt.js`（自行编译的纯 JS 版本），非原生 node.bcrypt
- **Class Component**：整个项目使用 React Class Component + decorator 语法，不得引入 hooks/函数组件
- **无 TypeScript 编译**：`tsconfig.json` 仅用于编辑器类型提示，webpack 只处理 `.js` 文件
- **无测试**：项目没有测试基础设施

## 当前热点

- `src/Home.js`（678行）：最大的组件，承载几乎所有核心交互逻辑，修改风险高
- `src/utils/autoFill.js`：浏览器自动填充逻辑复杂，涉及 uTools ubrowser API 和本地浏览器交互
- `public/preload.js`：加密服务核心，涉及 BCrypt + AES，修改需谨慎验证
- WebDAV 备份/恢复：`public/webdavServices.js` 和 `src/components/BackupSettings.js`

## 在本仓库中的工作方式

1. 修改前先理解数据流：`public/preload.js`（服务定义）→ `Passwords.js`（keyIV 生成/传递）→ `Home.js`（核心视图）→ 子组件
2. 除非任务明确要求重构，否则保持 Class Component 风格
3. 新增组件放在 `src/components/` 下，工具函数放在 `src/utils/` 下
4. 操作 uTools DB 时注意：创建用 `put`，更新需带 `_rev`（冲突重试模式见 `handleAccountUpdate`）
5. 加密字段（title/username/password/link/remark）必须通过 `window.services.encryptValue/decryptValue` 处理
6. 修改后必须 `npm run build` 成功，并在 uTools 开发者工具中验证

## 开放问题

- 项目未来是否会迁移到 React hooks/函数组件风格？
- Arco Design 的使用范围有限（仅部分组件），是否有计划统一到 MUI？
- 是否有计划引入 TypeScript 编译器（当前仅用于类型提示）？
- 测试基础设施是否会补建？当前无任何测试，覆盖率 0
- GitHub Actions 或其他 CI 是否会被引入？
