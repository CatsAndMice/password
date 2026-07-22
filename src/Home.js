import React from 'react'
import './home.less'
import Search from './Search'
import SnackbarMessage from './SnackbarMessage'
import ExportDialog from './ExportDialog'
import ImportDialog from './ImportDialog'
import Header from './components/Header'
import FavoriteAccounts from './components/FavoriteAccounts'
import { initializeData } from './utils/initializeData'
import PasswordGeneratorDialog from './components/PasswordGeneratorDialog'
import HomeBody from './components/HomeBody'
import HomeDialogs from './components/HomeDialogs'
import { getFavicon } from "./utils/getFavicon"
import { processImportAccounts } from "./utils/importAccounts"
import { batchDeleteAccounts, batchMoveAccounts, moveAccountToGroup, encryptAccountFields } from "./utils/accountOperations"
import D1API from '@/api/d1'

/**
 * 密码管理主页面 - 核心业务逻辑组件
 * 管理分组树、账号列表、搜索、导出/导入、批量操作、备份设置等所有核心交互
 */
class Home extends React.Component {
  state = {
    selectedGroupId: '',
    sortedGroup: [],
    searchKey: '',
    snackbarMessage: { key: 0, type: 'info', body: '' },
    exportData: null,
    importData: null,
    showFavorites: false,
    showBackupSettings: false,
    showBatchOperations: false,
    openPasswordGenerator: false
  }

  componentDidMount() {
    const { groupTree, groupIds, group2Accounts, decryptAccountDic } = initializeData(this.props.keyIV)
    this.setState({ groupTree, groupIds, group2Accounts, decryptAccountDic })
    // 监听窗口失焦/聚焦，实现5分钟无操作自动锁定
    window.addEventListener('blur', this.handleDetectLive)
    window.addEventListener('focus', this.handleClearDetectLiveTimeout)
    // 注册 uTools 子输入框，用于搜索账号
    window.utools.setSubInput(({ text }) => {
      this.setState({ searchKey: text, showFavorites: false, showBackupSettings: false })
    }, '标题/用户名搜索')
    window.services.autoBackup()
    D1API.trackEvent({ message: '登录成功' })
  }

  componentWillUnmount() {
    // 卸载前持久化排序状态到 DB
    const { group2Accounts, sortedGroup } = this.state
    if (sortedGroup.length > 0) {
      for (const groupId of sortedGroup) {
        if (groupId in group2Accounts) {
          group2Accounts[groupId].forEach((account, i) => {
            if (account.sort !== i) { account.sort = i; window.utools.db.put(account) }
          })
        }
      }
    }
    this.handleClearDetectLiveTimeout()
    window.removeEventListener('blur', this.handleDetectLive)
    window.removeEventListener('focus', this.handleClearDetectLiveTimeout)
  }

  // 5分钟后自动锁定（失焦开始计时）
  handleDetectLive = () => {
    this.detectLiveTimeout = setTimeout(() => { this.detectLiveTimeout = null; this.props.onOut() }, 5 * 60 * 1000)
  }

  // 窗口聚焦时取消锁定计时
  handleClearDetectLiveTimeout = () => {
    if (!this.detectLiveTimeout) return
    clearTimeout(this.detectLiveTimeout)
    this.detectLiveTimeout = null
  }

  showMessage = (body, type = 'info') => this.setState({ snackbarMessage: { key: Date.now(), body, type } })
  alertDbError = () => this.showMessage('数据写入错误，保存失败', 'error')

  handleGroupUpdate = (node) => {
    const group = { ...node }; delete group.childs
    const result = window.utools.db.put(group)
    if (result.ok) node._rev = result.rev
    else this.alertDbError()
  }

  handleGroupCreate = (node, parentNode) => {
    const result = window.utools.db.put({ _id: 'group/' + Date.now(), name: node.name, parentId: parentNode ? parentNode._id : '' })
    if (result.ok) {
      node._id = result.id; node._rev = result.rev
      const { groupIds, groupTree } = initializeData(this.props.keyIV)
      this.setState({ groupIds, groupTree })
    } else this.alertDbError()
  }

  handleGroupDelete = (node) => {
    if (window.utools.db.remove(node).error) { this.alertDbError(); return }
    const { groupIds, groupTree } = initializeData(this.props.keyIV)
    this.setState({ groupIds, groupTree })
  }

  handleGroupMove = (sourceNode, targetNode) => {
    sourceNode.parentId = targetNode ? targetNode._id : ''
    this.handleGroupUpdate(sourceNode)
  }

  handleGroupSelect = (node) => this.setState({ selectedGroupId: node ? node._id : '' })

  // 若当前分组有空白占位账号，则复用而非新建
  handleAccountCreate = (accountInfo) => {
    const { selectedGroupId, group2Accounts, decryptAccountDic } = this.state
    if (!selectedGroupId) return
    if (selectedGroupId in group2Accounts) {
      const emptyIndex = group2Accounts[selectedGroupId].findIndex(a => {
        const acc = decryptAccountDic[a._id]; return !acc.title && !acc.username
      })
      if (emptyIndex !== -1) {
        if (accountInfo) {
          Object.assign(group2Accounts[selectedGroupId][emptyIndex], encryptAccountFields(accountInfo, this.props.keyIV))
          this.handleAccountUpdate(group2Accounts[selectedGroupId][emptyIndex])
          this.updateDic(decryptAccountDic, group2Accounts[selectedGroupId][emptyIndex], accountInfo)
        }
        return emptyIndex
      }
    }

    const dateNow = Date.now()
    const newAccount = {
      _id: 'account/' + dateNow, groupId: selectedGroupId, createAt: dateNow,
      sort: selectedGroupId in group2Accounts ? group2Accounts[selectedGroupId][group2Accounts[selectedGroupId].length - 1].sort + 1 : 0,
      ...encryptAccountFields(accountInfo, this.props.keyIV)
    }
    const result = window.utools.db.put(newAccount)
    if (result.error) return this.alertDbError()
    newAccount._id = result.id; newAccount._rev = result.rev
    if (selectedGroupId in group2Accounts) group2Accounts[selectedGroupId].push(newAccount)
    else group2Accounts[selectedGroupId] = [newAccount]
    this.updateDic(decryptAccountDic, newAccount, accountInfo)
    this.setState({ selectedGroupId })
  }

  // 同步更新解密字典，并异步获取网站 favicon
  updateDic = (decryptAccountDic, newAccount, accountInfo) => {
    if (accountInfo) {
      decryptAccountDic[newAccount._id] = { account: newAccount, title: accountInfo.title, username: accountInfo.username }
      getFavicon(accountInfo.link).then(favicon => {
        const dic = decryptAccountDic[newAccount._id]
        if (dic) { dic.account.favicon = favicon; this.handleAccountUpdate(dic.account) }
      })
    } else decryptAccountDic[newAccount._id] = { account: newAccount }
  }

  // 处理账号更新，遇到版本冲突时自动重试一次
  handleAccountUpdate = (account) => {
    let result = window.utools.db.put(account)
    if (result.ok) {
      account._rev = result.rev
    } else if (result.error && result.name === 'conflict') {
      account._rev = window.utools.db.get(account._id)._rev
      result = window.utools.db.put(account)
    }
    if (!result.ok) { this.alertDbError(); return }
    if (this.state.showFavorites) {
      const data = initializeData(this.props.keyIV)
      this.setState({ group2Accounts: data.group2Accounts, decryptAccountDic: data.decryptAccountDic })
    }
  }

  handleAccountDelete = (account) => {
    const { group2Accounts, decryptAccountDic } = this.state
    if (window.utools.db.remove(account).error) return this.alertDbError()
    group2Accounts[account.groupId].splice(group2Accounts[account.groupId].indexOf(account), 1)
    if (group2Accounts[account.groupId].length === 0) delete group2Accounts[account.groupId]
    delete decryptAccountDic[account._id]
    this.setState({ selectedGroupId: account.groupId })
  }

  handleAccountGroupChange = (account, targetGroupId) => {
    moveAccountToGroup(account, targetGroupId, this.state.group2Accounts)
    this.handleAccountUpdate(account)
  }

  handleBatchDelete = (accountIds) => {
    batchDeleteAccounts(accountIds, this.state.decryptAccountDic)
    this.showMessage(`成功删除 ${accountIds.length} 个账号`)
    const { groupIds, group2Accounts, decryptAccountDic } = initializeData(this.props.keyIV)
    this.setState({ groupIds, group2Accounts, decryptAccountDic })
  }

  handleBatchMove = (accountIds, targetGroupId) => {
    const { group2Accounts, decryptAccountDic } = batchMoveAccounts(accountIds, targetGroupId, this.state.decryptAccountDic, this.state.group2Accounts)
    this.setState({ group2Accounts, decryptAccountDic })
  }

  handleImportAccounts = (accounts) => {
    const { group2Accounts, decryptAccountDic } = this.state
    const result = processImportAccounts(accounts, group2Accounts, decryptAccountDic, this.props.keyIV)
    if (result) this.setState({ selectedGroupId: result.groupId, group2Accounts: result.group2Accounts, decryptAccountDic: result.decryptAccountDic })
  }

  handleExport = (node) => this.setState({ exportData: { group: node } })
  handleImport = (node) => this.setState({ importData: { group: node } })
  handleBatchOperationsClick = () => this.setState({ showBatchOperations: true })
  handleCloseBatchOperations = () => this.setState({ showBatchOperations: false })
  handleFavoriteClick = () => this.setState(prev => ({ showFavorites: !prev.showFavorites }))
  handleBackupSettingsClick = () => this.setState({ showBackupSettings: !this.state.showBackupSettings })
  handleBackupSettingsClose = () => this.setState({ showBackupSettings: false })
  handleOpenPasswordGenerator = () => this.setState({ openPasswordGenerator: true })
  handleClosePasswordGenerator = () => this.setState({ openPasswordGenerator: false })

  // 获取所有收藏账号，过滤掉空标题且空用户名的占位项
  getFavoriteAccounts = () => {
    const { group2Accounts, decryptAccountDic } = this.state
    const allAccounts = []
    Object.values(group2Accounts).forEach(accounts => {
      accounts.forEach(account => {
        const acc = decryptAccountDic[account._id]
        if ((!acc.title && !acc.username) || !account.isFavorite) return
        allAccounts.push({ ...account })
      })
    })
    return allAccounts
  }

  render() {
    const { searchKey, selectedGroupId, groupIds, groupTree, group2Accounts, sortedGroup, decryptAccountDic, snackbarMessage, exportData, importData, showFavorites, showBackupSettings, showBatchOperations } = this.state
    if (!group2Accounts) {
      return (
        <div className='home-loading'>
          <div className='home-loading-spinner'>
            <div className='home-loading-bounce1' /><div className='home-loading-bounce2' /><div className='home-loading-bounce3' />
          </div>
        </div>
      )
    }
    return (
      <div className='home'>
        {!searchKey && (<>
          <Header onFavoriteClick={this.handleFavoriteClick} showFavorites={this.state.showFavorites}
            onBackupClick={this.handleBackupSettingsClick} onBatchOperationsClick={this.handleBatchOperationsClick}
            groupIds={groupIds} group2Accounts={group2Accounts} handleOpenPasswordGenerator={this.handleOpenPasswordGenerator} />
          <PasswordGeneratorDialog data={selectedGroupId ? group2Accounts[selectedGroupId] : null}
            open={this.state.openPasswordGenerator} onClose={this.handleClosePasswordGenerator}
            onCreate={this.handleAccountCreate} />
        </>)}
        <HomeDialogs showBackupSettings={showBackupSettings} showBatchOperations={showBatchOperations}
          onBackupSettingsClose={this.handleBackupSettingsClose} onBatchOperationsClose={this.handleCloseBatchOperations}
          showMessage={this.showMessage} groupTree={groupTree} keyIV={this.props.keyIV}
          group2Accounts={group2Accounts} decryptAccountDic={decryptAccountDic}
          onBatchDelete={this.handleBatchDelete} onBatchMove={this.handleBatchMove} />
        {searchKey ? (
          <Search keyIV={this.props.keyIV} onAccountUpdate={this.handleAccountUpdate}
            groupTree={groupTree} group2Accounts={group2Accounts} decryptAccountDic={decryptAccountDic} searchKey={this.state.searchKey} />
        ) : showFavorites ? (
          <FavoriteAccounts keyIV={this.props.keyIV} decryptAccountDic={decryptAccountDic}
            data={this.getFavoriteAccounts()} onUpdate={this.handleAccountUpdate} />
        ) : (
          <HomeBody groupTree={groupTree} groupIds={groupIds} group2Accounts={group2Accounts}
            selectedGroupId={selectedGroupId} sortedGroup={sortedGroup} decryptAccountDic={decryptAccountDic}
            keyIV={this.props.keyIV} onGroupUpdate={this.handleGroupUpdate} onGroupDelete={this.handleGroupDelete}
            onCreate={this.handleGroupCreate} onExport={this.handleExport} onImport={this.handleImport}
            onAppend={this.handleAccountGroupChange} onMove={this.handleGroupMove}
            onSelect={this.handleGroupSelect} onCreateAccount={this.handleAccountCreate}
            onAccountUpdate={this.handleAccountUpdate} onAccountDelete={this.handleAccountDelete} />
        )}
        <SnackbarMessage message={snackbarMessage} />
        <ExportDialog data={exportData} showMessage={this.showMessage} group2Accounts={group2Accounts} />
        <ImportDialog data={importData} showMessage={this.showMessage} onImport={this.handleImportAccounts} />
      </div>
    )
  }
}

export default Home
