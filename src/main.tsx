import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './bootstrap.scss'
import './index.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import NotificationBox from './component/NotificationBox'
import { LoginMfaPage, LoginMfaRecoveryPage } from './page/LoginMfa'
import { RegisterPage } from './page/Register'
import { LoginPage } from './page/Login'
import { InnerPage } from './component/InnerPage'
import { HomePage } from './page/Home'
import AuthRedirector from './component/AuthRedirector'
import AppProvider from './component/AppProvider'
import { PaymentsPage } from './page/Payments'
import { SecurityPage } from './page/Security'
import MinigamesGuild from './page/MinigamesGuild'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AuthRedirector />}>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/login/mfa' element={<LoginMfaPage />} />
            <Route path='/login/mfa/recovery' element={<LoginMfaRecoveryPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/recovery' element={<h1>Password recovery</h1>} />
            <Route path='/' element={<InnerPage />}>
              <Route path='/' element={<HomePage />} />
              <Route path='/payments' element={<PaymentsPage />} />
              <Route path='/security' element={<SecurityPage />} />
              <Route path='/minigames/guild' element={<MinigamesGuild />} />
            </Route>
            <Route path="*" element={<h1>Not found</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <NotificationBox />
    </AppProvider>
  </React.StrictMode>
)
