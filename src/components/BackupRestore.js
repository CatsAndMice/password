import React, { useState, useEffect } from 'react'
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

const BackupRestore = ({ buttonStyle, onRestore }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [backupFiles, setBackupFiles] = useState([])
  const [restoring, setRestoring] = useState(false)
  const [restoreResult, setRestoreResult] = useState(null)
  const [currentBackupDir, setCurrentBackupDir] = useState('')
  // 删除 showDirSettings 状态
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
    // 删除 setShowDirSettings(false)
    setDirError('')
    onRestore()
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
      // 删除 setShowDirSettings(false)
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
      // 删除 setShowDirSettings(false)
      setDirError('')
      // 刷新备份文件列表
      const files = window.services.getBackupFiles()
      setBackupFiles(files)
    } catch (error) {
      setDirError(error.message || '重置备份目录失败')
    }
  }


  const handleBackupClick = (path) => {
    setSelectedBackupPath(path)
    setConfirmDialogOpen(true)
  }

  const handleConfirmRestore = () => {
    setConfirmDialogOpen(false)
    handleRestoreBackup(selectedBackupPath)
  }


  // 添加这些渲染函数
  const renderRestoreResult = () => {
    if (!restoreResult) return null;

    return (
      <>
        <Typography
          variant="h6"
          sx={{ color: restoreResult.success ? '#4caf50' : '#f44336' }}
        >
          {restoreResult.message}
        </Typography>
        {restoreResult.success && restoreResult.stats && (
          <Typography variant="body2" sx={{ marginTop: '10px' }}>
            已导入 {restoreResult.stats.groupCount} 个分组，
            {restoreResult.stats.accountCount} 个账号
          </Typography>
        )}
      </>
    );
  };

  const renderLoadingState = () => {
    if (!restoring) return null;

    return (
      <>
        <CircularProgress size={40} />
        <Typography sx={{ marginTop: '10px' }}>正在导入数据...</Typography>
      </>
    );
  };

  const renderEmptyState = () => {
    if (backupFiles.length > 0) return null;

    return (
      <Typography sx={{ color: '#757575' }}>
        没有找到可用的备份文件
      </Typography>
    );
  };

  const renderBackupFilesList = () => {
    if (backupFiles.length === 0) return null;

    // 提取"最新"标签样式为常量
    const latestTagStyle = {
      marginLeft: '8px',
      fontSize: '12px',
      color: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      padding: '2px 6px',
      borderRadius: '4px'
    };

    return (
      <Box sx={{ textAlign: 'left' }}>
        <Typography variant="body2" sx={{ color: '#757575', marginBottom: '10px' }}>
          可用备份文件 ({backupFiles.length})
        </Typography>
        <Box sx={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '8px'
        }}>
          {backupFiles.map((file, index) => (
            <Box
              key={file.filename}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px',
                borderBottom: index < backupFiles.length - 1 ? '1px solid #f0f0f0' : 'none',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  borderRadius: '4px'
                },
              }}
              onClick={() => handleBackupClick(file.path)}
            >
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                {formatDate(file.date)}
                {index === 0 && (
                  <span style={latestTagStyle}>
                    最新
                  </span>
                )}
              </Typography>
              <Typography variant="body2" sx={{ color: '#757575' }}>
                {formatFileSize(file.size)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };


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
          <Typography variant="h6">导入备份数据</Typography>
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
        </DialogTitle>
        <DialogContent>
          <Box sx={{ padding: '10px 0' }}>
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

            <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
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
            </Box>
            <Divider sx={{ margin: '0' }} />
          </Box>


          <Box sx={{ padding: '10px 0 20px 0', textAlign: 'center' }}>
            {restoreResult ? renderRestoreResult() :
              restoring ? renderLoadingState() :
                backupFiles.length === 0 ? renderEmptyState() :
                  renderBackupFilesList()}
          </Box>
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