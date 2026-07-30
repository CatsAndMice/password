import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { createMuiTheme } from './themes/muiTheme'
import Passwords from './Passwords'
import Random from './Random'
import './themes/variables.css'

function resolveThemeMode() {
  const savedMode = localStorage.getItem('theme-mode')
  if (savedMode === 'dark' || savedMode === 'light') return savedMode
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// 全局 theme 对象，避免每次 render 重新创建
let currentTheme = createMuiTheme(resolveThemeMode() === 'dark')

function updateMuiTheme() {
  const mode = resolveThemeMode()
  currentTheme = createMuiTheme(mode === 'dark')
}

export default class App extends React.Component {
  state = {
    code: '',
    themeVersion: 0
  }

  componentDidMount() {
    window.utools.onPluginEnter(({ code, type, payload }) => {
      this.setState({ code })
    })

    window.utools.onPluginOut(() => {
      this.setState({ code: '' })
    })

    // 监听跨标签页的 storage 事件
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme-mode') {
        updateMuiTheme()
        this.setState({ themeVersion: Date.now() })
      }
    })

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (!localStorage.getItem('theme-mode')) {
        const mode = resolveThemeMode()
        document.documentElement.setAttribute('data-theme', mode)
        updateMuiTheme()
        this.setState({ themeVersion: Date.now() })
      }
    })

    // 监听 data-theme 属性变化（同一标签页内 Header 切换主题时触发）
    // 使用 ref 记录当前 theme，避免无限循环
    this.currentThemeRef = resolveThemeMode()
    const observer = new MutationObserver(() => {
      const newMode = document.documentElement.getAttribute('data-theme')
      if (newMode !== this.currentThemeRef && (newMode === 'dark' || newMode === 'light')) {
        this.currentThemeRef = newMode
        updateMuiTheme()
        this.setState({ themeVersion: Date.now() })
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    this.observer = observer
    this.mediaQuery = mediaQuery

    // 初始化主题
    const mode = resolveThemeMode()
    document.documentElement.setAttribute('data-theme', mode)
    this.currentThemeRef = mode
    updateMuiTheme()
  }

  componentWillUnmount() {
    if (this.observer) this.observer.disconnect()
    if (this.mediaQuery) this.mediaQuery.removeEventListener('change', () => {})
  }

  render() {
    const { code, themeVersion } = this.state
    return (
      <ThemeProvider key={themeVersion} theme={currentTheme}>
        {code === 'passwords' && <Passwords />}
        {code === 'random' && <Random />}
      </ThemeProvider>
    )
  }
}