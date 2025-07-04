import React from 'react'
import { createRoot } from 'react-dom/client'
import mitt from 'mitt'
import './index.less'
import './tailwind.css'
import App from './App'
window.emitter = mitt()
const root = createRoot(document.getElementById('root'))
root.render(<App />)
