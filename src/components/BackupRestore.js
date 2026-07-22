import React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import RestoreIcon from '@mui/icons-material/Restore'
import FolderIcon from '@mui/icons-material/Folder'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CloseIcon from '@mui/icons-material/Close'
import { formatDate, formatFileSize } from '../utils/formatUtils'
import Box from '@mui/material/Box'
import { WEBDAV_DOCS_URL } from "../utils/const"
import D1API from '@/api/d1'

const latestTagStyle = { marginLeft: '8px', fontSize: '12px', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', padding: '2px 6px', borderRadius: '4px' }

/**
 * 备份恢复组件
 * 从本地备份文件中选择并恢复数据，支持自定义备份目录
 */
const BackupRestore = ({ buttonStyle, onRestore }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [backupFiles, setBackupFiles] = React.useState([])
  const [restoring, setRestoring] = React.useState(false)
  const [restoreResult, setRestoreResult] = React.useState(null)
  const [currentBackupDir, setCurrentBackupDir] = React.useState('')
  const [newBackupDir, setNewBackupDir] = React.useState('')
  const [dirError, setDirError] = React.useState('')
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false)
  const [selectedBackupPath, setSelectedBackupPath] = React.useState(null)

  React.useEffect(() => { if (dialogOpen) setCurrentBackupDir(window.services.getBackupDir()) }, [dialogOpen])

  const handleOpenDialog = () => {
    setBackupFiles(window.services.getBackupFiles())
    setDialogOpen(true)
    setCurrentBackupDir(window.services.getBackupDir())
  }

  const handleCloseDialog = () => {
    setDialogOpen(false); setRestoreResult(null); setDirError(''); onRestore()
  }

  const handleRestoreBackup = async (backupPath) => {
    setRestoring(true)
    try {
      const result = await window.services.restoreBackup(backupPath)
      setRestoreResult(result)
      D1API.trackEvent({ message: '数据恢复成功' })
    } catch (error) {
      const message = typeof error === 'string' ? error : error.message || '恢复失败'
      setRestoreResult({ success: false, message })
      D1API.trackEvent({ message })
    } finally { setRestoring(false) }
  }

  const handleSelectBackupDir = async () => {
    try {
      const result = await window.utools.showOpenDialog({ title: '选择备份文件夹', properties: ['openDirectory', 'createDirectory'] })
      if (result && result.length > 0) { setNewBackupDir(result[0]); setDirError('') }
    } catch (error) { console.error('选择文件夹失败:', error) }
  }

  const handleSaveBackupDir = async () => {
    if (!newBackupDir) return
    try {
      await window.services.setBackupDir(newBackupDir)
      setCurrentBackupDir(newBackupDir); setDirError('')
      setBackupFiles(window.services.getBackupFiles())
    } catch (error) { setDirError(error.message || '设置备份目录失败') }
  }

  const handleResetBackupDir = async () => {
    try {
      const defaultDir = await window.services.resetBackupDir()
      setCurrentBackupDir(defaultDir); setNewBackupDir(''); setDirError('')
      setBackupFiles(window.services.getBackupFiles())
    } catch (error) { setDirError(error.message || '重置备份目录失败') }
  }

  const handleBackupClick = (path) => { setSelectedBackupPath(path); setConfirmDialogOpen(true) }
  const handleConfirmRestore = () => { setConfirmDialogOpen(false); handleRestoreBackup(selectedBackupPath) }

  return (
    <>
      <Button onClick={handleOpenDialog} fullWidth color='secondary' size='medium' variant='outlined' startIcon={<RestoreIcon />}
        sx={buttonStyle || { borderRadius: '12px', padding: '8px', marginTop: '8px', fontSize: '14px', textTransform: 'none' }}>
        导入已备份数据
      </Button>

      <Dialog open={dialogOpen} maxWidth="sm" fullWidth disableEscapeKeyDown
        onClose={(event, reason) => { if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') handleCloseDialog() }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '8px' }}>
          <Typography variant="h6">导入备份数据</Typography>
          <IconButton onClick={handleCloseDialog} size="small" sx={{ color: 'var(--color-text-disabled)', '&:hover': { color: 'var(--color-text-primary)' } }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ padding: '10px 0' }}>
            <Box className="flex items-baseline space-x-2">
              <Typography variant="subtitle1" sx={{ fontWeight: 500, marginBottom: '10px' }}>备份文件存储位置</Typography>
              <Typography component="a" variant="body2" onClick={() => window.utools.shellOpenExternal(WEBDAV_DOCS_URL)}
                sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, cursor: 'pointer', fontSize: '12px' }}>
                （查看使用教程）
              </Typography>
            </Box>
            <TextField fullWidth variant="outlined" size="small" value={newBackupDir || currentBackupDir}
              onChange={(e) => setNewBackupDir(e.target.value)} placeholder="选择备份文件夹路径" sx={{ marginBottom: '10px' }}
              InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={handleSelectBackupDir} edge="end"><FolderIcon /></IconButton></InputAdornment>) }} />
            {dirError && <Alert severity="error" sx={{ marginBottom: '10px' }}>{dirError}</Alert>}
            <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <Button variant="contained" color="primary" onClick={handleSaveBackupDir} disabled={!newBackupDir || newBackupDir === currentBackupDir}>保存设置</Button>
              <Button variant="outlined" onClick={handleResetBackupDir}>恢复默认</Button>
            </Box>
            <Divider sx={{ margin: '0' }} />
          </Box>

          <Box sx={{ padding: '10px 0 20px 0', textAlign: 'center' }}>
            {restoreResult ? (
              <>
                <Typography variant="h6" sx={{ color: restoreResult.success ? 'var(--color-success)' : 'var(--color-error)' }}>{restoreResult.message}</Typography>
                {restoreResult.success && restoreResult.stats && (
                  <Typography variant="body2" sx={{ marginTop: '10px' }}>已导入 {restoreResult.stats.groupCount} 个分组，{restoreResult.stats.accountCount} 个账号</Typography>
                )}
              </>
            ) : restoring ? (
              <><CircularProgress size={40} /><Typography sx={{ marginTop: '10px' }}>正在导入数据...</Typography></>
            ) : backupFiles.length === 0 ? (
              <Typography sx={{ color: 'var(--color-text-secondary)' }}>没有找到可用的备份文件</Typography>
            ) : (
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', marginBottom: '10px' }}>可用备份文件 ({backupFiles.length})</Typography>
                <Box sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '8px' }}>
                  {backupFiles.map((file, index) => (
                    <Box key={file.filename} onClick={() => handleBackupClick(file.path)} sx={{
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
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={handleCloseDialog} color="primary">关闭</Button></DialogActions>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>确认恢复数据</DialogTitle>
        <DialogContent><DialogContentText>恢复数据将会清空当前所有数据，确定要继续吗？</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>取消</Button>
          <Button onClick={handleConfirmRestore} color="primary" autoFocus>确认恢复</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BackupRestore