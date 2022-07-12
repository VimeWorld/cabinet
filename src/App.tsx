import React, { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Notifications } from './component/Notification';
import { fetchApi, getToken, setToken, getTuuid } from './lib/api';

interface AppContextContainerType {
    app: AppContextType;
    updateApp: (changes: AppContextType) => void;
}

interface AppContextType {
    token?: string;
    tuuid?: string;
    user?: UserType;
}

interface UserType {
    id: number;
    username: string;
    email: string;
    cash: number;
    reg_time: string;
    mfa_needed: boolean;
    account_deleted: boolean;
}

const AppContext = createContext<AppContextContainerType>(null!)

function AppProvider({ children }: { children: React.ReactNode }) {
    const [app, setApp] = useState<AppContextType>(() => {
        return {
            tuuid: getTuuid(),
            token: getToken(),
        }
    })
    const [loading, setLoading] = useState(!!app.token)

    const updateApp = (newVal: AppContextType) => {
        setApp((old) => {
            const clone = { ...old, ...newVal }
            if (old.token != clone.token)
                setToken(clone.token)
            return clone
        })
    }

    useEffect(() => {
        if (app.token) {
            fetchApi("/auth").then(async response => {
                if (response.status != 200) {
                    updateApp({
                        token: undefined,
                        user: undefined,
                    })
                } else if (response.ok) {
                    const body = await response.json()
                    updateApp({
                        token: app.token,
                        user: body.response,
                    })
                }
                setLoading(false)
            }).catch(error => {
                console.log(error)
                Notifications.error('sdsadsd')
            });
        }
    }, [])

    if (loading) {
        return <p>Loading...</p>
    }

    return <AppContext.Provider value={{ app, updateApp }}>
        {children}
    </AppContext.Provider>
}

const useApp = () => useContext(AppContext)

let AuthRequired = (
    { children }:
        { children: JSX.Element }
): JSX.Element => {
    let { app } = useApp();
    let location = useLocation();
    if (!app.user)
        return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
};

const pagesWithNoAuth = ['/login', '/register', '/recovery']
const pagesWithNoMfa = ['/login_mfa', '/login_mfa_recovery']

const AuthRedirector = ({ children }: { children?: JSX.Element | JSX.Element[] }): JSX.Element => {
    const { app } = useApp()
    const location = useLocation()
    if (!app.user) {
        if (!pagesWithNoAuth.includes(location.pathname))
            return <Navigate to='/login' state={{ from: location }} replace />
    } else if (app.user.mfa_needed) {
        if (!pagesWithNoMfa.includes(location.pathname))
            return <Navigate to='/login_mfa' state={{ from: location }} replace />
    } else {
        if (pagesWithNoAuth.includes(location.pathname) || pagesWithNoMfa.includes(location.pathname)) {
            const state = location.state as any;
            const returnPath = state?.from?.pathname || "/";
            return <Navigate to={returnPath} replace />
        }
    }
    return <Outlet />
}

export { AppProvider, AuthRedirector, useApp }
