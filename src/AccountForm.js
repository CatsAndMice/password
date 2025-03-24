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
import { getFavicon } from "./utils/getFavicon"

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
  }
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
    randomPasswordEl: null
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

  componentDidMount() {
    const stateValue = {}
    const data = this.props.data
      ;['title', 'username', 'password', 'remark', 'link'].forEach(f => {
        if (data[f]) {
          try {
            stateValue[f + 'Value'] = window.services.decryptValue(this.props.keyIV, data[f])
          } catch (e) {
            stateValue[f + 'Value'] = data[f]
          }
        }
      })
    this.setState(stateValue)
    window.addEventListener('keydown', this.keydownAction, true)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keydownAction, true)
  }

  UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line
    const stateValue = {};
    ['title', 'username', 'password', 'remark', 'link'].forEach(f => {
      if (nextProps.data[f]) {
        try {
          stateValue[f + 'Value'] = window.services.decryptValue(nextProps.keyIV, nextProps.data[f])
        } catch (e) {
          stateValue[f + 'Value'] = nextProps.data[f]
        }
      } else {
        stateValue[f + 'Value'] = ''
      }
    })
    this.setState(stateValue)
  }

  handleInputChang = field => async (e) => {
    const value = e.target.value
    if (field === 'title' || field === 'username') {
      this.props.decryptAccountDic[this.props.data._id][field] = value
      document.getElementById(this.props.data._id + '_' + field).innerText = value
    }
    // 保存网站logo
    if (field === 'link') {
      const doc = this.props.data
      if (value) {
        getFavicon(value).then(favicon => {
          if (favicon && this.props.decryptAccountDic[doc._id]) {
            doc.favicon = favicon
            // 确保对象存在
            if (!this.props.decryptAccountDic[doc._id].account) {
              this.props.decryptAccountDic[doc._id].account = {}
            }
            this.props.decryptAccountDic[doc._id].account.favicon = favicon
            this.props.onUpdate(doc)
          }
        }).catch(() => {
          if (doc.favicon || (this.props.decryptAccountDic[doc._id]?.account?.favicon)) {
            delete doc.favicon
            if (this.props.decryptAccountDic[doc._id]?.account) {
              delete this.props.decryptAccountDic[doc._id].account.favicon
            }
            this.props.onUpdate(doc)
          }
        })
      } else {
        delete doc.favicon
        delete this.props.decryptAccountDic[doc._id].account.favicon
        this.props.onUpdate(doc)
      }
    }
    const stateValue = {}
    stateValue[field + 'Value'] = value
    this.setState(stateValue)
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

  handleCopy = (target) => () => {
    const targetValue = this.state[target]
    window.utools.copyText(targetValue)
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
    window.utools.hideMainWindow(false)
    window.utools.shellOpenExternal(this.state.linkValue)
  }

  handleOkRandomPassword = () => {
    const newPasswordValue = this.randomPasswordRef.getPasswordValue()
    this.handleInputChang('password')({ target: { value: newPasswordValue } })
    this.setState({ randomPasswordEl: null })
  }



  // 在 render 方法中使用
  render() {
    const { titleValue, usernameValue, passwordValue, linkValue, remarkValue, passwordEye, randomPasswordEl } = this.state
    return (
      <div className='account-form'>
        <div>
          <TextField
            fullWidth
            label='标题'
            id='accountFormTitle'
            onChange={this.handleInputChang('title')}
            value={titleValue}
            variant='standard'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <TitleIcon className='account-form-prev-icon' />
                </InputAdornment>
              )
            }}
            sx={baseTextFieldStyle}
          />
        </div>
        <div>
          <TextField
            fullWidth
            label='用户名'
            onChange={this.handleInputChang('username')}
            value={usernameValue}
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
            sx={baseTextFieldStyle}
          />
        </div>
        <div>
          <TextField
            type={passwordEye ? 'text' : 'password'}
            fullWidth
            label='密码'
            onChange={this.handleInputChang('password')}
            value={passwordValue}
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
                  <Tooltip title='生成随机密码' placement='top'>
                    <IconButton tabIndex={-1} onClick={this.handleShowRandomPassword} size='small'>
                      <ShuffleIcon />
                    </IconButton>
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
            sx={baseTextFieldStyle}
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
            sx={baseTextFieldStyle}
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
              }
            }}
          />
        </div>
      </div>
    )
  }
}
