import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppProvider, AuthRedirector } from './App'
import { NotificationBox } from './component/Notification'
import './index.css'
import { LoginMfaPage } from './page/LoginMfa'
import { RegisterPage } from './page/Register'
import { LoginPage } from './page/Login'
import { InnerPage } from './component/InnerPage'
import { HomePage } from './page/Home'



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AuthRedirector />}>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/login_mfa' element={<LoginMfaPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/' element={<InnerPage />}>
              <Route path='/' element={<HomePage />} />
            </Route>
            <Route path="*" element={<h1>Not found</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
    <NotificationBox />
  </React.StrictMode>
)
