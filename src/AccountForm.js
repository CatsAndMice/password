import React from 'react'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Popover from '@mui/material/Popover'
import IconButton from '@mui/material/IconButton'
import SendIcon from '@mui/icons-material/Send'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import StarIcon from '@mui/icons-material/Star'
import RandomPassword from './RandomPassword'
import SnackbarMessage from './SnackbarMessage'
import { updateFavicon } from "./utils/updateFavicon"
import D1API from './api/d1'
import ShareButton from './components/ShareButton'
import { autoFill } from './utils/autoFill'
import PasswordStrengthIndicator from "./components/PasswordStrengthIndicator"
import { TitleField, UsernameField, PasswordField, LinkField, RemarkField } from './components/AccountFormFields'

/**
 * 账号编辑表单组件
 * 提供账号字段的加密编辑、锁定/解锁、收藏、复制、自动填充、随机密码生成等功能
 */
export default class AccountForm extends React.Component {
  isMacOs = window.utools.isMacOs()

  state = {
    titleValue: '', usernameValue: '', passwordValue: '', remarkValue: '', linkValue: '',
    passwordEye: false, isFavorite: false, randomPasswordEl: null,
    message: { key: 0, type: 'info', body: '' }, isLocked: true,
    expandedSections: { username: false, password: false, link: false, remark: false }
  }

  // 批量解密账号字段数据，若已有标题或用户名则默认锁定状态
  decryptAndUpdateState = (data, keyIV) => {
    const stateValue = {}
    const items = ['title', 'username', 'password', 'remark', 'link']
    const hasTitleOrUsername = Boolean(data['title'] || data['username'])
    items.forEach(f => {
      if (data[f]) {
        try { stateValue[f + 'Value'] = window.services.decryptValue(keyIV, data[f]) }
        catch (e) { stateValue[f + 'Value'] = data[f] }
      } else stateValue[f + 'Value'] = ''
    })
    stateValue.isLocked = hasTitleOrUsername
    return { stateValue }
  }

  componentDidMount() {
    const { stateValue } = this.decryptAndUpdateState(this.props.data, this.props.keyIV)
    this.setState({
      ...stateValue, isFavorite: this.props.data.isFavorite || false,
      expandedSections: {
        username: Boolean(stateValue.usernameValue), password: Boolean(stateValue.passwordValue),
        link: Boolean(stateValue.linkValue), remark: Boolean(stateValue.remarkValue)
      }
    })
    window.addEventListener('keydown', this.keydownAction, true)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { stateValue } = this.decryptAndUpdateState(nextProps.data, nextProps.keyIV)
    const { mode } = this.props
    // 收藏模式下保持当前的锁定状态，不自动锁定
    if (mode === 'FAVORITE') stateValue.isLocked = this.state.isLocked
    this.setState({
      ...stateValue, isFavorite: nextProps.data.isFavorite || false,
      expandedSections: {
        username: Boolean(stateValue.usernameValue), password: Boolean(stateValue.passwordValue),
        link: Boolean(stateValue.linkValue), remark: Boolean(stateValue.remarkValue)
      }
    })
  }

  constructor(props) { super(props); this.faviconTimer = null; this.faviconRequestId = 0 }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keydownAction, true)
    if (this.faviconTimer) clearTimeout(this.faviconTimer)
  }

  keydownAction = (e) => {
    // Ctrl/Cmd+U 复制用户名，Ctrl/Cmd+P 复制密码
    if ((e.code === 'KeyU' || e.code === 'KeyP') && (this.isMacOs ? e.metaKey : e.ctrlKey)) {
      e.preventDefault(); e.stopPropagation()
      window.utools.hideMainWindow()
      this.handleCopy(e.code === 'KeyU' ? 'usernameValue' : 'passwordValue')()
    }
    // 阻止中文输入法状态下上下箭头键事件冒泡
    if ((e.code === 'ArrowUp' || e.code === 'ArrowDown') && (e.keyCode === 229 || e.target.nodeName === 'TEXTAREA')) {
      e.stopPropagation()
    }
  }

  // 处理输入变更：即时更新解密字典中的明文值，延迟300ms加密写入DB
  handleInputChang = field => async (e) => {
    const value = e.target.value
    if (field === 'title' || field === 'username') {
      this.props.decryptAccountDic[this.props.data._id][field] = value
      const element = document.getElementById(this.props.data._id + '_' + field)
      if (element) element.innerText = value
    }
    this.setState({ [field + 'Value']: value })

    if (field === 'link') {
      if (this.faviconTimer) clearTimeout(this.faviconTimer)
      const currentRequestId = ++this.faviconRequestId
      const data = JSON.parse(JSON.stringify(this.props.data))
      this.faviconTimer = setTimeout(() => {
        if (currentRequestId === this.faviconRequestId) {
          if (value) data[field] = window.services.encryptValue(this.props.keyIV, value)
          else delete data[field]
          updateFavicon(value, data, this.props.decryptAccountDic, this.props.onUpdate, currentRequestId, () => this.faviconRequestId === currentRequestId)
        }
      }, 1000)
    }

    if (this.inputDelayTimer) clearTimeout(this.inputDelayTimer)
    const doc = this.props.data
    this.inputDelayTimer = setTimeout(() => {
      this.inputDelayTimer = null
      if (value) doc[field] = window.services.encryptValue(this.props.keyIV, value)
      else delete doc[field]
      this.props.onUpdate(doc)
    }, 300)
  }

  toggleFavorite = () => {
    const isFavorite = !this.state.isFavorite
    this.props.data.isFavorite = isFavorite
    this.setState({ isFavorite })
    this.props.onUpdate({ ...this.props.data, isFavorite })
    D1API.trackEvent({ message: '切换是否收藏' })
  }

  handleCopy = (target) => () => window.utools.copyText(this.state[target])
  handlePasswordVisible = () => this.setState({ passwordEye: !this.state.passwordEye })

  handleShowRandomPassword = (e) => {
    this.setState({ randomPasswordEl: e.currentTarget })
    setTimeout(() => { this.randomPasswordRef.generateRandom() })
  }

  handleCloseRandomPassword = () => this.setState({ randomPasswordEl: null })

  // 打开链接：若有账号信息则先复制到剪贴板，延迟1秒后打开浏览器
  handleOpenLink = () => {
    if (!this.state.linkValue) return
    if (this.state.usernameValue || this.state.passwordValue) {
      const copyText = [this.state.usernameValue && `用户名：${this.state.usernameValue}`, this.state.passwordValue && `密码：${this.state.passwordValue}`].filter(Boolean).join('\n')
      window.utools.copyText(copyText)
      this.setState(prev => ({ message: { key: prev.message.key + 1, type: 'success', body: '账号信息已复制到剪贴板' } }))
      D1API.trackEvent({ message: '跳转链接' })
      setTimeout(() => { window.utools.hideMainWindow(false); window.utools.shellOpenExternal(this.state.linkValue) }, 1000)
    } else {
      window.utools.hideMainWindow(false)
      window.utools.shellOpenExternal(this.state.linkValue)
    }
  }

  // 使用随机密码：将生成的密码填入密码字段，加密写入DB，同时复制到剪贴板
  handleOkRandomPassword = () => {
    const newPasswordValue = this.randomPasswordRef.getPasswordValue()
    this.handleInputChang('password')({ target: { value: newPasswordValue } })
    this.setState({ randomPasswordEl: null })
    window.utools.copyText(newPasswordValue)
    D1API.trackEvent({ message: `随机生成密码并使用：${newPasswordValue}` })
  }

  toggleLock = () => this.setState(prev => ({ isLocked: !prev.isLocked }))

  // 拼装账号信息文本并复制到剪贴板
  handleShare = () => {
    const { titleValue, usernameValue, passwordValue, linkValue, remarkValue } = this.state
    const shareText = [titleValue && `标题：${titleValue}`, usernameValue && `用户名：${usernameValue}`, passwordValue && `密码：${passwordValue}`, linkValue && `链接：${linkValue}`, remarkValue.trim() && `说明：${remarkValue.trim()}`].filter(Boolean).join('\n')
    window.utools.copyText(shareText)
    this.setState(prev => ({ message: { key: prev.message.key + 1, type: 'success', body: '账号信息已复制到剪贴板' } }))
    D1API.trackEvent({ message: `分享账号信息：${titleValue}` })
  }

  render() {
    const { titleValue, usernameValue, passwordValue, linkValue, isFavorite, remarkValue, passwordEye, randomPasswordEl, message, isLocked, expandedSections } = this.state
    const { mode } = this.props

    return (
      <div className={`account-form ${mode === 'SEARCH' ? 'search-mode' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 0, position: 'relative' }}>
          <Tooltip title={isLocked ? "解锁" : "锁定"} placement='top'>
            <IconButton onClick={this.toggleLock} size='small' className='!rounded-full !p-1 !mr-2'
              sx={{ color: isLocked ? 'var(--color-text-secondary)' : 'var(--color-primary)' }}>
              {isLocked ? <LockOutlinedIcon size='small' /> : <LockOpenOutlinedIcon size='small' />}
            </IconButton>
          </Tooltip>
          <Tooltip title={isFavorite ? "取消收藏" : "收藏"} placement='top'>
            <IconButton onClick={this.toggleFavorite} size='small' sx={{ color: 'var(--color-text-secondary)' }}>
              {isFavorite ? <StarIcon size='small' style={{ color: 'var(--color-primary)' }} /> : <StarOutlineIcon size='small' />}
            </IconButton>
          </Tooltip>
        </div>
        <SnackbarMessage message={message} />
        <div>
          <TitleField value={titleValue} onChange={this.handleInputChang('title')} isLocked={isLocked} isMacOs={this.isMacOs} />
        </div>
        {(expandedSections.username || !isLocked || usernameValue) && (
          <div>
            <UsernameField value={usernameValue} onChange={this.handleInputChang('username')} isLocked={isLocked} isMacOs={this.isMacOs} onCopy={this.handleCopy('usernameValue')} />
          </div>
        )}
        {(expandedSections.password || !isLocked || passwordValue) && (
          <div>
            <PasswordField value={passwordValue} onChange={this.handleInputChang('password')} isLocked={isLocked} isMacOs={this.isMacOs}
              passwordEye={passwordEye} onToggleEye={this.handlePasswordVisible} onCopy={this.handleCopy('passwordValue')} onShowRandom={this.handleShowRandomPassword} />
            <Popover open={Boolean(randomPasswordEl)} anchorEl={randomPasswordEl} onClose={this.handleCloseRandomPassword}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <div className='random-password-popover'>
                <RandomPassword from='accountform' ref={c => { this.randomPasswordRef = c }} />
                <div className='random-password-popover-footer'>
                  <Button onClick={this.handleOkRandomPassword} variant='contained' color='primary' endIcon={<SendIcon />}>使用该密码</Button>
                </div>
              </div>
            </Popover>
            <PasswordStrengthIndicator password={passwordValue} />
          </div>
        )}
        {(expandedSections.link || !isLocked || linkValue) && (
          <div>
            <LinkField value={linkValue} onChange={this.handleInputChang('link')} isLocked={isLocked}
              onOpenLink={this.handleOpenLink} onAutoFill={() => autoFill(this.state)} onCopy={this.handleCopy('linkValue')} />
          </div>
        )}
        {(expandedSections.remark || !isLocked || remarkValue) && (
          <div>
            <RemarkField value={remarkValue} onChange={this.handleInputChang('remark')} isLocked={isLocked} />
          </div>
        )}

        {isLocked && (!passwordValue || !linkValue || !remarkValue) && (
          <div className="flex justify-end mb-4" style={{ marginTop: '-12px' }}>
            <div onClick={() => {
              const allExpanded = !Object.values(expandedSections).includes(false)
              this.setState({ expandedSections: { username: !allExpanded, password: !allExpanded, link: !allExpanded, remark: !allExpanded } })
            }}
              className="inline-flex items-center cursor-pointer text-[13px] select-none transition-all duration-200"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
              {Object.values(expandedSections).includes(false) ? <ExpandMoreIcon className="text-base mr-1" /> : <ExpandLessIcon className="text-base mr-1" />}
              {Object.values(expandedSections).includes(false) ? '展开全部字段' : '收起空白字段'}
            </div>
          </div>
        )}
        {isLocked && <ShareButton onClick={this.handleShare} />}
      </div>
    )
  }
}