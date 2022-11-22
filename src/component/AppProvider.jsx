import { useEffect, useState } from 'react'
import { fetchApi, getToken, setToken, getTuuid } from '../lib/api';
import { AppContext } from '../hook/useApp';
import { Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Notifications from '../lib/notifications';
import { useTitle } from '../hook/useTitle';

function Preloader() {
    return <div className="vh-100 d-flex flex-column align-items-center justify-content-center">
        <Spinner variant='secondary' animation="grow" />
    </div>
}

function AuthLoadError({ error, app }) {
    const [reloading, setReloading] = useState(false)

    const reload = () => {
        if (reloading) return
        setReloading(true)
        app.fetchAuth({
            success: () => setReloading(false),
            error: () => {
                setReloading(false)
                Notifications.error("Ошибка осталась ヽ(ಠ_ಠ)ノ")
            },
        })
    }

    return <div className="vh-100 d-flex flex-column align-items-center justify-content-center">
        <h1 className='display-1'>Неполадки</h1>
        <h5 className='text-danger'>{error}</h5>
        <p>Если ошибка повторяется, значит что-то не работает, попробуйте зайти позже.</p>
        <div>
            <button className='btn btn-outline-primary' onClick={reload} disabled={reloading}>
                {reloading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                {reloading ? ' Пробую...' : 'Попробовать еще раз'}
            </button>
        </div>
    </div>
}

function NotFoundPage() {
    useTitle('404 - Страница не найдена')
    return <div className="vh-100 d-flex flex-column align-items-center justify-content-center">
        <h1 className='display-1'>404</h1>
        <h5>Страница не найдена</h5>
        <p>Здесь что-то когда-то было, но теперь этого уже нет.</p>
        <div>
            <Link to="/" className='btn btn-primary'>Верните меня домой</Link>
        </div>
    </div>
}

function AppProvider({ children }) {
    const [app, setApp] = useState(() => {
        return {
            tuuid: getTuuid(),
            token: getToken(),
        }
    })
    const [loading, setLoading] = useState(!!app.token)
    const [error, setError] = useState(null)

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

    const fetchAuth = options => {
        fetchApi("/auth")
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    updateApp({
                        token: app.token,
                        user: body.response,
                    })
                    setError(null)
                    options?.success?.()
                } else if (body.error) {
                    if (body.response.type == 'unauthorized') {
                        updateApp({
                            token: undefined,
                            user: undefined,
                        })
                        setError(null)
                        options?.success?.()
                    } else {
                        setError(body.response.title)
                        options?.error?.()
                    }
                } else {
                    setError("Некорректный ответ сервера")
                    options?.error?.()
                }
            }).catch(error => {
                options?.error?.(error)
                setError('Не удалось установить подключение')
            })
    }

    useEffect(() => {
        if (app.token) {
            fetchAuth({
                success: () => setLoading(false),
                error: () => setLoading(false),
            })
        }
    }, [])

    const value = { app, updateApp, logout, fetchAuth }

    if (loading)
        return <Preloader />

    if (error)
        return <AuthLoadError error={error} app={value} />

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export default AppProvider
export { NotFoundPage }
