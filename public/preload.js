const crypto = require('crypto')
const bcrypt = require('./bcrypt/bcrypt.js')

const getKeyIv = (passphrase) => {
  const hash1 = crypto.createHash('md5').update(passphrase).digest('hex')
  const hash2 = crypto.createHash('md5').update(hash1 + passphrase).digest('hex')
  const hash3 = crypto.createHash('md5').update(hash2 + passphrase).digest('hex')
  return { key: hash2, iv: hash3.substr(16) }
}

window.services = {
  setBcryptPass: (password) => {
    if (!password) return false
    const bcryptPass = bcrypt.hashSync(password, 10)
    // 使用对称加密存储一份可恢复的密码
    const keyiv = getKeyIv('recovery_key')
    const recoveryPass = crypto.createCipheriv('aes-256-cbc', keyiv.key, keyiv.iv)
      .update(password, 'utf8', 'hex') + cipher.final('hex')
    const result = window.utools.db.put({
      _id: 'bcryptpass',
      value: bcryptPass,
      recovery: recoveryPass
    })
    if (result.error) return false
    return true
  },
  resetBcryptPass: (password) => {
    if (!password) return false
    const passDoc = window.utools.db.get('bcryptpass')
    if (!passDoc) return false
    passDoc.value = bcrypt.hashSync(password, 10)
    const result = window.utools.db.put(passDoc)
    if (result.error) return false
    return true
  },
  verifyPassword: (password) => {
    const passDoc = window.utools.db.get('bcryptpass')
    if (!passDoc) return false
    if (bcrypt.compareSync(password, passDoc.value)) {
      return getKeyIv(password)
    }
    return false
  },
  encryptValue: (keyiv, data) => {
    if (!data) return ''
    const cipher = crypto.createCipheriv('aes-256-cbc', keyiv.key, keyiv.iv)
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
  },
  decryptValue: (keyiv, data) => {
    if (!data) return ''
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyiv.key, keyiv.iv)
    return decipher.update(data, 'hex', 'utf8') + decipher.final('utf8')
  },
  exportFile: (content, ext = '.txt') => {
    const fs = require('fs')
    const path = require('path')
    const saveFile = path.join(window.utools.getPath('downloads'), '密码管家' + Date.now() + ext)
    fs.writeFileSync(saveFile, content, 'utf-8')
    window.utools.shellShowItemInFolder(saveFile)
  },
  getFirstThree: (onProgress) => {
    const passDoc = window.utools.db.get('bcryptpass')
    if (!passDoc) return null

    return new Promise((resolve) => {
      let currentBatch = 0
      const batchSize = 100  // 减小批量大小

      const processBatch = () => {
        const firstThree = Math.floor(currentBatch / 1000).toString().padStart(3, '0')
        const startJ = (currentBatch % 1000) * batchSize
        const endJ = Math.min(startJ + batchSize, 1000)

        for (let j = startJ; j < endJ; j++) {
          const lastThree = j.toString().padStart(3, '0')
          const testPass = `${firstThree}${lastThree}`
          if (bcrypt.compareSync(testPass, passDoc.value)) {
            resolve(firstThree)
            return true
          }
        }

        // 计算并回调进度
        const progress = (currentBatch * batchSize / 1000000) * 100
        if (onProgress) {
          onProgress(progress.toFixed(1))
        }

        currentBatch++
        if (currentBatch < 1000) {
          // 增加延迟时间，让出更多主线程时间
          setTimeout(processBatch, 10)
        } else {
          resolve(null)
        }
        return false
      }

      processBatch()
    })
  }
}
