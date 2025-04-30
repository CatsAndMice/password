import React from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import DescriptionIcon from '@mui/icons-material/Description'

export default class ExportDialog extends React.Component {
  state = {
    open: false,
    password: '',
    subChecked: false
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.setState({ open: true, password: '', subChecked: false })
    }
  }

  handleClose = (event) => {
    this.setState({ open: false })
  }

  handlePasswordChange = (e) => {
    this.setState({ password: e.target.value })
  }

  handleSubCheckeckChange = (e) => {
    this.setState({ subChecked: e.target.checked })
  }

  getTreeGroupIds = (node, ids) => {
    ids.push(node._id)
    if (node.childs) {
      for (const n of node.childs) {
        this.getTreeGroupIds(n, ids)
      }
    }
  }

  handleExport = () => {
    const { data, group2Accounts } = this.props
    if (!data) return
    const keyIV = window.services.verifyPassword(this.state.password)
    if (!keyIV) {
      return this.props.showMessage('开门密码错误', 'error')
    }
    this.setState({ open: false })
    const accountList = []
    if (this.state.subChecked) {
      const ids = []
      this.getTreeGroupIds(data.group, ids)
      for (const id of ids) {
        const arr = group2Accounts[id]
        if (arr) accountList.push(...arr)
      }
    } else {
      const arr = group2Accounts[data.group._id]
      if (arr) accountList.push(...arr)
    }
    const contentArray = []
    accountList.forEach(x => {
      let content = '【' + window.services.decryptValue(keyIV, x.title) + '】\n'
      content += '用户名：' + window.services.decryptValue(keyIV, x.username) + '\n'
      content += '密码：' + window.services.decryptValue(keyIV, x.password) + '\n'
      if (x.link) {
        content += '链接：' + window.services.decryptValue(keyIV, x.link) + '\n'
      }
      if (x.remark) {
        content += '说明：' + window.services.decryptValue(keyIV, x.remark) + '\n'
      }
      contentArray.push(content)
    })
    window.services.exportFile(contentArray.join('\n'))
  }

  render() {
    const { data } = this.props
    if (!data) return false
    const { open, password, subChecked } = this.state
    return (
      <Dialog open={open} onClose={this.handleClose}>
        <DialogTitle>明文帐号数据导出</DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{
            paddingBottom: '10px',
            color: '#2c3e50'
          }}>
            导出「{data.group.name}」帐号数据
          </DialogContentText>
          <TextField
            error={password && password.length < 6}
            autoFocus
            variant='outlined'
            type='password'
            fullWidth
            label='开门密码'
            value={password}
            onChange={this.handlePasswordChange}
            size='small'
            inputProps={{
              maxLength: 6,
              style: {
                fontSize: '16px',
                letterSpacing: '4px'
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                '& input': {
                  padding: '8px 14px',
                  height: '1.4em',
                  lineHeight: '1.4em'
                }
              }
            }}
            helperText={password ? (password.length < 6 ? '请输入6位密码' : '') : ''}
          />
          <FormControlLabel onChange={this.handleSubCheckeckChange} checked={subChecked} control={<Checkbox />} label='包含子分组帐号数据' />
        </DialogContent>
        <DialogActions>
          <Button disabled={!password || password.length < 6} startIcon={<DescriptionIcon />} variant='contained' onClick={this.handleExport} color='primary'>
            导出 TXT
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
