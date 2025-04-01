const fs = require('fs')
const path = require('path')

const autoBackup = () => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const backupDir = path.join(window.utools.getPath('userData'), 'backups')
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
          const hoursSinceLastBackup = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60)
          if (hoursSinceLastBackup < 1) {
            console.log('今天已经备份过，无需再次备份')
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
        writeStream.write('{\n  "_backup_info": ' +
          JSON.stringify({
            type: 'upassword_backup',
            version: '1.0',
            createTime: Date.now(),
            platform: process.platform
          }, null, 2) + ',\n')

        writeStream.write('  "data": {\n')
        writeStream.write('    "groups": ' +
          JSON.stringify(window.utools.db.allDocs('group/'), null, 2) + ',\n')

        // 分批写入 accounts 数据
        writeStream.write('    "accounts": ')
        const accounts = window.utools.db.allDocs('account/')
        writeStream.write(JSON.stringify(accounts, null, 2) + ',\n')

        // 写入剩余数据和结束标记
        writeStream.write('    "bcryptpass": ' +
          JSON.stringify(window.utools.db.get('bcryptpass'), null, 2) + '\n')
        writeStream.write('  }\n}')

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
      const { groups, accounts, bcryptpass } = backupData.data

      // 恢复密码设置
      if (bcryptpass) {
        const existingPass = window.utools.db.get('bcryptpass')
        if (existingPass) {
          window.utools.db.remove(existingPass)
        }
        window.utools.db.put(bcryptpass)
      }

      // 删除并恢复分组数据
      const existingGroups = window.utools.db.allDocs('group/')
      window.utools.db.bulkDocs([
        ...existingGroups.map(doc => ({ ...doc, _deleted: true })),
        ...groups
      ])

      // 删除并恢复账号数据
      const existingAccounts = window.utools.db.allDocs('account/')
      window.utools.db.bulkDocs([
        ...existingAccounts.map(doc => ({ ...doc, _deleted: true })),
        ...accounts
      ])

      resolve({
        success: true,
        message: '备份恢复成功',
        stats: {
          groupCount: groups.length,
          accountCount: accounts.length
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
  const backupDir = path.join(window.utools.getPath('userData'), 'backups')
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
  getBackupFiles
}