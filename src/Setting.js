// 移除 import
import React from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

export default class Setting extends React.Component {
  state = {
    password: '',
    confirmPassword: '',
    confirmPasswordVerifyFail: false
  }

  handlePasswordChange = (e) => {
    const password = e.target.value
    this.setState({ password })
  }

  handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value
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
      <div className='setting-body'>
        <h2>请先设置开门密码</h2>
        <div className='setting-container'>
          <div>
            <TextField
              error={password && password.length < 6}
              variant='standard'
              autoFocus
              type='password'
              fullWidth
              label='开门密码'
              value={password}
              onChange={this.handlePasswordChange}
              inputProps={{ maxLength: 6 }}
              helperText={password ? (password.length < 6 ? '请输入6位密码' : '密码可用') : ''}
            />
          </div>
          <div>
            <TextField
              error={confirmPasswordVerifyFail}
              variant='standard'
              type='password'
              fullWidth
              label='确认开门密码'
              value={confirmPassword}
              onChange={this.handleConfirmPasswordChange}
              inputProps={{ maxLength: 6 }}
              helperText={confirmPasswordVerifyFail ? '密码不一致' : ''}
            />
          </div>
          <div>
            <Button
              onClick={this.handleOkClick}
              disabled={!password || !confirmPassword || password.length < 6 || confirmPasswordVerifyFail}
              fullWidth
              color='primary'
              size='large'
              variant='contained'
            >确认</Button>
            <div className='setting-remark'>开门密码用于验证进入及加密数据，忘记开门密码无法找回</div>
          </div>
        </div>
      </div>)
  }
}
