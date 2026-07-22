import React from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Tooltip from '@mui/material/Tooltip'
import CSVParser from './utils/csvParser'
import CloseIcon from '@mui/icons-material/Close'
import ImportPreviewTable from './components/ImportPreviewTable'

export default class ImportDialog extends React.Component {
    state = { open: false, password: '', content: '' }

    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) this.setState({ open: true, password: '', content: '' })
    }

    handleClose = () => this.setState({ open: false })
    handlePasswordChange = (e) => this.setState({ password: e.target.value })
    handleContentChange = (e) => this.setState({ content: e.target.value })

    handleImport = async () => {
        const { data } = this.props
        if (!data) return
        const keyIV = window.services.verifyPassword(this.state.password)
        if (!keyIV) return this.props.showMessage('开门密码错误', 'error')
        if (!this.state.content.trim()) return this.props.showMessage('请输入要导入的数据', 'error')

        try {
            const parsedAccounts = this.parseContent(this.state.content)
            if (parsedAccounts.length === 0) return this.props.showMessage('未找到有效的帐号数据', 'error')

            const accounts = await Promise.all(parsedAccounts.map(async account => ({
                _id: window.services.generateId('account/'),
                groupId: data.group._id,
                createAt: Date.now(),
                title: account.title ? window.services.encryptValue(keyIV, account.title) : '',
                username: account.username ? window.services.encryptValue(keyIV, account.username) : '',
                password: account.password ? window.services.encryptValue(keyIV, account.password) : '',
                link: account.link ? window.services.encryptValue(keyIV, account.link) : '',
                remark: account.remark ? window.services.encryptValue(keyIV, account.remark) : ''
            })))

            this.setState({ open: false })
            this.props.onImport(accounts)
            this.props.showMessage(`成功导入 ${accounts.length} 个帐号`, 'success')
        } catch (error) {
            this.props.showMessage('导入失败，数据格式错误', 'error')
        }
    }

    handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (!file) return
        if (!['text/plain', 'text/csv', 'application/csv'].includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
            this.props.showMessage('请上传 txt 或 csv 文件', 'error'); return
        }
        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target.result
            if (file.name.endsWith('.csv')) {
                const accounts = CSVParser.parseCSV(content)
                accounts.length > 0 ? this.setState({ content: CSVParser.convertToText(accounts) }) : this.props.showMessage('CSV 文件格式不正确或没有找到有效数据', 'error')
            } else this.setState({ content })
        }
        reader.onerror = () => this.props.showMessage('文件读取失败', 'error')
        reader.readAsText(file)
    }

    parseContent = (content) => {
        const accounts = []
        content.split('【').forEach(chunk => {
            if (!chunk.trim()) return
            const lines = chunk.split('\n')
            if (lines.length < 3) return
            const account = { title: lines[0].replace('】', ''), username: '', password: '', link: '', remark: '' }
            lines.slice(1).forEach(line => {
                if (line.startsWith('用户名：')) account.username = line.replace('用户名：', '')
                else if (line.startsWith('密码：')) account.password = line.replace('密码：', '')
                else if (line.startsWith('链接：')) account.link = line.replace('链接：', '')
                else if (line.startsWith('说明：')) account.remark = line.replace('说明：', '')
            })
            if (account.title || account.username || account.password || account.link || account.remark) accounts.push(account)
        })
        return accounts
    }

    render() {
        const { data } = this.props
        if (!data) return false
        const { open, password, content } = this.state
        const parsedAccounts = content ? this.parseContent(content) : []

        return (
            <Dialog open={open} onClose={(event, reason) => { if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') this.handleClose() }} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 8px 8px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>导入帐号数据到分组</div>
                    <IconButton onClick={this.handleClose} size="small" sx={{ color: 'var(--color-text-disabled)', '&:hover': { color: 'var(--color-text-primary)' } }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <DialogContentText sx={{ paddingBottom: '10px', color: 'var(--color-text-primary)' }}>导入数据到「{data.group.name}」分组</DialogContentText>
                    <TextField error={Boolean(password) && password.length < 6} autoFocus variant='outlined' type='password' fullWidth label='开门密码' value={password}
                        onChange={this.handlePasswordChange} size='small' inputProps={{ maxLength: 6, style: { fontSize: '16px', letterSpacing: '4px' } }}
                        sx={{ marginBottom: '16px', '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--color-bg-card)', '& input': { padding: '8px 14px', height: '1.4em', lineHeight: '1.4em' } } }}
                        helperText={password && password.length < 6 ? '请输入6位密码' : ''} />
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <Stack spacing={2} direction="column" sx={{ width: '100%' }}>
                            <TextField multiline rows={8} fullWidth label='帐号数据' value={content} onChange={this.handleContentChange}
                                variant='outlined' sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--color-bg-card)' } }}
                                placeholder={`请输入要导入的帐号数据，格式如下：\n【标题】\n用户名：xxx\n密码：xxx\n链接：xxx\n说明：xxx`}
                                InputProps={{ endAdornment: (
                                    <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1, mr: 1 }}>
                                        <input type="file" accept=".txt,.csv" style={{ display: 'none' }} onChange={this.handleFileUpload} id="file-upload" />
                                        <label htmlFor="file-upload">
                                            <Tooltip title="上传txt或csv文件" placement="top">
                                                <IconButton component="span" size="small" sx={{ border: '1px solid var(--color-border)', borderRadius: '4px', '&:hover': { backgroundColor: 'var(--color-bg-overlay)' } }}>
                                                    <AttachFileIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </label>
                                    </InputAdornment>
                                ) }} />
                            {parsedAccounts.length > 0 && <ImportPreviewTable accounts={parsedAccounts} />}
                        </Stack>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button disabled={!password || password.length < 6 || !content.trim()} startIcon={<UploadFileIcon />}
                        onClick={this.handleImport} color='primary' variant='contained'>导入数据</Button>
                </DialogActions>
            </Dialog>
        )
    }
}