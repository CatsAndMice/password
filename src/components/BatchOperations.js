import React, { useState, useEffect, useRef } from 'react'
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
import { Table, Input, TreeSelect } from "@arco-design/web-react"
import Tooltip from '@mui/material/Tooltip'
import "@arco-design/web-react/dist/css/arco.css"
import { IconSearch } from '@arco-design/web-react/icon'
import CloseIcon from '@mui/icons-material/Close'

const originColumns = [
  {
    key: 'name',
    title: '分组名',
    dataIndex: 'name',
    fixed: 'left',
    width: 120,
  },
  {
    key: 'title',
    title: '标题',
    dataIndex: 'title',
    fixed: 'left',
    width: 150,
  },
  {
    key: 'username',
    title: '用户名',
    dataIndex: 'username',
    width: 150,
  },
  {
    key: 'password',
    title: '密码',
    dataIndex: 'password',
    width: 200,
  },
  {
    key: 'link',
    title: '链接',
    dataIndex: 'link',
    width: 200,
    ellipsis: true
  },
  {
    key: 'remark',
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
const BatchOperations = ({ onClose, showMessage, groupTree, keyIV, decryptAccountDic, onBatchDelete, onBatchMove }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [columns, setColumns] = useState(originColumns)
  const [list, setList] = useState([])
  const [tableHeight, setTableHeight] = useState('400px')
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [targetGroupId, setTargetGroupId] = useState('')

  const inputRef = useRef(null)
  const groupDic = {},
    groupId2NameCache = {}

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const handleMove = () => {
    setShowMoveDialog(true)
  }

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false)
    onBatchDelete(selectedRowKeys)
  }

  const handleCopy = () => {
    const copyContent = selectedRowKeys.map(key => {
      const item = list.find(i => i.key === key)
      return `标题：${item.title}
用户名：${item.username}
密码：${item.password}
链接：${item.link}
说明：${item.remark}`
    }).join('\n\n')

    navigator.clipboard.writeText(copyContent).then(() => {
      showMessage('已复制到剪贴板')
      setSelectedRowKeys([])
    }).catch(() => {
      showMessage('复制失败', 'error')
    })
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
        groupId,
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

  const setFilter = () => {
    const groupEntries = Object.entries(groupId2NameCache)
    const filters = groupEntries.map(([id, name]) => ({
      text: name,
      value: id
    }))

    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      newColumns[0] = {
        ...newColumns[0], filters,
        onFilter: (value, row) => {
          return row.groupId == value
        }
      }
      newColumns[1] = {
        ...newColumns[1],
        filterIcon: <IconSearch />,
        filterDropdown: ({ filterKeys, setFilterKeys, confirm }) => {
          return (
            <div className='arco-table-custom-filter'>
              <Input.Search
                ref={inputRef}
                searchButton
                allowClear
                placeholder='请输入用户名'
                value={filterKeys[0] || ''}
                onChange={(value) => {
                  setFilterKeys(value ? [value] : []);
                }}
                onSearch={() => {
                  confirm();
                }}
              />
            </div>
          );
        },
        onFilter: (value, row) => {
          console.log(value, row);
          return value ? row.title.indexOf(value) !== -1 : true
        },
        onFilterDropdownVisibleChange: (visible) => {
          if (visible) {
            setTimeout(() => inputRef.current.focus(), 150);
          }
        },
      }
      return newColumns;
    });
  }

  const handleConfirmMove = () => {
    if (!targetGroupId) {
      showMessage('请选择目标分组', 'error')
      return
    }
    onBatchMove(selectedRowKeys, targetGroupId)
    setShowMoveDialog(false)
    setTargetGroupId('')
    setSelectedRowKeys([])
    showMessage('移动成功')
  }


  useEffect(() => {
    generateGroupDic(groupTree, groupDic)
    getList()
    setFilter()
    const height = window.innerHeight - 190
    setTableHeight(`${height}px`)
  }, [decryptAccountDic])

  return (
    <>
      <style>
        {`
          .arco-trigger {
            z-index: 1300;
          }
        `}
      </style>
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
                        onClick={handleCopy}
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
                        onClick={handleMove}
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

        {/* 移动账号对话框 */}
        <Dialog
          open={showMoveDialog}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick') {
              setShowMoveDialog(false)
            }
          }}
          disableEscapeKeyDown
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 8px 8px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              移动账号
            </div>
            <IconButton
              onClick={() => setShowMoveDialog(false)}
              size="small"
              sx={{
                color: 'rgba(0, 0, 0, 0.54)',
                '&:hover': {
                  color: 'rgba(0, 0, 0, 0.87)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText sx={{ mb: 2 }}>
              选择要移动到的目标分组：
            </DialogContentText>
            <div style={{ minWidth: '300px', maxHeight: '400px', overflow: 'auto' }}>
              <TreeSelect
                treeData={groupTree}
                placeholder="请选择目标分组"
                value={targetGroupId}
                onChange={value => setTargetGroupId(value)}
                style={{
                  width: '100%',
                }}
                fieldNames={{
                  key: '_id',
                  title: 'name',
                  children: 'childs'
                }}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowMoveDialog(false)}>
              取消
            </Button>
            <Button
              disabled={!targetGroupId}
              variant="contained"
              onClick={handleConfirmMove}
            >
              移动
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>

  )
}

export default BatchOperations


