import React, { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import RestoreIcon from '@mui/icons-material/Restore'
import FolderIcon from '@mui/icons-material/Folder'
import SettingsIcon from '@mui/icons-material/Settings'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CloseIcon from '@mui/icons-material/Close'

const BackupRestore = ({ buttonStyle }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [backupFiles, setBackupFiles] = useState([])
  const [restoring, setRestoring] = useState(false)
  const [restoreResult, setRestoreResult] = useState(null)
  const [currentBackupDir, setCurrentBackupDir] = useState('')
  const [showDirSettings, setShowDirSettings] = useState(false)
  const [newBackupDir, setNewBackupDir] = useState('')
  const [dirError, setDirError] = useState('')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedBackupPath, setSelectedBackupPath] = useState(null)

  // 获取当前备份目录
  useEffect(() => {
    if (dialogOpen) {
      setCurrentBackupDir(window.services.getBackupDir())
    }
  }, [dialogOpen])

  const handleOpenDialog = () => {
    const files = window.services.getBackupFiles()
    setBackupFiles(files)
    setDialogOpen(true)
    setCurrentBackupDir(window.services.getBackupDir())
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setRestoreResult(null)
    setShowDirSettings(false)
    setDirError('')
  }

  const handleRestoreBackup = async (backupPath) => {
    setRestoring(true)
    try {
      const result = await window.services.restoreBackup(backupPath)
      setRestoreResult(result)
    } catch (error) {
      setRestoreResult({
        success: false,
        message: typeof error === 'string' ? error : error.message || '恢复失败'
      })
    } finally {
      setRestoring(false)
    }
  }

  const handleSelectBackupDir = async () => {
    try {
      const result = await window.utools.showOpenDialog({
        title: '选择备份文件夹',
        properties: ['openDirectory', 'createDirectory']
      })

      if (result && result.length > 0) {
        setNewBackupDir(result[0])
        setDirError('')
      }
    } catch (error) {
      console.error('选择文件夹失败:', error)
    }
  }

  const handleSaveBackupDir = async () => {
    if (!newBackupDir) return

    try {
      await window.services.setBackupDir(newBackupDir)
      setCurrentBackupDir(newBackupDir)
      setShowDirSettings(false)
      setDirError('')

      // 刷新备份文件列表
      const files = window.services.getBackupFiles()
      setBackupFiles(files)
    } catch (error) {
      setDirError(error.message || '设置备份目录失败')
    }
  }

  const handleResetBackupDir = async () => {
    try {
      const defaultDir = await window.services.resetBackupDir()
      setCurrentBackupDir(defaultDir)
      setNewBackupDir('')
      setShowDirSettings(false)

      // 刷新备份文件列表
      const files = window.services.getBackupFiles()
      setBackupFiles(files)
    } catch (error) {
      setDirError(error.message || '重置备份目录失败')
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }


  const handleBackupClick = (path) => {
    setSelectedBackupPath(path)
    setConfirmDialogOpen(true)
  }

  const handleConfirmRestore = () => {
    setConfirmDialogOpen(false)
    handleRestoreBackup(selectedBackupPath)
  }


  return (
    <>
      <Button
        onClick={handleOpenDialog}
        fullWidth
        color='secondary'
        size='medium'
        variant='outlined'
        startIcon={<RestoreIcon />}
        sx={buttonStyle || {
          borderRadius: '12px',
          padding: '8px',
          marginTop: '8px',
          fontSize: '14px',
          textTransform: 'none'
        }}
      >
        导入已备份数据
      </Button>

      <Dialog
        open={dialogOpen}
        // onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            handleCloseDialog()
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            导入备份数据
            <Tooltip title="备份设置">
              <IconButton
                onClick={() => setShowDirSettings(!showDirSettings)}
                size="small"
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </div>
          <div>
            <IconButton
              onClick={handleCloseDialog}
              size="small"
              sx={{
                color: 'rgba(0, 0, 0, 0.54)',
                '&:hover': {
                  color: 'rgba(0, 0, 0, 0.87)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          {/* 备份目录设置 */}
          {showDirSettings ? (
            <div style={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, marginBottom: '10px' }}>
                备份文件存储位置
              </Typography>

              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={newBackupDir || currentBackupDir}
                onChange={(e) => setNewBackupDir(e.target.value)}
                placeholder="选择备份文件夹路径"
                sx={{ marginBottom: '10px' }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSelectBackupDir} edge="end">
                        <FolderIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {dirError && (
                <Alert severity="error" sx={{ marginBottom: '10px' }}>
                  {dirError}
                </Alert>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveBackupDir}
                  disabled={!newBackupDir || newBackupDir === currentBackupDir}
                >
                  保存设置
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleResetBackupDir}
                >
                  恢复默认
                </Button>
              </div>

              <Divider sx={{ margin: '20px 0' }} />
            </div>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: '#757575',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FolderIcon sx={{ fontSize: '1rem', marginRight: '5px' }} />
              当前备份位置: {currentBackupDir}
            </Typography>
          )}

          {restoreResult ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: restoreResult.success ? '#4caf50' : '#f44336'
            }}>
              <Typography variant="h6">{restoreResult.message}</Typography>
              {restoreResult.success && restoreResult.stats && (
                <Typography variant="body2" style={{ marginTop: '10px' }}>
                  已导入 {restoreResult.stats.groupCount} 个分组，
                  {restoreResult.stats.accountCount} 个账号
                </Typography>
              )}
            </div>
          ) : restoring ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <CircularProgress size={40} />
              <Typography style={{ marginTop: '10px' }}>正在导入数据...</Typography>
            </div>
          ) : backupFiles.length === 0 ? (
            <Typography style={{ padding: '20px', textAlign: 'center', color: '#757575' }}>
              没有找到可用的备份文件
            </Typography>
          ) : (
            <List sx={{ padding: '10px 0' }}>
              {backupFiles.map((file, index) => (
                <ListItem
                  key={file.filename}
                  button
                  onClick={() => handleBackupClick(file.path)}
                  sx={{
                    margin: '8px 0',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {formatDate(file.date)}
                        {index === 0 &&
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '12px',
                            color: '#2196F3',
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            最新
                          </span>
                        }
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: '#757575' }}>
                        文件大小: {formatFileSize(file.size)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            关闭
          </Button>
        </DialogActions>
      </Dialog>


      {/* 添加确认对话框 */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>确认恢复数据</DialogTitle>
        <DialogContent>
          <DialogContentText>
            恢复数据将会清空当前所有数据，确定要继续吗？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>取消</Button>
          <Button onClick={handleConfirmRestore} color="primary" autoFocus>
            确认恢复
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BackupRestore