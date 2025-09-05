import React, { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import D1API from '@/api/d1'

const OCRInputDialog = ({ open, onClose, onConfirm, onCreate }) => {
    const [inputText, setInputText] = useState('')
    const [isSimpleMode, setSimpleMode] = useState(utools.dbStorage.getItem("isSimpleMode") || false)

    const handleClose = async () => {
        setInputText('')
        onClose()
    }

    const handleConfirm = () => {
        if (!inputText.trim()) return
        if (isSimpleMode) {
            // 解析输入文本
            const [title, url] = inputText.split(',').map(item => item.trim())
            onConfirm({
                title: title || '',
                username: '',
                password: '',
                link: url || '',
                remark: ''
            })
        } else {
            // 解析输入文本
            const [title, username, password, ...others] = inputText.split(',').map(item => item.trim())
            onConfirm({
                title: title || '',
                username: username || '',
                password: password || '',
                link: others[0] || '',
                remark: others[1] || ''
            })
        }

        handleClose()
        D1API.trackEvent({ message: '快速新建帐号' })
    }

    const getHtml = () => {
        const [title, username, password, ...others] = inputText.split(',').map(item => item.trim())
        return (
            <div className="space-y-2 text-slate-500">
                <div>标题：{title || '未填写'}</div>
                <div>用户名：{username || '未填写'}</div>
                <div>密码：{password || '未填写'}</div>
                <div>链接：{others[0] || '未填写'}</div>
                <div>说明：{others[1] || '未填写'}</div>
            </div>
        )
    }

    const getSimpleHtml = () => {
        const [title, url] = inputText.split(',').map(item => item.trim())
        return (
            <div className="space-y-2 text-slate-500">
                <div>标题：{title || '未填写'}</div>
                <div>链接：{url || '未填写'}</div>
            </div>
        )
    }

    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                    handleClose()
                }
            }}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{
                m: 0,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div className='flex items-center' >
                    <span>快速新增账号</span>
                    <div className="ml-3 flex items-center text-xs cursor-pointer" style={{
                        color: '#9ca4b2',
                        height: '24px',
                    }}>
                        <span className='text-center   border-l border-t inline-block  border-b border-gray-300 rounded-l-full px-2 ' style={{
                            lineHeight: '22px',
                            ...(isSimpleMode ? {} : { color: '#2196F3', borderColor: '#cde1fd', backgroundColor: '#eff6fe' })
                        }}
                            onClick={() => setSimpleMode(() => {
                                utools.dbStorage.setItem("isSimpleMode", false)
                                return false
                            })}
                        >
                            完整版
                        </span>
                        <span className='border-r h-full' style={{
                            borderColor: '#cde1fd',
                        }} ></span>
                        <span className='text-center border-r border-t inline-block  border-b border-gray-300 rounded-r-full px-2 ' style={{
                            lineHeight: '22px',
                            ...(isSimpleMode ? { color: '#2196F3', borderColor: '#cde1fd', backgroundColor: '#eff6fe' } : {})
                        }}
                            onClick={() => setSimpleMode(() => {
                                utools.dbStorage.setItem("isSimpleMode", true)
                                return true
                            })}>
                            简洁版
                        </span>
                    </div>
                </div>

                <IconButton
                    onClick={handleClose}

                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 11,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers className='!px-4'>
                <TextField
                    multiline
                    minRows={4}
                    maxRows={8}
                    fullWidth
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isSimpleMode ? "请按照格式输入：标题,链接（使用英文逗号分隔）" : "请按照格式输入：标题,用户名,密码,链接,说明（使用英文逗号分隔）"}
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: '#ffffff'
                        }
                    }}
                />

                <div className="p-3 pl-0 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-slate-400">
                        {isSimpleMode ? "请按照格式输入：标题,链接（使用英文逗号分隔）" : "请按照格式输入：标题,用户名,密码,链接,说明（使用英文逗号分隔）"}
                    </div>
                </div>

                <div className=" p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                    <div className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        预览结果
                    </div>
                    {isSimpleMode ? getSimpleHtml() : getHtml()}
                </div>
            </DialogContent>
            <DialogActions className="p-4 gap-2">
                <Button
                    onClick={() => {
                        handleClose()
                        onCreate()
                        D1API.trackEvent({ message: '直接新建' })
                    }}
                >
                    直接新建
                </Button>
                <Button
                    onClick={handleConfirm}
                    color='primary'
                    variant='contained'
                    disabled={!inputText.trim()}
                >
                    确定
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default OCRInputDialog