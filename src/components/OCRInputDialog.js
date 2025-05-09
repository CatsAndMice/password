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
import { createWorker, OEM } from 'tesseract.js'

const OCRInputDialog = ({ open, onClose, onConfirm, onCreate }) => {
    const [inputText, setInputText] = useState('')

    const handleImageUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        try {
            const worker = await createWorker(
                'chi_sim',
                OEM.DEFAULT, {
                langPath: process.env.TESSERACT_LANG_PATH,
                workerPath: process.env.TESSERACT_WORKER_PATH,
                corePath: process.env.TESSERACT_CORE_PATH
            }
            );
            const { data: { text } } = await worker.recognize(file);
            console.log(text);

            if (text) {
                //处理中文字符
                const processedText = text
                    .replace(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, '$1$2')
                    .replace(/\n/g, ',');
                console.log(processedText);
            }
            await worker.terminate();
        } catch (error) {
            console.error('OCR 识别失败:', error)
        }
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
        setInputText('')
        onClose()
    }

    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                    onClose()
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
                    onClick={onClose}

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
                    placeholder="请按格式输入：标题,用户名,密码,链接,说明（使用英文逗号分隔）"
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
                                    const result = await window.utools.ocr(URL.createObjectURL(file));
                                    if (result && result.length > 0) {
                                        setInputText(result.join(','));
                                    }
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
                        请按格式输入：标题,用户名,密码,链接,说明（使用英文逗号分隔）
                        <span className="ml-1 text-slate-300">支持粘贴图片自动识别</span>
                    </div>
                </div>
                {inputText.trim() && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                        <div className="font-medium text-slate-600 mb-2">预览结果：</div>
                        {(() => {
                            const [title, username, password, ...others] = inputText.split(',').map(item => item.trim())
                            return (
                                <div className="space-y-1 text-slate-500">
                                    <div>标题：{title || '未填写'}</div>
                                    <div>用户名：{username || '未填写'}</div>
                                    <div>密码：{password || '未填写'}</div>
                                    <div>链接：{others[0] || '未填写'}</div>
                                    <div>说明：{others[1] || '未填写'}</div>
                                </div>
                            )
                        })()}
                    </div>
                )}
            </DialogContent>
            <DialogActions className="p-4 gap-2">
                <Button
                    onClick={() => {
                        onClose()
                        onCreate()
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