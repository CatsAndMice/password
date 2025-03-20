import React from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Popover from '@mui/material/Popover'
import TitleIcon from '@mui/icons-material/Title'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import LinkIcon from '@mui/icons-material/Link'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser'
import LockIcon from '@mui/icons-material/Lock'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import SendIcon from '@mui/icons-material/Send'
import RandomPassword from './RandomPassword'
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

  handleInputChang = field => e => {
    const value = e.target.value
    if (field === 'title' || field === 'username') {
      this.props.decryptAccountDic[this.props.data._id][field] = value
      document.getElementById(this.props.data._id + '_' + field).innerText = value
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
                  <LinkIcon className='account-form-prev-icon' fontSize="small" />
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
