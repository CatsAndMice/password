import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import StarIcon from '@mui/icons-material/Star'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import BackupIcon from '@mui/icons-material/Backup'

const Header = ({ onFavoriteClick, showFavorites,onBackupClick }) => (
  <AppBar
    position="static"
    elevation={0}
    sx={{
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
            fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei"',
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
    </Toolbar>
  </AppBar>
)

export default Header