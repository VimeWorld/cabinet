import { Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import useApp from '../hook/useApp'
import AppProvider from './AppProvider'

const pagesWithNoAuth = ['/login', '/register', '/recovery', '/recovery/step2']
const pagesWithNoMfa = ['/login/mfa', '/login/mfa/recovery']

const AuthRedirector = ({ children }) => {
    const { app } = useApp()
    const location = useLocation()
    if (!app.user) {
        if (!pagesWithNoAuth.includes(location.pathname))
            return <Navigate to='/login' state={{ from: location }} replace />
    } else if (app.user.mfa == "needed") {
        if (!pagesWithNoMfa.includes(location.pathname)) {
            // Сохраняем стейт из логина
            let from = location
            if (location.pathname == '/login' && location.state?.from)
                from = location.state?.from
            return <Navigate to='/login/mfa' state={{ from }} replace />
        }
    } else if (app.user.account_deleted) {
        if (location.pathname != '/account_deleted')
            return <Navigate to='/account_deleted' replace />
    } else {
        if (pagesWithNoAuth.includes(location.pathname) || pagesWithNoMfa.includes(location.pathname)) {
            if (location.state?.from)
                return <Navigate to={location.state.from} replace />
            return <Navigate to="/" replace />
        }
    }

    return children
}

const Root = () => {
    return <AppProvider>
        <AuthRedirector>
            <Outlet />
        </AuthRedirector>
        <ScrollRestoration />
    </AppProvider>
}

export default Root
