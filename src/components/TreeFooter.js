import React from 'react'
import Tooltip from '@mui/material/Tooltip'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import EditIcon from '@mui/icons-material/Edit'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import IconButton from '@mui/material/IconButton'
import ImportExportIcon from '@mui/icons-material/ImportExport'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

/**
 * 分组树底部工具栏组件
 * 提供新增、编辑、导入导出、删除分组的快捷操作
 */
export default class TreeFooter extends React.Component {
  state = { anchorEl: null }

  handleImportExportClick = (event) => this.setState({ anchorEl: event.currentTarget })
  handleImportExportClose = () => this.setState({ anchorEl: null })

  handleImport = () => {
    this.setState({ anchorEl: null })
    this.props.onImport()
  }

  handleExport = () => {
    this.setState({ anchorEl: null })
    this.props.onExport()
  }

  render() {
    const { isEdit, isDelete, inputKey } = this.props
    const { anchorEl } = this.state

    return (
      <div className='tree-footer'>
        <Tooltip title='新增分组' placement='top'>
          <div className='tree-footer-button-wrapper'>
            <IconButton tabIndex={-1} disabled={Boolean(inputKey)} onClick={this.props.onCreate} size='small'
              className={`tree-footer-button ${Boolean(inputKey) ? 'disabled' : ''}`}>
              <CreateNewFolderIcon />
            </IconButton>
          </div>
        </Tooltip>
        <Tooltip title='修改分组' placement='top'>
          <div className='tree-footer-button-wrapper'>
            <IconButton tabIndex={-1} disabled={!isEdit} onClick={this.props.onEdit} size='small'
              className={`tree-footer-button ${!isEdit ? 'disabled' : ''}`}>
              <EditIcon />
            </IconButton>
          </div>
        </Tooltip>
        <Tooltip title='导入导出' placement='top'>
          <div className='tree-footer-button-wrapper'>
            <IconButton tabIndex={-1} disabled={!isEdit} onClick={this.handleImportExportClick} size='small'
              className={`tree-footer-button ${!isEdit ? 'disabled' : ''}`}>
              <ImportExportIcon />
            </IconButton>
          </div>
        </Tooltip>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleImportExportClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ '& .MuiPaper-root': { borderRadius: '8px', boxShadow: 'var(--shadow-popup)', minWidth: '200px' } }}>
          <MenuItem onClick={this.handleImport} sx={{ padding: '10px 16px', gap: '8px', '&:hover': { backgroundColor: 'var(--color-primary-light2)' } }}>
            <FileUploadIcon sx={{ color: 'var(--color-primary)', fontSize: 20 }} /> 导入分组帐号数据
          </MenuItem>
          <MenuItem onClick={this.handleExport} sx={{ padding: '10px 16px', gap: '8px', '&:hover': { backgroundColor: 'var(--color-primary-light2)' } }}>
            <FileDownloadIcon sx={{ color: 'var(--color-primary)', fontSize: 20 }} /> 导出分组帐号数据
          </MenuItem>
        </Menu>
        <Tooltip title='删除分组' placement='top'>
          <div className='tree-footer-button-wrapper'>
            <IconButton tabIndex={-1} disabled={!isDelete} onClick={this.props.onDelete} size='small'
              className={`tree-footer-button ${!isDelete ? 'disabled' : ''}`}>
              <DeleteForeverIcon />
            </IconButton>
          </div>
        </Tooltip>
      </div>
    )
  }
}