import React, { useState, useEffect } from 'react'
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

const BackupSettings = ({ onClose, showMessage }) => {
    const [currentBackupDir, setCurrentBackupDir] = useState('')
    const [newBackupDir, setNewBackupDir] = useState('')
    const [dirError, setDirError] = useState('')
    const [backupFiles, setBackupFiles] = useState([])
    const [backupInProgress, setBackupInProgress] = useState(false)

    // 获取当前备份目录和备份文件列表
    useEffect(() => {
        setCurrentBackupDir(window.services.getBackupDir())
        refreshBackupFiles()
    }, [])

    const refreshBackupFiles = () => {
        const files = window.services.getBackupFiles()
        setBackupFiles(files)
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
            setDirError('')
            showMessage('备份目录设置成功', 'success')
            refreshBackupFiles()
        } catch (error) {
            setDirError(error.message || '设置备份目录失败')
        }
    }

    const handleResetBackupDir = async () => {
        try {
            const defaultDir = await window.services.resetBackupDir()
            setCurrentBackupDir(defaultDir)
            setNewBackupDir('')
            showMessage('已恢复默认备份目录', 'success')
            refreshBackupFiles()
        } catch (error) {
            setDirError(error.message || '重置备份目录失败')
        }
    }

    const handleManualBackup = async () => {
        setBackupInProgress(true)
        try {
            const result = await window.services.autoBackup(true)
            if (result) {
                showMessage('手动备份成功', 'success')
                refreshBackupFiles()
            } else {
                showMessage('备份失败，请检查备份目录权限', 'error')
            }
        } catch (error) {
            showMessage('备份过程中出错: ' + error.message, 'error')
        } finally {
            setBackupInProgress(false)
        }
    }



    return (
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

            <Divider sx={{ margin: '20px 0' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    手动备份
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<BackupIcon />}
                    onClick={handleManualBackup}
                    disabled={backupInProgress}
                >
                    立即备份
                </Button>
            </Box>

            <Typography variant="body2" sx={{ color: '#757575', marginBottom: '10px' }}>
                最近备份文件 ({backupFiles.length})
            </Typography>

            {backupFiles.length > 0 ? (
                <Box sx={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px', padding: '8px'
                }}>
                    {backupFiles.map((file, index) => (
                        <Box key={index} sx={{
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
                            onClick={() => window.utools.shellOpenPath(file.path)}
                        >
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                {formatDate(file.date)}
                                {index === 0 && (
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
                                )}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#757575' }}>
                                {formatFileSize(file.size)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            ) : (
                <Typography variant="body2" sx={{ color: '#757575', textAlign: 'center', padding: '20px' }}>
                    暂无备份文件
                </Typography>
            )}

            <Typography variant="body2" sx={{ color: '#757575', marginTop: '20px' }}>
                * 登录时若超过1小时未备份，系统将自动备份
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
                * 系统最多保留最近7个备份文件
            </Typography>
        </Box>
    )
}

export default BackupSettings