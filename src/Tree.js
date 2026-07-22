import React from 'react'
import TreeNode from './TreeNode'
import TreeRoot from './TreeRoot'
import TreeFooter from './components/TreeFooter'
import './tree.less'

/**
 * 分组树组件
 * 渲染树结构、管理展开收起、选中、新增/编辑/删除/拖拽移动分组
 */
export default class Tree extends React.Component {
  state = { expandIds: [], inputKey: '', selectedKey: '' }

  componentDidMount() {
    // 恢复上次的展开状态和选中节点
    let expandIds = window.localStorage.getItem('grouptree.expandIds')
    if (expandIds) {
      expandIds = JSON.parse(expandIds)
      this.setState({ expandIds })
      // 延迟验证展开ID是否仍然有效（分组可能已被删除）
      setTimeout(() => {
        if (this.props.groupIds && this.props.groupIds.length > 0) {
          const newExpandIds = expandIds.filter(x => this.props.groupIds.includes(x))
          if (newExpandIds.length !== expandIds.length) this.setState({ expandIds: newExpandIds })
        }
      }, 1000)
    }
    const selectedKey = window.localStorage.getItem('grouptree.selectedKey')
    if (selectedKey) setTimeout(() => { this.select(selectedKey) }, 10)
    else setTimeout(() => { if (this.props.groupTree && this.props.groupTree.length > 0) this.select('0') }, 10)
  }

  componentWillUnmount() {
    window.localStorage.setItem('grouptree.expandIds', JSON.stringify(this.state.expandIds))
    window.localStorage.setItem('grouptree.selectedKey', this.state.selectedKey)
  }

  // 通过 key（如 '0-1-2'）定位树节点
  getNode = (key) => {
    if (!key) return null
    const keys = key.split('-')
    let target = this.props.groupTree[keys.shift()]
    if (!target) return null
    for (const index of keys) {
      if (!target.childs) return null
      target = target.childs[index]
      if (!target) return null
    }
    return target
  }

  deleteNode = (key) => {
    const parentKey = key.substr(0, key.lastIndexOf('-'))
    const nodeIndex = key.substr(key.lastIndexOf('-') + 1)
    if (parentKey) {
      const parentNode = this.getNode(parentKey)
      parentNode.childs.splice(nodeIndex, 1)
      if (parentNode.childs.length === 0) { delete parentNode.childs; this.removeExpandNode(parentNode._id) }
    } else this.props.groupTree.splice(nodeIndex, 1)
  }

  addExpandNode = (id) => { if (!this.state.expandIds.includes(id)) this.state.expandIds.push(id) }
  removeExpandNode = (id) => {
    const index = this.state.expandIds.indexOf(id)
    if (index === -1) return
    this.state.expandIds.splice(index, 1)
  }

  // 按中文拼音排序子节点
  sortChilds = (childs) => childs.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN', { sensitivity: 'accent' }))

  handleCreate = () => {
    const node = { _id: '', name: '' }
    let inputKey = ''
    if (this.state.selectedKey) {
      // 限制最大嵌套深度为7层
      if (this.state.selectedKey.split('-').length > 7) return
      const parentNode = this.getNode(this.state.selectedKey)
      if (parentNode.childs) parentNode.childs.push(node)
      else parentNode.childs = [node]
      inputKey = this.state.selectedKey + '-' + (parentNode.childs.length - 1)
      this.addExpandNode(parentNode._id)
    } else {
      this.props.groupTree.push(node)
      inputKey = '' + (this.props.groupTree.length - 1)
    }
    this.setState({ inputKey })
  }

  handleDelete = () => {
    const { inputKey, selectedKey } = this.state
    if (inputKey || !selectedKey) return
    const node = this.getNode(selectedKey)
    if (node.childs || this.props.group2Accounts[node._id]) return
    this.deleteNode(selectedKey)
    this.props.onDelete(node)
    this.select('')
  }

  handleEdit = () => {
    const { inputKey, selectedKey } = this.state
    if (inputKey || !selectedKey) return
    this.setState({ inputKey: selectedKey })
  }

  handleExport = () => {
    const { inputKey, selectedKey } = this.state
    const node = this.getNode(selectedKey)
    this.props.onExport(node)
  }

  handleImport = () => {
    const { selectedKey } = this.state
    const node = this.getNode(selectedKey)
    this.props.onImport(node)
  }

  // 编辑或创建节点：新建节点名称为空时删除，否则更新/创建并重新排序
  onUpdate = (key, value) => {
    const node = this.getNode(key)
    if (!value) {
      if (node.name) { this.setState({ inputKey: '' }); return }
      this.deleteNode(key)
      this.setState({ inputKey: '' })
      return
    }
    const isCreate = node.name === ''
    node.name = value
    let newKey = ''
    const parentKey = key.substr(0, key.lastIndexOf('-'))
    let parentNode = null
    if (parentKey) {
      parentNode = this.getNode(parentKey)
      parentNode.childs = this.sortChilds(parentNode.childs)
      newKey = parentKey + '-' + parentNode.childs.indexOf(node)
    } else {
      const cloneRoot = [...this.props.groupTree]
      while (this.props.groupTree.length) this.props.groupTree.pop()
      this.sortChilds(cloneRoot).forEach(ele => this.props.groupTree.push(ele))
      newKey = '' + this.props.groupTree.indexOf(node)
    }
    if (isCreate) {
      this.props.onCreate(node, parentNode)
    } else this.props.onUpdate(node)
    this.setState({ inputKey: '' })
    this.select(newKey)
  }

  // 切换节点展开/收起；收起时若当前选中节点是收起节点的子孙则选中父节点
  expand = (id, key) => {
    const index = this.state.expandIds.indexOf(id)
    if (index === -1) {
      this.state.expandIds.push(id)
      this.setState({ expandIds: this.state.expandIds })
    } else {
      this.state.expandIds.splice(index, 1)
      if (this.state.selectedKey !== key && this.state.selectedKey.indexOf(key) === 0) this.select(key, false)
      else this.setState({ expandIds: this.state.expandIds })
    }
  }

  select = (key, autoExpand = true) => {
    if (!key) { this.setState({ selectedKey: '' }); this.props.onSelect(null); return }
    const node = this.getNode(key)
    if (!node) { this.setState({ selectedKey: '' }); this.props.onSelect(null); return }
    if (autoExpand && node.childs) this.addExpandNode(node._id)
    this.setState({ selectedKey: key })
    this.props.onSelect(node)
  }

  // 拖拽移动节点：从源位置移除，插入目标节点下或根节点，重新排序
  move = (sourceKey, targetKey) => {
    const parentSourceKey = sourceKey.substr(0, sourceKey.lastIndexOf('-'))
    const sourceIndex = sourceKey.substr(sourceKey.lastIndexOf('-') + 1)
    const sourceNode = this.getNode(sourceKey)
    const parentSourceNodeChilds = parentSourceKey ? this.getNode(parentSourceKey).childs : this.props.groupTree
    let targetNode = null
    let parentTargetNodes = null
    if (targetKey) {
      targetNode = this.getNode(targetKey)
      if (targetNode.childs) {
        if (!targetNode.childs.includes(sourceNode)) targetNode.childs.push(sourceNode)
        targetNode.childs = this.sortChilds(targetNode.childs)
      } else targetNode.childs = [sourceNode]
      this.addExpandNode(targetNode._id)
      this.props.onMove(sourceNode, targetNode)
      if (targetKey.includes('-')) {
        parentTargetNodes = []
        const targetKeyArray = targetKey.split('-')
        targetKeyArray.pop()
        for (let i = 0; i < targetKeyArray.length; i++) {
          parentTargetNodes.unshift(this.getNode(targetKeyArray.join('-')))
          targetKeyArray.pop()
        }
        parentTargetNodes.push(targetNode)
      }
    } else {
      if (!this.props.groupTree.includes(sourceNode)) this.props.groupTree.push(sourceNode)
      const cloneRoot = [...this.props.groupTree]
      while (this.props.groupTree.length) this.props.groupTree.pop()
      this.sortChilds(cloneRoot).forEach(ele => this.props.groupTree.push(ele))
      this.props.onMove(sourceNode, null)
    }
    parentSourceNodeChilds.splice(sourceIndex, 1)
    if (parentSourceKey && this.props.groupTree[parentSourceKey.split('-')[0]] && parentSourceNodeChilds.length === 0) {
      const psNode = parentSourceKey ? this.getNode(parentSourceKey) : null
      if (psNode) delete psNode.childs
    }

    let newSelectKey = ''
    if (targetKey) {
      if (targetKey.includes('-')) {
        let pointerChilds = this.props.groupTree
        parentTargetNodes.forEach(node => {
          newSelectKey += (newSelectKey ? '-' : '') + pointerChilds.indexOf(node)
          pointerChilds = node.childs
        })
      } else newSelectKey = '' + this.props.groupTree.indexOf(targetNode)
    } else newSelectKey = '' + this.props.groupTree.indexOf(sourceNode)
    this.select(newSelectKey)
  }

  append = (account, targetKey) => {
    const targetGroup = this.getNode(targetKey)
    this.props.onAppend(account, targetGroup._id)
    this.select(targetKey)
  }

  renderTree = (treeArray, deep, parentKey) => {
    const preKey = parentKey ? (parentKey + '-') : ''
    return treeArray.map((x, i) => {
      const key = preKey + i
      return (
        <TreeNode key={x._id} groupId={x._id} id={key} move={this.move} append={this.append}
          onClick={(e) => { e.stopPropagation(); this.select(key) }}
          onBlur={(e) => this.onUpdate(key, e.target.value)}
          onExpand={(e) => { e.stopPropagation(); this.expand(x._id, key) }}
          deep={deep} isParent={!!x.childs} isSelected={this.state.selectedKey === key}
          isInput={this.state.inputKey === key} title={x.name}
          badge={this.props.group2Accounts[x._id] ? this.props.group2Accounts[x._id].length : 0}>
          {(x.childs && this.state.expandIds.includes(x._id)) && this.renderTree(x.childs, deep + 1, key)}
        </TreeNode>
      )
    })
  }

  render() {
    const { selectedKey, inputKey } = this.state
    const isEdit = inputKey ? false : !!selectedKey
    let isDelete = isEdit
    if (isDelete) {
      const node = this.getNode(selectedKey)
      if (node) {
        if (node.childs || this.props.group2Accounts[node._id]) isDelete = false
      } else isDelete = false
    }
    return (
      <div className='tree-normal'>
        <div className='tree-body'>
          <TreeRoot onClick={(e) => { e.stopPropagation(); this.select('') }} move={this.move}>
            {this.renderTree(this.props.groupTree, 0, '')}
          </TreeRoot>
        </div>
        <TreeFooter
          isEdit={isEdit} isDelete={isDelete} inputKey={inputKey}
          onCreate={this.handleCreate} onEdit={this.handleEdit}
          onDelete={this.handleDelete} onExport={this.handleExport} onImport={this.handleImport}
        />
      </div>)
  }
}