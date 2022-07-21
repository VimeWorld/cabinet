import { useEffect, useState } from 'react'
import Notifications from '../lib/notifications';
import { fetchApi, getToken, setToken, getTuuid } from '../lib/api';
import { AppContext } from '../hook/useApp';

function AppProvider({ children }) {
    const [app, setApp] = useState(() => {
        return {
            tuuid: getTuuid(),
            token: getToken(),
        }
    })
    const [loading, setLoading] = useState(!!app.token)

    const updateApp = (newVal) => {
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

    const fetchAuth = async (options) => {
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
            options?.success?.()
        }).catch(error => {
            options?.error?.(error)
            Notifications.error('Невозможно подключиться к серверу', {
                ttl: 24 * 60 * 60 * 1000
            })
        });
    }

    useEffect(() => {
        if (app.token) {
            fetchAuth({
                success: () => setLoading(false)
            })
        }
    }, [])

    if (loading) {
        return <p>Loading...</p>
    }

    const value = { app, updateApp, logout, fetchAuth }
    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export default AppProvider
