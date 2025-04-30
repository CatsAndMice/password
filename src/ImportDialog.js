import React from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
// 添加文件上传图标
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AttachFileIcon from '@mui/icons-material/AttachFile'
// 添加新的导入
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Tooltip from '@mui/material/Tooltip'
// 添加表格相关组件导入
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { getFavicon } from './utils/getFavicon'
export default class ImportDialog extends React.Component {
    state = {
        open: false,
        password: '',
        content: ''
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {
            this.setState({ open: true, password: '', content: '' })
        }
    }

    handleClose = () => {
        this.setState({ open: false })
    }

    handlePasswordChange = (e) => {
        this.setState({ password: e.target.value })
    }

    handleContentChange = (e) => {
        this.setState({ content: e.target.value })
    }

    handleImport = async () => {
        const { data } = this.props
        if (!data) return
        const keyIV = window.services.verifyPassword(this.state.password)
        if (!keyIV) {
            return this.props.showMessage('开门密码错误', 'error')
        }
        if (!this.state.content.trim()) {
            return this.props.showMessage('请输入要导入的数据', 'error')
        }

        try {
            const parsedAccounts = this.parseContent(this.state.content)
            if (parsedAccounts.length === 0) {
                return this.props.showMessage('未找到有效的帐号数据', 'error')
            }

            // 处理账号数据并获取 favicon
            const accounts = await Promise.all(parsedAccounts.map(async account => {
                const baseAccount = {
                    _id: window.services.generateId('account/'),
                    groupId: data.group._id,
                    createAt: Date.now(),
                    title: account.title ? window.services.encryptValue(keyIV, account.title) : '',
                    username: account.username ? window.services.encryptValue(keyIV, account.username) : '',
                    password: account.password ? window.services.encryptValue(keyIV, account.password) : '',
                    link: account.link ? window.services.encryptValue(keyIV, account.link) : '',
                    remark: account.remark ? window.services.encryptValue(keyIV, account.remark) : ''
                }

                // 如果有链接，尝试获取 favicon
                // if (account.link) {
                //     try {
                //         const favicon = await getFavicon(account.link)
                //         if (favicon) {
                //             baseAccount.favicon = favicon
                //         }
                //     } catch (error) {
                //         console.error('获取favicon失败:', error)
                //     }
                // }

                return baseAccount
            }))

            this.setState({ open: false })
            this.props.onImport(accounts)
            this.props.showMessage(`成功导入 ${accounts.length} 个帐号`, 'success')
        } catch (error) {
            this.props.showMessage('导入失败，数据格式错误', 'error')
        }
    }

    // 在 class ImportDialog 中添加文件处理函数
    handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (!file) return

        if (file.type !== 'text/plain') {
            this.props.showMessage('请上传 txt 文件', 'error')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            this.setState({ content: e.target.result })
        }
        reader.onerror = () => {
            this.props.showMessage('文件读取失败', 'error')
        }
        reader.readAsText(file)
    }

    // 解析数据的方法
    parseContent = (content) => {
        const accounts = []
        const contents = content.split('【')
        contents.forEach(content => {
            if (!content.trim()) return
            const lines = content.split('\n')
            if (lines.length < 3) return

            const account = {
                title: lines[0].replace('】', ''),
                username: '',
                password: '',
                link: '',
                remark: ''
            }

            lines.slice(1).forEach(line => {
                if (line.startsWith('用户名：')) {
                    account.username = line.replace('用户名：', '')
                } else if (line.startsWith('密码：')) {
                    account.password = line.replace('密码：', '')
                } else if (line.startsWith('链接：')) {
                    account.link = line.replace('链接：', '')
                } else if (line.startsWith('说明：')) {
                    account.remark = line.replace('说明：', '')
                }
            })
            if (account.title || account.username || account.password || account.link || account.remark) {
                accounts.push(account)
            }
        })
        return accounts
    }

    // 修改渲染部分
    render() {
        const { data } = this.props
        if (!data) return false
        const { open, password, content } = this.state
        const parsedAccounts = content ? this.parseContent(content) : []

        return (
            <Dialog open={open} onClose={this.handleClose} maxWidth="md" fullWidth>
                <DialogTitle>导入帐号数据到分组</DialogTitle>
                <DialogContent dividers>
                    <DialogContentText sx={{
                        paddingBottom: '10px',
                        color: '#2c3e50'
                    }}>
                        导入数据到「{data.group.name}」分组
                    </DialogContentText>
                    <TextField
                        error={Boolean(password) && password.length < 6}
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
                            marginBottom: '16px',
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
                        helperText={password && password.length < 6 ? '请输入6位密码' : ''}
                    />
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <Stack spacing={2} direction="column" sx={{ width: '100%' }}>
                            <TextField
                                multiline
                                rows={8}
                                fullWidth
                                label='帐号数据'
                                value={content}
                                onChange={this.handleContentChange}
                                variant='outlined'
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        backgroundColor: '#ffffff'
                                    }
                                }}
                                placeholder={`请输入要导入的帐号数据，格式如下：
【标题】
用户名：xxx
密码：xxx
链接：xxx
说明：xxx`}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1, mr: 1 }}>
                                            <input
                                                type="file"
                                                accept=".txt"
                                                style={{ display: 'none' }}
                                                onChange={this.handleFileUpload}
                                                id="file-upload"
                                            />
                                            <label htmlFor="file-upload">
                                                <Tooltip title="上传txt文件" placement="top">
                                                    <IconButton
                                                        component="span"
                                                        size="small"
                                                        sx={{
                                                            border: '1px solid rgba(0, 0, 0, 0.23)',
                                                            borderRadius: '4px',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                            }
                                                        }}
                                                    >
                                                        <AttachFileIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </label>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            {parsedAccounts.length > 0 && (
                                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>序号</TableCell>
                                                <TableCell>标题</TableCell>
                                                <TableCell>用户名</TableCell>
                                                <TableCell>密码</TableCell>
                                                <TableCell>链接</TableCell>
                                                <TableCell>说明</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {parsedAccounts.map((account, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{account.title}</TableCell>
                                                    <TableCell>{account.username}</TableCell>
                                                    <TableCell>{account.password}</TableCell>
                                                    <TableCell>{account.link}</TableCell>
                                                    <TableCell>{account.remark}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Stack>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={!password || password.length < 6 || !content.trim()}
                        startIcon={<UploadFileIcon />}
                        onClick={this.handleImport}
                        color='primary'
                        variant='contained'
                    >
                        导入数据
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}