import React, { useState } from 'react'
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
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Divider from '@mui/material/Divider'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import { WEBDAV_DOCS_URL, FEEDBACK_URL } from "../utils/const"
import GitHubIcon from '@mui/icons-material/GitHub'
import FeedbackIcon from '@mui/icons-material/Feedback'
import NewBadge from './NewBadge'
import KeyIcon from '@mui/icons-material/Key'
// import PasswordGeneratorDialog from './PasswordGeneratorDialog'
import FolderIcon from '@mui/icons-material/Folder'


const CURRENT_FEATURE_VERSION = '1.9.0' // 每次发布新功能时更新此版本号

// 在组件顶部添加状态
const Header = ({ onFavoriteClick, showFavorites, onBackupClick,handleOpenPasswordGenerator, onBatchOperationsClick, groupIds, group2Accounts }) => {

  const groupCount = groupIds?.length || 0
  const accountCount = Object.values(group2Accounts || {}).reduce((total, accounts) => total + accounts.length, 0)

  // const [openPasswordGenerator, setOpenPasswordGenerator] = React.useState(false)
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

  const [showNewFeatureDot, setShowNewFeatureDot] = useState(() => {
    return window.utools.dbStorage.getItem('has_viewed_new_features') !== CURRENT_FEATURE_VERSION
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

  // const handleOpenPasswordGenerator = () => {
  //   setOpenPasswordGenerator(true)
  // }

  // const handleClosePasswordGenerator = () => {
  //   setOpenPasswordGenerator(false)
  // }

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


  const [moreAnchorEl, setMoreAnchorEl] = React.useState(null)

  const handleMoreClick = (event) => {
    setMoreAnchorEl(event.currentTarget)
    if (showNewFeatureDot) {
      setShowNewFeatureDot(false)
      window.utools.dbStorage.setItem('has_viewed_new_features', CURRENT_FEATURE_VERSION)
    }
  }
  const handleMoreClose = () => {
    setMoreAnchorEl(null)
  }

  // 修改按钮部分
  return (
    <>
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
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              color: 'rgba(0, 0, 0, 0.6)',
              '& .stat-item': {
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }
            }}
          >
            <div className="stat-item">
              <FolderIcon className="text-gray-500" sx={{ fontSize: 16 }} />
              <span className="font-mono font-medium">全部分组：{groupCount}</span>
            </div>
            <div className="stat-item">
              <KeyIcon className="text-gray-500" sx={{ fontSize: 16 }} />
              <span className="font-mono font-medium">全部账号：{accountCount}</span>
            </div>
          </Typography>
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
          <Divider orientation="vertical" sx={{ margin: '0 5px', borderColor: 'rgba(0,0,0,0.08)', height: '16px' }} />
          <Button
            onClick={handleMoreClick}
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
              position: 'relative',
              '&::after': showNewFeatureDot ? {
                content: '""',
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '5px',
                height: '5px',
                backgroundColor: '#f44336',
                borderRadius: '50%'
              } : {}
            }}
          >
            <div className="rotate-90"> <MoreVertIcon /></div>
          </Button>
          <Menu
            anchorEl={moreAnchorEl}
            open={Boolean(moreAnchorEl)}
            onClose={handleMoreClose}
            sx={{

              '& .MuiPaper-root': {
                borderRadius: '8px',
                padding: '0 8px', // 设置内边距为8px
                minWidth: '160px', // 设置最小宽度为160px
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }
            }}
          >
            <MenuItem
              onClick={() => {
                handleMoreClose();
                handleOpenPasswordGenerator();
              }}
              sx={{ minHeight: '36px', borderRadius: '4px', paddingLeft: '8px' }}
            >
              <KeyIcon sx={{ mr: 1, fontSize: 18, color: 'rgba(0, 0, 0, 0.6)' }} />
              密码生成器 <NewBadge />
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMoreClose();
                onBatchOperationsClick();
              }}
              sx={{ minHeight: '36px', borderRadius: '4px', paddingLeft: '8px' }}
            >
              <svg t="1747277557580" className="icon mr-2" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3161" width="20" height="20"><path d="M774.144 340.992H238.592A114.688 114.688 0 0 0 123.904 455.68v307.2a114.688 114.688 0 0 0 114.688 114.688h535.552a114.688 114.688 0 0 0 114.688-114.688v-307.2a114.688 114.688 0 0 0-114.688-114.688z m-114.688 295.424h-125.952v126.464a27.136 27.136 0 1 1-54.784 0v-126.976H353.28a27.648 27.648 0 0 1 0-54.784h125.44V454.656a27.136 27.136 0 1 1 54.784 0v126.464h125.44a27.648 27.648 0 0 1 0 54.784zM331.264 229.888h358.4a25.6 25.6 0 0 0 0-51.2h-358.4a25.6 25.6 0 1 0 0 51.2zM228.864 313.856h563.2a25.6 25.6 0 0 0 0-51.2h-563.2a25.6 25.6 0 0 0 0 51.2z" fill="rgba(0, 0, 0, 0.6)" p-id="3162"></path></svg>
              帐号批量管理
              <NewBadge />
            </MenuItem>

            <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

            <MenuItem
              onClick={() => {
                handleMoreClose();
                onBackupClick();
              }}
              sx={{ minHeight: '36px', borderRadius: '4px', paddingLeft: '8px' }}
            >
              <BackupIcon sx={{ mr: 1, fontSize: 18, color: 'rgba(0, 0, 0, 0.6)' }} />
              备份设置
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleMoreClose();
                window.utools.shellOpenExternal(WEBDAV_DOCS_URL)
              }}
              sx={{ minHeight: '36px', borderRadius: '4px', paddingLeft: '8px' }}
            >
              <MenuBookOutlinedIcon sx={{ mr: 1, fontSize: 18, color: 'rgba(0, 0, 0, 0.6)' }} />
              使用手册
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleMoreClose();
                window.utools.shellOpenExternal(FEEDBACK_URL)
              }}
              sx={{ minHeight: '36px', borderRadius: '4px', paddingLeft: '8px' }}
            >
              <FeedbackIcon sx={{ mr: 1, fontSize: 18, color: 'rgba(0, 0, 0, 0.6)' }} />
              问题反馈
            </MenuItem>

            <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

            <MenuItem
              onClick={() => {
                handleMoreClose();
                window.utools.shellOpenExternal('https://github.com/CatsAndMice/password')
              }}
              sx={{ minHeight: '36px', borderRadius: '4px', paddingLeft: '8px' }}
            >
              <GitHubIcon sx={{ mr: 1, fontSize: 18, color: 'rgba(0, 0, 0, 0.6)' }} />
              开源地址
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </>
  )
}

export default Header
