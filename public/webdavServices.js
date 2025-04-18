const { createClient } = require('webdav')
const fs = require('fs')

module.exports = {
    // 获取 WebDAV 配置
    getWebdavConfig() {
        const config = window.utools.db.get('system/webdav_config')
        return config ? {
            url: config.url,
            username: config.username,
            password: config.password && window.services.getOriginalPasswordPlus(config.password),
            enabled: config.enabled
        } : null
    },

    // 保存 WebDAV 配置
    setWebdavConfig(config) {
        const password = config.password && window.services.getRecoveryPass(config.password)
        const encryptedConfig = {
            ...config,
            password
        }
        window.utools.db.remove('system/webdav_config')
        return window.utools.db.put({
            _id: 'system/webdav_config',
            ...encryptedConfig,
            updateTime: Date.now()
        })
    },

    // 测试 WebDAV 连接
    async testWebdavConnection(config) {
        // 参数验证
        if (!config?.url || !config?.username || !config?.password) {
            throw new Error('请填写完整的 WebDAV 配置信息')
        }

        // 验证 URL 格式
        try {
            const url = new URL(config.url)
            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('WebDAV 地址必须以 http:// 或 https:// 开头')
            }
        } catch (error) {
            throw new Error('无效的 WebDAV 服务器地址')
        }

        try {
            const client = createClient(config.url.replace(/\/$/, ''), {
                username: config.username,
                password: config.password,
                timeout: 10000 // 10秒超时
            })

            // 测试连接，尝试获取根目录
            await client.getDirectoryContents('/')
            return true
        } catch (error) {
            console.error('WebDAV 连接测试失败:', error)

            // 处理常见错误类型
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        throw new Error('认证失败，请检查用户名和密码')
                    case 403:
                        throw new Error('访问被拒绝，请检查权限设置')
                    case 404:
                        throw new Error('服务器地址不存在')
                    default:
                        throw new Error(`服务器错误 (${error.response.status})`)
                }
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('连接超时，请检查网络状态或服务器地址')
            } else if (error.code === 'ENOTFOUND') {
                throw new Error('无法解析服务器地址，请检查是否正确')
            } else if (error.code === 'ECONNREFUSED') {
                throw new Error('连接被拒绝，请检查服务器是否在线')
            }

            throw new Error(error.message || '连接失败，请检查配置信息')
        }
    },

    // 创建 WebDAV 客户端
    createWebdavClient(config) {
        return createClient(config.url.replace(/\/$/, ''), {
            username: config.username,
            password: config.password,
            timeout: 30000 // 30秒超时
        })
    },

    // 备份文件到 WebDAV
    async backupToWebdav(isManual = false, backupFile) {
        try {
            const config = this.getWebdavConfig()
            if (!config || !config.enabled) {
                throw new Error('WebDAV 备份未启用或配置无效')
            }

            const client = this.createWebdavClient(config)

            // 确保远程备份目录存在
            const backupDir = '/密码管家(谨慎删除)'
            const exists = await client.exists(backupDir)
            if (!exists) {
                await client.createDirectory(backupDir)
            }

            // 获取今天的日期
            const today = new Date().toISOString().split('T')[0]

            // 检查今天是否已经备份且未超过时间限制
            const files = await client.getDirectoryContents(backupDir)
            const todayFile = files.find(f => f.filename.includes(today))

            if (todayFile) {
                // 根据是否为手动备份设置不同的时间限制
                const timeLimit = isManual ? (60 / 3600) : 1 // 手动备份为60秒，自动备份为1小时
                const hoursSinceLastBackup = (Date.now() - new Date(todayFile.lastmod).getTime()) / (1000 * 60 * 60)
                if (hoursSinceLastBackup < timeLimit) {
                    console.log(isManual ? '60秒内已云备份过，无需再次备份' : '今天已经云备份过，无需再次备份')
                    return { success: true }
                }
            }

            // 生成备份文件名
            const fileName = `backup_${today}.json`
            const remotePath = `${backupDir}/${fileName}`

            // 读取文件内容
            const fileContent = await fs.promises.readFile(backupFile)
            await client.putFileContents(remotePath, fileContent, {
                overwrite: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            // 清理旧备份文件
            const backupFiles = files
                .filter(file => {
                    file.filename = file.filename.replace(backupDir + '/', '')
                    return file.filename.startsWith('backup_') && (file.filename.endsWith('.json') || file.filename.endsWith('.txt'))
                })
                .sort((a, b) => b.lastmod - a.lastmod)
                .slice(7) // 保留最近7个备份

            // 删除多余的备份文件
            for (const file of backupFiles) {
                await client.deleteFile(`${backupDir}/${file.filename}`)
            }

            return {
                success: true,
                path: remotePath,
            }
        } catch (error) {
            console.error('WebDAV 备份失败:', error)
            throw new Error(`WebDAV 备份失败: ${error.message}`)
        }
    },
    async getWebdavBackupFiles() {
        try {
            const config = this.getWebdavConfig()
            if (!config || !config.enabled) {
                return []
            }

            const client = this.createWebdavClient(config)
            const backupDir = '/upassword-backup'

            // 检查目录是否存在
            const exists = await client.exists(backupDir)
            if (!exists) {
                return []
            }

            // 获取文件列表
            const files = await client.getDirectoryContents(backupDir)
            return files
                .filter(file => file.filename.startsWith('backup-') && file.filename.endsWith('.db'))
                .sort((a, b) => b.lastmod - a.lastmod)
                .map(file => ({
                    name: file.filename,
                    path: `${backupDir}/${file.filename}`,
                    size: file.size,
                    date: new Date(file.lastmod)
                }))
        } catch (error) {
            console.error('获取 WebDAV 备份文件列表失败:', error)
            throw new Error(`获取备份文件列表失败: ${error.message}`)
        }
    }
}