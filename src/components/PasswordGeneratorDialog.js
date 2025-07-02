import React, { useEffect, useRef } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import RandomPassword from '../RandomPassword'
import AddIcon from '@mui/icons-material/Add'
import D1API from '@/api/d1'
const PasswordGeneratorDialog = ({ open, onClose }) => {
    const randomPasswordRef = useRef(null)

    const handleCopy = () => {
        const passwordValue = randomPasswordRef.current.getPasswordValue()
        window.utools.copyText(passwordValue)
        onClose()
        D1API.trackEvent({ message: '使用密码生成器' })
    }

    useEffect(() => {
        if (randomPasswordRef.current) {
            randomPasswordRef.current.generateRandom()
        }
        window.addEventListener('copy', handleCopy)

        return () => {
            window.removeEventListener('copy', handleCopy)
        }
    }, [])

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                console.log(randomPasswordRef.current);
                if (randomPasswordRef.current) {
                    randomPasswordRef.current.generateRandom()
                }
            }, 0)
        }
    }, [open])

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
                密码生成器
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
            <DialogContent dividers>
                <RandomPassword from='random' ref={randomPasswordRef} />
            </DialogContent>
            <DialogActions>
                <Button
                    // onClick={handleCopyAndCreate} 
                    variant='contained'
                    color='secondary'
                    endIcon={<AddIcon />}
                >
                    复制并创建帐号
                </Button>
                <Button onClick={handleCopy} variant='contained' color='primary' endIcon={<SendIcon />}>复制密码 ({window.utools.isMacOs() ? '⌘' : 'Ctrl'}+C)</Button>
            </DialogActions>
        </Dialog>
    )
}

export default PasswordGeneratorDialog