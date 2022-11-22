import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Routes, ScrollRestoration } from 'react-router-dom'

import './bootstrap.scss'
import './index.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import NotificationBox from './component/NotificationBox'
import RegisterPage from './page/Register'
import LoginPage from './page/Login'
import { LoginMfaPage, LoginMfaRecoveryPage } from './page/LoginMfa'
import { RecoveryStep2Page, RecoveryPage } from './page/Recovery'
import AccountDeletePage from './page/AccountDelete'
import InnerPage from './component/InnerPage'
import HomePage from './page/Home'
import Root from './component/Root'
import AppProvider, { NotFoundPage } from './component/AppProvider'
import PaymentsPage from './page/Payments'
import SecurityPage from './page/Security'
import MinigamesGuildPage from './page/MinigamesGuild'
import MinigamesDonatePage from './page/MinigamesDonate'
import BansPage from './page/Bans'
import TransactionConfirmPage from './page/ConfirmTransaction'

const router = createBrowserRouter(createRoutesFromElements(
  <Route path='/' element={<Root />} >
    <Route path='/login' element={<LoginPage />} />
    <Route path='/login/mfa' element={<LoginMfaPage />} />
    <Route path='/login/mfa/recovery' element={<LoginMfaRecoveryPage />} />
    <Route path='/register' element={<RegisterPage />} />
    <Route path='/recovery' element={<RecoveryPage />} />
    <Route path='/recovery/step2' element={<RecoveryStep2Page />} />
    <Route path='/confirm_transation' element={<TransactionConfirmPage />} />
    <Route path='/discord' element={<h1>Discord verification</h1>} />
    <Route path='/account_delete' element={<AccountDeletePage />} />
    <Route path='/' element={<InnerPage />}>
      <Route path='/' element={<HomePage />} />
      <Route path='/payments' element={<PaymentsPage />} />
      <Route path='/security' element={<SecurityPage />} />
      <Route path='/bans' element={<BansPage />} />
      <Route path='/minigames/donate' element={<MinigamesDonatePage />} />
      <Route path='/minigames/guild' element={<MinigamesGuildPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Route>
));


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <NotificationBox />
  </React.StrictMode>
)
