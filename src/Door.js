import React from 'react'
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import InputBase from '@mui/material/InputBase'
import Reset from './Reset'

export default class Door extends React.Component {
  state = {
    fail: false,
    passwordValue: '',
    resetPassword: false,
    isCapsLock: false,
    isComposition: false
  }

  handleEnter = () => {
    if (this.state.fail) return
    this.props.onVerify(this.state.passwordValue, () => {
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

  render() {
    const { fail, resetPassword, passwordValue, isCapsLock, isComposition } = this.state
    if (resetPassword) return <Reset onOut={this.handleResetOut} />
    return (
      <div className={'door-body' + (fail ? ' door-fail' : '')} style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '25px',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{
            margin: 0,
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
            width: '280px',
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
              marginTop: '10px',
              fontSize: '13px',
              color: '#e74c3c',
              fontWeight: '500'
            }}>
              {isCapsLock && <div>键盘大写锁定已打开</div>}
              {isComposition && <div>请切换到英文输入法</div>}
            </div>
          </div>
          <Button
            onClick={this.handleResetClick}
            variant="text"
            size="small"
            style={{
              fontSize: '14px',
              color: '#7f8c8d',
              textTransform: 'none',
              padding: '8px 16px',
              marginTop: '10px'
            }}
          >
            修改密码
          </Button>
        </div>
      </div>
    )
  }
}
