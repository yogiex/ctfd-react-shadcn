import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './globals.css'

const CTFD_VERSION = '4.0.0'
console.log(`CTFd v${CTFD_VERSION}`)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
