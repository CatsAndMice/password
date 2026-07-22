import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import BackupSettings from './BackupSettings'
import BatchOperations from './BatchOperations'

/**
 * 主界面弹窗容器
 * 渲染备份设置和批量操作两个全屏弹窗
 */
function HomeDialogs({ showBackupSettings, showBatchOperations, onBackupSettingsClose, onBatchOperationsClose, showMessage, groupTree, keyIV, group2Accounts, decryptAccountDic, onBatchDelete, onBatchMove }) {
  return (
    <>
      {showBackupSettings && (
        <Dialog
          open={showBackupSettings}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
              onBackupSettingsClose()
            }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 8px 8px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              备份设置
            </div>
            <IconButton
              onClick={onBackupSettingsClose}
              size="small"
              sx={{
                color: 'var(--color-text-disabled)',
                '&:hover': {
                  color: 'var(--color-text-primary)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <BackupSettings
              onClose={onBackupSettingsClose}
              showMessage={showMessage}
            />
          </DialogContent>
        </Dialog>
      )}

      {showBatchOperations && (
        <Dialog
          fullScreen
          open={showBatchOperations}
          onClose={onBatchOperationsClose}
        >
          <BatchOperations
            showMessage={showMessage}
            onClose={onBatchOperationsClose}
            groupTree={groupTree}
            keyIV={keyIV}
            group2Accounts={group2Accounts}
            decryptAccountDic={decryptAccountDic}
            onBatchDelete={onBatchDelete}
            onBatchMove={onBatchMove}
          />
        </Dialog>
      )}
    </>
  )
}

export default HomeDialogs
