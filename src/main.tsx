import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'

import './bootstrap.scss'
import './index.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import NotificationBox from './component/NotificationBox'
import RegisterPage from './page/Register'
import LoginPage from './page/Login'
import { LoginMfaPage, LoginMfaRecoveryPage } from './page/LoginMfa'
import { RecoveryStep2Page, RecoveryPage } from './page/Recovery'
import InnerPage from './component/InnerPage'
import HomePage from './page/Home'
import Root from './component/Root'
import { NotFoundPage } from './component/AppProvider'
import PaymentsPage from './page/Payments'
import SecurityPage from './page/Security'
import MinigamesGuildPage from './page/MinigamesGuild'
import MinigamesDonatePage from './page/MinigamesDonate'
import BansPage from './page/Bans'
import TransactionConfirmPage from './page/ConfirmTransaction'
import { AccountDeletedStatePage, AccountDeleteRequestPage } from './page/AccountDelete'
import DiscordLinkPage from './page/Discord'
import OauthAuthorizePage from './page/OauthAutrorize'

const router = createBrowserRouter(createRoutesFromElements(
  <Route path='/' element={<Root />} >
    <Route path='/login' element={<LoginPage />} />
    <Route path='/login/mfa' element={<LoginMfaPage />} />
    <Route path='/login/mfa/recovery' element={<LoginMfaRecoveryPage />} />
    <Route path='/register' element={<RegisterPage />} />
    <Route path='/recovery' element={<RecoveryPage />} />
    <Route path='/recovery/step2' element={<RecoveryStep2Page />} />
    <Route path='/confirm_transaction' element={<TransactionConfirmPage />} />
    <Route path='/discord' element={<DiscordLinkPage />} />
    <Route path='/account_delete' element={<AccountDeleteRequestPage />} />
    <Route path='/account_deleted' element={<AccountDeletedStatePage />} />
    <Route path='/oauth/authorize' element={<OauthAuthorizePage />} />
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

if (import.meta.env.PROD) {
  console.log('%cОстановитесь!', 'color: red; font-size: 55px; font-weight: bold; font-family: system-ui, "Segoe UI", Helvetica, sans-serif; text-shadow: 1px 1px black, -1px 1px black, -1px -1px black, 1px -1px black;');
  console.log('%cЭта функция браузера предназначена для разработчиков. Если кто-то сказал вам скопировать и вставить что-то здесь, чтобы включить функцию VimeWorld или «взломать» чей-то аккаунт, это мошенники. Выполнив эти действия, вы предоставите им доступ к своему аккаунту VimeWorld.', 'font-size: 20px; font-family: system-ui, "Segoe UI", Helvetica, sans-serif;');
}
