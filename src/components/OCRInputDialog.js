import React, { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import Tooltip from '@mui/material/Tooltip'
import CloseIcon from '@mui/icons-material/Close'
import InputAdornment from '@mui/material/InputAdornment'
import D1API from '@/api/d1'
import { recognizeTextFromImage, cancelOCR, isAbort } from "../api/ocr"

let interval = null
const OCRInputDialog = ({ open, onClose, onConfirm, onCreate }) => {
    const [inputText, setInputText] = useState('')
    const [recognizing, setRecognizing] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleCancelRecognize = (isTrackEvent = true) => {
        clearInterval(interval)
        cancelOCR()
        setRecognizing(false)
        setProgress(0)
        isTrackEvent && D1API.trackEvent({ message: '取消图片识别' })
    }

    const handleImageUpload = async (event) => {
        handleCancelRecognize(false)
        if (recognizing) return
        const file = event.target.files[0]
        if (!file) return
        setRecognizing(true)
        setProgress(0)
        setTimeout(() => {
            // 模拟进度效果
            interval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + 10
                    if (newProgress >= 90) {
                        clearInterval(interval)
                        return 90
                    }
                    return newProgress
                })
            }, 200)
            const reader = new FileReader()
            reader.onload = async (e) => {
                try {
                    const base64Data = e.target.result.split(',')[1]
                    const result = await recognizeTextFromImage(base64Data)
                    clearInterval(interval)
                    setProgress(100)
                    // 增强健壮性的识别结果处理
                    let recognizedText = ''
                    if (result && result.success && Array.isArray(result.ret)) {
                        recognizedText = result.ret
                            .filter(item => item && item.word && typeof item.word === 'string')
                            .map(item => item.word)
                            .filter(word => word.length > 0)
                            .join('')
                    }
                    setRecognizing(false)
                    if (!recognizedText) {
                        setInputText('未能识别到有效文字内容')
                        D1API.trackEvent({ message: '未能识别到有效文字内容' })
                        return
                    }
                    setInputText(recognizedText)
                    D1API.trackEvent({ message: '图片识别成功' })
                } catch (error) {
                    clearInterval(interval)
                    setProgress(0)
                    if (isAbort) {
                        D1API.trackEvent({ message: `手动取消OCR` })
                        return
                    }
                    D1API.trackEvent({ message: `图片识别失败: ${error.message}` })
                    setInputText('图片识别出现问题，请尝试以下方法：\n1. 确保图片清晰可读\n2. 调整图片亮度和对比度\n3. 重新截取或拍摄图片\n4. 手动输入文本')
                } finally {
                    setRecognizing(false)
                    setProgress(0)
                }
            }
            reader.readAsDataURL(file)
        }, 100)
    }

    const handleClose = async () => {
        setInputText('')
        onClose()
    }




    const handleConfirm = () => {
        if (!inputText.trim()) return
        // 解析输入文本
        const [title, username, password, ...others] = inputText.split(',').map(item => item.trim())
        onConfirm({
            title: title || '',
            username: username || '',
            password: password || '',
            link: others[0] || '',
            remark: others[1] || ''
        })
        handleClose()
        D1API.trackEvent({ message: '快速新建帐号' })
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
                快速新增账号
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
                    placeholder=" 请按照格式输入：标题,用户名,密码,链接,说明（使用英文逗号分隔）"
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: '#ffffff'
                        }
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1, mr: 1 }}>
                                {recognizing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm text-blue-500">{progress}%</div>
                                        <Tooltip title="取消识别" placement="top">
                                            <IconButton
                                                onClick={handleCancelRecognize}
                                                size="small"
                                                sx={{
                                                    border: '1px solid rgba(0, 0, 0, 0.23)',
                                                    borderRadius: '4px',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                    }
                                                }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                ) : (
                                    <React.Fragment>
                                        <input
                                            type="file"
                                            accept="image/bmp,image/jpeg,image/png,image/pbm,image/webp"
                                            style={{ display: 'none' }}
                                            onChange={handleImageUpload}
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload">
                                            <Tooltip title="上传图片识别" placement="top">
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
                                                    <PhotoCamera fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </label>
                                    </React.Fragment>
                                )}
                            </InputAdornment>
                        )
                    }}

                    onPaste={async (e) => {
                        const items = e.clipboardData.items;
                        for (let item of items) {
                            if (item.type.indexOf('image') !== -1) {
                                e.preventDefault();
                                const file = item.getAsFile();
                                try {
                                    await handleImageUpload({ target: { files: [file] } });
                                } catch (error) {
                                    console.error('OCR 识别失败:', error);
                                }
                            }
                        }
                    }}
                />
                <div className="p-3 pl-0 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-slate-400">
                        请按照格式输入：标题,用户名,密码,链接,说明（使用英文逗号分隔）
                        <span className="ml-1 text-slate-300">输入框支持粘贴图片识别内容</span>
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
                    {(() => {
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
                    })()}
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
        </Dialog>
    )
}

export default OCRInputDialog