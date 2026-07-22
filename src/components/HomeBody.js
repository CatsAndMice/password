import React from 'react'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import Tree from '../Tree'
import AccountArea from '../AccountArea'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'

/**
 * 主界面内容区域组件
 * 在 DndProvider 中渲染左侧分组树(Tree)和右侧账号列表(AccountArea)
 */
export default class HomeBody extends React.Component {
  state = {
    treeCollapsed: false
  }

  // 切换分组树区域的折叠/展开状态
  handleToggleGroupArea = () => {
    const treeArea = document.querySelector('.tree-area')
    if (treeArea) {
      treeArea.classList.toggle('collapsed')
    }
  }

  render() {
    const { groupTree, groupIds, group2Accounts, selectedGroupId, sortedGroup, decryptAccountDic, keyIV, onGroupUpdate, onGroupDelete, onCreate, onExport, onImport, onAppend, onMove, onSelect, onCreateAccount, onAccountUpdate, onAccountDelete } = this.props

    return (
      <DndProvider backend={HTML5Backend}>
        <div className='home-body'>
          <div className={`relative tree-area`} onClick={(e) => e.stopPropagation()} >
            {groupTree && (
              <Tree
                onUpdate={onGroupUpdate}
                onDelete={onGroupDelete}
                onCreate={onCreate}
                onExport={onExport}
                onImport={onImport}
                onAppend={onAppend}
                onMove={onMove}
                onSelect={onSelect}
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
                bg-[var(--color-bg-card)]
                shadow-[2px_0px_8px_var(--color-divider)]
                w-4
                h-8
                z-50
                transition-all !duration-200 !ease-in-out 
                cursor-pointer
                flex !items-center !justify-center
                rounded-r-md
              `}
            >
              <ChevronLeftIcon className="collapsed-icon !text-[var(--color-primary)] hover:!text-[var(--color-primary-hover)] transition-colors duration-200" />
            </div>
          </div>
          <div>
            <AccountArea
              keyIV={keyIV}
              decryptAccountDic={decryptAccountDic}
              data={selectedGroupId ? group2Accounts[selectedGroupId] : null}
              onCreate={onCreateAccount}
              onUpdate={onAccountUpdate}
              onDelete={onAccountDelete}
              sortedGroup={sortedGroup}
            />
          </div>
        </div>
      </DndProvider>
    )
  }
}
