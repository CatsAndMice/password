const fs = require('fs')
const path = require('path')

// 获取备份目录
const getBackupDir = () => {
  // 尝试从配置中获取自定义备份路径
  const config = window.utools.db.get('backup_config') || {}
  if (config.customBackupDir && fs.existsSync(config.customBackupDir)) {
    return config.customBackupDir
  }
  // 默认备份路径
  return path.join(window.utools.getPath('userData'), 'backups')
}

// 设置自定义备份目录
const setBackupDir = (dirPath) => {
  if (!dirPath || !fs.existsSync(dirPath)) {
    throw new Error('无效的目录路径')
  }

  // 测试目录是否可写
  try {
    const testFile = path.join(dirPath, '.test_write')
    fs.writeFileSync(testFile, 'test')
    fs.unlinkSync(testFile)
  } catch (error) {
    throw new Error('目录没有写入权限')
  }

  // 保存配置
  const config = window.utools.db.get('backup_config') || { _id: 'backup_config' }
  config.customBackupDir = dirPath
  window.utools.db.put(config)

  return dirPath
}

// 重置为默认备份目录
const resetBackupDir = () => {
  const config = window.utools.db.get('backup_config')
  if (config) {
    delete config.customBackupDir
    window.utools.db.put(config)
  }
  return getBackupDir()
}

const autoBackup = (isManual = false) => {
  // 开发环境不执行备份
  if (window.utools.isDev()) {
    console.warn('开发环境不执行备份')
    return
  }
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const backupDir = getBackupDir()
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true })
        }

        // 获取今天的日期
        const today = new Date().toISOString().split('T')[0]

        // 检查今天是否已经备份且未超过1小时
        const backupFiles = await fs.promises.readdir(backupDir)
        const todayFile = backupFiles.find(f => f.includes(today))

        if (todayFile) {
          const stats = await fs.promises.stat(path.join(backupDir, todayFile))
          // 根据是否为手动备份设置不同的时间限制
          const timeLimit = isManual ? (60 / 3600) : 1 // 手动备份为60秒，自动备份为1小时
          const hoursSinceLastBackup = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60)
          if (hoursSinceLastBackup < timeLimit) {
            console.log(isManual ? '60秒内已备份过，无需再次备份' : '今天已经备份过，无需再次备份')
            resolve(true)
            return
          }
        }

        const backupFile = path.join(
          backupDir,
          `backup_${today}.json`
        )

        const writeStream = fs.createWriteStream(backupFile)

        // 写入头部和其他小数据
        const _backup_info = {
          type: 'upassword_backup',
          version: '1.0',
          createTime: Date.now(),
          platform: process.platform
        }
        writeStream.write('{"_backup_info": ' +
          JSON.stringify(_backup_info) + ',')

        const groups = window.utools.db.allDocs('group/')
        writeStream.write('"data": {')
        writeStream.write('"groups": ' +
          JSON.stringify(groups) + ',')

        // 分批写入 accounts 数据
        writeStream.write('"accounts": ')
        const accounts = window.utools.db.allDocs('account/')
        writeStream.write(JSON.stringify(accounts) + ',')

        const webdav_config = window.utools.db.get('system/webdav_config')
        if (webdav_config) {
          writeStream.write('"webdav_config": ' +
            JSON.stringify(webdav_config) + ',')
        }

        // 写入剩余数据和结束标记
        const bcryptpass = window.utools.db.get('bcryptpass')
        writeStream.write('"bcryptpass": ' +
          JSON.stringify(bcryptpass) + '}}')


        // 等待写入完成
        await new Promise(resolve => writeStream.end(resolve))

        const files = await fs.promises.readdir(backupDir)
        const oldFiles = files
          .filter(f => f.startsWith('backup_'))
          .sort()
          .slice(0, -7)

        for (const f of oldFiles) {
          await fs.promises.unlink(path.join(backupDir, f))
        }

        // 执行云备份
        try {
          const webdavConfig = window.services.getWebdavConfig()
          if (webdavConfig?.enabled) {
            await window.services.backupToWebdav(isManual, backupFile)
          }
        } catch (error) {
          console.error('云备份失败:', error)
          // 云备份失败不影响本地备份的结果
        }

        resolve(true)
      } catch (error) {
        console.error('自动备份失败:', error)
        resolve(false)
      }
    }, 0)
  })
}

const restoreBackup = (backupFilePath) => {
  return new Promise((resolve, reject) => {
    try {
      // 读取备份文件
      const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'))
      // 验证备份文件格式
      if (!backupData._backup_info || backupData._backup_info.type !== 'upassword_backup') {
        throw new Error('无效的备份文件格式')
      }

      // 开始恢复数据
      const { groups, accounts, webdav_config = null, bcryptpass } = backupData.data

      // 删除并恢复分组数据
      const existingGroups = window.utools.db.allDocs('group/')
      for (const doc of existingGroups) {
        window.utools.db.remove(doc)
      }
      // 去除所有分组的_rev字段
      groups.forEach(group => delete group._rev)
      const groupResults = window.utools.db.bulkDocs(groups)
      const successGroups = groupResults.filter(ret => ret.ok).length



      // 删除并恢复账号数据
      const existingAccounts = window.utools.db.allDocs('account/')
      for (const doc of existingAccounts) {
        window.utools.db.remove(doc)
      }
      // 去除所有账号的_rev字段
      accounts.forEach(account => delete account._rev)
      const accountResults = window.utools.db.bulkDocs(accounts)
      const successAccounts = accountResults.filter(ret => ret.ok).length


      // 恢复密码设置
      if (bcryptpass) {
        const existingPass = window.utools.db.get('bcryptpass')
        if (existingPass) {
          window.utools.db.remove('bcryptpass')
        }
        // 去除_rev字段，避免版本冲突
        delete bcryptpass._rev
        window.utools.db.put(bcryptpass)
      }


      // 恢复云备份配置
      if (webdav_config) {
        const webdav_configDb = window.utools.db.get('system/webdav_config')
        if (webdav_configDb) {
          window.utools.db.remove('system/webdav_config')
        }
        // 去除_rev字段，避免版本冲突
        delete webdav_config._rev
        window.utools.db.put(webdav_config)
      }


      // 如果有创建失败的数据，抛出错误
      if (successGroups !== groups.length || successAccounts !== accounts.length) {
        throw new Error(`数据恢复不完整，成功恢复 ${successGroups}个分组，${successAccounts}个账号`)
      }

      resolve({
        success: true,
        message: '备份恢复成功',
        stats: {
          groupCount: successGroups,
          accountCount: successAccounts
        }
      })
    } catch (error) {
      reject({
        success: false,
        message: '备份恢复失败: ' + error.message
      })
    }
  })
}

// 获取可用的备份文件列表
const getBackupFiles = () => {
  const backupDir = getBackupDir()
  if (!fs.existsSync(backupDir)) {
    return []
  }

  return fs.readdirSync(backupDir)
    .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
    .map(filename => ({
      filename,
      path: path.join(backupDir, filename),
      date: filename.split('_')[1].split('.')[0],
      size: fs.statSync(path.join(backupDir, filename)).size
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

module.exports = {
  autoBackup,
  restoreBackup,
  getBackupFiles,
  getBackupDir,
  setBackupDir,
  resetBackupDir
}