import React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { TreeSelect } from "@arco-design/web-react"

/**
 * 批量删除确认弹窗
 */
function BatchDeleteDialog({ open, count, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>确认删除</DialogTitle>
      <DialogContent><DialogContentText>确定要删除选中的 {count} 个账号吗？此操作不可恢复。</DialogContentText></DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={onConfirm} color='error' variant='contained'>删除</Button>
      </DialogActions>
    </Dialog>
  )
}

/**
 * 批量移动账号弹窗，使用 TreeSelect 选择目标分组
 */
function BatchMoveDialog({ open, groupTree, targetGroupId, onChangeGroup, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={(event, reason) => { if (reason !== 'backdropClick') onClose() }} disableEscapeKeyDown>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 8px 8px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>移动账号</div>
        <IconButton onClick={onClose} size="small" sx={{ color: 'var(--color-text-disabled)', '&:hover': { color: 'var(--color-text-primary)' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText sx={{ mb: 2 }}>选择要移动到的目标分组：</DialogContentText>
        <div style={{ minWidth: '300px', maxHeight: '400px', overflow: 'auto' }}>
          <TreeSelect treeData={groupTree} placeholder="请选择目标分组" value={targetGroupId}
            onChange={onChangeGroup} style={{ width: '100%' }}
            fieldNames={{ key: '_id', title: 'name', children: 'childs' }} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button disabled={!targetGroupId} variant="contained" onClick={onConfirm}>移动</Button>
      </DialogActions>
    </Dialog>
  )
}

export { BatchDeleteDialog, BatchMoveDialog }