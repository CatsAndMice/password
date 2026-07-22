import React from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'

const ShareButton = ({ onClick }) => (
  <Tooltip
    title="分享账号信息"
    placement="left"
    sx={{
      '& .MuiTooltip-tooltip': {
        fontSize: '12px',
        padding: '4px 8px',
        backgroundColor: 'rgba(97, 97, 97, 0.9)',
        borderRadius: '4px'
      }
    }}
  >
    <IconButton
      onClick={onClick}
      sx={{
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        width: '32px',
        height: '32px',
        backgroundColor: 'var(--color-bg-card)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: 'var(--shadow-popup)',
        '&:hover': {
          backgroundColor: 'var(--color-bg-card)',
          boxShadow: 'var(--shadow-popup)',
        },
        '&:active': {
          transform: 'scale(0.96)',
          boxShadow: '0 1px 4px var(--color-divider)',
        },
        zIndex: 1000,
      }}
    >
      <ShareOutlinedIcon sx={{
        fontSize: 16,
        color: 'var(--color-text-primary)'
      }} />
    </IconButton>
  </Tooltip>
)

export default ShareButton