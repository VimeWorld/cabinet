import React, { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Notifications from './lib/notifications';
import { fetchApi, getToken, setToken, getTuuid } from './lib/api';

interface AppContextContainerType {
    app: AppContextType;
    updateApp: (changes: AppContextType) => void;
    logout: () => Promise<void>;
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

    const logout = async () => {
        await fetchApi('/logout', { method: 'POST' })
        updateApp({
            token: undefined,
            user: undefined,
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
                Notifications.error('Невозможно подключиться к серверу', {
                    ttl: 24 * 60 * 60 * 1000
                })
            });
        }
    }, [])

    if (loading) {
        return <p>Loading...</p>
    }

    return <AppContext.Provider value={{ app, updateApp, logout }}>
        {children}
    </AppContext.Provider>
}

const useApp = () => useContext(AppContext)

const pagesWithNoAuth = ['/login', '/register', '/recovery']
const pagesWithNoMfa = ['/login/mfa', '/login/mfa/recovery']

const AuthRedirector = (): JSX.Element => {
    const { app } = useApp()
    const location = useLocation()
    if (!app.user) {
        if (!pagesWithNoAuth.includes(location.pathname))
            return <Navigate to='/login' state={{ from: location }} replace />
    } else if (app.user.mfa_needed) {
        if (!pagesWithNoMfa.includes(location.pathname))
            return <Navigate to='/login/mfa' state={{ from: location }} replace />
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
