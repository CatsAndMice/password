import React, { useState, useEffect } from 'react'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove'
import { Table } from "@arco-design/web-react"
import Tooltip from '@mui/material/Tooltip'
import "@arco-design/web-react/dist/css/arco.css"
const columns = [
  {
    title: '分组名',
    dataIndex: 'name',
    fixed: 'left',
    width: 120,
    resizable: true
  },
  {
    title: '标题',
    dataIndex: 'title',
    fixed: 'left',
    width: 150,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    width: 150,
  },
  {
    title: '密码',
    dataIndex: 'password',
    width: 200,
  },
  {
    title: '链接',
    dataIndex: 'link',
    width: 200,
    ellipsis: true
  },
  {
    title: '说明',
    dataIndex: 'remark'
  }
],
  iconStyle = {
    color: '#2196F3',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#1976D2',
      transform: 'scale(1.1)'
    },
    '&.Mui-disabled': {
      color: 'rgba(0, 0, 0, 0.26)',
      '&:hover': {
        transform: 'none'
      }
    }
  },
  delIconStyle = {
    color: '#f44336',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#d32f2f',
      transform: 'scale(1.1)'
    },
    '&.Mui-disabled': {
      color: 'rgba(0, 0, 0, 0.26)',
      '&:hover': {
        transform: 'none'
      }
    }
  }
const BatchOperations = ({ onClose, groupTree, keyIV, decryptAccountDic, onBatchDelete }) => {
  const [selectedAccounts, setSelectedAccounts] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [list, setList] = useState([])
  const [tableHeight, setTableHeight] = useState('400px')
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const groupDic = {},
    groupId2NameCache = {}

  const handleSelectAll = () => {
    if (selectedAccounts.size === accounts.length) {
      setSelectedAccounts(new Set())
    } else {
      setSelectedAccounts(new Set(accounts.map(acc => acc._id)))
    }
  }

  const handleSelectAccount = (accountId) => {
    const newSelected = new Set(selectedAccounts)
    if (newSelected.has(accountId)) {
      newSelected.delete(accountId)
    } else {
      newSelected.add(accountId)
    }
    setSelectedAccounts(newSelected)
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false)
    onBatchDelete(selectedRowKeys)
  }

  const generateGroupDic = (array, dic) => {
    for (const g of array) {
      dic[g._id] = g
      if (g.childs) {
        generateGroupDic(g.childs, dic)
      }
    }
  }

  const getGroupName = (id, groupName) => {
    const name = groupDic[id].name + (groupName ? '-' : '') + groupName
    if (groupDic[id].parentId) {
      return getGroupName(groupDic[id].parentId, name)
    } else {
      return name
    }
  }

  const groupName = (id) => {
    if (id in groupId2NameCache) {
      return groupId2NameCache[id]
    }
    const groupName = getGroupName(id, '')
    groupId2NameCache[id] = groupName
    return groupName
  }

  const getList = () => {
    const groupedAccounts = {}
    // 首先按 groupId 分组
    for (const id in decryptAccountDic) {
      const cdata = decryptAccountDic[id]
      const groupId = cdata.account.groupId

      if (!groupedAccounts[groupId]) {
        groupedAccounts[groupId] = []
      }

      groupedAccounts[groupId].push({
        key: cdata.account._id,
        username: cdata.username || '-',
        name: groupName(groupId),
        title: cdata.title || '-',
        password: window.services.decryptValue(keyIV, cdata.account.password) || '-',
        link: window.services.decryptValue(keyIV, cdata.account.link) || '-',
        remark: window.services.decryptValue(keyIV, cdata.account.remark) || '-'
      })
    }
    const values = Array.from(Object.values(groupedAccounts)) || []
    setList(values.flat(Infinity))
    setSelectedRowKeys([])
  }


  useEffect(() => {
    generateGroupDic(groupTree, groupDic)
    getList()
    const height = window.innerHeight - 190
    setTableHeight(`${height}px`)
  }, [decryptAccountDic])



  return (
    <>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }} className="bg-white">
        <Box className="flex items-center  p-2 border-b border-gray-200">
          <IconButton onClick={onClose} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" className="text-gray-800 font-bold">
            帐号批量管理
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Table
            columns={columns}
            data={list}
            scroll={{ y: tableHeight, x: 1000, }}
            sticky={true}
            borderCell={true}
            fixedHeader={true}
            pagination={false}
            virtualized={true}
            rowSelection={
              {
                checkAll: true,
                type: 'checkbox',
                columnWidth: 50,
                selectedRowKeys,
                onChange: (selectedRowKeys) => {
                  setSelectedRowKeys(selectedRowKeys);
                },
              }
            }
            footer={() => (
              <div className="flex items-center justify-between">
                <Typography variant="body2" color="textSecondary">
                  选中 {selectedRowKeys.length} 个账号
                </Typography>
                <div className="flex items-center gap-x-1">
                  <Tooltip title="复制选中账号" placement="top">
                    <span>
                      <IconButton
                        size="small"
                        disabled={selectedRowKeys.length === 0}
                        // onClick={handleCopy}
                        sx={iconStyle}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="移动选中账号" placement="top">
                    <span>
                      <IconButton
                        size="small"
                        disabled={selectedRowKeys.length === 0}
                        // onClick={handleMove}
                        sx={iconStyle}
                      >
                        <DriveFileMoveIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="删除选中账号" placement="top">
                    <span>
                      <IconButton
                        size="small"
                        disabled={selectedRowKeys.length === 0}
                        onClick={handleDelete}
                        sx={delIconStyle}
                      >
                        <DeleteForeverIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </div>
              </div>
            )}
          />
        </Box>
        <Dialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
        >
          <DialogTitle>确认删除</DialogTitle>
          <DialogContent >
            <DialogContentText >
              确定要删除选中的 {selectedRowKeys.length} 个账号吗？此操作不可恢复。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteConfirm(false)}>取消</Button>
            <Button onClick={handleConfirmDelete}
              color='error'
              variant='contained'
            >删除</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>

  )
}

export default BatchOperations