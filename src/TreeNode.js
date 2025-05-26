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
                {isSelected ? (<svg width="16" height="16" className='mr-2 shrink-0 preserve-color' fill="none" viewBox="0 0 16.938 16" ><defs><radialGradient id="20590c_0" cx="0" cy="0" r="1" gradientTransform="matrix(-1.30746 8.44444 -10.17364 -1.5752 10.224 5.778)" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FFF"></stop><stop offset="100%" stop-color="#FFF" stop-opacity="0"></stop></radialGradient><linearGradient id="20590c_1" x1="0.5" x2="0.5" y1="0" y2="1"><stop offset="0%" stop-color="#2B95FF"></stop><stop offset="100%" stop-color="#006CDB"></stop></linearGradient></defs><path fill="url(#20590c_1)" d="M.89 13.022a1.2 1.2 0 0 0 1.2 1.2H13.91a1.2 1.2 0 0 0 1.2-1.2V4.444c0-.981-.796-1.777-1.777-1.777H8.776c-.286 0-.57-.056-.836-.164l-1.384-.562a2.222 2.222 0 0 0-.836-.163H2.667c-.982 0-1.778.796-1.778 1.778v9.466Z"></path><path fill="#7ABCFF" d="M.911 12.661a1.244 1.244 0 0 0 1.204 1.561h11.969c.605 0 1.135-.408 1.289-.994l1.52-5.778a1.333 1.333 0 0 0-1.289-1.672H3.75c-.605 0-1.135.408-1.29.994l-1.549 5.89Z"></path><path fill="url(#20590c_0)" fill-opacity="0.6" fill-rule="evenodd" d="M.911 12.661a1.244 1.244 0 0 0 1.204 1.561h11.969c.605 0 1.135-.408 1.289-.994l1.52-5.778a1.333 1.333 0 0 0-1.289-1.672H3.75c-.605 0-1.135.408-1.29.994l-1.549 5.89Zm.43.113q-.1.38.14.692.24.312.634.312h11.969q.685 0 .86-.663l1.52-5.778q.11-.422-.156-.769-.267-.346-.704-.346H3.75q-.685 0-.86.663l-1.55 5.89Z"></path></svg>
                ) : (<svg width="16" height="16" fill="none" className='mr-2 shrink-0 preserve-color' viewBox="0 0 16 16" ><defs><radialGradient id="a1e0d9_0" cx="0" cy="0" r="1" gradientTransform="matrix(0 6.71137 -9.762 0 8 4.444)" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FFF"></stop><stop offset="100%" stop-color="#FFF" stop-opacity="0"></stop></radialGradient><linearGradient id="a1e0d9_1" x1="0.5" x2="0.5" y1="0" y2="1"><stop offset="0%" stop-color="#2B95FF"></stop><stop offset="100%" stop-color="#006CDB"></stop></linearGradient></defs><path fill="url(#a1e0d9_1)" d="M.89 3.556V10.8a1.2 1.2 0 0 0 1.2 1.2H13.91a1.2 1.2 0 0 0 1.2-1.2V4.444c0-.981-.796-1.777-1.777-1.777H8.776c-.286 0-.57-.056-.836-.164l-1.384-.562a2.222 2.222 0 0 0-.836-.163H2.667c-.982 0-1.778.796-1.778 1.778Z"></path><path fill="#7ABCFF" d="M.89 12.889c0 .736.596 1.333 1.332 1.333h11.556c.736 0 1.333-.597 1.333-1.333V5.778c0-.737-.597-1.334-1.333-1.334H2.222c-.736 0-1.333.597-1.333 1.334v7.11Z" data-spm-anchor-id="a2q3o.26061305.0.i11.55c07cc1q3UejY"></path><path fill="url(#a1e0d9_0)" fill-opacity="0.4" fill-rule="evenodd" d="M.89 12.889c0 .736.596 1.333 1.332 1.333h11.556c.736 0 1.333-.597 1.333-1.333V5.778c0-.737-.597-1.334-1.333-1.334H2.222c-.736 0-1.333.597-1.333 1.334v7.11Zm.444 0q0 .368.26.628t.628.26h11.556q.368 0 .629-.26.26-.26.26-.628V5.778q0-.368-.26-.629-.26-.26-.629-.26H2.222q-.368 0-.628.26t-.26.629v7.11Z"></path></svg>)}
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
