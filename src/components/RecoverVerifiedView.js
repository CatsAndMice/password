import React from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

/**
 * 密码找回验证成功后的密码展示视图
 * 显示完整密码并支持复制和返回登录
 */
function RecoverVerifiedView({ fullPassword, onCopy, onBack }) {
  return (
    <>
      <div className="text-[15px] text-text-primary leading-relaxed mb-6 text-center">
        验证成功！您的完整密码是：
      </div>
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="text-2xl font-bold text-text-primary px-6 py-3 bg-bg-card-hover rounded-lg tracking-[4px]">
          {fullPassword}
        </div>
        <IconButton onClick={onCopy}><ContentCopyIcon /></IconButton>
      </div>
      <Button variant="contained" fullWidth onClick={onBack}
        sx={{ textTransform: 'none', padding: '10px', fontSize: '15px', background: 'var(--color-primary)' }}>
        返回登录
      </Button>
    </>
  )
}

export default RecoverVerifiedView