import React from 'react'
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import InputBase from '@mui/material/InputBase'
import EditIcon from '@mui/icons-material/Edit'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Reset from './Reset'
import Recover from './Recover'
export default class Door extends React.Component {
  state = {
    fail: false,
    passwordValue: '',
    resetPassword: false,
    isCapsLock: false,
    isComposition: false,
    recoverPassword: false,  // 新增找回密码状态
    canRecover: false,  // 新增状态
    firstThree: '',  // 密码前三位
    menuAnchorEl: null,
    rememberLogin: false,
  }

  componentDidMount() {
    // 检查是否可以找回密码
    const originalPassword = window.services.getOriginalPassword()
    this.setState({ canRecover: !!originalPassword })
  }

  handleEnter = () => {
    if (this.state.fail) return
    this.props.onVerify({
      passText: this.state.passwordValue,
      rememberLogin: this.state.rememberLogin
    }, () => {
      this.setState({ fail: true })
      setTimeout(() => {
        this.setState({ fail: false })
      }, 1000)
    })
  }

  handleInputChange = (event) => {
    if (this.state.isComposition) return
    this.setState({ passwordValue: event.target.value })
  }

  handleInputKeydown = (event) => {
    if (event.getModifierState('CapsLock')) {
      if (!this.state.isCapsLock) this.setState({ isCapsLock: true })
    } else {
      if (this.state.isCapsLock) this.setState({ isCapsLock: false })
    }
    if (event.keyCode === 229) {
      if (!this.state.isComposition) this.setState({ isComposition: true })
      event.target.blur()
      setTimeout(() => { event.target.focus() }, 300)
      return
    }
    if (this.state.isComposition) this.setState({ isComposition: false })
    if (event.keyCode !== 13) return
    event.preventDefault()
    this.handleEnter()
  }

  handleResetClick = () => {
    this.setState({ resetPassword: true })
  }

  handleResetOut = () => {
    this.setState({ resetPassword: false })
  }


  // 添加找回密码处理函数
  handleRecoverClick = () => {
    const originalPassword = window.services.getOriginalPassword()
    if (originalPassword) {
      this.setState({
        recoverPassword: true,
        firstThree: originalPassword.slice(0, 3)  // 获取前三位
      })
    }
  }

  handleRecoverOut = () => {
    this.setState({ recoverPassword: false })
  }


  handleMenuOpen = (event) => {
    this.setState({ menuAnchorEl: event.currentTarget })
  }

  handleMenuClose = () => {
    this.setState({ menuAnchorEl: null })
  }

  handleRememberChange = (event) => {
    this.setState({ rememberLogin: event.target.checked })
  }
  render() {
    const { fail, resetPassword, recoverPassword, passwordValue, isCapsLock, isComposition, canRecover, firstThree } = this.state
    if (resetPassword) return <Reset onOut={this.handleResetOut} />
    if (recoverPassword) return <Recover firstThree={firstThree} onOut={this.handleRecoverOut} />
    return (
      <div className={('door-body' + (fail ? ' door-fail' : '')) + ' page-background'} style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{
            margin: 0,
            marginBottom: '25px',
            color: '#2c3e50',
            fontSize: '24px',
            fontWeight: '500'
          }}>
            请输入密码
          </h2>
          <div className={'door-input' + (fail ? ' door-swing' : '')} style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '15px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            width: '320px',
            position: 'relative',
            border: '1px solid #e1e1e1',
            transition: 'all 0.3s ease'
          }}>
            <InputBase
              autoFocus
              fullWidth
              type='password'
              placeholder='请输入6位密码'
              value={passwordValue}
              onKeyDown={this.handleInputKeydown}
              onChange={this.handleInputChange}
              inputProps={{
                maxLength: 6,
                style: {
                  fontSize: '20px',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  fontWeight: '500',
                  paddingLeft: 0,
                  height: '30px',
                  color: '#34495e'
                }
              }}
            />
            <div className='door-input-enter' style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              <IconButton
                onClick={this.handleEnter}
                color="primary"
                style={{
                  background: passwordValue.length === 6 ? '#4CAF50' : 'transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                <SubdirectoryArrowLeftIcon style={{
                  color: passwordValue.length === 6 ? '#fff' : '#666'
                }} />
              </IconButton>
            </div>
            <div className='door-tooltip' style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              fontSize: '13px',
              color: '#e74c3c',
              fontWeight: '500'
            }}>
              {isCapsLock && <div>键盘大写锁定已打开</div>}
              {isComposition && <div>请切换到英文输入法</div>}
            </div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: isCapsLock || isComposition ? '32px' : '16px',
            padding: '0 4px 0 8px',
            width: '320px'
          }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.rememberLogin}
                  onChange={this.handleRememberChange}
                  size="small"
                  sx={{
                    padding: '4px',
                    color: '#95a5a6',
                    '&.Mui-checked': {
                      color: '#3498db',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(52, 152, 219, 0.04)',
                    }
                  }}
                />
              }
              sx={{
                marginLeft: '-4px',
                '& .MuiFormControlLabel-label': {
                  marginLeft: '4px'
                }
              }}
              label={
                <span style={{
                  fontSize: '13px',
                  color: '#7f8c8d',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  msUserSelect: 'none',
                  opacity: 1
                }}>
                  1天内免登录
                </span>
              }
            />

            <Button
              onClick={this.handleMenuOpen}
              variant="text"
              size="small"
              sx={{
                minWidth: 'auto',
                fontSize: '13px',
                color: '#7f8c8d !important',
                fontWeight: '400',
                textTransform: 'none',
                borderRadius: '16px',
                transition: 'all 0.2s ease',
              }}
              endIcon={<KeyboardArrowDownIcon sx={{
                fontSize: 18,
                transition: 'transform 0.3s ease',
                transform: Boolean(this.state.menuAnchorEl) ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />}
            >
              <span style={{
                fontSize: '13px',
                color: '#7f8c8d',
              }}>
                密码选项
              </span>
            </Button>
            <Menu
              anchorEl={this.state.menuAnchorEl}
              open={Boolean(this.state.menuAnchorEl)}
              onClose={this.handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                  borderRadius: '12px',
                  minWidth: 180,
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem
                onClick={() => {
                  this.handleMenuClose()
                  this.handleResetClick()
                }}
                sx={{
                  fontSize: '14px',
                  py: 1.5,
                  px: 2.5,
                  borderRadius: '8px',
                  mx: 1,
                  my: 0.5,
                  gap: 1.5,
                  color: '#2c3e50',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(52, 152, 219, 0.08)',
                  }
                }}
              >
                <EditIcon sx={{ fontSize: 18, color: '#3498db' }} /> 修改密码
              </MenuItem>
              {canRecover && (
                <MenuItem
                  onClick={() => {
                    this.handleMenuClose()
                    this.handleRecoverClick()
                  }}
                  sx={{
                    fontSize: '14px',
                    py: 1.5,
                    px: 2.5,
                    borderRadius: '8px',
                    mx: 1,
                    my: 0.5,
                    gap: 1.5,
                    color: '#2c3e50',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(230, 126, 34, 0.08)',
                    }
                  }}
                >
                  <HelpOutlineIcon sx={{ fontSize: 18, color: '#e67e22' }} /> 找回密码
                </MenuItem>
              )}
            </Menu>
          </div>
        </div>
      </div>
    )
  }
}
