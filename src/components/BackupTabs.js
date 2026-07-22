import React from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import FolderIcon from '@mui/icons-material/Folder'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import BackupIcon from '@mui/icons-material/Backup'
import { formatDate, formatFileSize } from '../utils/formatUtils'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import { WEBDAV_DOCS_URL } from "../utils/const"
import D1API from '@/api/d1'

const latestTagStyle = { marginLeft: '8px', fontSize: '12px', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', padding: '2px 6px', borderRadius: '4px' }

/**
 * 本地备份标签页
 */
function BackupLocalTab({ currentBackupDir, newBackupDir, dirError, backupFiles, backupInProgress, onSelectDir, onChangeDir, onSaveDir, onResetDir, onManualBackup }) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 500, marginBottom: '10px' }}>备份文件存储位置</Typography>
      <TextField fullWidth variant="outlined" size="small" value={newBackupDir || currentBackupDir}
        onChange={(e) => onChangeDir(e.target.value)} placeholder="选择备份文件夹路径" sx={{ marginBottom: '10px' }}
        InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={onSelectDir} edge="end"><FolderIcon /></IconButton></InputAdornment>) }} />
      {dirError && <Alert severity="error" sx={{ marginBottom: '10px' }}>{dirError}</Alert>}
      <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Button variant="contained" color="primary" onClick={onSaveDir} disabled={!newBackupDir || newBackupDir === currentBackupDir}>保存设置</Button>
        <Button variant="outlined" onClick={onResetDir}>恢复默认</Button>
      </Box>
      <Divider sx={{ margin: '20px 0' }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>手动备份</Typography>
        <Button variant="contained" color="primary" startIcon={<BackupIcon />} onClick={onManualBackup} disabled={backupInProgress}>立即备份</Button>
      </Box>
      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', marginBottom: '10px' }}>最近备份文件 ({backupFiles.length})</Typography>
      {backupFiles.length > 0 ? (
        <Box sx={{ border: '1px solid var(--color-border)', borderRadius: '4px', padding: '8px' }}>
          {backupFiles.map((file, index) => (
            <Box key={index} onClick={() => window.utools.shellOpenPath(file.path)} sx={{
              display: 'flex', justifyContent: 'space-between', padding: '8px',
              borderBottom: index < backupFiles.length - 1 ? '1px solid var(--color-border-light)' : 'none',
              cursor: 'pointer', '&:hover': { backgroundColor: 'var(--color-bg-overlay)', borderRadius: '4px' }
            }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                {formatDate(file.date)}{index === 0 && <span style={latestTagStyle}>最新</span>}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>{formatFileSize(file.size)}</Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '20px' }}>暂无备份文件</Typography>
      )}
      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', marginTop: '20px' }}>* 登录时若超过1小时未备份，系统将自动备份</Typography>
      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>* 系统最多保留最近7个备份文件</Typography>
    </Box>
  )
}

/**
 * WebDAV云备份标签页
 */
function BackupWebdavTab({ webdavConfig, showWebdavSwitch, onConfigChange, onSave, onToggle }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Box className="flex items-baseline space-x-2">
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>WebDAV 云备份配置</Typography>
          <Typography component="a" variant="body2" onClick={() => window.utools.shellOpenExternal(WEBDAV_DOCS_URL)}
            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, cursor: 'pointer', fontSize: '12px' }}>
            （查看使用教程）
          </Typography>
        </Box>
        {showWebdavSwitch && (
          <FormControlLabel
            control={<Switch checked={webdavConfig.enabled} onChange={(e) => onToggle(e.target.checked)} />}
            label={<Typography variant="body2">{webdavConfig.enabled ? '已启用' : '已停用'}</Typography>}
            sx={{ marginRight: 0 }} />
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
        <TextField fullWidth size="small" label="WebDAV 服务器地址" value={webdavConfig.url}
          onChange={(e) => onConfigChange(prev => ({ ...prev, url: e.target.value }))} placeholder="https://dav.jianguoyun.com/dav/" />
        <TextField fullWidth size="small" label="用户名" value={webdavConfig.username}
          onChange={(e) => onConfigChange(prev => ({ ...prev, username: e.target.value }))} />
        <TextField fullWidth size="small" type="password" label="密码" value={webdavConfig.password}
          onChange={(e) => onConfigChange(prev => ({ ...prev, password: e.target.value }))} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button variant="contained" onClick={onSave} disabled={!webdavConfig.url || !webdavConfig.username || !webdavConfig.password}>保存 WebDAV 配置</Button>
          <Button variant="outlined" onClick={async () => {
            try { await window.services.testWebdavConnection(webdavConfig); showMessage('连接测试成功', 'success') } catch (error) { showMessage(error.message, 'error') }
          }} disabled={!webdavConfig.url || !webdavConfig.username || !webdavConfig.password}>测试连接</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>* WebDAV 云备份支持坚果云等支持 WebDAV 协议的网盘服务</Typography>
      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>* 系统最多保留最近7个备份文件</Typography>
    </Box>
  )
}

export { BackupLocalTab, BackupWebdavTab }