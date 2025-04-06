import React from 'react'
import Passwords from './Passwords'
import Random from './Random'
// import { createTheme, ThemeProvider } from '@mui/material/styles'

export default class App extends React.Component {
  state = {
    code: '',
    theme: (() => {
      const savedMode = localStorage.getItem('theme-mode')
      if (savedMode === 'dark' || savedMode === 'light') return savedMode
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    })()
  }

  componentDidMount() {
    // 进入插件
    window.utools.onPluginEnter(({ code, type, payload }) => {
      this.setState({ code })
    })

    // 退出插件
    window.utools.onPluginOut(() => {
      this.setState({ code: '' })
    })

    // 监听主题变化
    const updateTheme = () => {
      const savedMode = localStorage.getItem('theme-mode')
      if (savedMode === 'dark' || savedMode === 'light') {
        document.documentElement.setAttribute('data-theme', savedMode)
        // this.setState({ theme: savedMode })
      } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
        // this.setState({ theme: isDark ? 'dark' : 'light' })
      }
    }

    // 监听 localStorage 变化
    window.addEventListener('storage', updateTheme)

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateTheme)

    updateTheme()
    return () => {
      window.removeEventListener('storage', updateTheme)
      mediaQuery.removeEventListener('change', updateTheme)
    }
  }

  render() {
    const { code } = this.state
    if (code === 'passwords') return <Passwords />
    if (code === 'random') return <Random />
    return false
  }
}
