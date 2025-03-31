export const initializeData = (keyIV) => {
  const groups = window.utools.db.allDocs('group/')
  const groupDic = {}
  const groupIds = []
  const groupTree = []
  const group2Accounts = {}
  const decryptAccountDic = {}

  if (groups.length > 0) {
    groups.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN', { sensitivity: 'accent' }))
      .forEach(g => { groupDic[g._id] = g })

    groups.forEach(g => {
      if (g.parentId && (g.parentId in groupDic)) {
        if (groupDic[g.parentId].childs) {
          groupDic[g.parentId].childs.push(g)
        } else {
          groupDic[g.parentId].childs = [g]
        }
      } else {
        groupTree.push(g)
      }
      groupIds.push(g._id)
    })

    const accounts = window.utools.db.allDocs('account/')
    if (accounts.length > 0) {
      for (const account of accounts) {
        if (account.groupId in group2Accounts) {
          group2Accounts[account.groupId].push(account)
        } else {
          group2Accounts[account.groupId] = [account]
        }
        decryptAccountDic[account._id] = { account }
        if (account.title) {
          try {
            decryptAccountDic[account._id].title = window.services.decryptValue(keyIV, account.title)
          } catch (e) {
            decryptAccountDic[account._id].title = account.title
          }
        }
        if (account.username) {
          try {
            decryptAccountDic[account._id].username = window.services.decryptValue(keyIV, account.username)
          } catch (e) {
            decryptAccountDic[account._id].username = account.username
          }
        }
      }

      for (const groupId in group2Accounts) {
        if (group2Accounts[groupId].length > 1) {
          group2Accounts[groupId] = group2Accounts[groupId].sort((a, b) => a.sort - b.sort)
        }
      }
    }
  }

  return { groupTree, groupIds, group2Accounts, decryptAccountDic }
}