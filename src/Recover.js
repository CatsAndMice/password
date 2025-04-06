import React from 'react'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import InputBase from '@mui/material/InputBase'
import Alert from '@mui/material/Alert'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

export default class Recover extends React.Component {
  state = {
    inputValue: '',
    attempts: 0,
    countdown: 0,
    error: '',
    showError: false,
    isVerified: false,
    fullPassword: '',
    firstThree: ''
  }

  componentDidMount() {
    const { firstThree } = this.props
    if (firstThree) {
      this.setState({ firstThree })
    }
  }

  handleVerify = () => {
    const { inputValue, attempts } = this.state
    if (attempts >= 3) return

    const testPassword = `${this.state.firstThree}${inputValue}`
    const keyIV = window.services.verifyPassword(testPassword)
    if (keyIV) {
      this.setState({
        isVerified: true,
        fullPassword: testPassword
      })
    } else {
      this.setState(prev => ({
        attempts: prev.attempts + 1,
        error: '密码错误，请重试',
        showError: true,
        inputValue: ''
      }), () => {
        if (this.state.attempts >= 3) {
          this.startCountdown()
        }
        setTimeout(() => {
          this.setState({ showError: false })
        }, 3000)
      })
    }
  }

  componentWillUnmount() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  }

  startCountdown = () => {
    this.setState({ countdown: 60 })
    this.countdownTimer = setInterval(() => {
      this.setState(prev => ({
        countdown: prev.countdown - 1
      }), () => {
        if (this.state.countdown === 0) {
          clearInterval(this.countdownTimer)
          this.setState({ attempts: 0 })
        }
      })
    }, 1000)
  }

  handleCopy = () => {
    const { fullPassword } = this.state
    if (!fullPassword) return

    navigator.clipboard.writeText(fullPassword)
      .then(() => {
        this.setState({
          showError: true,
          error: '密码已复制到剪贴板'
        }, () => {
          setTimeout(() => {
            this.setState({ showError: false })
          }, 2000)
        })
      })
      .catch(() => {
        this.setState({
          showError: true,
          error: '复制失败，请手动复制'
        }, () => {
          setTimeout(() => {
            this.setState({ showError: false })
          }, 2000)
        })
      })
  }

  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.handleVerify()
    }
  }

  render() {
    const { inputValue, attempts, countdown, error, showError, isVerified } = this.state
    const isDisabled = attempts >= 3 && countdown > 0

    return (
      <div className='page-background' style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          position: 'relative',
          width: '400px',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1), 0 0 20px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.9)'
        }}>
          <Tooltip title="返回" placement="top">
            <IconButton
              onClick={this.props.onOut}
              style={{
                position: 'absolute',
                left: '16px',
                top: '16px'
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <h2 style={{
            textAlign: 'center',
            margin: '0 0 30px 0',
            color: '#2c3e50',
            fontSize: '24px',
            fontWeight: '500'
          }}>
            找回密码
          </h2>

          {!isVerified ? (
            <>
              <div style={{
                fontSize: '16px',
                color: '#34495e',
                lineHeight: '1.8',
                marginBottom: '28px',
                textAlign: 'center',
                padding: '20px',
                background: 'rgba(52, 152, 219, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(52, 152, 219, 0.1)'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  您的密码前三位是：
                  <span style={{
                    fontWeight: '600',
                    color: '#2c3e50',
                    background: '#fff',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    letterSpacing: '2px'
                  }}>
                    {this.state.firstThree}
                  </span>
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#7f8c8d',
                  marginTop: '8px'
                }}>
                  请输入后三位密码进行验证
                </div>
              </div>
              <div style={{
                position: 'relative',
                marginBottom: '24px'
              }}>
                <InputBase
                  value={inputValue}
                  autoFocus
                  onChange={(e) => this.setState({ inputValue: e.target.value })}
                  onKeyDown={this.handleKeyDown}
                  disabled={isDisabled}
                  placeholder="请输入后三位密码"
                  type="password"
                  fullWidth
                  inputProps={{
                    maxLength: 3,
                    style: {
                      textAlign: 'center',
                      fontSize: '20px',
                      letterSpacing: '8px',
                      padding: '10px',
                      background: '#f8f9fa',
                      borderRadius: '8px'
                    }
                  }}
                />
                {showError && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#e74c3c',
                    fontSize: '14px'
                  }}>
                    {error}
                  </div>
                )}
              </div>

              {attempts > 0 && (
                <Alert severity="warning" style={{ marginBottom: '24px' }}>
                  剩余尝试次数：{3 - attempts}次
                </Alert>
              )}

              {isDisabled && (
                <Alert severity="error" style={{ marginBottom: '24px' }}>
                  已超出最大尝试次数，请等待{countdown}秒后重试
                </Alert>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={this.handleVerify}
                disabled={isDisabled || !inputValue || inputValue.length < 3}
                style={{
                  textTransform: 'none',
                  background: isDisabled ? '#ccc' : '#3498db',
                  padding: '10px',
                  fontSize: '15px'
                }}
              >
                验证
              </Button>
            </>
          ) : (
            <>
              <div style={{
                fontSize: '15px',
                color: '#34495e',
                lineHeight: '1.6',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                验证成功！您的完整密码是：
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  padding: '12px 24px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  letterSpacing: '4px'
                }}>
                  {this.state.fullPassword}
                </div>
                <IconButton onClick={this.handleCopy}>
                  <ContentCopyIcon />
                </IconButton>
              </div>
              <Button
                variant="contained"
                fullWidth
                onClick={this.props.onOut}
                style={{
                  textTransform: 'none',
                  background: '#3498db',
                  padding: '10px',
                  fontSize: '15px'
                }}
              >
                返回登录
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }
}