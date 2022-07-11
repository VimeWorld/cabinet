import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { NotificationBox } from './component/Notification'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App>
      <h1>App</h1>
    </App>
    <NotificationBox />
  </React.StrictMode>
)
