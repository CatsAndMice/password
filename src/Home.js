import React from 'react'
import './home.less'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import Tree from './Tree'
import AccountArea from './AccountArea'
import Search from './Search'
import SnackbarMessage from './SnackbarMessage'
import ExportDialog from './ExportDialog'
import ImportDialog from './ImportDialog'
import D1API from './api/d1'
import Header from './components/Header'
import FavoriteAccounts from './components/FavoriteAccounts'
import { initializeData } from './utils/initializeData'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import CloseIcon from '@mui/icons-material/Close'
import BackupSettings from './components/BackupSettings'

class Home extends React.Component {
  state = {
    selectedGroupId: '',
    sortedGroup: [],
    searchKey: '',
    snackbarMessage: { key: 0, type: 'info', body: '' },
    exportData: null,
    importData: null,
    showFavorites: false,
    showBackupSettings: false
  }

  handleDetectLive = () => {
    // 窗口无焦点 5 分钟，自动退出
    this.detectLiveTimeout = setTimeout(() => {
      this.detectLiveTimeout = null
      this.props.onOut()
    }, 5 * 60 * 1000)
  }

  handleClearDetectLiveTimeout = () => {
    if (!this.detectLiveTimeout) return
    clearTimeout(this.detectLiveTimeout)
    this.detectLiveTimeout = null
  }

  componentDidMount() {
    // 添加登录成功埋点
    D1API.trackEvent({ message: '登录成功' })
    const { groupTree, groupIds, group2Accounts, decryptAccountDic } = initializeData(this.props.keyIV)
    this.setState({ groupTree, groupIds, group2Accounts, decryptAccountDic })
    window.addEventListener('blur', this.handleDetectLive)
    window.addEventListener('focus', this.handleClearDetectLiveTimeout)
    window.utools.setSubInput(({ text }) => {
      this.setState({
        searchKey: text,
        showFavorites: false,
        showBackupSettings: false
      })
    }, '标题/用户名搜索')
    window.services.autoBackup()
  }

  componentWillUnmount() {
    const { group2Accounts, sortedGroup } = this.state
    if (sortedGroup.length > 0) {
      for (const groupId of sortedGroup) {
        if (groupId in group2Accounts) {
          const length = group2Accounts[groupId].length
          for (let i = 0; i < length; i++) {
            const account = group2Accounts[groupId][i]
            if (account.sort !== i) {
              account.sort = i
              window.utools.db.put(account)
            }
          }
        }
      }
    }
    this.handleClearDetectLiveTimeout()
    window.removeEventListener('blur', this.handleDetectLive)
    window.removeEventListener('focus', this.handleClearDetectLiveTimeout)
  }

  showMessage = (body, type = 'info') => {
    this.setState({ snackbarMessage: { key: Date.now(), body, type } })
  }

  alertDbError = () => {
    this.showMessage('数据写入错误，保存失败', 'error')
  }

  handleGroupUpdate = (node) => {
    const group = { ...node }
    delete group.childs
    const result = window.utools.db.put(group)
    if (result.ok) {
      node._rev = result.rev
    } else {
      this.alertDbError()
    }
  }

  handleGroupCreate = (node, parentNode) => {
    const result = window.utools.db.put({
      _id: 'group/' + Date.now(),
      name: node.name,
      parentId: parentNode ? parentNode._id : ''
    })
    if (result.ok) {
      node._id = result.id
      node._rev = result.rev
    } else {
      this.alertDbError()
    }
  }

  handleGroupDelete = (node) => {
    const result = window.utools.db.remove(node)
    if (result.error) {
      this.alertDbError()
    }
  }

  handleGroupMove = (sourceNode, targeNode) => {
    if (targeNode) {
      sourceNode.parentId = targeNode._id
    } else {
      sourceNode.parentId = ''
    }
    this.handleGroupUpdate(sourceNode)
  }

  handleGroupSelect = (node) => {
    this.setState({ selectedGroupId: node ? node._id : '' })
  }

  handleAccountCreate = () => {
    const { selectedGroupId, group2Accounts, decryptAccountDic } = this.state
    if (!selectedGroupId) return

    if (selectedGroupId in group2Accounts) {
      // 在一次循环中同时查找空白账号和其索引
      let emptyAccountIndex = -1
      const accounts = group2Accounts[selectedGroupId]
      for (let i = 0; i < accounts.length; i++) {
        const decryptedAcc = decryptAccountDic[accounts[i]._id]
        if (!decryptedAcc.title && !decryptedAcc.username) {
          emptyAccountIndex = i
          break
        }
      }
      if (emptyAccountIndex !== -1) {
        return emptyAccountIndex
      }
    }


    const dateNow = Date.now()
    const newAccount = {
      _id: 'account/' + dateNow,
      groupId: selectedGroupId,
      createAt: dateNow
    }
    if (selectedGroupId in group2Accounts) {
      newAccount.sort = group2Accounts[selectedGroupId][group2Accounts[selectedGroupId].length - 1].sort + 1
    } else {
      newAccount.sort = 0
    }
    const result = window.utools.db.put(newAccount)
    if (result.error) {
      return this.alertDbError()
    }
    newAccount._id = result.id
    newAccount._rev = result.rev

    if (selectedGroupId in group2Accounts) {
      group2Accounts[selectedGroupId].push(newAccount)
    } else {
      group2Accounts[selectedGroupId] = [newAccount]
    }
    decryptAccountDic[newAccount._id] = { account: newAccount }
    this.setState({ selectedGroupId })
  }

  handleAccountUpdate = (account) => {
    const result = window.utools.db.put(account)
    if (result.ok) {
      account._rev = result.rev
      // 如果在常用账号页面，更新后重新初始化数据
      if (this.state.showFavorites) {
        const { group2Accounts, decryptAccountDic } = initializeData(this.props.keyIV)
        this.setState({ group2Accounts, decryptAccountDic })
      }
    } else {
      if (result.error && result.name === 'conflict') { // 修改冲突
        const newdoc = window.utools.db.get(account._id)
        account._rev = newdoc._rev
        const retry = window.utools.db.put(account)
        if (retry.ok) {
          account._rev = result.retry
          // 如果在常用账号页面，更新后重新初始化数据
          if (this.state.showFavorites) {
            const { group2Accounts, decryptAccountDic } = initializeData(this.props.keyIV)
            this.setState({ group2Accounts, decryptAccountDic })
          }
        } else {
          this.alertDbError()
        }
      } else {
        this.alertDbError()
      }
    }
  }

  handleAccountDelete = (account) => {
    const { group2Accounts, decryptAccountDic } = this.state
    const result = window.utools.db.remove(account)
    if (result.error) {
      return this.alertDbError()
    }
    group2Accounts[account.groupId].splice(group2Accounts[account.groupId].indexOf(account), 1)
    if (group2Accounts[account.groupId].length === 0) {
      delete group2Accounts[account.groupId]
    }
    delete decryptAccountDic[account._id]
    this.setState({ selectedGroupId: account.groupId })
  }

  handleAccountGroupChange = (account, targetGroupId) => {
    const group2Accounts = this.state.group2Accounts
    group2Accounts[account.groupId].splice(group2Accounts[account.groupId].indexOf(account), 1)
    if (group2Accounts[account.groupId].length === 0) {
      delete group2Accounts[account.groupId]
    }
    if (targetGroupId in group2Accounts) {
      account.sort = group2Accounts[targetGroupId][group2Accounts[targetGroupId].length - 1].sort + 1
      group2Accounts[targetGroupId].push(account)
    } else {
      account.sort = 0
      group2Accounts[targetGroupId] = [account]
    }
    account.groupId = targetGroupId
    this.handleAccountUpdate(account)
  }

  findGroupById = (id, childs) => {
    for (const c of childs) {
      if (c._id === id) return c
      if (c.childs) {
        return this.findGroupById(id, c.childs)
      }
    }
    return null
  }

  handleExport = (node) => {
    this.setState({ exportData: { group: node } })
  }

  // 添加导入处理函数
  handleImport = (node) => {
    this.setState({ importData: { group: node } })
  }

  handleImportAccounts = (accounts) => {
    const { group2Accounts, decryptAccountDic } = this.state
    const groupId = accounts[0].groupId
    let hasError = false
    accounts.forEach((account, index) => {
      if (groupId in group2Accounts) {
        account.sort = group2Accounts[groupId][group2Accounts[groupId].length - 1].sort + index + 1
      } else {
        account.sort = index
      }

      const result = window.utools.db.put(account)
      if (result.ok) {
        account._rev = result.rev
        if (groupId in group2Accounts) {
          group2Accounts[groupId].push(account)
        } else {
          group2Accounts[groupId] = [account]
        }
        decryptAccountDic[account._id] = { account }
        // 解密标题和用户名
        if (account.title) {
          try {
            decryptAccountDic[account._id].title = window.services.decryptValue(this.props.keyIV, account.title)
          } catch (e) {
            decryptAccountDic[account._id].title = account.title
          }
        }
        if (account.username) {
          try {
            decryptAccountDic[account._id].username = window.services.decryptValue(this.props.keyIV, account.username)
          } catch (e) {
            decryptAccountDic[account._id].username = account.username
          }
        }
      } else {
        hasError = true
      }
    })

    if (!hasError) {
      this.setState({
        selectedGroupId: groupId,
        group2Accounts: { ...group2Accounts },
        decryptAccountDic: { ...decryptAccountDic }
      })
    }
  }

  handleFavoriteClick = () => {
    this.setState(prevState => ({ showFavorites: !prevState.showFavorites }))
  }

  // 添加备份设置处理函数
  handleBackupSettingsClick = () => {
    this.setState({ showBackupSettings: !this.state.showBackupSettings })
  }

  // 处理备份设置关闭
  handleBackupSettingsClose = () => {
    this.setState({ showBackupSettings: false })
  }


  // 添加处理展开/收起的方法
  handleToggleGroupArea = () => {
    const treeArea = document.querySelector('.tree-area')
    if (treeArea) {
      treeArea.classList.toggle('collapsed')
    }
  }

  // 在 render 中添加导入对话框组件
  render() {
    const { searchKey, selectedGroupId, groupIds, groupTree, group2Accounts, sortedGroup, decryptAccountDic, snackbarMessage, exportData, importData, showFavorites, showBackupSettings } = this.state
    if (!group2Accounts) {
      return (
        <div className='home-loading'>
          <div className='home-loading-spinner'>
            <div className='home-loading-bounce1' />
            <div className='home-loading-bounce2' />
            <div className='home-loading-bounce3' />
          </div>
        </div>
      )
    }
    return (
      <div className='home'>
        {!searchKey && (
          <Header
            onFavoriteClick={this.handleFavoriteClick}
            showFavorites={this.state.showFavorites}
            onBackupClick={this.handleBackupSettingsClick}
          />
        )}

        {/* 添加备份设置对话框 */}
        {showBackupSettings && (
          <Dialog
            open={showBackupSettings}
            onClose={(event, reason) => {
              if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                this.handleBackupSettingsClose()
              }
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',  padding:'8px 8px 8px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                备份设置
              </div>
              <IconButton
                onClick={this.handleBackupSettingsClose}
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
            <DialogContent>
              <BackupSettings
                onClose={this.handleBackupSettingsClose}
                showMessage={this.showMessage}
              />
            </DialogContent>
          </Dialog>
        )}

        {searchKey ? (
          <Search
            keyIV={this.props.keyIV}
            onAccountUpdate={this.handleAccountUpdate}
            groupTree={groupTree}
            group2Accounts={group2Accounts}
            decryptAccountDic={decryptAccountDic}
            searchKey={this.state.searchKey}
          />
        ) : showFavorites ? (
          <FavoriteAccounts
            keyIV={this.props.keyIV}
            decryptAccountDic={decryptAccountDic}
            data={this.getFavoriteAccounts()}
            onUpdate={this.handleAccountUpdate}
          />
        ) : (
          <DndProvider backend={HTML5Backend}>
            <div className='home-body'>
              <div className={`relative tree-area`} onClick={(e) => e.stopPropagation()} >
                {
                  groupTree && (
                    <Tree
                      onUpdate={this.handleGroupUpdate}
                      onDelete={this.handleGroupDelete}
                      onCreate={this.handleGroupCreate}
                      onExport={this.handleExport}
                      onImport={this.handleImport}
                      onAppend={this.handleAccountGroupChange}
                      onMove={this.handleGroupMove}
                      onSelect={this.handleGroupSelect}
                      groupIds={groupIds}
                      group2Accounts={group2Accounts}
                      groupTree={groupTree}
                    />)
                }

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    this.handleToggleGroupArea();
                  }}
                  size="small"
                  className={`
                    isolate
                    !absolute top-[45%]
                    -right-[15px]
                    -translate-y-1/2 
                    bg-white
                    shadow-[2px_0px_8px_rgba(0,0,0,0.15)]
                    w-4
                    h-8
                    z-50
                    transition-all !duration-200 !ease-in-out 
                    cursor-pointer
                    flex !items-center !justify-center
                    rounded-r-md
                  `}
                >
                  <ChevronLeftIcon className="collapsed-icon !text-[#2196F3] hover:!text-[#1976D2] transition-colors duration-200" />
                </div>
              </div>
              <div>
                <AccountArea
                  keyIV={this.props.keyIV}
                  decryptAccountDic={decryptAccountDic}
                  data={selectedGroupId ? group2Accounts[selectedGroupId] : null}
                  onCreate={this.handleAccountCreate}
                  onUpdate={this.handleAccountUpdate}
                  onDelete={this.handleAccountDelete}
                  sortedGroup={sortedGroup}
                />
              </div>
            </div>
          </DndProvider>
        )}
        <SnackbarMessage message={snackbarMessage} />
        <ExportDialog data={exportData} showMessage={this.showMessage} group2Accounts={group2Accounts} />
        <ImportDialog data={importData} showMessage={this.showMessage} onImport={this.handleImportAccounts} />
      </div>
    )
  }


  getFavoriteAccounts = () => {
    const { group2Accounts, decryptAccountDic } = this.state
    const allAccounts = []

    // 收集所有账号
    Object.values(group2Accounts).forEach(accounts => {
      accounts.forEach(account => {
        const decryptedAcc = decryptAccountDic[account._id]
        // 跳过没有任何内容的账号
        if (!decryptedAcc.title && !decryptedAcc.username) {
          return
        }

        // 确保 clickCount 存在，如果不存在则默认为 0
        const clickCount = account.clickCount || 0
        allAccounts.push({
          ...account,
          clickCount
        })
      })
    })

    // 按点击次数降序排序并获取前20个
    const favorites = allAccounts
      .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
      .slice(0, 20)

    return favorites.length > 0 ? favorites : null
  }
}

export default Home
