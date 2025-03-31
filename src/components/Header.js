import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import StarIcon from '@mui/icons-material/Star'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const Header = ({ onFavoriteClick, showFavorites }) => (
  <AppBar
    position="static"
    elevation={0}
    sx={{
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(8px)'
    }}
  >
    <Toolbar variant="dense" sx={{ minHeight: '48px', padding: '0 16px !important' }}>
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
            background: 'linear-gradient(45deg, rgba(0, 0, 0, 0.87), rgba(0, 0, 0, 0.6))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 1px 1px rgba(0,0,0,0.03)'
          }
        }}
      >
        <span>我的密码库</span>
      </Typography>
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
          // backgroundColor: showFavorites ? 'rgba(33, 150, 243, 0.08)' : 'transparent'
        }}
      >
       常用账号
      </Button>
    </Toolbar>
  </AppBar>
)

export default Header