import React from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SvgIcon from '@mui/material/SvgIcon'
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import LockIcon from '@mui/icons-material/Lock'
import TitleIcon from '@mui/icons-material/Title'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import { baseTextFieldStyle } from '../utils/formStyles'

function LinkSvgIcon() {
  return (
    <SvgIcon fontSize="small">
      <svg t="1742436154120" style={{ fill: 'var(--color-text-secondary)' }} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7012" width="20" height="20"><path d="M509.4 508.5m-469.5 0a469.5 469.5 0 1 0 939 0 469.5 469.5 0 1 0-939 0Z" p-id="7013"></path><path d="M617.9 467.2c-0.3-0.6-0.5-1.2-0.8-1.8-0.1-0.1-0.1-0.2-0.2-0.4-7.2-14.5-22.7-23.9-39.9-22.6-22.5 1.8-39.4 21.5-37.6 44 0.5 5.8 2.1 11.1 4.6 15.9 11.4 25.7 6.4 57-14.6 78.1l-110 110.2c-27.3 27.3-71.7 27.3-99 0-27.3-27.3-27.3-71.7 0-99l41-41-0.3-0.3c9.5-8.2 15-20.7 14-34.1-1.8-22.5-21.5-39.4-44-37.6-10.8 0.8-20.2 5.8-27 13.2l-0.1-0.1-41.8 41.8c-59.4 59.4-59.4 155.6 0 215 59.4 59.4 155.6 59.4 215 0l110.3-110.3c46.2-46.3 56.2-114.8 30.4-171z" fill="#FFFFFF" p-id="7014"></path><path d="M762.4 257.4c-59.4-59.4-155.6-59.4-215 0L437.1 367.7c-46.2 46.2-56.2 114.7-30.5 170.9 0.3 0.6 0.5 1.2 0.8 1.8 0.1 0.1 0.1 0.2 0.2 0.4 7.2 14.5 22.7 23.9 39.9 22.6 22.5-1.8 39.4-21.5 37.6-44-0.5-5.8-2.1-11.1-4.6-15.9-11.4-25.7-6.4-57 14.6-78.1l110.1-110.1c27.3-27.3 71.7-27.3 99 0 27.3 27.3 27.3 71.7 0 99l-41 41 0.3 0.3c-9.5 8.2-15 20.7-14 34.1 1.8 22.5 21.5 39.4 44 37.6 10.8-0.8 20.2-5.8 27-13.2l0.1 0.1 41.8-41.8c59.3-59.4 59.3-155.7 0-215z" fill="#FFFFFF" p-id="7015"></path></svg>
    </SvgIcon>
  )
}

/**
 * 通用表单字段渲染组件，封装 MUI TextField 的统一样式和行为
 */
function FormTextField({ label, field, value, onChange, isLocked, startIcon, endAdornment, type, multiline, minRows, maxRows, variant, className }) {
  return (
    <TextField
      type={type || 'text'}
      fullWidth
      label={label}
      onChange={onChange}
      value={value}
      disabled={isLocked}
      variant={variant || 'standard'}
      multiline={multiline}
      minRows={minRows}
      maxRows={maxRows}
      className={className}
      InputProps={{
        startAdornment: startIcon ? <InputAdornment position='start'>{startIcon}</InputAdornment> : undefined,
        endAdornment: endAdornment ? <InputAdornment position='end'>{endAdornment}</InputAdornment> : undefined,
      }}
      InputLabelProps={multiline ? { shrink: true, sx: { color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: 500 } } : undefined}
      sx={{
        ...baseTextFieldStyle,
        opacity: isLocked ? 0.9 : 1,
        transition: 'all 0.2s',
        ...(multiline ? {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'var(--color-bg-card)', borderRadius: '8px',
            '& fieldset': { borderColor: 'var(--color-divider)' },
            '&:hover fieldset': { borderColor: 'var(--color-primary)' },
            '&.Mui-focused fieldset': { borderColor: 'var(--color-primary)', borderWidth: '1px' },
          },
          '& .MuiInputBase-input': { fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.6', letterSpacing: '0.2px' }
        } : {})
      }}
    />
  )
}

/**
 * 标题字段组件
 */
export function TitleField({ value, onChange, isLocked, isMacOs }) {
  return (
    <FormTextField
      label='标题' field='title' value={value} onChange={onChange} isLocked={isLocked}
      startIcon={<TitleIcon className='account-form-prev-icon' />}
    />
  )
}

/**
 * 用户名字段组件，含复制按钮和快捷键提示
 */
export function UsernameField({ value, onChange, isLocked, isMacOs, onCopy }) {
  return (
    <FormTextField
      label='用户名' field='username' value={value} onChange={onChange} isLocked={isLocked}
      startIcon={<AccountBoxIcon className='account-form-prev-icon' />}
      endAdornment={
        <Tooltip title={'复制用户名，快捷键 ' + (isMacOs ? 'Command' : 'Ctrl') + '+U'} placement='top-end'>
          <IconButton tabIndex={-1} onClick={onCopy} size='small'><ContentCopyIcon /></IconButton>
        </Tooltip>
      }
    />
  )
}

/**
 * 密码字段组件，含明文切换、随机密码生成、复制功能
 */
export function PasswordField({ value, onChange, isLocked, isMacOs, passwordEye, onToggleEye, onCopy, onShowRandom }) {
  return (
    <FormTextField
      label='密码' field='password' value={value} onChange={onChange} isLocked={isLocked}
      type={passwordEye ? 'text' : 'password'}
      startIcon={<LockIcon className='account-form-prev-icon' />}
      endAdornment={
        <>
          <Tooltip title={passwordEye ? '关闭明文' : '明文显示'} placement='top'>
            <IconButton tabIndex={-1} onClick={onToggleEye} size='small'>
              {passwordEye ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
          <span className='account-form-icon-divider' />
          <Tooltip title={isLocked ? '解锁后可生成随机密码' : '生成随机密码'} placement='top'>
            <span>
              <IconButton tabIndex={-1} onClick={onShowRandom} size='small' disabled={isLocked}
                sx={{ '&.Mui-disabled': { color: 'var(--color-text-disabled)' } }}>
                <ShuffleIcon />
              </IconButton>
            </span>
          </Tooltip>
          <span className='account-form-icon-divider' />
          <Tooltip title={'复制密码，快捷键 ' + (isMacOs ? 'Command' : 'Ctrl') + '+P'} placement='top-end'>
            <IconButton tabIndex={-1} onClick={onCopy} size='small'><ContentCopyIcon /></IconButton>
          </Tooltip>
        </>
      }
    />
  )
}

/**
 * 链接字段组件，含浏览器打开、自动填充、复制链接功能
 */
export function LinkField({ value, onChange, isLocked, onOpenLink, onAutoFill, onCopy }) {
  return (
    <FormTextField
      label='链接' field='link' value={value} onChange={onChange} isLocked={isLocked}
      startIcon={<LinkSvgIcon />}
      endAdornment={
        <>
          <Tooltip title='浏览器中打开' placement='top'>
            <IconButton tabIndex={-1} onClick={onOpenLink} size='small'><OpenInBrowserIcon fontSize="small" /></IconButton>
          </Tooltip>
          <span className='account-form-icon-divider' />
          <Tooltip title='自动填充账号密码' placement='top'>
            <IconButton tabIndex={-1} onClick={onAutoFill} size='small'><AutoFixHighIcon fontSize="small" /></IconButton>
          </Tooltip>
          <span className='account-form-icon-divider' />
          <Tooltip title='复制链接' placement='top-end'>
            <IconButton tabIndex={-1} onClick={onCopy} size='small'><ContentCopyIcon fontSize="small" /></IconButton>
          </Tooltip>
        </>
      }
    />
  )
}

/**
 * 说明字段组件，多行文本输入
 */
export function RemarkField({ value, onChange, isLocked }) {
  return (
    <FormTextField
      label='说明' field='remark' value={value} onChange={onChange} isLocked={isLocked}
      multiline minRows={5} maxRows={15} variant='outlined' className='account-form-remark'
    />
  )
}