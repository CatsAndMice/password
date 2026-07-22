/**
 * 表单字段共享样式
 * 统一 MUI TextField 的边框、字体、图标、禁用状态等视觉样式
 */
export const baseTextFieldStyle = {
  '& .MuiInput-underline:before': { borderBottomColor: 'var(--color-divider)' },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'var(--color-primary)' },
  '& .MuiInputLabel-root': { color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: 500 },
  '& .MuiInputBase-input': { fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: 500, letterSpacing: '0.2px' },
  '& .account-form-prev-icon': { fontSize: '20px', color: 'var(--color-text-secondary)' },
  '& .MuiIconButton-root': { padding: '4px', '& .MuiSvgIcon-root': { fontSize: '18px' } },
  '& .account-form-icon-divider': { margin: '0 4px', width: '1px', height: '20px', backgroundColor: 'var(--color-divider)' },
  '& .Mui-disabled': {
    '& .MuiInputBase-input': { color: 'var(--color-text-secondary)', WebkitTextFillColor: 'var(--color-text-secondary)', cursor: 'default' },
    '& .account-form-prev-icon': { color: 'var(--color-text-secondary)' },
    '& .MuiInput-underline:before': { borderBottomStyle: 'dotted', borderBottomColor: 'var(--color-border)' },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'var(--color-border)' }
  }
}
