/**
 * 处理导入账号：批量写入 DB、更新分组映射和解密字典
 * @returns {Object|null} 成功返回 { groupId, group2Accounts, decryptAccountDic }，失败返回 null
 */
export function processImportAccounts(accounts, group2Accounts, decryptAccountDic, keyIV) {
  let hasError = false
    // 导入账号共享同一个分组 ID
    const groupId = accounts[0].groupId

  accounts.forEach((account, index) => {
    // 设置排序序号：基于现有分组最后一个账号 + 1
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
      if (account.title) {
        try { decryptAccountDic[account._id].title = window.services.decryptValue(keyIV, account.title) } catch (e) { decryptAccountDic[account._id].title = account.title }
      }
      if (account.username) {
        try { decryptAccountDic[account._id].username = window.services.decryptValue(keyIV, account.username) } catch (e) { decryptAccountDic[account._id].username = account.username }
      }
    } else {
      hasError = true
    }
  })

  if (hasError) return null
  return { groupId, group2Accounts: { ...group2Accounts }, decryptAccountDic: { ...decryptAccountDic } }
}
