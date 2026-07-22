import React, { useState, useEffect, useRef } from 'react'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import Box from '@mui/material/Box'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove'
import { Table, Input } from "@arco-design/web-react"
import Tooltip from '@mui/material/Tooltip'
import "@arco-design/web-react/dist/css/arco.css"
import { IconSearch } from '@arco-design/web-react/icon'
import { BatchDeleteDialog, BatchMoveDialog } from './BatchOperationsDialogs'

const originColumns = [
  { key: 'name', title: '分组名', dataIndex: 'name', fixed: 'left', width: 120 },
  { key: 'title', title: '标题', dataIndex: 'title', fixed: 'left', width: 150 },
  { key: 'username', title: '用户名', dataIndex: 'username', width: 150 },
  { key: 'password', title: '密码', dataIndex: 'password', width: 200 },
  { key: 'link', title: '链接', dataIndex: 'link', width: 200, ellipsis: true },
  { key: 'remark', title: '说明', dataIndex: 'remark' }
]

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

/**
 * 账号批量管理组件
 * 提供全量账号表格管理，支持筛选、多选、复制、移动、删除等批量操作
 */
const BatchOperations = ({ onClose, showMessage, groupTree, keyIV, decryptAccountDic, onBatchDelete, onBatchMove }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [columns, setColumns] = useState(originColumns)
  const [list, setList] = useState([])
  const [tableHeight, setTableHeight] = useState('400px')
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [targetGroupId, setTargetGroupId] = useState('')
  const inputRef = useRef(null)
  const groupDic = {}
  const groupId2NameCache = {}

  const handleConfirmDelete = () => { setShowDeleteConfirm(false); onBatchDelete(selectedRowKeys) }

  const handleCopy = () => {
    const copyContent = selectedRowKeys.map(key => {
      const item = list.find(i => i.key === key)
      return `标题：${item.title}\n用户名：${item.username}\n密码：${item.password}\n链接：${item.link}\n说明：${item.remark}`
    }).join('\n\n')
    navigator.clipboard.writeText(copyContent).then(() => { showMessage('已复制到剪贴板'); setSelectedRowKeys([]) }).catch(() => showMessage('复制失败', 'error'))
  }

  // 递归生成分组 ID 到分组对象的映射字典
  const generateGroupDic = (array, dic) => {
    for (const g of array) { dic[g._id] = g; if (g.childs) generateGroupDic(g.childs, dic) }
  }

  // 递归拼接完整分组名称（父分组-子分组）
  const getGroupName = (id, groupName) => {
    const name = groupDic[id].name + (groupName ? '-' : '') + groupName
    return groupDic[id].parentId ? getGroupName(groupDic[id].parentId, name) : name
  }

  // 带缓存的分组名称获取，避免重复递归计算
  const groupName = (id) => {
    if (id in groupId2NameCache) return groupId2NameCache[id]
    const name = getGroupName(id, ''); groupId2NameCache[id] = name; return name
  }

  // 组装表格数据：遍历所有解密后的账号，解密密码/链接/说明字段
  const getList = () => {
    const groupedAccounts = {}
    for (const id in decryptAccountDic) {
      const cdata = decryptAccountDic[id]
      const groupId = cdata.account.groupId
      if (!groupedAccounts[groupId]) groupedAccounts[groupId] = []
      groupedAccounts[groupId].push({
        key: cdata.account._id, username: cdata.username || '-', groupId,
        name: groupName(groupId), title: cdata.title || '-',
        password: window.services.decryptValue(keyIV, cdata.account.password) || '-',
        link: window.services.decryptValue(keyIV, cdata.account.link) || '-',
        remark: window.services.decryptValue(keyIV, cdata.account.remark) || '-'
      })
    }
    setList(Object.values(groupedAccounts).flat(Infinity))
    setSelectedRowKeys([])
  }

  // 设置表格列的筛选器和排序
  const setFilter = () => {
    Object.keys(groupDic).forEach(id => groupName(id))
    const filters = Object.entries(groupId2NameCache).map(([id, name]) => ({ text: name, value: id }))
    setColumns(prevColumns => {
      const newColumns = [...prevColumns]
      newColumns[0] = { ...newColumns[0], filters, onFilter: (value, row) => row.groupId == value }
      newColumns[1] = {
        ...newColumns[1],
        filterIcon: <IconSearch />,
        filterDropdown: ({ filterKeys, setFilterKeys, confirm }) => (
          <div className='arco-table-custom-filter'>
            <Input.Search ref={inputRef} searchButton allowClear placeholder='请输入用户名' value={filterKeys[0] || ''}
              onChange={(value) => setFilterKeys(value ? [value] : [])} onSearch={() => confirm()} />
          </div>
        ),
        onFilter: (value, row) => value ? row.title.toLowerCase().indexOf(value.toLowerCase()) !== -1 : true,
        onFilterDropdownVisibleChange: (visible) => { if (visible) setTimeout(() => inputRef.current.focus(), 150) }
      }
      return newColumns
    })
  }

  const handleConfirmMove = () => {
    if (!targetGroupId) { showMessage('请选择目标分组', 'error'); return }
    onBatchMove(selectedRowKeys, targetGroupId)
    setShowMoveDialog(false); setTargetGroupId(''); setSelectedRowKeys([])
    showMessage('移动成功')
  }

  useEffect(() => {
    generateGroupDic(groupTree, groupDic)
    setFilter(); getList()
    setTableHeight(`${window.innerHeight - 190}px`)
  }, [decryptAccountDic])

  return (
    <>
      <style>{`.arco-trigger { z-index: 1300; }`}</style>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }} className="bg-white">
        <Box className="flex items-center p-2 border-b border-gray-200">
          <IconButton onClick={onClose} size="small"><ChevronLeftIcon /></IconButton>
          <Typography variant="h6" className="text-gray-800 font-bold">帐号批量管理</Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Table columns={columns} data={list} scroll={{ y: tableHeight, x: 1000 }} sticky={true} borderCell={true}
            fixedHeader={true} pagination={false} virtualized={true}
            rowSelection={{ checkAll: true, type: 'checkbox', columnWidth: 50, selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
            footer={() => (
              <div className="flex items-center justify-between">
                <Typography variant="body2" color="textSecondary">选中 {selectedRowKeys.length} 个账号</Typography>
                <div className="flex items-center gap-x-1">
                  <Tooltip title="复制选中账号" placement="top"><span><IconButton size="small" disabled={selectedRowKeys.length === 0} onClick={handleCopy} sx={iconStyle}><ContentCopyIcon /></IconButton></span></Tooltip>
                  <Tooltip title="移动选中账号" placement="top"><span><IconButton size="small" disabled={selectedRowKeys.length === 0} onClick={() => setShowMoveDialog(true)} sx={iconStyle}><DriveFileMoveIcon /></IconButton></span></Tooltip>
                  <Tooltip title="删除选中账号" placement="top"><span><IconButton size="small" disabled={selectedRowKeys.length === 0} onClick={() => setShowDeleteConfirm(true)} sx={delIconStyle}><DeleteForeverIcon /></IconButton></span></Tooltip>
                </div>
              </div>
            )} />
        </Box>
        <BatchDeleteDialog open={showDeleteConfirm} count={selectedRowKeys.length} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleConfirmDelete} />
        <BatchMoveDialog open={showMoveDialog} groupTree={groupTree} targetGroupId={targetGroupId}
          onChangeGroup={setTargetGroupId} onClose={() => setShowMoveDialog(false)} onConfirm={handleConfirmMove} />
      </Box>
    </>
  )
}

export default BatchOperations