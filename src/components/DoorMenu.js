import React from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import EditIcon from '@mui/icons-material/Edit'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

/**
 * 开门密码选项菜单
 * 提供修改密码和找回密码（需要原始密码记录才显示）两个入口
 */
const DoorMenu = ({ anchorEl, open, onClose, canRecover, onResetClick, onRecoverClick }) => (
  <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={onClose}
    PaperProps={{
      elevation: 3,
      sx: {
        mt: 1.5, overflow: 'visible', filter: 'drop-shadow(var(--shadow-popup))',
        borderRadius: '12px', minWidth: 180,
        '&:before': {
          content: '""', display: 'block', position: 'absolute', top: 0, right: 14,
          width: 10, height: 10, bgcolor: 'var(--color-bg-card)', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0,
        },
      }
    }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
    <MenuItem onClick={() => { onClose(); onResetClick() }}
      sx={{ fontSize: '14px', py: 1.5, px: 2.5, borderRadius: '8px', mx: 1, my: 0.5, gap: 1.5, color: 'var(--color-text-primary)', transition: 'all 0.2s ease', '&:hover': { backgroundColor: 'var(--color-primary-light2)' } }}>
      <EditIcon sx={{ fontSize: 18, color: 'var(--color-primary)' }} /> 修改密码
    </MenuItem>
    {canRecover && (
      <MenuItem onClick={() => { onClose(); onRecoverClick() }}
        sx={{ fontSize: '14px', py: 1.5, px: 2.5, borderRadius: '8px', mx: 1, my: 0.5, gap: 1.5, color: 'var(--color-text-primary)', transition: 'all 0.2s ease', '&:hover': { backgroundColor: 'var(--color-primary-light2)' } }}>
        <HelpOutlineIcon sx={{ fontSize: 18, color: 'var(--color-warning)' }} /> 找回密码
      </MenuItem>
    )}
  </Menu>
)

export default DoorMenu
