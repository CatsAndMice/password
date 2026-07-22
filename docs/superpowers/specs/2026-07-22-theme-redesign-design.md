# 主题换肤方案设计

## 日期

2026-07-22

## 目标

替换当前 `filter: invert(1)` 暗黑模式 hack，建立基于 CSS Custom Properties + MUI ThemeProvider 双轨驱动的主题系统，支持亮色/暗黑/跟随系统三种模式。

## 当前问题

- 暗黑模式通过 `html[data-theme='dark'] { filter: invert(1) hue-rotate(180deg) }` 全局翻转颜色，导致色彩失真
- 零个 CSS Custom Properties，约 200+ 处硬编码颜色散布在 20+ 文件中
- MUI ThemeProvider 未启用，MUI 组件使用默认亮色调色板
- Tailwind 无主题配置，`dark:` 变体未使用

## 设计决策

| 决策点 | 选择 |
|--------|------|
| 模式 | 亮色 / 暗黑 / 跟随系统（保持现有三态） |
| 亮色风格 | 微调优化，保留蓝调，使用更现代的 slate 文本色 |
| 暗色风格 | 偏蓝暗黑，`#0d1117` 底 / `#161b22` 卡片 |
| 用户自定义 | 不支持，纯预设 |
| 实施策略 | 一步到位，全部替换 |

## 架构

### 双轨驱动

```
┌──────────────────────────────────────────────────┐
│                  App.js                          │
│  ┌────────────────────────────────────────────┐  │
│  │  <ThemeProvider theme={muiTheme}>          │  │
│  │    ┌──────────────────────────────────┐    │  │
│  │    │  引入 variables.css              │    │  │
│  │    │  (CSS Custom Properties)         │    │  │
│  │    └──────────────────────────────────┘    │  │
│  │  ... 所有组件 ...                          │  │
│  │  </ThemeProvider>                          │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

- **轨道 1：CSS Variables** → Less 文件、inline style、Tailwind 使用 `var(--xxx)`
- **轨道 2：MUI ThemeProvider** → MUI 组件的 `theme.palette`、`sx prop` callback

两者共享同一套 token 值，通过 `data-theme` 属性切换。

### 主题切换

保持现有机制不变：`<html data-theme="light|dark">` + `localStorage` + `matchMedia` 监听。

新增：`App.js` 根据 `data-theme` 变化调用 `setState` 更新 MUI `createTheme` 对象。

## 文件变更

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/themes/variables.css` | 25-30 个 CSS Custom Properties，亮暗两套值 |
| `src/themes/muiTheme.js` | 导出 `createMuiTheme(isDark)` 函数，从 CSS 变量读取值生成 MUI theme 对象 |

### 修改文件

| 文件 | 变更 |
|------|------|
| `src/index.less` | 删除 `html[data-theme='dark'] filter` hack，颜色替换为 `var(--xxx)` |
| `src/home.less` | 同上 |
| `src/tree.less` | 同上 |
| `src/account.less` | 同上 |
| `src/search.less` | 同上 |
| `src/App.js` | 引入 `variables.css`，包裹 `ThemeProvider`，监听 `data-theme` 变化更新 theme |
| `src/components/Header.js` | 更新主题切换逻辑（不再需要手动 setAttribute） |
| `src/Door.js` | 颜色替换 |
| `src/Setting.js` | 颜色替换 |
| `src/Reset.js` | 颜色替换 |
| `src/Recover.js` | 颜色替换 |
| `src/AccountItem.js` | 颜色替换 |
| `src/AccountArea.js` | 颜色替换 |
| `src/AccountForm.js` | 颜色替换 |
| `src/ExportDialog.js` | 颜色替换 |
| `src/ImportDialog.js` | 颜色替换 |
| `src/SnackbarMessage.js` | 颜色替换 |
| `src/TreeRoot.js` | 颜色替换 |
| `src/TreeNode.js` | 颜色替换 |
| `src/utils/formStyles.js` | 颜色替换 |
| `src/components/AccountFormFields.js` | 颜色替换 |
| `src/components/BackupRestore.js` | 颜色替换 |
| `src/components/BackupTabs.js` | 颜色替换 |
| `src/components/BatchOperations.js` | 颜色替换 |
| `src/components/BatchOperationsDialogs.js` | 颜色替换 |
| `src/components/DoorMenu.js` | 颜色替换 |
| `src/components/FavoriteAccounts.js` | 颜色替换 |
| `src/components/HeaderMoreMenu.js` | 颜色替换 |
| `src/components/HomeBody.js` | 颜色替换 |
| `src/components/HomeDialogs.js` | 颜色替换 |
| `src/components/LazyAvatar.js` | 颜色替换 |
| `src/components/NewBadge.js` | 颜色替换 |
| `src/components/OCRInputDialog.js` | 颜色替换 |
| `src/components/PasswordGeneratorDialog.js` | 颜色替换 |
| `src/components/ShareButton.js` | 颜色替换 |
| `src/components/TreeFooter.js` | 颜色替换 |
| `src/components/RecoverVerifiedView.js` | 颜色替换 |
| `tailwind.config.js` | 扩展 `colors` 映射 CSS 变量，启用 `darkMode: 'class'` |

## CSS Variables Token 设计

### 语义 Token（25 个）

```css
:root, [data-theme='light'] {
  /* 背景 */
  --color-bg-primary: #f5f7fa;          /* 页面背景 */
  --color-bg-card: #ffffff;             /* 卡片/面板背景 */
  --color-bg-card-hover: #f8f9fa;       /* 卡片悬停 */
  --color-bg-input: #ffffff;            /* 输入框背景 */
  --color-bg-overlay: rgba(0,0,0,0.04); /* 蒙层/遮罩 */

  /* 文字 */
  --color-text-primary: #1f2937;        /* 主文字 */
  --color-text-secondary: #6b7280;      /* 次要文字 */
  --color-text-disabled: #9ca3af;       /* 禁用文字 */
  --color-text-link: #2196F3;           /* 链接文字 */

  /* 主色 */
  --color-primary: #2196F3;             /* 主色 */
  --color-primary-hover: #1976D2;       /* 主色悬停 */
  --color-primary-light: rgba(33,150,243,0.1); /* 主色浅底 */
  --color-primary-light2: rgba(33,150,243,0.05);

  /* 边框 */
  --color-border: #e5e7eb;              /* 边框 */
  --color-border-light: #f3f4f6;        /* 浅边框 */
  --color-divider: rgba(0,0,0,0.08);    /* 分割线 */

  /* 状态色 */
  --color-success: #4CAF50;
  --color-warning: #e67e22;
  --color-error: #f44336;
  --color-error-hover: #d32f2f;

  /* 阴影 */
  --shadow-card: 0 2px 8px rgba(0,0,0,0.1);
  --shadow-popup: 0 4px 12px rgba(0,0,0,0.12);

  /* 滚动条 */
  --color-scrollbar-thumb: rgba(0,0,0,0.2);
  --color-scrollbar-track: rgba(0,0,0,0.05);
}

[data-theme='dark'] {
  --color-bg-primary: #0d1117;
  --color-bg-card: #161b22;
  --color-bg-card-hover: #1c2333;
  --color-bg-input: #0d1117;
  --color-bg-overlay: rgba(255,255,255,0.04);

  --color-text-primary: #c9d1d9;
  --color-text-secondary: #8b949e;
  --color-text-disabled: #484f58;
  --color-text-link: #58a6ff;

  --color-primary: #58a6ff;
  --color-primary-hover: #79b8ff;
  --color-primary-light: rgba(88,166,255,0.15);
  --color-primary-light2: rgba(88,166,255,0.08);

  --color-border: #21262d;
  --color-border-light: #1c2128;
  --color-divider: rgba(255,255,255,0.08);

  --color-success: #3fb950;
  --color-warning: #d29922;
  --color-error: #f85149;
  --color-error-hover: #ff6b63;

  --shadow-card: 0 2px 8px rgba(0,0,0,0.3);
  --shadow-popup: 0 4px 12px rgba(0,0,0,0.4);

  --color-scrollbar-thumb: rgba(255,255,255,0.15);
  --color-scrollbar-track: rgba(255,255,255,0.05);
}
```

### 映射规则

| 现有硬编码色 | 替换为 |
|-------------|--------|
| `#2c3e50`, `#34495e` | `var(--color-text-primary)` |
| `#666`, `#999`, `#7f8c8d`, `#757575`, `#ababab`, `#909399` | `var(--color-text-secondary)` |
| `#2196F3` | `var(--color-primary)` |
| `#1976D2` | `var(--color-primary-hover)` |
| `rgba(33, 150, 243, 0.x)` | `var(--color-primary-light)` / `var(--color-primary-light2)` |
| `#f44336`, `#e74c3c` | `var(--color-error)` |
| `#d32f2f` | `var(--color-error-hover)` |
| `#e0e0e0`, `#ebeef5`, `#e1e1e1` | `var(--color-border)` |
| `rgba(0,0,0,0.08)`, `rgba(0,0,0,0.1)` 分割线 | `var(--color-divider)` |
| `#ffffff`, `#fff`, `rgb(255,255,255)` 卡片背景 | `var(--color-bg-card)` |
| `#f5f7fa` 渐变 / 纯色背景 | `var(--color-bg-primary)` |
| `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)` | `var(--color-bg-gradient)` (新增渐变 token) |
| `#4CAF50`, `#4caf50` | `var(--color-success)` |
| `#e67e22` | `var(--color-warning)` |
| `#95a5a6`, `rgba(0,0,0,0.54)` 禁用态 | `var(--color-text-disabled)` |
| `0 2px 8px rgba(0,0,0,0.1)` 等阴影 | `var(--shadow-card)` / `var(--shadow-popup)` |

### 额外渐变 Token

暗黑模式下的渐变背景需单独处理：

```css
:root, [data-theme='light'] {
  --color-bg-gradient: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

[data-theme='dark'] {
  --color-bg-gradient: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
}
```

## MUI Theme 设计

```js
// src/themes/muiTheme.js
import { createTheme } from '@mui/material/styles';

export function createMuiTheme(isDark) {
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: isDark ? '#58a6ff' : '#2196F3',
        dark: isDark ? '#79b8ff' : '#1976D2',
        light: isDark ? 'rgba(88,166,255,0.15)' : 'rgba(33,150,243,0.1)',
      },
      background: {
        default: isDark ? '#0d1117' : '#f5f7fa',
        paper: isDark ? '#161b22' : '#ffffff',
      },
      text: {
        primary: isDark ? '#c9d1d9' : '#1f2937',
        secondary: isDark ? '#8b949e' : '#6b7280',
      },
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      error: { main: isDark ? '#f85149' : '#f44336' },
      success: { main: isDark ? '#3fb950' : '#4CAF50' },
      warning: { main: isDark ? '#d29922' : '#e67e22' },
    },
  });
}
```

## Tailwind 配置

```js
module.exports = {
  content: ['./src/**/*.{html,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--color-bg-primary)',
        'bg-card': 'var(--color-bg-card)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        border: 'var(--color-border)',
      },
    },
  },
  plugins: [],
};
```

## App.js 变更要点

```js
// 新增引入
import './themes/variables.css';
import { ThemeProvider } from '@mui/material/styles';
import { createMuiTheme } from './themes/muiTheme';

// state 新增 themeMode
state = { theme: 'light', themeMode: 'light', featureCode: null };

// componentDidMount 中监听 data-theme 变化
// 使用 MutationObserver 监听 html 的 data-theme 属性变化
// setState({ themeMode: newMode }) 触发 MUI theme 重建

// render 中
<ThemeProvider theme={createMuiTheme(this.state.themeMode === 'dark')}>
  {/* 原有内容 */}
</ThemeProvider>
```

## 需要删除的内容

1. `src/index.less` 中 `html[data-theme='dark']` 的 `filter: invert(1)` 整个块
2. `src/index.less` 中 `.page-background` 的暗黑覆盖 `background: rgb(255, 255, 255)`
3. `src/home.less` 中 `html[data-theme='dark']` 的 `background: rgb(255, 255, 255)` 覆盖
4. `src/index.less` 中注释掉的历史暗黑模式代码（lines 269-329）
5. 所有 `.preserve-color` 类（不再需要，因为不再用 filter）
6. `Header.js` 中的 `setAttribute('data-theme', ...)` 调用（移到 App.js 统一管理）

## 实施顺序

1. 创建 `src/themes/variables.css`（CSS tokens）
2. 创建 `src/themes/muiTheme.js`（MUI theme 工厂）
3. 修改 `tailwind.config.js`（扩展 colors）
4. 修改 `src/App.js`（引入文件 + ThemeProvider + MutationObserver）
5. 逐个替换 Less 文件（5 个文件）
6. 逐个替换 JS 组件（~20 个文件）
7. 清理删除：filter hack、preserve-color、历史注释代码
8. `npm run build` 验证