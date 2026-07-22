import React from 'react'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import InputBase from '@mui/material/InputBase'
import Alert from '@mui/material/Alert'
import RecoverVerifiedView from './components/RecoverVerifiedView'

/**
 * 密码找回页面
 * 显示密码前三位提示，用户输入后三位进行验证，最多3次尝试，失败后需等待60秒
 */
export default class Recover extends React.Component {
  state = { inputValue: '', attempts: 0, countdown: 0, error: '', showError: false, isVerified: false, fullPassword: '', firstThree: '' }

  componentDidMount() {
    if (this.props.firstThree) this.setState({ firstThree: this.props.firstThree })
  }

  // 验证后三位密码：拼合前三位+输入的后三位，通过 verifyPassword 校验
  handleVerify = () => {
    const { inputValue, attempts } = this.state
    if (attempts >= 3) return
    const testPassword = `${this.state.firstThree}${inputValue}`
    const keyIV = window.services.verifyPassword(testPassword)
    if (keyIV) {
      this.setState({ isVerified: true, fullPassword: testPassword })
    } else {
      this.setState(prev => ({ attempts: prev.attempts + 1, error: '密码错误，请重试', showError: true, inputValue: '' }), () => {
        if (this.state.attempts >= 3) this.startCountdown()
        setTimeout(() => this.setState({ showError: false }), 3000)
      })
    }
  }

  componentWillUnmount() { if (this.countdownTimer) clearInterval(this.countdownTimer) }

  // 60秒倒计时锁定
  startCountdown = () => {
    this.setState({ countdown: 60 })
    this.countdownTimer = setInterval(() => {
      this.setState(prev => ({ countdown: prev.countdown - 1 }), () => {
        if (this.state.countdown === 0) { clearInterval(this.countdownTimer); this.setState({ attempts: 0 }) }
      })
    }, 1000)
  }

  handleCopy = () => {
    if (!this.state.fullPassword) return
    navigator.clipboard.writeText(this.state.fullPassword)
      .then(() => this.showTempError('密码已复制到剪贴板'))
      .catch(() => this.showTempError('复制失败，请手动复制'))
  }

  showTempError = (msg) => {
    this.setState({ showError: true, error: msg }, () => setTimeout(() => this.setState({ showError: false }), 2000))
  }

  handleKeyDown = (event) => { if (event.key === 'Enter') this.handleVerify() }

  render() {
    const { inputValue, attempts, countdown, error, showError, isVerified } = this.state
    const isDisabled = attempts >= 3 && countdown > 0

    return (
      <div className='page-background' style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '400px', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-popup)', backdropFilter: 'blur(10px)', background: 'var(--color-bg-card)' }}>
          <Tooltip title="返回" placement="top">
            <IconButton onClick={this.props.onOut} style={{ position: 'absolute', left: '16px', top: '16px' }}><ArrowBackIcon /></IconButton>
          </Tooltip>
          <h2 style={{ textAlign: 'center', margin: '0 0 30px 0', color: 'var(--color-text-primary)', fontSize: '24px', fontWeight: '500' }}>找回密码</h2>

          {!isVerified ? (
            <>
              <div style={{ fontSize: '16px', color: 'var(--color-text-primary)', lineHeight: '1.8', marginBottom: '28px', textAlign: 'center', padding: '20px', background: 'var(--color-primary-light2)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ marginBottom: '12px' }}>
                  您的密码前三位是：
                  <span style={{ fontWeight: '600', color: 'var(--color-text-primary)', background: 'var(--color-bg-input)', padding: '4px 12px', borderRadius: '6px', boxShadow: 'var(--shadow-card)', letterSpacing: '2px' }}>
                    {this.state.firstThree}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>请输入后三位密码进行验证</div>
              </div>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <InputBase value={inputValue} autoFocus onChange={(e) => this.setState({ inputValue: e.target.value })}
                  onKeyDown={this.handleKeyDown} disabled={isDisabled} placeholder="请输入后三位密码" type="password" fullWidth
                  inputProps={{ maxLength: 3, style: { textAlign: 'center', fontSize: '20px', letterSpacing: '8px', padding: '10px', background: 'var(--color-bg-input)', borderRadius: '8px', color: 'var(--color-text-primary)' } }} />
                {showError && <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', color: 'var(--color-error)', fontSize: '14px' }}>{error}</div>}
              </div>
              {attempts > 0 && <Alert severity="warning" style={{ marginBottom: '24px' }}>剩余尝试次数：{3 - attempts}次</Alert>}
              {isDisabled && <Alert severity="error" style={{ marginBottom: '24px' }}>已超出最大尝试次数，请等待{countdown}秒后重试</Alert>}
              <Button variant="contained" fullWidth onClick={this.handleVerify} disabled={isDisabled || !inputValue || inputValue.length < 3}
                style={{ textTransform: 'none', background: isDisabled ? 'var(--color-text-disabled)' : 'var(--color-primary)', padding: '10px', fontSize: '15px' }}>
                验证
              </Button>
            </>
          ) : (
            <RecoverVerifiedView fullPassword={this.state.fullPassword} onCopy={this.handleCopy} onBack={this.props.onOut} />
          )}
        </div>
      </div>
    )
  }
}