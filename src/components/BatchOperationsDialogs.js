import React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

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

const renderTreeOptions = (nodes, depth = 0) => {
  return nodes.map(node => [
    <MenuItem key={node._id} value={node._id} sx={{ pl: 2 + depth * 2 }}>
      {node.name}
    </MenuItem>,
    node.childs ? renderTreeOptions(node.childs, depth + 1) : null
  ])
}

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
        <FormControl fullWidth size="small">
          <InputLabel>目标分组</InputLabel>
          <Select value={targetGroupId || ''} label="目标分组" onChange={e => onChangeGroup(e.target.value)}>
            {renderTreeOptions(groupTree)}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button disabled={!targetGroupId} variant="contained" onClick={onConfirm}>移动</Button>
      </DialogActions>
    </Dialog>
  )
}

export { BatchDeleteDialog, BatchMoveDialog }
