import React from 'react'
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import InputBase from '@mui/material/InputBase'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Reset from './Reset'
import Recover from './Recover'
import DoorMenu from './components/DoorMenu'

/**
 * 开门密码验证页面
 * 输入6位密码验证身份，支持大小写锁定检测、中文输入法检测、免登录、修改/找回密码
 */
export default class Door extends React.Component {
  state = {
    fail: false, passwordValue: '', resetPassword: false,
    isCapsLock: false, isComposition: false, recoverPassword: false,
    canRecover: false, firstThree: '', menuAnchorEl: null, rememberLogin: false,
  }

  componentDidMount() {
    // 检查是否有原始密码记录，决定是否显示找回密码选项
    const originalPassword = window.services.getOriginalPassword()
    this.setState({ canRecover: !!originalPassword })
  }

  // 提交密码验证：失败后抖动1秒
  handleEnter = () => {
    if (this.state.fail) return
    this.props.onVerify({ passText: this.state.passwordValue, rememberLogin: this.state.rememberLogin }, () => {
      this.setState({ fail: true })
      setTimeout(() => this.setState({ fail: false }), 1000)
    })
  }

  handleInputChange = (event) => {
    if (this.state.isComposition) return
    this.setState({ passwordValue: event.target.value })
  }

  // 处理键盘事件：检测大写锁定和中文输入法状态，按回车提交
  handleInputKeydown = (event) => {
    // 检测 CapsLock 状态
    if (event.getModifierState('CapsLock')) { if (!this.state.isCapsLock) this.setState({ isCapsLock: true }) }
    else { if (this.state.isCapsLock) this.setState({ isCapsLock: false }) }
    // keyCode 229 表示正在使用输入法组合输入
    if (event.keyCode === 229) {
      // 组合输入状态下，先失焦再聚焦以清除输入法状态
      if (!this.state.isComposition) this.setState({ isComposition: true })
      event.target.blur(); setTimeout(() => { event.target.focus() }, 300)
      return
    }
    if (this.state.isComposition) this.setState({ isComposition: false })
    // 回车键提交
    if (event.keyCode !== 13) return
    event.preventDefault(); this.handleEnter()
  }

  handleResetClick = () => this.setState({ resetPassword: true })
  handleResetOut = () => this.setState({ resetPassword: false })

  handleRecoverClick = () => {
    const originalPassword = window.services.getOriginalPassword()
    if (originalPassword) {
      this.setState({ recoverPassword: true, firstThree: originalPassword.slice(0, 3) })
    }
  }
  handleRecoverOut = () => this.setState({ recoverPassword: false })

  handleMenuOpen = (event) => this.setState({ menuAnchorEl: event.currentTarget })
  handleMenuClose = () => this.setState({ menuAnchorEl: null })
  handleRememberChange = (event) => this.setState({ rememberLogin: event.target.checked })

  render() {
    const { fail, resetPassword, recoverPassword, passwordValue, isCapsLock, isComposition, canRecover, firstThree } = this.state
    if (resetPassword) return <Reset onOut={this.handleResetOut} />
    if (recoverPassword) return <Recover firstThree={firstThree} onOut={this.handleRecoverOut} />
    return (
      <div className={('door-body' + (fail ? ' door-fail' : '')) + ' page-background'} style={{
        height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ margin: 0, marginBottom: '25px', color: 'var(--color-text-primary)', fontSize: '24px', fontWeight: '500' }}>请输入密码</h2>
          <div className={'door-input' + (fail ? ' door-swing' : '')} style={{
            background: 'var(--color-bg-card)', borderRadius: '12px', padding: '15px 20px',
            boxShadow: 'var(--shadow-card)', width: '320px', position: 'relative', border: '1px solid var(--color-border)', transition: 'all 0.3s ease'
          }}>
            <InputBase autoFocus fullWidth type='password' placeholder='请输入6位密码' value={passwordValue}
              onKeyDown={this.handleInputKeydown} onChange={this.handleInputChange}
              inputProps={{ maxLength: 6, style: { fontSize: '20px', textAlign: 'center', letterSpacing: '8px', fontWeight: '500', paddingLeft: 0, height: '30px', color: 'var(--color-text-primary)' } }} />
            <div className='door-input-enter' style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}>
              <IconButton onClick={this.handleEnter} color="primary"
                style={{ background: passwordValue.length === 6 ? 'var(--color-success)' : 'transparent', transition: 'all 0.3s ease' }}>
                <SubdirectoryArrowLeftIcon style={{ color: passwordValue.length === 6 ? '#fff' : 'var(--color-text-secondary)' }} />
              </IconButton>
            </div>
            <div className='door-tooltip' style={{
              position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px', fontSize: '13px', color: 'var(--color-error)', fontWeight: '500'
            }}>
              {isCapsLock && <div>键盘大写锁定已打开</div>}
              {isComposition && <div>请切换到英文输入法</div>}
            </div>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: isCapsLock || isComposition ? '32px' : '16px', padding: '0 4px 0 8px', width: '320px'
          }}>
            <FormControlLabel
              control={<Checkbox checked={this.state.rememberLogin} onChange={this.handleRememberChange} size="small"
                sx={{ padding: '4px', color: 'var(--color-text-disabled)', '&.Mui-checked': { color: 'var(--color-primary)' }, '&:hover': { backgroundColor: 'var(--color-primary-light2)' } }} />}
              sx={{ marginLeft: '-4px', '& .MuiFormControlLabel-label': { marginLeft: '4px' } }}
              label={<span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', userSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none', opacity: 1 }}>1天内免登录</span>} />
            <Button onClick={this.handleMenuOpen} variant="text" size="small"
              sx={{ minWidth: 'auto', fontSize: '13px', color: 'var(--color-text-secondary) !important', fontWeight: '400', textTransform: 'none', borderRadius: '16px', transition: 'all 0.2s ease' }}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18, transition: 'transform 0.3s ease', transform: Boolean(this.state.menuAnchorEl) ? 'rotate(180deg)' : 'rotate(0deg)' }} />}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>密码选项</span>
            </Button>
            <DoorMenu
              anchorEl={this.state.menuAnchorEl} open={Boolean(this.state.menuAnchorEl)}
              onClose={this.handleMenuClose} canRecover={canRecover}
              onResetClick={this.handleResetClick} onRecoverClick={this.handleRecoverClick} />
          </div>
        </div>
      </div>
    )
  }
}