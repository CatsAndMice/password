/**
 * 批量移动账号到目标分组
 * 从原分组移除账号，追加到目标分组末尾并更新 sort 序号
 * @returns {Object} { hasError, group2Accounts, decryptAccountDic }
 */
export function batchMoveAccounts(accountIds, targetGroupId, decryptAccountDic, group2Accounts) {
  let hasError = false
  accountIds.forEach(id => {
    if (!decryptAccountDic[id]) return
    const account = decryptAccountDic[id].account
    group2Accounts[account.groupId].splice(group2Accounts[account.groupId].indexOf(account), 1)
    if (group2Accounts[account.groupId].length === 0) delete group2Accounts[account.groupId]
    if (targetGroupId in group2Accounts) {
      account.sort = group2Accounts[targetGroupId][group2Accounts[targetGroupId].length - 1].sort + 1
      group2Accounts[targetGroupId].push(account)
    } else {
      account.sort = 0
      group2Accounts[targetGroupId] = [account]
    }
    account.groupId = targetGroupId
    if (window.utools.db.put(account).error) hasError = true
    decryptAccountDic[id] = { ...decryptAccountDic[id], account: { ...account } }
  })
  return { hasError, group2Accounts, decryptAccountDic: { ...decryptAccountDic } }
}

/**
 * 批量删除账号（仅从 DB 移除）
 * @returns {boolean} hasError - 是否发生写入错误
 */
export function batchDeleteAccounts(accountIds, decryptAccountDic) {
  let hasError = false
  accountIds.forEach(id => {
    if (decryptAccountDic[id]) {
      if (window.utools.db.remove(decryptAccountDic[id].account).error) hasError = true
    }
  })
  return hasError
}

/**
 * 拖拽移动单个账号到目标分组
 * 仅操作内存中的 group2Accounts，不写 DB
 */
export function moveAccountToGroup(account, targetGroupId, group2Accounts) {
  group2Accounts[account.groupId].splice(group2Accounts[account.groupId].indexOf(account), 1)
  if (group2Accounts[account.groupId].length === 0) delete group2Accounts[account.groupId]
  if (targetGroupId in group2Accounts) {
    account.sort = group2Accounts[targetGroupId][group2Accounts[targetGroupId].length - 1].sort + 1
    group2Accounts[targetGroupId].push(account)
  } else {
    account.sort = 0
    group2Accounts[targetGroupId] = [account]
  }
  account.groupId = targetGroupId
}

/**
 * 加密账号表单字段（title/username/password/link/remark）
 * @returns {Object} 加密后的字段对象
 */
export function encryptAccountFields(accountInfo, keyIV) {
  if (!accountInfo) return {}
  return ['title', 'username', 'password', 'link', 'remark'].reduce((acc, field) => {
    acc[field] = accountInfo[field] ? window.services.encryptValue(keyIV, accountInfo[field]) : ''
    return acc
  }, {})
}