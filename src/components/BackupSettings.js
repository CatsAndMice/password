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
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import { WEBDAV_DOCS_URL } from "../utils/const"
import D1API from '@/api/d1'

const BackupSettings = ({ onClose, showMessage }) => {
    const [currentBackupDir, setCurrentBackupDir] = useState('')
    const [newBackupDir, setNewBackupDir] = useState('')
    const [dirError, setDirError] = useState('')
    const [backupFiles, setBackupFiles] = useState([])
    const [backupInProgress, setBackupInProgress] = useState(false)
    const [webdavConfig, setWebdavConfig] = useState({
        url: '',
        username: '',
        password: '',
        enabled: false
    })
    const [activeTab, setActiveTab] = useState(0)

    const [showWebdavSwitch, setShowWebdavSwitch] = useState(false)

    // 获取当前配置
    useEffect(() => {
        setCurrentBackupDir(window.services.getBackupDir())
        refreshBackupFiles()
        const config = window.services.getWebdavConfig()
        if (config) {
            setWebdavConfig(config)
            setShowWebdavSwitch(true)
        }
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



    const handleSaveWebdav = async () => {
        try {
            // 先测试连接
            await window.services.testWebdavConnection(webdavConfig)
            // 第一次保存时自动启用
            const configToSave = {
                ...webdavConfig,
                enabled: !showWebdavSwitch ? true : webdavConfig.enabled
            }
            await window.services.setWebdavConfig(configToSave)
            setWebdavConfig(configToSave)
            setShowWebdavSwitch(true)
            showMessage('WebDAV配置保存成功', 'success')
            D1API.trackEvent({ message: 'WebDAV配置保存成功' })
        } catch (error) {
            // 连接测试失败或保存失败时的错误处理
            showMessage(error.message || 'WebDAV配置验证失败', 'error')
        }
    }

    const renderLocalBackup = () => (
        <Box>
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


    const handleWebdavToggle = async (checked) => {
        try {
            const newConfig = { ...webdavConfig, enabled: checked }
            await window.services.setWebdavConfig(newConfig)
            setWebdavConfig(newConfig)
            showMessage(checked ? 'WebDAV云备份已启用' : 'WebDAV云备份已停用', 'success')
        } catch (error) {
            showMessage('设置失败: ' + error.message, 'error')
            // 恢复原状态
            setWebdavConfig(prev => ({ ...prev, enabled: !checked }))
        }
    }


    const renderWebDAVBackup = () => (
        <Box>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
            }}>
                <Box className="flex items-baseline space-x-2" >
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        WebDAV 云备份配置
                    </Typography>
                    <Typography
                        component="a"
                        variant="body2"
                        onClick={() => window.utools.shellOpenExternal(WEBDAV_DOCS_URL)}
                        sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                                textDecoration: 'underline'
                            },
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        （查看使用教程）
                    </Typography>
                </Box>
                {showWebdavSwitch && (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={webdavConfig.enabled}
                                onChange={(e) => handleWebdavToggle(e.target.checked)}
                            />
                        }
                        label={
                            <Typography variant="body2">
                                {webdavConfig.enabled ? '已启用' : '已停用'}
                            </Typography>
                        }
                        sx={{ marginRight: 0 }}
                    />
                )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                <TextField
                    fullWidth
                    size="small"
                    label="WebDAV 服务器地址"
                    value={webdavConfig.url}
                    onChange={(e) => setWebdavConfig(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://dav.jianguoyun.com/dav/"
                />
                <TextField
                    fullWidth
                    size="small"
                    label="用户名"
                    value={webdavConfig.username}
                    onChange={(e) => setWebdavConfig(prev => ({ ...prev, username: e.target.value }))}
                />
                <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="密码"
                    value={webdavConfig.password}
                    onChange={(e) => setWebdavConfig(prev => ({ ...prev, password: e.target.value }))}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Button
                        variant="contained"
                        onClick={handleSaveWebdav}
                        disabled={!webdavConfig.url || !webdavConfig.username || !webdavConfig.password}
                    >
                        保存 WebDAV 配置
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={async () => {
                            try {
                                await window.services.testWebdavConnection(webdavConfig)
                                showMessage('连接测试成功', 'success')
                            } catch (error) {
                                showMessage(error.message, 'error')
                            }
                        }}
                        disabled={!webdavConfig.url || !webdavConfig.username || !webdavConfig.password}
                    >
                        测试连接
                    </Button>
                </Box>
            </Box>

            <Typography variant="body2" sx={{ color: '#757575' }}>
                * WebDAV 云备份支持坚果云等支持 WebDAV 协议的网盘服务
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
                * 系统最多保留最近7个备份文件
            </Typography>
        </Box>
    )

    return (
        <Box sx={{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'background.paper',
                zIndex: 10,
                borderBottom: 1,
                borderColor: 'divider'
            }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{
                        minHeight: '40px',
                        '& .MuiTab-root': {
                            minHeight: '40px',
                            padding: '6px 16px',
                            alignItems: 'flex-start',
                            textAlign: 'left'
                        }
                    }}
                >
                    <Tab label="本地备份" />
                    <Tab label="WebDAV云备份" />
                </Tabs>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                {activeTab === 0 && renderLocalBackup()}
                {activeTab === 1 && renderWebDAVBackup()}
            </Box>
        </Box>
    )
}

export default BackupSettings