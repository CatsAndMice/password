importScripts('./bcrypt/bcrypt.js')

self.onmessage = (e) => {
  const { bcryptHash, batchSize } = e.data
  let found = false

  // 分批处理密码尝试
  for (let i = 0; i < 1000 && !found; i++) {
    const firstThree = i.toString().padStart(3, '0')
    
    // 每处理一批就发送进度
    for (let j = 0; j < 1000; j += batchSize) {
      const endJ = Math.min(j + batchSize, 1000)
      
      for (let k = j; k < endJ; k++) {
        const lastThree = k.toString().padStart(3, '0')
        const testPass = `${firstThree}${lastThree}`
        
        if (bcrypt.compareSync(testPass, bcryptHash)) {
          found = true
          self.postMessage({ found: true, firstThree })
          return
        }
      }
      
      // 发送进度
      self.postMessage({ 
        found: false, 
        progress: ((i * 1000 + j) / 1000000) * 100 
      })
    }
  }
}