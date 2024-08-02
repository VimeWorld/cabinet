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
import MinigamesColorPage from './page/MinigamesColor'
import BansPage from './page/Bans'
import TransactionConfirmPage from './page/ConfirmTransaction'
import { AccountDeletedStatePage, AccountDeleteRequestPage } from './page/AccountDelete'
import DiscordLinkPage from './page/Discord'
import OauthAuthorizePage from './page/OauthAutrorize'
import MinigamesPrimePage from './page/MinigamesPrime'
import MinigamesHdSubPage from './page/MinigamesHdSub'

const router = createBrowserRouter(createRoutesFromElements(
    <Route path='/' Component={Root} >
        <Route path='/login' Component={LoginPage} />
        <Route path='/login/mfa' Component={LoginMfaPage} />
        <Route path='/login/mfa/recovery' Component={LoginMfaRecoveryPage} />
        <Route path='/register' Component={RegisterPage} />
        <Route path='/recovery' Component={RecoveryPage} />
        <Route path='/recovery/step2' Component={RecoveryStep2Page} />
        <Route path='/confirm_transaction' Component={TransactionConfirmPage} />
        <Route path='/discord' Component={DiscordLinkPage} />
        <Route path='/account_delete' Component={AccountDeleteRequestPage} />
        <Route path='/account_deleted' Component={AccountDeletedStatePage} />
        <Route path='/oauth/authorize' Component={OauthAuthorizePage} />
        <Route path='/' Component={InnerPage}>
            <Route path='/' Component={HomePage} />
            <Route path='/payments' Component={PaymentsPage} />
            <Route path='/security' Component={SecurityPage} />
            <Route path='/bans' Component={BansPage} />
            <Route path='/minigames/prime' Component={MinigamesPrimePage} />
            <Route path='/minigames/hd_sub' Component={MinigamesHdSubPage} />
            <Route path='/minigames/donate' Component={MinigamesDonatePage} />
            <Route path='/minigames/guild' Component={MinigamesGuildPage} />
            <Route path='/minigames/color' Component={MinigamesColorPage} />
        </Route>
        <Route path="*" Component={NotFoundPage} />
    </Route>
))


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
        <NotificationBox />
    </React.StrictMode>
)

if (import.meta.env.PROD) {
    console.log(
        '%cОстановитесь!',
        'color: red; font-size: 55px; font-weight: bold; font-family: system-ui, "Segoe UI", Helvetica, sans-serif; text-shadow: 1px 1px black, -1px 1px black, -1px -1px black, 1px -1px black;',
    )
    console.log(
        '%cЭта функция браузера предназначена для разработчиков. Если кто-то сказал вам скопировать и вставить что-то здесь, чтобы включить функцию VimeWorld или «взломать» чей-то аккаунт, это мошенники. Выполнив эти действия, вы предоставите им доступ к своему аккаунту VimeWorld.',
        'font-size: 20px; font-family: system-ui, "Segoe UI", Helvetica, sans-serif;',
    )
}
