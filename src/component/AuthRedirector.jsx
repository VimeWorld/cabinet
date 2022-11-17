import { Navigate, Outlet, useLocation } from "react-router-dom"
import useApp from "../hook/useApp"

const pagesWithNoAuth = ['/login', '/register', '/recovery', '/recovery/step2']
const pagesWithNoMfa = ['/login/mfa', '/login/mfa/recovery']

export default () => {
    const { app } = useApp()
    const location = useLocation()
    if (!app.user) {
        if (!pagesWithNoAuth.includes(location.pathname))
            return <Navigate to='/login' state={{ from: location }} replace />
    } else if (app.user.mfa == "needed") {
        if (!pagesWithNoMfa.includes(location.pathname))
            return <Navigate to='/login/mfa' state={{ from: location }} replace />
    } else if (app.user.account_deleted) {
        if (location.pathname != '/account_delete')
            return <Navigate to='/account_delete' state={{ from: location }} replace />
    } else {
        if (pagesWithNoAuth.includes(location.pathname) || pagesWithNoMfa.includes(location.pathname)) {
            const returnPath = location.state?.from?.pathname || "/";
            return <Navigate to={returnPath} replace />
        }
    }
    return <Outlet />
}
