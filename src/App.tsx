import { createContext, useContext, useEffect, useState } from 'react'
import { Notifications } from './component/Notification';
import { fetchApi, getToken, setToken } from './lib/api';

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
}

const AppContext = createContext<AppContextContainerType>(null!)

function App({ children }: { children: React.ReactNode }) {
    let savedToken = getToken()
    const [ctx, setCtx] = useState<AppContextType>({})
    const [loading, setLoading] = useState(!!savedToken)

    const updateApp = (newVal: AppContextType) => {
        setCtx((old) => {
            const clone = { ...old, ...newVal }
            if (old.token != clone.token)
                setToken(clone.token)
            return clone
        })
    }

    useEffect(() => {
        if (savedToken) {
            fetchApi("/auth").then(async response => {
                if (response.status != 200) {
                    updateApp({
                        token: undefined,
                        user: undefined,
                    })
                } else if (response.ok) {
                    const body = await response.json()
                    updateApp({
                        token: savedToken as string,
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

    return <AppContext.Provider value={{ app: ctx, updateApp }}>
        {children}
    </AppContext.Provider>
}

const useApp = () => useContext(AppContext)

export { App, useApp }
