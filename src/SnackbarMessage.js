import React from 'react'
import ReactDOM from 'react-dom'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export default class SnackbarMessage extends React.Component {
  state = {
    open: false
  }

  componentDidUpdate (prevProps) {
    if (prevProps.message !== this.props.message) {
      this.setState({ open: true })
    }
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') return
    this.setState({ open: false })
  }

  render () {
    const { open } = this.state
    const { key, type, body } = this.props.message
    
    return ReactDOM.createPortal(
      <Snackbar
        key={key}
        open={open}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={this.handleClose}
      >
        <Alert 
          onClose={this.handleClose} 
          variant='filled' 
          severity={type}
          sx={{ 
            minWidth: '250px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          {body}
        </Alert>
      </Snackbar>,
      document.body
    )
  }
}
