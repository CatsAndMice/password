import React, { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import StarIcon from '@mui/icons-material/Star'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import CheckIcon from '@mui/icons-material/Check'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Divider from '@mui/material/Divider'
import FolderIcon from '@mui/icons-material/Folder'
import KeyIcon from '@mui/icons-material/Key'
import HeaderMoreMenu from './HeaderMoreMenu'

const CURRENT_FEATURE_VERSION = '1.9.0'

/**
 * 应用顶部导航栏组件
 * 展示分组/账号统计、收藏切换、主题切换、更多菜单（密码生成器、批量管理、备份设置等）
 */
const Header = ({ onFavoriteClick, showFavorites, onBackupClick, handleOpenPasswordGenerator, onBatchOperationsClick, groupIds, group2Accounts }) => {
  const groupCount = groupIds?.length || 0
  const accountCount = Object.values(group2Accounts || {}).reduce((total, accounts) => total + accounts.length, 0)

  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const savedMode = localStorage.getItem('theme-mode')
    if (savedMode === 'dark') return true
    if (savedMode === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [isFollowSystem, setIsFollowSystem] = React.useState(() => localStorage.getItem('theme-mode') === null)

  // 判断是否显示新功能红点（首次进入当前版本时）
  const [showNewFeatureDot, setShowNewFeatureDot] = useState(() => {
    return window.utools.dbStorage.getItem('has_viewed_new_features') !== CURRENT_FEATURE_VERSION
  })

  // 切换主题模式：亮色/暗色/跟随系统
  const handleModeSelect = (mode) => {
    let resolvedMode = mode
    switch (mode) {
      case 'light':
        setIsFollowSystem(false); setIsDarkMode(false)
        localStorage.setItem('theme-mode', 'light')
        break
      case 'dark':
        setIsFollowSystem(false); setIsDarkMode(true)
        localStorage.setItem('theme-mode', 'dark')
        break
      case 'system':
        setIsFollowSystem(true); localStorage.removeItem('theme-mode')
        resolvedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        setIsDarkMode(resolvedMode === 'dark')
        break
    }
    document.documentElement.setAttribute('data-theme', resolvedMode)
    handleClose()
  }
  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  React.useEffect(() => {
    if (isFollowSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e) => {
        setIsDarkMode(e.matches)
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      }
      handleChange(mediaQuery)
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [isFollowSystem])

  const [moreAnchorEl, setMoreAnchorEl] = React.useState(null)
  const handleMoreClick = (event) => {
    setMoreAnchorEl(event.currentTarget)
    if (showNewFeatureDot) {
      setShowNewFeatureDot(false)
      window.utools.dbStorage.setItem('has_viewed_new_features', CURRENT_FEATURE_VERSION)
    }
  }
  const handleMoreClose = () => setMoreAnchorEl(null)

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-divider)', backdropFilter: 'blur(8px)' }}>
        <Toolbar variant="dense" sx={{ height: '50px', padding: '0 16px !important' }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--color-text-secondary)', '& .stat-item': { display: 'flex', alignItems: 'center', gap: '4px' } }}>
            <div className="stat-item">
              <FolderIcon className="text-gray-500" sx={{ fontSize: 16 }} />
              <span className="font-mono font-medium">全部分组：{groupCount}</span>
            </div>
            <div className="stat-item">
              <KeyIcon className="text-gray-500" sx={{ fontSize: 16 }} />
              <span className="font-mono font-medium">全部账号：{accountCount}</span>
            </div>
          </Typography>
          <Button startIcon={showFavorites ? <StarIcon /> : <StarOutlineIcon />} onClick={onFavoriteClick} size="small"
            sx={{ marginRight: '8px', '&:hover': { backgroundColor: showFavorites ? 'var(--color-primary-light2)' : 'var(--color-bg-overlay)' }, transition: 'all 0.2s', borderRadius: '6px', color: showFavorites ? 'var(--color-primary)' : 'var(--color-text-secondary)', textTransform: 'none', minWidth: 'auto' }}>
            常用收藏
          </Button>
          <Button startIcon={isFollowSystem ? <SettingsSystemDaydreamIcon /> : (isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />)} onClick={handleClick} size="small"
            sx={{ '&:hover': { backgroundColor: 'var(--color-bg-overlay)' }, transition: 'all 0.2s', borderRadius: '6px', color: 'var(--color-text-secondary)', textTransform: 'none', minWidth: 'auto' }}>
            {isFollowSystem ? '跟随系统' : (isDarkMode ? '暗色模式' : '亮色模式')}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
            sx={{ '& .MuiPaper-root': { borderRadius: '8px', minWidth: '120px', boxShadow: 'var(--shadow-popup)' } }}>
            <MenuItem onClick={() => handleModeSelect('light')} sx={{ minHeight: '36px' }}>
              {!isDarkMode && !isFollowSystem && <CheckIcon sx={{ mr: 1, fontSize: 18 }} />} 亮色模式
            </MenuItem>
            <MenuItem onClick={() => handleModeSelect('dark')} sx={{ minHeight: '36px' }}>
              {isDarkMode && !isFollowSystem && <CheckIcon sx={{ mr: 1, fontSize: 18 }} />} 暗黑模式
            </MenuItem>
            <MenuItem onClick={() => handleModeSelect('system')} sx={{ minHeight: '36px' }}>
              {isFollowSystem && <CheckIcon sx={{ mr: 1, fontSize: 18 }} />} 跟随系统
            </MenuItem>
          </Menu>
          <Divider orientation="vertical" sx={{ margin: '0 5px', borderColor: 'var(--color-divider)', height: '16px' }} />
          <Button onClick={handleMoreClick} size="small"
            sx={{ '&:hover': { backgroundColor: 'var(--color-bg-overlay)' }, transition: 'all 0.2s', borderRadius: '6px', color: 'var(--color-text-secondary)', textTransform: 'none', minWidth: 'auto', position: 'relative',
              '&::after': showNewFeatureDot ? { content: '""', position: 'absolute', top: '2px', right: '2px', width: '5px', height: '5px', backgroundColor: 'var(--color-error)', borderRadius: '50%' } : {} }}>
            <div className="rotate-90"><MoreVertIcon /></div>
          </Button>
          <HeaderMoreMenu anchorEl={moreAnchorEl} open={Boolean(moreAnchorEl)} onClose={handleMoreClose}
            showNewFeatureDot={showNewFeatureDot} onPasswordGenerator={handleOpenPasswordGenerator}
            onBatchOperations={onBatchOperationsClick} onBackupClick={onBackupClick} />
        </Toolbar>
      </AppBar>
    </>
  )
}

export default Header