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

module.exports = {
  autoBackup
}