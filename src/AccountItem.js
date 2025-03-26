import React from 'react'
import { DragSource, DropTarget } from 'react-dnd'
import Avatar from '@mui/material/Avatar'
import LinkIcon from '@mui/icons-material/Link'

const boxSource = {
  beginDrag(props, monitor, component) {
    return { account: props.data.account, index: props.index }
  }
}

const boxTarget = {
  canDrop(props, monitor) {
    const source = monitor.getItem()
    if (props.index - source.index === 1 || props.index === source.index) return false
    return true
  },
  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      return
    }
    const source = monitor.getItem()
    if (source.index < props.index) {
      props.onMove(source.index, props.index - 1)
    } else {
      props.onMove(source.index, props.index)
    }
  }
}

@DropTarget('account', boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: monitor.canDrop(),
  isOver: monitor.isOver()
}))
@DragSource('account', boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
class AccountItem extends React.Component {
  state = {
    faviconLoaded: false
  }


  render() {
    const { isDragging, isOver, canDrop, connectDropTarget, connectDragSource, data, isSelected } = this.props
    return connectDropTarget(connectDragSource(
      <div style={{ opacity: isDragging ? 0 : 1 }} className='account-item'>
        {(isOver && canDrop) && <div className='account-item-sort' />}
        <div className={'account-item-body' + (isSelected ? ' account-item-selected' : '')}
          style={{ padding: '8px 12px' }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            {!this.state.faviconError && data.account.favicon && (
              <Avatar
                src={data.account.favicon}
                variant="square"
                key={data.account.favicon}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '4px',
                  marginTop: '2px',
                  display: this.state.faviconLoaded ? 'flex' : 'none'
                }}
                onError={() => this.setState({ faviconLoaded: false })}
                onLoad={() => this.setState({ faviconLoaded: true })}
              >
                <LinkIcon sx={{ fontSize: 18, color: 'rgba(44, 62, 80, 0.5)' }} />
              </Avatar>
            )}
            <div style={{ 
                flex: 1,
                minWidth: 0, // 关键是这行，让flex item可以收缩到比内容更小
                overflow: 'hidden' // 确保子元素不会溢出
              }}>
                <div id={data.account._id + '_title'}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#2c3e50',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                  {data.title}
                </div>
                <div className='account-item-username'
                  id={data.account._id + '_username'}
                  style={{
                    fontSize: '13px',
                    color: 'rgba(44, 62, 80, 0.7)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                  {data.username}
                </div>
              </div>
          </div>
        </div>
      </div>))
  }
}

export default AccountItem
