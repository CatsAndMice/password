import React, { useState, useEffect } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { BackupLocalTab, BackupWebdavTab } from './BackupTabs'
import D1API from '@/api/d1'

/**
 * 备份设置组件
 * 提供本地备份目录配置、WebDAV云备份配置的双Tab界面
 */
const BackupSettings = ({ onClose, showMessage }) => {
    const [currentBackupDir, setCurrentBackupDir] = useState('')
    const [newBackupDir, setNewBackupDir] = useState('')
    const [dirError, setDirError] = useState('')
    const [backupFiles, setBackupFiles] = useState([])
    const [backupInProgress, setBackupInProgress] = useState(false)
    const [webdavConfig, setWebdavConfig] = useState({ url: '', username: '', password: '', enabled: false })
    const [activeTab, setActiveTab] = useState(0)
    const [showWebdavSwitch, setShowWebdavSwitch] = useState(false)

    useEffect(() => {
        setCurrentBackupDir(window.services.getBackupDir())
        refreshBackupFiles()
        const config = window.services.getWebdavConfig()
        if (config) { setWebdavConfig(config); setShowWebdavSwitch(true) }
    }, [])

    const refreshBackupFiles = () => setBackupFiles(window.services.getBackupFiles())

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
            showMessage('备份目录设置成功', 'success')
            refreshBackupFiles()
        } catch (error) { setDirError(error.message || '设置备份目录失败') }
    }

    const handleResetBackupDir = async () => {
        try {
            const defaultDir = await window.services.resetBackupDir()
            setCurrentBackupDir(defaultDir); setNewBackupDir('')
            showMessage('已恢复默认备份目录', 'success')
            refreshBackupFiles()
        } catch (error) { setDirError(error.message || '重置备份目录失败') }
    }

    const handleManualBackup = async () => {
        setBackupInProgress(true)
        try {
            const result = await window.services.autoBackup(true)
            result ? showMessage('手动备份成功', 'success') : showMessage('备份失败，请检查备份目录权限', 'error')
            refreshBackupFiles()
        } catch (error) { showMessage('备份过程中出错: ' + error.message, 'error') }
        finally { setBackupInProgress(false) }
    }

    const handleSaveWebdav = async () => {
        try {
            await window.services.testWebdavConnection(webdavConfig)
            const configToSave = { ...webdavConfig, enabled: !showWebdavSwitch ? true : webdavConfig.enabled }
            await window.services.setWebdavConfig(configToSave)
            setWebdavConfig(configToSave); setShowWebdavSwitch(true)
            showMessage('WebDAV配置保存成功', 'success')
            D1API.trackEvent({ message: 'WebDAV配置保存成功' })
        } catch (error) { showMessage(error.message || 'WebDAV配置验证失败', 'error') }
    }

    const handleWebdavToggle = async (checked) => {
        try {
            const newConfig = { ...webdavConfig, enabled: checked }
            await window.services.setWebdavConfig(newConfig)
            setWebdavConfig(newConfig)
            showMessage(checked ? 'WebDAV云备份已启用' : 'WebDAV云备份已停用', 'success')
        } catch (error) { showMessage('设置失败: ' + error.message, 'error') }
    }

    return (
        <Box sx={{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 10, borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{ minHeight: '40px', '& .MuiTab-root': { minHeight: '40px', padding: '6px 16px', alignItems: 'flex-start', textAlign: 'left', textTransform: 'none' } }}>
                    <Tab label="本地备份" />
                    <Tab label="WebDAV云备份" />
                </Tabs>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                {activeTab === 0 && (
                    <BackupLocalTab currentBackupDir={currentBackupDir} newBackupDir={newBackupDir} dirError={dirError}
                        backupFiles={backupFiles} backupInProgress={backupInProgress}
                        onSelectDir={handleSelectBackupDir} onChangeDir={setNewBackupDir}
                        onSaveDir={handleSaveBackupDir} onResetDir={handleResetBackupDir} onManualBackup={handleManualBackup} />
                )}
                {activeTab === 1 && (
                    <BackupWebdavTab webdavConfig={webdavConfig} showWebdavSwitch={showWebdavSwitch}
                        onConfigChange={setWebdavConfig} onSave={handleSaveWebdav} onToggle={handleWebdavToggle} />
                )}
            </Box>
        </Box>
    )
}

export default BackupSettings