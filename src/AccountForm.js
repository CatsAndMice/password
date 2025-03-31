import React from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Popover from '@mui/material/Popover'
import TitleIcon from '@mui/icons-material/Title'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser'
import LockIcon from '@mui/icons-material/Lock'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import SendIcon from '@mui/icons-material/Send'
import SvgIcon from '@mui/material/SvgIcon';
import RandomPassword from './RandomPassword'
import SnackbarMessage from './SnackbarMessage'
import { updateFavicon } from "./utils/updateFavicon"
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import D1API from './api/index'
import ShareButton from './components/ShareButton'

// 基础样式配置
const baseTextFieldStyle = {
  '& .MuiInput-underline:before': {
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
    borderBottomColor: '#2196F3',
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(44, 62, 80, 0.7)',
    fontSize: '14px',
    fontWeight: 500,
  },
  '& .MuiInputBase-input': {
    fontSize: '15px',
    color: '#2c3e50',
    fontWeight: 500,
    letterSpacing: '0.2px',
  },
  '& .account-form-prev-icon': {
    fontSize: '20px',
    color: 'rgba(44, 62, 80, 0.7)',
  },
  '& .MuiIconButton-root': {
    padding: '4px',
    '& .MuiSvgIcon-root': {
      fontSize: '18px',
    },
  },
  '& .account-form-icon-divider': {
    margin: '0 4px',
    width: '1px',
    height: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  '& .Mui-disabled': {
    '& .MuiInputBase-input': {
      color: 'rgba(44, 62, 80, 0.75)', // 调深文字颜色
      WebkitTextFillColor: 'rgba(44, 62, 80, 0.75)', // 同步调整 Safari 的文字颜色
      cursor: 'default',
    },
    '& .account-form-prev-icon': {
      color: 'rgba(44, 62, 80, 0.65)', // 调深图标颜色
    },
    '& .MuiInput-underline:before': {
      borderBottomStyle: 'dotted',
      borderBottomColor: 'rgba(0, 0, 0, 0.15)', // 略微加深底线颜色
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottomColor: 'rgba(0, 0, 0, 0.15)',
    }
  },
}
export default class AccountForm extends React.Component {
  isMacOs = window.utools.isMacOs()

  state = {
    titleValue: '',
    usernameValue: '',
    passwordValue: '',
    remarkValue: '',
    linkValue: '',
    passwordEye: false,
    randomPasswordEl: null,
    message: { key: 0, type: 'info', body: '' }, // 添加消息状态
    isLocked: true
  }

  keydownAction = (e) => {
    if ((e.code === 'KeyU' || e.code === 'KeyP') && (this.isMacOs ? e.metaKey : e.ctrlKey)) {
      e.preventDefault()
      e.stopPropagation()
      window.utools.hideMainWindow()
      this.handleCopy(e.code === 'KeyU' ? 'usernameValue' : 'passwordValue')()
    }
    if ((e.code === 'ArrowUp' || e.code === 'ArrowDown') && (e.keyCode === 229 || e.target.nodeName === 'TEXTAREA')) {
      e.stopPropagation()
    }
  }

  // 添加新的方法处理数据解密和状态更新
  decryptAndUpdateState = (data, keyIV) => {
    const stateValue = {}
    const items = ['title', 'username', 'password', 'remark', 'link']
    // 先检查 title 和 username
    let hasTitleOrUsername = data['title'] || data['username']
    hasTitleOrUsername = Boolean(hasTitleOrUsername)

    items.forEach(f => {
      if (data[f]) {
        try {
          stateValue[f + 'Value'] = window.services.decryptValue(keyIV, data[f])
        } catch (e) {
          stateValue[f + 'Value'] = data[f]
        }
      } else {
        stateValue[f + 'Value'] = ''
      }
    })
    stateValue.isLocked = hasTitleOrUsername
    return { stateValue }
  }

  componentDidMount() {
    console.log(111);
    const { stateValue } = this.decryptAndUpdateState(this.props.data, this.props.keyIV)
    this.setState(stateValue)
    window.addEventListener('keydown', this.keydownAction, true)
  }

  UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line
    const { stateValue } = this.decryptAndUpdateState(nextProps.data, nextProps.keyIV)
    const { mode } = this.props
    //当mode为FAVORITE时，更新数据不默认锁定
    if (mode === 'FAVORITE') {
      stateValue.isLocked = this.state.isLocked
    }
    this.setState(stateValue)
  }

  constructor(props) {
    super(props)
    this.faviconTimer = null
    this.faviconRequestId = 0  // 添加请求ID计数器
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keydownAction, true)
    // 清理定时器
    if (this.faviconTimer) {
      clearTimeout(this.faviconTimer)
    }
  }

  handleInputChang = field => async (e) => {
    const value = e.target.value
    if (field === 'title' || field === 'username') {
      this.props.decryptAccountDic[this.props.data._id][field] = value
      // 添加元素存在性检查
      const element = document.getElementById(this.props.data._id + '_' + field)
      if (element) {
        element.innerText = value
      }
    }

    const stateValue = {}
    stateValue[field + 'Value'] = value
    this.setState(stateValue)

    if (field === 'link') {
      if (this.faviconTimer) {
        clearTimeout(this.faviconTimer)
      }

      const currentRequestId = ++this.faviconRequestId
      // 克隆数据，防止数据污染
      const data = JSON.parse(JSON.stringify(this.props.data))
      this.faviconTimer = setTimeout(() => {
        if (currentRequestId === this.faviconRequestId) {
          if (value) {
            data[field] = window.services.encryptValue(this.props.keyIV, value)
          } else {
            delete data[field]
          }
          // this.props.onUpdate(doc)
          updateFavicon(
            value,
            data,
            this.props.decryptAccountDic,
            this.props.onUpdate,
            currentRequestId,  // 传递请求ID
            () => this.faviconRequestId === currentRequestId  // 传递验证函数
          )
        }
      }, 1000)
    }

    if (this.inputDelayTimer) {
      clearTimeout(this.inputDelayTimer)
    }
    const doc = this.props.data
    this.inputDelayTimer = setTimeout(() => {
      this.inputDelayTimer = null
      if (value) {
        doc[field] = window.services.encryptValue(this.props.keyIV, value)
      } else {
        delete doc[field]
      }
      this.props.onUpdate(doc)
    }, 300)
  }

  updateClickCount = () => {
    const updatedAccount = {
      ...this.props.data,
      clickCount: (this.props.data.clickCount || 0) + 1
    }
    this.props.data.clickCount = updatedAccount.clickCount
    this.props.onUpdate(updatedAccount)
  }

  handleCopy = (target) => () => {
    const targetValue = this.state[target]
    window.utools.copyText(targetValue)
    // 增加点击计数
    this.updateClickCount()
  }

  handlePasswordVisible = () => {
    if (this.state.passwordEye) {
      this.setState({ passwordEye: false })
    } else {
      this.setState({ passwordEye: true })
    }
  }

  handleShowRandomPassword = (e) => {
    this.setState({ randomPasswordEl: e.currentTarget })
    setTimeout(() => {
      this.randomPasswordRef.generateRandom()
    })
  }

  handleCloseRandomPassword = () => {
    this.setState({ randomPasswordEl: null })
  }

  handleOpenLink = () => {
    if (!this.state.linkValue) return

    // 增加点击计数
    this.updateClickCount()

    // 如果存在用户名或密码，将它们组合复制到剪贴板
    if (this.state.usernameValue || this.state.passwordValue) {
      const copyText = [
        this.state.usernameValue && `用户名：${this.state.usernameValue}`,
        this.state.passwordValue && `密码：${this.state.passwordValue}`
      ].filter(Boolean).join('\n')
      window.utools.copyText(copyText)
      // this.props.showMessage && this.props.showMessage('已复制登录信息到剪贴板', 'info')
      this.setState(prevState => ({
        message: {
          key: prevState.message.key + 1,
          type: 'success',
          body: '账号信息已复制到剪贴板'
        }
      }))

      D1API.trackEvent({ message: `跳转链接：${this.state.linkValue}` })
      // 延迟 1 秒后再跳转
      setTimeout(() => {
        window.utools.hideMainWindow(false)
        window.utools.shellOpenExternal(this.state.linkValue)
      }, 1000)
    } else {
      window.utools.hideMainWindow(false)
      window.utools.shellOpenExternal(this.state.linkValue)
    }
  }

  handleOkRandomPassword = () => {
    const newPasswordValue = this.randomPasswordRef.getPasswordValue()
    this.handleInputChang('password')({ target: { value: newPasswordValue } })
    this.setState({ randomPasswordEl: null })
    window.utools.copyText(newPasswordValue)
    D1API.trackEvent({ message: `随机生成密码并使用：${newPasswordValue}` })
  }

  toggleLock = () => {
    this.setState(prevState => ({ isLocked: !prevState.isLocked }))
  }

  handleShare = () => {
    const { titleValue, usernameValue, passwordValue, linkValue } = this.state
    const shareText = [
      titleValue && `标题：${titleValue}`,
      usernameValue && `用户名：${usernameValue}`,
      passwordValue && `密码：${passwordValue}`,
      linkValue && `链接：${linkValue}`
    ].filter(Boolean).join('\n')

    window.utools.copyText(shareText)
    this.setState(prevState => ({
      message: {
        key: prevState.message.key + 1,
        type: 'success',
        body: '账号信息已复制到剪贴板'
      }
    }))

    // 记录分享事件
    D1API.trackEvent({ message: `分享账号信息：${titleValue}` })
  }


  // 在 render 方法中使用
  render() {
    const { titleValue, usernameValue, passwordValue, linkValue, remarkValue, passwordEye, randomPasswordEl, message, isLocked } = this.state
    const { mode } = this.props // 从 props 中获取是否为搜索模式

    return (
      <div className={`account-form ${mode === 'SEARCH' ? 'search-mode' : ''}`}>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: 0,
          position: 'relative'
        }}>
          {/* <Tooltip title={isLocked ? '点击解锁编辑' : '点击锁定'}> */}
          <Button
            onClick={this.toggleLock}
            size='small'
            startIcon={isLocked ? <LockOutlinedIcon /> : <LockOpenOutlinedIcon />}
            sx={{
              '&:hover': {
                backgroundColor: isLocked ? 'rgba(0, 0, 0, 0.08)' : 'rgba(33, 150, 243, 0.12)',
              },
              transition: 'all 0.2s',
              borderRadius: '6px',
              color: isLocked ? 'rgba(0, 0, 0, 0.6)' : '#2196F3',
              textTransform: 'none',
              minWidth: 'auto'
            }}
          >
            {isLocked ? '已锁定' : '已解锁'}
          </Button>
          {/* </Tooltip> */}
        </div>
        <SnackbarMessage message={message} />
        <div>
          <TextField
            fullWidth
            label='标题'
            id='accountFormTitle'
            onChange={this.handleInputChang('title')}
            value={titleValue}
            disabled={isLocked}
            variant='standard'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <TitleIcon className='account-form-prev-icon' />
                </InputAdornment>
              )
            }}
            sx={{
              ...baseTextFieldStyle,
              opacity: isLocked ? 0.9 : 1, // 轻微降低整体不透明度
              transition: 'opacity 0.2s', // 添加过渡效果
            }}
          />
        </div>
        <div>
          <TextField
            fullWidth
            label='用户名'
            onChange={this.handleInputChang('username')}
            value={usernameValue}
            disabled={isLocked}
            variant='standard'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <AccountBoxIcon className='account-form-prev-icon' />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <Tooltip title={'复制用户名，快捷键 ' + (this.isMacOs ? 'Command' : 'Ctrl') + '+U'} placement='top-end'>
                    <IconButton tabIndex={-1} onClick={this.handleCopy('usernameValue')} size='small'>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
            sx={{
              ...baseTextFieldStyle,
              opacity: isLocked ? 0.9 : 1, // 轻微降低整体不透明度
              transition: 'opacity 0.2s', // 添加过渡效果
            }}
          />
        </div>
        <div>
          <TextField
            type={passwordEye ? 'text' : 'password'}
            fullWidth
            label='密码'
            onChange={this.handleInputChang('password')}
            value={passwordValue}
            disabled={isLocked}
            variant='standard'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <LockIcon className='account-form-prev-icon' />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <Tooltip title={passwordEye ? '关闭明文' : '明文显示'} placement='top'>
                    <IconButton tabIndex={-1} onClick={this.handlePasswordVisible} size='small'>
                      {passwordEye ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Tooltip>
                  <span className='account-form-icon-divider' />
                  <Tooltip title={isLocked ? '解锁后可生成随机密码' : '生成随机密码'} placement='top'>
                    <span>
                      <IconButton
                        tabIndex={-1}
                        onClick={this.handleShowRandomPassword}
                        size='small'
                        disabled={isLocked}
                        sx={{
                          '&.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.26)'
                          }
                        }}
                      >
                        <ShuffleIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <span className='account-form-icon-divider' />
                  <Tooltip title={'复制密码，快捷键 ' + (this.isMacOs ? 'Command' : 'Ctrl') + '+P'} placement='top-end'>
                    <IconButton tabIndex={-1} onClick={this.handleCopy('passwordValue')} size='small'>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
            sx={{
              ...baseTextFieldStyle,
              opacity: isLocked ? 0.9 : 1, // 轻微降低整体不透明度
              transition: 'opacity 0.2s', // 添加过渡效果
            }}
          />
          <Popover
            open={Boolean(randomPasswordEl)}
            anchorEl={randomPasswordEl}
            onClose={this.handleCloseRandomPassword}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <div className='random-password-popover'>
              <RandomPassword from='accountform' ref={c => { this.randomPasswordRef = c }} />
              <div className='random-password-popover-footer'>
                <Button onClick={this.handleOkRandomPassword} variant='contained' color='primary' endIcon={<SendIcon />}>使用该密码</Button>
              </div>
            </div>
          </Popover>
        </div>
        <div>
          <TextField
            fullWidth
            label='链接'
            onChange={this.handleInputChang('link')}
            value={linkValue}
            disabled={isLocked}
            sx={{
              ...baseTextFieldStyle,
              opacity: isLocked ? 0.9 : 1, // 轻微降低整体不透明度
              transition: 'opacity 0.2s', // 添加过渡效果
            }}
            variant='standard'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SvgIcon fontSize="small" >
                    <svg t="1742436154120" className='account-form-prev-icon' style={{ fill: 'rgba(44, 62, 80, 0.7)' }} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7012" width="20" height="20"><path d="M509.4 508.5m-469.5 0a469.5 469.5 0 1 0 939 0 469.5 469.5 0 1 0-939 0Z" p-id="7013"></path><path d="M617.9 467.2c-0.3-0.6-0.5-1.2-0.8-1.8-0.1-0.1-0.1-0.2-0.2-0.4-7.2-14.5-22.7-23.9-39.9-22.6-22.5 1.8-39.4 21.5-37.6 44 0.5 5.8 2.1 11.1 4.6 15.9 11.4 25.7 6.4 57-14.6 78.1l-110 110.2c-27.3 27.3-71.7 27.3-99 0-27.3-27.3-27.3-71.7 0-99l41-41-0.3-0.3c9.5-8.2 15-20.7 14-34.1-1.8-22.5-21.5-39.4-44-37.6-10.8 0.8-20.2 5.8-27 13.2l-0.1-0.1-41.8 41.8c-59.4 59.4-59.4 155.6 0 215 59.4 59.4 155.6 59.4 215 0l110.3-110.3c46.2-46.3 56.2-114.8 30.4-171z" fill="#FFFFFF" p-id="7014"></path><path d="M762.4 257.4c-59.4-59.4-155.6-59.4-215 0L437.1 367.7c-46.2 46.2-56.2 114.7-30.5 170.9 0.3 0.6 0.5 1.2 0.8 1.8 0.1 0.1 0.1 0.2 0.2 0.4 7.2 14.5 22.7 23.9 39.9 22.6 22.5-1.8 39.4-21.5 37.6-44-0.5-5.8-2.1-11.1-4.6-15.9-11.4-25.7-6.4-57 14.6-78.1l110.1-110.1c27.3-27.3 71.7-27.3 99 0 27.3 27.3 27.3 71.7 0 99l-41 41 0.3 0.3c-9.5 8.2-15 20.7-14 34.1 1.8 22.5 21.5 39.4 44 37.6 10.8-0.8 20.2-5.8 27-13.2l0.1 0.1 41.8-41.8c59.3-59.4 59.3-155.7 0-215z" fill="#FFFFFF" p-id="7015"></path></svg>
                  </SvgIcon>
                  {/* <LinkIcon   /> */}
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <Tooltip title='浏览器中打开' placement='top'>
                    <IconButton tabIndex={-1} onClick={this.handleOpenLink} size='small'>
                      <OpenInBrowserIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <span className='account-form-icon-divider' />
                  <Tooltip title='复制链接' placement='top-end'>
                    <IconButton tabIndex={-1} onClick={this.handleCopy('linkValue')} size='small'>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
        </div>
        <div>
          <TextField
            fullWidth
            label='说明'
            multiline
            minRows={5}
            maxRows={15}
            value={remarkValue}
            disabled={isLocked}
            onChange={this.handleInputChang('remark')}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: 'rgba(44, 62, 80, 0.7)',
                fontSize: '14px',
                fontWeight: 500,
              }
            }}
            variant='outlined'
            className='account-form-remark'
            sx={{
              ...baseTextFieldStyle,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: '#2196F3',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2196F3',
                  borderWidth: '1px',
                },
              },
              '& .MuiInputBase-input': {
                fontSize: '14px',
                color: '#2c3e50',
                lineHeight: '1.6',
                letterSpacing: '0.2px',
              },
              opacity: isLocked ? 0.9 : 1, // 轻微降低整体不透明度
              transition: 'opacity 0.2s', // 添加过渡效果
            }}
          />
        </div>
        {isLocked && <ShareButton onClick={this.handleShare} />}
      </div>
    )
  }
}
