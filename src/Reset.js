import React from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'


export default class Reset extends React.Component {
  state = {
    oldPassword: '',
    oldPasswordVerifyFail: false,
    password: '',
    confirmPassword: '',
    confirmPasswordVerifyFail: false,
    doing: false,
    showOldPassword: false,
    showPassword: false,
    showConfirmPassword: false
  }

  handleOldPasswordChange = (e) => {
    const oldPassword = e.target.value.replace(/[\u4e00-\u9fa5\s]/g, '')
    this.setState({ oldPassword, oldPasswordVerifyFail: false })
  }

  handlePasswordChange = (e) => {
    const password = e.target.value.replace(/[\u4e00-\u9fa5\s]/g, '')
    const { confirmPassword } = this.state
    this.setState({
      password,
      confirmPasswordVerifyFail: confirmPassword && password !== confirmPassword
    })
  }

  handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value.replace(/[\u4e00-\u9fa5\s]/g, '')
    const { password } = this.state
    this.setState({
      confirmPassword,
      confirmPasswordVerifyFail: password !== confirmPassword
    })
  }

  handleReset = () => {
    const { oldPassword, password, confirmPassword } = this.state
    if (!oldPassword || !password || !confirmPassword || password.length < 6) return
    if (password !== confirmPassword) return this.setState({ confirmPasswordVerifyFail: true })
    const oldKeyIV = window.services.verifyPassword(oldPassword)
    if (!oldKeyIV) return this.setState({ oldPasswordVerifyFail: true })
    this.setState({ doing: true })
    setTimeout(() => {
      if (!window.services.resetBcryptPass(password)) return
      const newKeyIV = window.services.verifyPassword(password)
      const accounts = window.utools.db.allDocs('account/')
      accounts.forEach(item => {
        ['title', 'username', 'password', 'remark', 'link'].forEach(f => {
          if (!item[f]) return
          try {
            const plainVal = window.services.decryptValue(oldKeyIV, item[f])
            item[f] = window.services.encryptValue(newKeyIV, plainVal)
          } catch (e) { }
        })
      })
      window.utools.db.bulkDocs(accounts)
      this.props.onOut()
    }, 50)
  }

  render() {
    const { doing, oldPassword, oldPasswordVerifyFail, password, confirmPassword, confirmPasswordVerifyFail } = this.state
    if (doing) {
      return (
        <div className='reset-doing' style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px'
        }}>
          <CircularProgress color='secondary' size={40} />
          <div style={{ color: '#666', fontSize: '16px' }}>修改中...</div>
        </div>
      )
    }
    return (
      <div className='setting-body' style={{
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
          gap: '25px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          width: '360px'
        }}>
          <h2 style={{
            margin: 0,
            color: '#2c3e50',
            fontSize: '24px',
            fontWeight: '500',
            textAlign: 'center'
          }}>修改开门密码</h2>

          <TextField
            error={oldPasswordVerifyFail}
            variant='outlined'
            autoFocus
            type={this.state.showOldPassword ? 'text' : 'password'}
            fullWidth
            label='旧的开门密码'
            value={oldPassword}
            onChange={this.handleOldPasswordChange}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => this.setState(state => ({ showOldPassword: !state.showOldPassword }))}
                  edge="end"
                  size="large"
                >
                  {this.state.showOldPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
            inputProps={{
              maxLength: 6,
              style: {
                fontSize: '18px',
                letterSpacing: '4px'
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                '& input': {
                  padding: '12px 14px',  // 调整输入框内边距
                  height: '1.4em',  // 设置输入框高度
                  lineHeight: '1.4em'  // 设置行高
                }
              }
            }}
            helperText={oldPasswordVerifyFail ? '密码错误' : ''}
          />

          <TextField
            error={password && password.length < 6}
            variant='outlined'
            type={this.state.showPassword ? 'text' : 'password'}
            fullWidth
            label='新的开门密码'
            value={password}
            onChange={this.handlePasswordChange}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => this.setState(state => ({ showPassword: !state.showPassword }))}
                  edge="end"
                  size="large"
                >
                  {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
            inputProps={{
              maxLength: 6,
              style: {
                fontSize: '18px',
                letterSpacing: '4px'
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                '& input': {
                  padding: '12px 14px',
                  height: '1.4em',
                  lineHeight: '1.4em'
                }
              }
            }}
            helperText={password ? (password.length < 6 ? '请输入6位密码' : '密码可用') : ''}
          />

          <TextField
            error={confirmPasswordVerifyFail}
            variant='outlined'
            type={this.state.showConfirmPassword ? 'text' : 'password'}
            fullWidth
            label='确认开门密码'
            value={confirmPassword}
            onChange={this.handleConfirmPasswordChange}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => this.setState(state => ({ showConfirmPassword: !state.showConfirmPassword }))}
                  edge="end"
                  size="large"
                >
                  {this.state.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
            inputProps={{
              maxLength: 6,
              style: {
                fontSize: '18px',
                letterSpacing: '4px'
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                '& input': {
                  padding: '12px 14px',  // 调整输入框内边距
                  height: '1.4em',  // 设置输入框高度
                  lineHeight: '1.4em'  // 设置行高
                }
              }
            }}
            helperText={confirmPasswordVerifyFail ? '密码不一致' : ''}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                onClick={this.props.onOut}
                size='large'
                variant='outlined'
                sx={{
                  flex: 1,
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '16px',
                  textTransform: 'none'
                }}
              >
                取消
              </Button>
              <Button
                onClick={this.handleReset}
                disabled={!oldPassword || !password || !confirmPassword || password.length < 6 || confirmPasswordVerifyFail || oldPasswordVerifyFail}
                color='secondary'
                size='large'
                variant='contained'
                sx={{
                  flex: 2,
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '16px',
                  textTransform: 'none',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(45deg, #FF4081 30%, #F50057 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #F50057 30%, #C51162 90%)'
                  }
                }}
              >
                修改密码
              </Button>
            </div>
            <div style={{
              color: '#666',
              fontSize: '13px',
              textAlign: 'center',
              marginTop: '5px'
            }}>
              修改开门密码将所有帐号数据解密再重新加密
            </div>
          </div>
        </div>
      </div>
    )
  }
}
