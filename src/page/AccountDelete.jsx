import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Notifications from '../lib/notifications'
import { fetchApi } from '../lib/api'
import { Spinner } from 'react-bootstrap'
import useApp from '../hook/useApp'
import OuterPage from '../component/OuterPage'
import { useTitle } from '../hook/useTitle'

const DeleteInProgressFragment = ({ progress }) => {
    const { app, updateApp } = useApp()
    useTitle('Аккаунт ' + app.user.username + ' удален')
    const [loading, setLoading] = useState(false)

    const cancel = () => {
        if (!progress.cancel_possible) return
        if (loading) return
        setLoading(true)

        fetchApi('/user/delete/cancel', {
            method: 'POST'
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    updateApp({
                        user: {
                            ...app.user,
                            account_deleted: false,
                        }
                    })
                    Notifications.success('Аккаунт восстановлен')
                } else if (body.response.type == 'too_late') {
                    Notifications.error('Уже слишком поздно отменять удаление')
                } else {
                    Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    if (!progress.cancel_possible)
        return <div>
            Аккаунт будет окончательно удален в ближайшее время.
        </div>

    return <div>
        <p>
            Аккаунт будет окончательно удален после <b>{new Date(Date.parse(progress.cancel_deadline)).toLocaleString()}</b>.
            До этого времени вы можете отменить удаление.
        </p>

        <button className="btn btn-lg btn-primary w-100 mt-4" onClick={cancel} disabled={loading}>
            {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
            {loading ? ' Загрузка...' : 'Восстановить аккаунт'}
        </button>
    </div>
}

const DeleteConfirmFragment = ({ token }) => {
    const { app, updateApp } = useApp()
    const [loading, setLoading] = useState(false)

    const confirm = () => {
        if (loading) return

        setLoading(true)
        fetchApi('/user/delete/confirm', {
            method: 'POST',
            body: { token }
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    updateApp({
                        user: {
                            ...app.user,
                            account_deleted: true,
                        }
                    })
                } else if (body.response.type == 'invalid_token') {
                    Notifications.error('Время действия ссылки истекло')
                } else {
                    Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    return <>
        <p>
            После нажатия кнопки <b>Удалить аккаунт</b> у вас будет еще <b>20 дней</b> чтобы передумать и восстановить его.
            До этого времени вы можете отменить удаление.
        </p>

        <p className="text-danger">Ваш ник не будет доступен для регистрации еще <b>3 месяца</b> после удаления аккаунта.</p>

        <button className="btn btn-lg btn-danger w-100 mt-3" onClick={confirm} disabled={loading}>
            {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
            {loading ? ' Загрузка...' : 'Удалить аккаунт'}
        </button>
    </>
}

const AccountDeleteRequestPage = () => {
    useTitle('Удаление аккаунта')
    const { app } = useApp()
    const [valid, setValid] = useState(false)
    const [loading, setLoading] = useState(true)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            navigate('/', { replace: true })
            return
        }

        setLoading(true)
        fetchApi('/user/delete/request?token=' + token)
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    setValid(true)
                } else if (body.response.type == 'invalid_token') {
                    Notifications.error('Некорректный запрос на удаление аккаунта')
                    navigate('/', { replace: true })
                } else if (body.response.type == 'expired_token') {
                    Notifications.error('Время действия ссылки истекло')
                    navigate('/', { replace: true })
                } else {
                    Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }, [token])

    if (!token)
        return <></>

    return <OuterPage variant="red">
        <h4 className="mb-2 text-center text-danger">Удаление аккаунта</h4>
        <h5 className="mb-4 text-center">{app.user.username}</h5>

        {loading && <div className="text-center"><Spinner size="lg" variant="secondary" /></div>}
        {!loading && !valid && <div className="text-danger text-center">Ошибка</div>}
        {!loading && valid && <DeleteConfirmFragment token={token} />}

        <Link to="/" className="btn btn-link mt-3">Вернуться</Link>
    </OuterPage>
}

const AccountDeletedStatePage = () => {
    const { app, logout } = useApp()
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (!app.user.account_deleted) {
            navigate('/', { replace: true })
            return
        }

        setLoading(true)
        fetchApi('/user/delete/status')
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    setStatus(body.response)
                } else if (body.response.type == 'not_deleting') {
                    Notifications.error('Ваш аккаунт не удаляется, вас не должно быть на этой странице...')
                } else {
                    Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }, [app])

    if (!app.user.account_deleted)
        return <></>

    return <OuterPage>
        <h5 className="mb-4 text-center text-danger">Аккаунт {app.user.username} удален</h5>

        {loading && <div className="text-center"><Spinner size="lg" variant="secondary" /></div>}
        {!loading && !status && <div className="text-danger text-center">Ошибка</div>}
        {!loading && status && <DeleteInProgressFragment progress={status} />}

        <button className="btn btn-link mt-3" onClick={logout}>Выход</button>
    </OuterPage>
}

export { AccountDeletedStatePage, AccountDeleteRequestPage }
