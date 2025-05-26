import React from 'react'
import { DropTarget, DragSource } from 'react-dnd'

const nodeSource = {
  canDrag(props) {
    return !props.isInput
  },
  beginDrag(props, monitor, component) {
    return { id: props.id }
  }
}

const nodeTarget = {
  canDrop(props, monitor) {
    const source = monitor.getItem()
    if (source.account) {
      if (source.account.groupId === props.groupId) return false
      return true
    }
    if (props.id.indexOf(source.id) === 0) return false
    if (source.id.substr(0, source.id.lastIndexOf('-')) === props.id) return false
    if (props.deep > 6) return false
    return true
  },
  drop(props, monitor, component) {
    if (!component.props.isOverCurrent) return
    if (monitor.didDrop()) return
    const targetKey = props.id
    const source = monitor.getItem()
    if (source.account) {
      props.append(source.account, targetKey)
      return
    }
    const sourceKey = source.id
    props.move(sourceKey, targetKey)
  }
}

@DropTarget(['treenode', 'account'], nodeTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  // isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType()
}))
@DragSource('treenode', nodeSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview()
  // isDragging: monitor.isDragging()
}))
class TreeNode extends React.Component {
  render() {
    const { isOverCurrent, canDrop, connectDragPreview, connectDragSource, connectDropTarget, deep, onClick, isParent, children, isSelected, isInput, title, badge, onBlur, onExpand } = this.props
    const left = deep * 12 + (isParent ? 0 : 15) + 2
    return connectDragSource(connectDropTarget(
      <div style={(isOverCurrent && canDrop) ? { opacity: 0.3 } : null}>
        <div onClick={onClick} className='tree-node'>
          <div style={{ paddingLeft: left }} className={'tree-node-body' + (isSelected ? ' tree-node-selected' : '')}>
            {isParent && <div onClick={onExpand} className={children ? 'tree-node-icon-arrow-down' : 'tree-node-icon-arrow-right'} />}
            {isInput ? (
              <div onClick={(e) => e.stopPropagation()} className='tree-node-edit-box'>
                <input
                  type='text'
                  autoFocus
                  onKeyDown={(e) => { if (e.keyCode === 13) { e.stopPropagation(); e.preventDefault(); onBlur(e) } }}
                  onFocus={(e) => e.target.select()}
                  onBlur={onBlur}
                  defaultValue={title}
                />
              </div>
            ) : (
              <div className='tree-node-title flex items-center '>
                {isSelected ? (<svg width="16" height="16" className='mr-2 shrink-0' viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_714_6439)">
                    <path d="M12.7186 3.42859H6.9899L5.43659 1.90479H1.55331C0.69899 1.90479 0 2.5905 0 3.42859L0 13.115L14.2719 13.4352V4.9524C14.2719 4.11431 13.573 3.42859 12.7186 3.42859Z" fill="#FFA000" />
                    <path d="M14.5829 4.79419H2.39166C1.56233 4.79419 0.818729 5.4132 0.739211 6.16976L0.0163179 13.0476C-0.0632003 13.8042 0.550283 14.4232 1.37961 14.4232H13.5709C14.4002 14.4232 15.1438 13.8042 15.2234 13.0476L15.9462 6.16976C16.0258 5.4132 15.4123 4.79419 14.5829 4.79419Z" fill="#FFCA28" />
                  </g>
                  <defs>
                    <clipPath id="clip0_714_6439">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                ) : (<svg width="16" height="16" className='mr-2 shrink-0' viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.4 3.42859H7.2L5.6 1.90479H1.6C0.72 1.90479 0 2.5905 0 3.42859V6.47621H16V4.9524C16 4.11431 15.28 3.42859 14.4 3.42859Z" fill="#FFA000" />
                  <path d="M14.4 3.42859H1.6C0.72 3.42859 0 4.13879 0 5.00682V12.898C0 13.766 0.72 14.4762 1.6 14.4762H14.4C15.28 14.4762 16 13.766 16 12.898V5.00682C16 4.13879 15.28 3.42859 14.4 3.42859Z" fill="#FFCA28" />
                </svg>
                )}
                <span className='truncate flex-grow'>{title}</span>
              </div>
            )}
            {(!isInput && badge > 0) && <div className='tree-node-badge'><span>{badge}</span></div>}
          </div>
          {connectDragPreview(<div style={{ left }} className='tree-node-preview'>{title}</div>)}
        </div>
        {children}
      </div>))
  }
}

export default TreeNode
