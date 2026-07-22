import React from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import KeyIcon from '@mui/icons-material/Key'
import BackupIcon from '@mui/icons-material/Backup'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import FeedbackIcon from '@mui/icons-material/Feedback'
import GitHubIcon from '@mui/icons-material/GitHub'
import NewBadge from './NewBadge'
import { WEBDAV_DOCS_URL, FEEDBACK_URL } from "../utils/const"

/**
 * 头部"更多"下拉菜单组件
 * 包含密码生成器、批量管理、备份设置、使用手册、问题反馈、开源地址
 */
const HeaderMoreMenu = ({ anchorEl, open, onClose, showNewFeatureDot, onPasswordGenerator, onBatchOperations, onBackupClick }) => (
  <Menu anchorEl={anchorEl} open={open} onClose={onClose}
    sx={{ '& .MuiPaper-root': { borderRadius: '8px', padding: '0 8px', minWidth: '160px', boxShadow: 'var(--shadow-popup)' } }}>
    <MenuItem onClick={() => { onClose(); onPasswordGenerator() }}
      sx={{ minHeight: '36px', borderRadius: '4px', paddingLeft: '8px' }}>
      <KeyIcon sx={{ mr: 1, fontSize: 18, color: 'var(--color-text-secondary)' }} /> 密码生成器 <NewBadge />
    </MenuItem>
    <MenuItem onClick={() => { onClose(); onBatchOperations() }}
      sx={{ minHeight: '36px', borderRadius: '4px', paddingLeft: '8px' }}>
      <svg t="1747277557580" className="icon mr-2" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3161" width="20" height="20"><path d="M774.144 340.992H238.592A114.688 114.688 0 0 0 123.904 455.68v307.2a114.688 114.688 0 0 0 114.688 114.688h535.552a114.688 114.688 0 0 0 114.688-114.688v-307.2a114.688 114.688 0 0 0-114.688-114.688z m-114.688 295.424h-125.952v126.464a27.136 27.136 0 1 1-54.784 0v-126.976H353.28a27.648 27.648 0 0 1 0-54.784h125.44V454.656a27.136 27.136 0 1 1 54.784 0v126.464h125.44a27.648 27.648 0 0 1 0 54.784zM331.264 229.888h358.4a25.6 25.6 0 0 0 0-51.2h-358.4a25.6 25.6 0 1 0 0 51.2zM228.864 313.856h563.2a25.6 25.6 0 0 0 0-51.2h-563.2a25.6 25.6 0 0 0 0 51.2z" fill="var(--color-text-secondary)" p-id="3162"></path></svg>
      帐号批量管理 <NewBadge />
    </MenuItem>
    <Divider sx={{ borderColor: 'var(--color-divider)' }} />
    <MenuItem onClick={() => { onClose(); onBackupClick() }}
      sx={{ minHeight: '36px', borderRadius: '4px', paddingLeft: '8px' }}>
      <BackupIcon sx={{ mr: 1, fontSize: 18, color: 'var(--color-text-secondary)' }} /> 备份设置
    </MenuItem>
    <MenuItem onClick={() => { onClose(); window.utools.shellOpenExternal(WEBDAV_DOCS_URL) }}
      sx={{ minHeight: '36px', borderRadius: '4px', paddingLeft: '8px' }}>
      <MenuBookOutlinedIcon sx={{ mr: 1, fontSize: 18, color: 'var(--color-text-secondary)' }} /> 使用手册
    </MenuItem>
    <MenuItem onClick={() => { onClose(); window.utools.shellOpenExternal(FEEDBACK_URL) }}
      sx={{ minHeight: '36px', borderRadius: '4px', paddingLeft: '8px' }}>
      <FeedbackIcon sx={{ mr: 1, fontSize: 18, color: 'var(--color-text-secondary)' }} /> 问题反馈
    </MenuItem>
    <Divider sx={{ borderColor: 'var(--color-divider)' }} />
    <MenuItem onClick={() => { onClose(); window.utools.shellOpenExternal('https://github.com/CatsAndMice/password') }}
      sx={{ minHeight: '36px', borderRadius: '4px', paddingLeft: '8px' }}>
      <GitHubIcon sx={{ mr: 1, fontSize: 18, color: 'var(--color-text-secondary)' }} /> 开源地址
    </MenuItem>
  </Menu>
)

export default HeaderMoreMenu