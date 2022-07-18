import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import NotificationBox from './component/NotificationBox'
import { LoginMfaPage, LoginMfaRecoveryPage } from './page/LoginMfa'
import { RegisterPage } from './page/Register'
import { LoginPage } from './page/Login'
import { InnerPage } from './component/InnerPage'
import { HomePage } from './page/Home'
import AuthRedirector from './component/AuthRedirector'
import AppProvider from './component/AppProveder'



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
            </Route>
            <Route path="*" element={<h1>Not found</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <NotificationBox />
    </AppProvider>
  </React.StrictMode>
)
