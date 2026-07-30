import React, { useState, useEffect, useMemo } from 'react'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import Box from '@mui/material/Box'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove'
import Tooltip from '@mui/material/Tooltip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { BatchDeleteDialog, BatchMoveDialog } from './BatchOperationsDialogs'

const iconStyle = {
  color: 'var(--color-primary)', transition: 'all 0.2s ease',
  '&:hover': { color: 'var(--color-primary-hover)', transform: 'scale(1.1)' },
  '&.Mui-disabled': { color: 'var(--color-text-disabled)', '&:hover': { transform: 'none' } }
}

const delIconStyle = {
  color: 'var(--color-error)', transition: 'all 0.2s ease',
  '&:hover': { color: 'var(--color-error-hover)', transform: 'scale(1.1)' },
  '&.Mui-disabled': { color: 'var(--color-text-disabled)', '&:hover': { transform: 'none' } }
}

const BatchOperations = ({ onClose, showMessage, groupTree, keyIV, decryptAccountDic, onBatchDelete, onBatchMove }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [list, setList] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [targetGroupId, setTargetGroupId] = useState('')
  const [searchText, setSearchText] = useState('')
  const [filterGroupId, setFilterGroupId] = useState('')
  const groupDic = {}
  const groupId2NameCache = {}

  const handleConfirmDelete = () => { setShowDeleteConfirm(false); onBatchDelete(selectedIds) }

  const handleCopy = () => {
    const copyContent = selectedIds.map(id => {
      const item = list.find(i => i.id === id)
      return `标题：${item.title}\n用户名：${item.username}\n密码：${item.password}\n链接：${item.link}\n说明：${item.remark}`
    }).join('\n\n')
    navigator.clipboard.writeText(copyContent).then(() => { showMessage('已复制到剪贴板'); setSelectedIds([]) }).catch(() => showMessage('复制失败', 'error'))
  }

  const generateGroupDic = (array, dic) => {
    for (const g of array) { dic[g._id] = g; if (g.childs) generateGroupDic(g.childs, dic) }
  }

  const getGroupName = (id, groupName) => {
    const name = groupDic[id].name + (groupName ? '-' : '') + groupName
    return groupDic[id].parentId ? getGroupName(groupDic[id].parentId, name) : name
  }

  const groupName = (id) => {
    if (id in groupId2NameCache) return groupId2NameCache[id]
    const name = getGroupName(id, ''); groupId2NameCache[id] = name; return name
  }

  const getList = () => {
    const groupedAccounts = {}
    for (const id in decryptAccountDic) {
      const cdata = decryptAccountDic[id]
      const groupId = cdata.account.groupId
      if (!groupedAccounts[groupId]) groupedAccounts[groupId] = []
      groupedAccounts[groupId].push({
        id: cdata.account._id, username: cdata.username || '-', groupId,
        name: groupName(groupId), title: cdata.title || '-',
        password: window.services.decryptValue(keyIV, cdata.account.password) || '-',
        link: window.services.decryptValue(keyIV, cdata.account.link) || '-',
        remark: window.services.decryptValue(keyIV, cdata.account.remark) || '-'
      })
    }
    setList(Object.values(groupedAccounts).flat(Infinity))
    setSelectedIds([])
  }

  const handleConfirmMove = () => {
    if (!targetGroupId) { showMessage('请选择目标分组', 'error'); return }
    onBatchMove(selectedIds, targetGroupId)
    setShowMoveDialog(false); setTargetGroupId(''); setSelectedIds([])
    showMessage('移动成功')
  }

  useEffect(() => {
    generateGroupDic(groupTree, groupDic)
    getList()
  }, [decryptAccountDic])

  const filteredList = useMemo(() => {
    return list.filter(row => {
      if (filterGroupId && row.groupId !== filterGroupId) return false
      if (searchText && !row.title.toLowerCase().includes(searchText.toLowerCase())) return false
      return true
    })
  }, [list, filterGroupId, searchText])

  const allSelected = filteredList.length > 0 && filteredList.every(r => selectedIds.includes(r.id))
  const someSelected = filteredList.some(r => selectedIds.includes(r.id)) && !allSelected

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(selectedIds.filter(id => !filteredList.find(r => r.id === id)))
    } else {
      const newIds = [...new Set([...selectedIds, ...filteredList.map(r => r.id)])]
      setSelectedIds(newIds)
    }
  }

  const handleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const renderGroupOptions = (nodes, depth = 0) => {
    return nodes.map(node => [
      <MenuItem key={node._id} value={node._id} sx={{ pl: 2 + depth * 2 }}>
        {node.name}
      </MenuItem>,
      node.childs ? renderGroupOptions(node.childs, depth + 1) : null
    ])
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-card)' }}>
      <Box className="flex items-center p-2" sx={{ borderBottom: '1px solid var(--color-divider)' }}>
        <IconButton onClick={onClose} size="small"><ChevronLeftIcon /></IconButton>
        <Typography variant="h6" sx={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>帐号批量管理</Typography>
      </Box>
      <Box className="flex items-center gap-2 p-2" sx={{ borderBottom: '1px solid var(--color-divider-light)' }}>
        <TextField size="small" placeholder="搜索标题" value={searchText} onChange={e => setSearchText(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'var(--color-text-secondary)' }} /></InputAdornment> }}
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: '13px' } }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>筛选分组</InputLabel>
          <Select value={filterGroupId} label="筛选分组" onChange={e => setFilterGroupId(e.target.value)}>
            <MenuItem value="">全部分组</MenuItem>
            {renderGroupOptions(groupTree)}
          </Select>
        </FormControl>
      </Box>
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table stickyHeader size="small" sx={{ '& .MuiTableCell-head': { fontWeight: 'bold', whiteSpace: 'nowrap', zIndex: 1 } }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, zIndex: 2, backgroundColor: 'var(--color-bg-card-hover)' }}>
                <Checkbox indeterminate={someSelected} checked={allSelected} onChange={handleSelectAll} size="small" />
              </TableCell>
              <TableCell sx={{ position: 'sticky', left: 48, zIndex: 2, backgroundColor: 'var(--color-bg-card-hover)', minWidth: 120 }}>分组名</TableCell>
              <TableCell sx={{ position: 'sticky', left: 168, zIndex: 2, backgroundColor: 'var(--color-bg-card-hover)', minWidth: 150 }}>标题</TableCell>
              <TableCell sx={{ minWidth: 150 }}>用户名</TableCell>
              <TableCell sx={{ minWidth: 200 }}>密码</TableCell>
              <TableCell sx={{ minWidth: 200 }}>链接</TableCell>
              <TableCell sx={{ minWidth: 120 }}>说明</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredList.map(row => (
              <TableRow key={row.id} hover selected={selectedIds.includes(row.id)} onClick={() => handleSelectRow(row.id)}
                sx={{ cursor: 'pointer', '&.Mui-selected': { backgroundColor: 'var(--color-primary-light2) !important' } }}>
                <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: selectedIds.includes(row.id) ? 'var(--color-primary-light2)' : 'var(--color-bg-card)' }}>
                  <Checkbox checked={selectedIds.includes(row.id)} size="small" />
                </TableCell>
                <TableCell sx={{ position: 'sticky', left: 48, zIndex: 1, backgroundColor: selectedIds.includes(row.id) ? 'var(--color-primary-light2)' : 'var(--color-bg-card)', whiteSpace: 'nowrap' }}>{row.name}</TableCell>
                <TableCell sx={{ position: 'sticky', left: 168, zIndex: 1, backgroundColor: selectedIds.includes(row.id) ? 'var(--color-primary-light2)' : 'var(--color-bg-card)', whiteSpace: 'nowrap' }}>{row.title}</TableCell>
                <TableCell>{row.username}</TableCell>
                <TableCell>{row.password}</TableCell>
                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.link}</TableCell>
                <TableCell>{row.remark}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box className="flex items-center justify-between p-2" sx={{ borderTop: '1px solid var(--color-divider)' }}>
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>选中 {selectedIds.length} 个账号</Typography>
        <div className="flex items-center gap-x-1">
          <Tooltip title="复制选中账号" placement="top"><span><IconButton size="small" disabled={selectedIds.length === 0} onClick={handleCopy} sx={iconStyle}><ContentCopyIcon /></IconButton></span></Tooltip>
          <Tooltip title="移动选中账号" placement="top"><span><IconButton size="small" disabled={selectedIds.length === 0} onClick={() => setShowMoveDialog(true)} sx={iconStyle}><DriveFileMoveIcon /></IconButton></span></Tooltip>
          <Tooltip title="删除选中账号" placement="top"><span><IconButton size="small" disabled={selectedIds.length === 0} onClick={() => setShowDeleteConfirm(true)} sx={delIconStyle}><DeleteForeverIcon /></IconButton></span></Tooltip>
        </div>
      </Box>
      <BatchDeleteDialog open={showDeleteConfirm} count={selectedIds.length} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleConfirmDelete} />
      <BatchMoveDialog open={showMoveDialog} groupTree={groupTree} targetGroupId={targetGroupId}
        onChangeGroup={setTargetGroupId} onClose={() => setShowMoveDialog(false)} onConfirm={handleConfirmMove} />
    </Box>
  )
}

export default BatchOperations
