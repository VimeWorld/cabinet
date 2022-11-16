import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import Notifications from '../lib/notifications';
import { fetchApi } from "../lib/api"
import { Spinner } from "react-bootstrap"
import useApp from "../hook/useApp";

const DeleteInProgressCard = ({ progress }) => {
    const { app, updateApp } = useApp()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const cancel = () => {
        if (!progress.cancel_possible) return
        if (loading) return

        fetchApi('/delete/cancel', {
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
                    navigate("/")
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

        <div className="mt-4">
            <button className="btn btn-lg btn-primary w-100" onClick={cancel} disabled={loading}>
                {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                {loading ? ' Загрузка...' : 'Восстановить аккаунт'}
            </button>
        </div>
    </div>
}

const DeleteConfirmCard = ({ token }) => {
    const { app, updateApp } = useApp()
    const [loading, setLoading] = useState(false)

    const confirm = () => {
        if (loading) return

        setLoading(true)
        fetchApi('/delete/confirm', {
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

        <div className="mt-3">
            <button className="btn btn-lg btn-danger w-100" onClick={confirm} disabled={loading}>
                {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                {loading ? ' Загрузка...' : 'Удалить аккаунт'}
            </button>
        </div>
    </>
}

const DeleteRequestLoader = () => {
    const { app } = useApp()
    const [valid, setValid] = useState(false)
    const [loading, setLoading] = useState(true)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    useEffect(() => {
        setLoading(true)
        fetchApi('/delete/request?token=' + token)
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

    return <div className="card w-100 p-4 my-5">
        <h3 className="mb-1 text-center">VimeWorld</h3>
        <h5 className="mb-2 fw-normal text-center text-danger">Удаление аккаунта</h5>
        <h5 className="mb-4 text-center">{app.user.username}</h5>

        {loading && <div className="text-center"><Spinner size="lg" variant="secondary" /></div>}
        {!loading && !valid && <div className="text-danger text-center">Ошибка</div>}
        {!loading && valid && <DeleteConfirmCard token={token} />}

        <Link to="/" className="btn btn-link mt-3">Вернуться</Link>
    </div>
}

const DeletionProgressLoader = () => {
    const { app, logout } = useApp()
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        fetchApi('/delete/status')
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
    }, [])

    return <div className="card w-100 p-4 my-5">
        <h3 className="mb-1 text-center">VimeWorld</h3>
        <h5 className="mb-4 fw-normal text-center text-danger">Аккаунт {app.user.username} удален</h5>

        {loading && <div className="text-center"><Spinner size="lg" variant="secondary" /></div>}
        {!loading && !status && <div className="text-danger text-center">Ошибка</div>}
        {!loading && status && <DeleteInProgressCard progress={status} />}

        <button className="btn btn-link mt-3" onClick={logout}>Выход</button>
    </div>
}

const AccountDeletePage = () => {
    const { app } = useApp()

    return <section className="container vh-100">
        <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
                {app.user.account_deleted ?
                    <DeletionProgressLoader />
                    :
                    <DeleteRequestLoader />
                }
            </div>
        </div>
    </section>
}

export default AccountDeletePage
