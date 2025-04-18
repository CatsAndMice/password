import React from 'react'
import '../assets/styles/fonts.css'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import StarIcon from '@mui/icons-material/Star'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import BackupIcon from '@mui/icons-material/Backup'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import CheckIcon from '@mui/icons-material/Check'

// 在组件顶部添加状态
const Header = ({ onFavoriteClick, showFavorites, onBackupClick }) => {
  // 从 localStorage 读取初始状态
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const savedMode = localStorage.getItem('theme-mode')
    if (savedMode === 'dark') return true
    if (savedMode === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [isFollowSystem, setIsFollowSystem] = React.useState(() => {
    return localStorage.getItem('theme-mode') === null
  })

  // 修改模式选择处理函数
  const handleModeSelect = (mode) => {
    switch (mode) {
      case 'light':
        setIsFollowSystem(false)
        setIsDarkMode(false)
        localStorage.setItem('theme-mode', 'light')
        document.documentElement.setAttribute('data-theme', 'light')
        break
      case 'dark':
        setIsFollowSystem(false)
        setIsDarkMode(true)
        localStorage.setItem('theme-mode', 'dark')
        document.documentElement.setAttribute('data-theme', 'dark')
        break
      case 'system':
        setIsFollowSystem(true)
        localStorage.removeItem('theme-mode')
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDarkMode(isDark)
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
        break
    }
    handleClose()
  }
  const [anchorEl, setAnchorEl] = React.useState(null)

  // 添加菜单打开关闭处理
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // 添加系统主题监听
  React.useEffect(() => {
    if (isFollowSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e) => {
        setIsDarkMode(e.matches)
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      }

      handleChange(mediaQuery) // 初始化
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [isFollowSystem])


  // 修改按钮部分
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'rgb(255, 255, 255)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <Toolbar variant="dense" sx={{ height: '50px', padding: '0 16px !important' }}>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            color: 'rgba(0, 0, 0, 0.87)',
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            userSelect: 'none',
            '& span': {
              background: 'linear-gradient(45deg, #2196F3, #00BCD4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(33, 150, 243, 0.2)',
              fontFamily: 'MyFont',
              fontWeight: 700,
              letterSpacing: '1px',
            }
          }}
        >
          <span>我的密码库</span>
        </Typography>




        {/* 添加备份按钮 */}
        <Button
          startIcon={<BackupIcon />}
          onClick={onBackupClick}
          size="small"
          sx={{
            marginRight: '8px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
            },
            transition: 'all 0.2s',
            borderRadius: '6px',
            color: 'rgba(0, 0, 0, 0.6)',
            textTransform: 'none',
            minWidth: 'auto',
          }}
        >
          备份
        </Button>
        <Button
          startIcon={showFavorites ? <StarIcon /> : <StarOutlineIcon />}
          onClick={onFavoriteClick}
          size="small"
          sx={{
            marginRight: '8px',
            '&:hover': {
              backgroundColor: showFavorites ? 'rgba(33, 150, 243, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            },
            transition: 'all 0.2s',
            borderRadius: '6px',
            color: showFavorites ? '#2196F3' : 'rgba(0, 0, 0, 0.6)',
            textTransform: 'none',
            minWidth: 'auto',
          }}
        >
          常用账号
        </Button>

        {/* 修改暗黑模式切换按钮 */}
        <Button
          startIcon={isFollowSystem ? <SettingsSystemDaydreamIcon /> : (isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />)}
          onClick={handleClick}
          size="small"
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
            },
            transition: 'all 0.2s',
            borderRadius: '6px',
            color: 'rgba(0, 0, 0, 0.6)',
            textTransform: 'none',
            minWidth: 'auto',
          }}
        >
          {isFollowSystem ? '跟随系统' : (isDarkMode ? '暗色模式' : '亮色模式')}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: '8px',
              minWidth: '120px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }
          }}
        >
          <MenuItem onClick={() => handleModeSelect('light')} sx={{ minHeight: '36px' }}>
            {!isDarkMode && !isFollowSystem && <CheckIcon sx={{ mr: 1, fontSize: 18 }} />}
            亮色模式
          </MenuItem>
          <MenuItem onClick={() => handleModeSelect('dark')} sx={{ minHeight: '36px' }}>
            {isDarkMode && !isFollowSystem && <CheckIcon sx={{ mr: 1, fontSize: 18 }} />}
            暗黑模式
          </MenuItem>
          <MenuItem onClick={() => handleModeSelect('system')} sx={{ minHeight: '36px' }}>
            {isFollowSystem && <CheckIcon sx={{ mr: 1, fontSize: 18 }} />}
            跟随系统
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Header