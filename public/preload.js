const crypto = require('crypto')
const bcrypt = require('./bcrypt/bcrypt.js')
const getKeyIv = (passphrase) => {
  const hash1 = crypto.createHash('md5').update(passphrase).digest('hex')
  const hash2 = crypto.createHash('md5').update(hash1 + passphrase).digest('hex')
  const hash3 = crypto.createHash('md5').update(hash2 + passphrase).digest('hex')
  return { key: hash2, iv: hash3.substr(16) }
}

// 加密原始密码，返回加密密码
const getRecoveryPass = (password) => {
  const keyiv = getKeyIv('recovery_key')
  const cipher = crypto.createCipheriv('aes-256-cbc', keyiv.key, keyiv.iv)
  return cipher.update(password, 'utf8', 'hex') + cipher.final('hex')
}

// 解密加密密码，返回原始密码
const getOriginalPasswordPlus = (recovery) => {
  const keyiv = getKeyIv('recovery_key')
  const decipher = crypto.createDecipheriv('aes-256-cbc', keyiv.key, keyiv.iv)
  const originalPassword = decipher.update(recovery, 'hex', 'utf8') + decipher.final('utf8')
  return originalPassword
}

window.services = {
  generateId: (prefix = '') => {
    const timestamp = Date.now()
    const random = crypto.randomBytes(4).toString('hex')
    return `${prefix}${timestamp}_${random}`
  },
  getRecoveryPass,
  getOriginalPasswordPlus,
  setBcryptPass: (password) => {
    if (!password) return false
    const bcryptPass = bcrypt.hashSync(password, 10)
    const recoveryPass = getRecoveryPass(password.slice(0, 3))
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
    const recoveryPass = getRecoveryPass(password.slice(0, 3))
    passDoc.recovery = recoveryPass
    const result = window.utools.db.put(passDoc)
    if (result.error) return false
    return true
  },
  verifyPassword: (password) => {
    const passDoc = window.utools.db.get('bcryptpass')
    if (!passDoc) return false

    if (bcrypt.compareSync(password, passDoc.value)) {
      if (!passDoc.recovery) {
        const recoveryPass = getRecoveryPass(password)
        passDoc.recovery = recoveryPass
        window.utools.db.put(passDoc)
      }
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
  // 获取原始密码
  getOriginalPassword: () => {
    const passDoc = window.utools.db.get('bcryptpass')
    if (!passDoc || !passDoc.recovery) return null
    try {
      return getOriginalPasswordPlus(passDoc.recovery)
    } catch (err) {
      console.error('解密失败:', err)
      return null
    }
  }
}
