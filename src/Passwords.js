import React from 'react'
import Door from './Door'
import Setting from './Setting'
import Home from './Home'

const LOGIN_INFO = 'LOGIN_INFO'
const ONE_DAY = 24 * 60 * 60 * 1000 // 1天后过期（24小时 * 60分钟 * 60秒 * 1000毫秒）
export default class Passwords extends React.Component {
  state = {
    hadKey: Boolean(window.utools.db.get('bcryptpass')),
    keyIV: ''
  }
  componentDidMount() {
    const loginInfo = window.localStorage.getItem(LOGIN_INFO)
    if (loginInfo) {
      try {
        const { expireTime, encryptedPass } = JSON.parse(loginInfo)
        // 检查是否过期
        if (expireTime > Date.now()) {
          const keyIV = window.services.verifyPassword(
            window.services.getOriginalPasswordPlus(encryptedPass)
          )
          if (keyIV) {
            this.setState({ keyIV })
          }
        }
      } catch (error) {
        window.localStorage.removeItem(LOGIN_INFO)
      }
    }
  }

  handleVerify = ({ passText = '', rememberLogin = false }, errorCallback) => {
    const keyIV = window.services.verifyPassword(passText)
    if (!keyIV) {
      errorCallback()
      return
    }
    // 处理1天内免登录
    if (rememberLogin) {
      const expireTime = Date.now() + ONE_DAY
      const loginInfo = {
        encryptedPass: window.services.getRecoveryPass(passText), // 直接存储密码，依赖 localStorage 的安全性
        expireTime
      }
      // 存储加密后的登录信息
      window.localStorage.setItem(LOGIN_INFO, JSON.stringify(loginInfo))
    }
    this.setState({ keyIV })
  }

  handleOut = () => {
    const loginInfo = window.localStorage.getItem(LOGIN_INFO)
    const clearKeyIV = () => {
      if (this.state.keyIV) {
        this.setState({ keyIV: '' })
        window.utools.removeSubInput()
      }
    }
    if (loginInfo) {
      try {
        const { expireTime } = JSON.parse(loginInfo)
        // 如果已过期，清理登录信息和状态
        if (expireTime <= Date.now()) {
          window.localStorage.removeItem(LOGIN_INFO)
          clearKeyIV()
        }
      } catch (error) {
        // 解析出错时清理数据
        window.localStorage.removeItem(LOGIN_INFO)
        clearKeyIV()
      }
      return
    }
    clearKeyIV()
  }

  handleSetBcryptPass = (passText) => {
    const isOk = window.services.setBcryptPass(passText)
    if (!isOk) return
    // 插入基本数据
    const newGroup = window.utools.db.put({ _id: 'group/' + Date.now(), name: '默认分组', parentId: '' })
    if (newGroup.ok) {
      const keyiv = window.services.verifyPassword(passText)
      const newAccount = {
        _id: 'account/' + Date.now(),
        title: window.services.encryptValue(keyiv, '密码管家'),
        username: window.services.encryptValue(keyiv, '程序员凌览'),
        link: window.services.encryptValue(keyiv, 'https://u.tools/plugins/detail/%E5%AF%86%E7%A0%81%E7%AE%A1%E5%AE%B6/?c=eylamc1n2u'),
        groupId: newGroup.id,
        createAt: Date.now(),
        sort: 0
      }
      window.utools.db.put(newAccount)
    }
    this.setState({ hadKey: true, keyIV: '' })
  }

  render() {
    const { hadKey, keyIV } = this.state
    if (!hadKey) return <Setting onSet={this.handleSetBcryptPass} />
    if (!keyIV) return <Door onVerify={this.handleVerify} />
    return <Home keyIV={keyIV} onOut={this.handleOut} />
  }
}
