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

export default class App extends React.Component {
  state = {
    code: '',
    theme: resolveThemeMode()
  }

  componentDidMount() {
    window.utools.onPluginEnter(({ code, type, payload }) => {
      this.setState({ code })
    })

    window.utools.onPluginOut(() => {
      this.setState({ code: '' })
    })

    // 监听跨标签页的 storage 事件（其他标签页修改主题时同步）
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme-mode') {
        const mode = resolveThemeMode()
        document.documentElement.setAttribute('data-theme', mode)
        this.setState({ theme: mode })
      }
    })

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (!localStorage.getItem('theme-mode')) {
        const mode = resolveThemeMode()
        document.documentElement.setAttribute('data-theme', mode)
        this.setState({ theme: mode })
      }
    })

    // 监听 data-theme 属性变化（同一标签页内 Header 切换主题时触发）
    const observer = new MutationObserver(() => {
      const mode = document.documentElement.getAttribute('data-theme')
      if (mode === 'dark' || mode === 'light') {
        this.setState({ theme: mode })
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    this.observer = observer
    this.mediaQuery = mediaQuery

    // 初始化主题
    const mode = resolveThemeMode()
    document.documentElement.setAttribute('data-theme', mode)
  }

  componentWillUnmount() {
    if (this.observer) this.observer.disconnect()
    if (this.mediaQuery) this.mediaQuery.removeEventListener('change', () => {})
  }

  render() {
    const { code, theme } = this.state
    return (
      <ThemeProvider theme={createMuiTheme(theme === 'dark')}>
        {code === 'passwords' && <Passwords />}
        {code === 'random' && <Random />}
      </ThemeProvider>
    )
  }
}