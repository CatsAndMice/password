// 移除 import
import React from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

// 首先在文件顶部添加图标导入
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
// 导入备份恢复组件
import BackupRestore from './components/BackupRestore'

export default class Setting extends React.Component {
  state = {
    password: '',
    confirmPassword: '',
    confirmPasswordVerifyFail: false,
    showPassword: false,
    showConfirmPassword: false
  }

  handlePasswordChange = (e) => {
    const password = e.target.value.replace(/[\u4e00-\u9fa5\s]/g, '')
    this.setState({ password })
  }

  handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value.replace(/[\u4e00-\u9fa5\s]/g, '')
    const { password } = this.state
    this.setState({
      confirmPassword,
      confirmPasswordVerifyFail: password !== confirmPassword
    })
  }

  handleOkClick = () => {
    const { password, confirmPassword } = this.state
    if (!password || !confirmPassword || password.length < 6) return
    if (password !== confirmPassword) return this.setState({ confirmPasswordVerifyFail: true })
    this.props.onSet(password)
  }

  render() {
    const { password, confirmPassword, confirmPasswordVerifyFail } = this.state
    return (
      <div className='setting-body page-background' style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '25px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1), 0 0 20px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(10px)',
          width: '360px'
        }}>
          <h2 style={{
            margin: 0,
            color: '#2c3e50',
            fontSize: '24px',
            fontWeight: '500',
            textAlign: 'center'
          }}>请设置开门密码</h2>

          <TextField
            error={password && password.length < 6}
            variant='outlined'
            autoFocus
            type={this.state.showPassword ? 'text' : 'password'}
            fullWidth
            label='开门密码'
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
                  padding: '12px 14px',
                  height: '1.4em',
                  lineHeight: '1.4em'
                }
              }
            }}
            helperText={confirmPasswordVerifyFail ? '密码不一致' : ''}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button
              onClick={this.handleOkClick}
              disabled={!password || !confirmPassword || password.length < 6 || confirmPasswordVerifyFail}
              fullWidth
              color='primary'
              size='large'
              variant='contained'
              sx={{
                borderRadius: '12px',
                padding: '12px',
                fontSize: '16px',
                textTransform: 'none',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)'
                }
              }}
            >
              确认
            </Button>
            {/* 使用备份恢复组件 */}
            <BackupRestore
              onRestore={this.props.onRestore}
              buttonStyle={{
                borderRadius: '12px',
                padding: '12px',
                marginTop: '8px',
                fontSize: '14px',
                textTransform: 'none',
                height: '45px',
              }}
            />

            <div style={{
              color: '#666',
              fontSize: '13px',
              textAlign: 'center',
              marginTop: '5px'
            }}>
              开门密码用于验证进入及加密数据，忘记开门密码无法找回
            </div>
          </div>
        </div>
      </div>
    )
  }
}
