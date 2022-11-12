import { useEffect, useState } from "react"
import { Button, Form, Modal, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap"
import { useForm } from "react-hook-form"
import useApp from "../hook/useApp"
import { fetchApi } from "../lib/api"
import Notifications from "../lib/notifications"

const PasswordCard = () => {
    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            password: '',
            new_password: '',
            new_password2: '',
        }
    })
    const [loading, setLoading] = useState(false)

    const onSubmit = data => {
        if (loading) return
        setLoading(true)

        fetchApi('/cp/settings/password', {
            method: 'POST',
            body: {
                current_password: data.password,
                new_password: data.new_password,
            }
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Пароль успешно изменен')
                    return
                }

                switch (body.response.type) {
                    case 'invalid_new_password':
                        setError('new_password', { message: 'Нельзя установить такой пароль' }, { shouldFocus: true })
                        break
                    case 'invalid_credentials':
                        setError('password', { message: 'Текущий пароль введен неправильно' }, { shouldFocus: true })
                        break
                    case 'passwords_equals':
                        setError('new_password', { message: 'Старый и новый пароли не отличаются' }, { shouldFocus: true })
                        break
                    default:
                        Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    return <div className="card">
        <div className="card-header">
            <h4 className="mb-0">Пароль</h4>
            <span>Рекомендуем периодически обновлять пароль, чтобы повысить безопасность аккаунта</span>
        </div>
        <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Текущий пароль</Form.Label>
                    <Form.Control type="password" {...register('password', {
                        required: 'Пароль не может быть пустым'
                    })} isInvalid={!!errors.password} />
                    {errors.password && <Form.Control.Feedback type="invalid">{errors.password.message}</Form.Control.Feedback>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="new_password">
                    <Form.Label>Новый пароль</Form.Label>
                    <Form.Control type="password" {...register('new_password', {
                        required: 'Пароль не может быть пустым',
                        minLength: {
                            value: 6,
                            message: 'Минимальная длина пароля 6 символов'
                        },
                        maxLength: {
                            value: 50,
                            message: 'Максимальная длина пароля 50 символов'
                        },
                        deps: ['new_password2']
                    })} isInvalid={!!errors.new_password} />
                    {errors.new_password && <Form.Control.Feedback type="invalid">{errors.new_password.message}</Form.Control.Feedback>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="new_password2">
                    <Form.Label>Повтор нового пароля</Form.Label>
                    <Form.Control type="password" {...register('new_password2', {
                        validate: (val) => {
                            if (watch('new_password') != val)
                                return 'Пароли должны совпадать'
                        },
                    })} isInvalid={!!errors.new_password2} />
                    {errors.new_password2 && <Form.Control.Feedback type="invalid">{errors.new_password2.message}</Form.Control.Feedback>}
                </Form.Group>

                <div className="text-end">
                    <button className="btn btn-primary" disabled={loading}>
                        {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                        {loading ? ' Загрузка...' : 'Изменить'}
                    </button>
                </div>
            </form>
        </div>
    </div>
}

const EmailCard = () => {
    const { app } = useApp()
    return <div className="card">
        <div className="card-header">
            <h4 className="mb-0">Email</h4>
            <span>Изменить Email можно только через Поддержку</span>
        </div>
        <div className="card-body">
            <Form.Group controlId="email">
                <Form.Label>Текущий Email</Form.Label>
                <Form.Control disabled value={app.user.email} />
            </Form.Group>
        </div>
    </div>
}

const AuthSessionsCard = () => {
    return <div className="card">
        <div className="card-header">
            <h4 className="mb-0">Активные сессии</h4>
            <span>Места, с которых выполнен вход</span>
        </div>
        <div className="card-body text-center">
            <button className="btn btn-outline-primary">Посмотреть</button>
        </div>
    </div>
}

const ModalSetupMfa = ({ show, close, onEnable }) => {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        defaultValues: {
            code: null,
        }
    })
    const { app } = useApp()
    // null - loading or error, string - data
    const [secret, setSecret] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!show) return
        fetchApi('/cp/settings/totp/setup', { method: 'POST' })
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    setSecret(body.response.secret)
                    return
                }
                switch (body.response.type) {
                    case 'already_active':
                        close()
                        onEnable?.()
                        Notifications.success('Двухэтапная аутентификация уже включена')
                        break
                    default:
                        Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
    }, [show])

    const onSubmit = data => {
        if (loading || !secret) return
        setLoading(true)
        fetchApi('/cp/settings/totp/setup/confirm', {
            method: 'POST',
            body: {
                tuuid: app.tuuid,
                code: data.code,
            }
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    close()
                    onEnable?.()
                    Notifications.success('Двухэтапная аутентификация успешно включена')
                    return
                }

                switch (body.response.type) {
                    case 'invalid_code':
                        setError('code', { message: 'Введен неправильный код' }, { shouldFocus: true })
                        break
                    default:
                        Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    const android = <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank">Android</a>
    const iphone = <a href="https://itunes.apple.com/us/app/google-authenticator/id388497605" target="_blank">iPhone</a>
    const otpurl = 'otpauth://totp/VimeWorld:' + app.user.username + '?issuer=VimeWorld&secret=' + secret

    return <Modal show={show} onHide={close} size="lg">
        <form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Header closeButton>
                <Modal.Title>Настройка двухэтапной аутентификации</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Приложения для генерации кодов двухэтапной аутентификации позволяют получать коды даже без подключения к интернету.
                    Воспользуйтесь любым приложением для генерации кодов двухэтапной аутентификации.
                    Например, Google Authenticator для {iphone} или {android}.
                </p>
                <p>
                    В приложении просканируйте QR-код или вручную введите секретный ключ, указанный ниже.
                    Затем, чтобы подтвердить правильную настройку приложения, введите код из приложения.
                </p>
                <div className="row gy-2">
                    {secret == null && <div className="d-flex justify-content-center">
                        <Spinner variant="secondary" />
                    </div>}
                    {secret && <>
                        <div className="col-12 col-sm-6 text-center">
                            <img width="200px" height="200px" src={"https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=" + encodeURIComponent(otpurl)} />
                        </div>
                        <div className="col-12 col-sm-6 d-flex flex-column align-items-middle justify-content-center">
                            <div className="mb-sm-4">
                                Секретный ключ: <code className="user-select-all">{secret}</code>
                            </div>
                            <Form.Group controlId="setup-totp-code">
                                <Form.Label>Код из приложения</Form.Label>
                                <Form.Control
                                    {...register('code', {
                                        required: true,
                                        pattern: /^[0-9]{6}$/,
                                    })}
                                    type="number"
                                    isInvalid={!!errors.code}
                                    autoComplete="off"
                                    placeholder="6 цифр"
                                />
                                {errors.code && <Form.Control.Feedback type="invalid">{errors.code.message}</Form.Control.Feedback>}
                            </Form.Group>
                        </div>
                    </>}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={close}>
                    Закрыть
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                    {loading ? ' Загрузка...' : 'Подтвердить'}
                </Button>
            </Modal.Footer>
        </form>
    </Modal>
}

const ModalDisableMfa = ({ show, close, onDisable }) => {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        defaultValues: {
            code: '',
        }
    })
    const [loading, setLoading] = useState(false)

    const onSubmit = data => {
        if (loading) return
        setLoading(true)
        fetchApi('/cp/settings/totp/disable', {
            method: 'POST',
            body: {
                code: data.code,
            }
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    close()
                    onDisable?.()
                    Notifications.success('Двухэтапная аутентификация успешно отключена')
                    return
                }

                switch (body.response.type) {
                    case 'invalid_code':
                        setError('code', { message: 'Введен неправильный код' }, { shouldFocus: true })
                        break
                    case 'not_active':
                        close()
                        onDisable?.()
                        Notifications.warning('Двухэтапная аутентификация не включена')
                        break
                    default:
                        Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    return <Modal show={show} onHide={close}>
        <form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Header closeButton>
                <Modal.Title>Отключение 2fa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="disable-totp-code">
                    <Form.Label>Для отключения двухэтапной аутентификации введите одноразовый код из приложения</Form.Label>
                    <Form.Control
                        {...register('code', {
                            required: true,
                            pattern: /^[0-9]{6}$/,
                        })}
                        type="number"
                        isInvalid={!!errors.code}
                        autoComplete="off"
                        placeholder="6 цифр"
                    />
                    {errors.code && <Form.Control.Feedback type="invalid">{errors.code.message}</Form.Control.Feedback>}
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={close}>
                    Закрыть
                </Button>
                <Button type="submit" variant="danger" disabled={loading}>
                    {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                    {loading ? ' Загрузка...' : 'Отключить'}
                </Button>
            </Modal.Footer>
        </form>
    </Modal>
}

const MfaCard = () => {
    const { app, updateApp } = useApp()

    // null - loading, false - not active, [...] - data
    const [sessions, setSessions] = useState(null)
    const [sessionsError, setSessionsError] = useState(false)
    const [sessionsLoading, setSessionsLoading] = useState(false)

    const [modalDisableMfa, setModalDisableMfa] = useState(false)
    const [modalSetupMfa, setModalSetupMfa] = useState(false)

    const loadSessions = () => {
        if (sessionsLoading) return
        setSessionsError(false)
        setSessionsLoading(true)
        fetchApi('/cp/settings/totp/session/list')
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    setSessions(body.response.sessions)
                } else if (body.response.type == "not_active") {
                    setSessions(false)
                } else {
                    setSessionsError(true)
                }
            }).catch(() => setSessionsError(true))
            .finally(() => setSessionsLoading(false))
    }

    useEffect(loadSessions, [])

    const revokeSession = (e, id) => {
        e.target.setAttribute('disabled', 'disabled')
        e.target.innerText = 'Загрузка...'
        fetchApi('/cp/settings/totp/session/revoke', {
            method: 'POST',
            body: { id },
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    setSessions(sessions.filter(s => s.id != id))
                    Notifications.success('Сессия успешно завершена')
                } else if (body.response.type == "not_active") {
                    setSessions(false)
                    Notifications.warning('Двухэтапная аутентификация не включена')
                } else {
                    Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => {
                e.target.removeAttribute('disabled')
                e.target.innerText = 'Завершить'
            })
    }

    return <div className="card">
        <div className="card-header d-lg-flex justify-content-between align-items-center">
            <div>
                <h4 className="mb-0">Двухэтапная аутентификация</h4>
                <span>Дополнительная защита вашего аккаунта</span>
            </div>
            {sessions &&
                <div className="mt-3 mt-lg-0">
                    <button className="btn btn-outline-danger" onClick={() => setModalDisableMfa(true)}>Отключить</button>
                    <ModalDisableMfa
                        show={modalDisableMfa}
                        close={() => setModalDisableMfa(false)}
                        onDisable={() => {
                            updateApp({ user: { ...app.user, mfa: 'disabled' } })
                            setSessions(false)
                        }}
                    />
                </div>
            }
        </div>

        {sessionsLoading &&
            <div className="card-body">
                <div className="d-flex justify-content-center">
                    <Spinner variant="secondary" />
                </div>
            </div>}

        {sessionsError && <div className="card-body text-danger text-center">
            <p>При загрузке произошла ошибка</p>
            <button className="btn btn-outline-secondary" onClick={loadSessions}>Попробовать снова</button>
        </div>}

        {sessions === false && <div className="card-body">
            <div className="d-flex justify-content-center">
                <button className="btn btn-primary" onClick={() => setModalSetupMfa(true)}>Установить</button>
                <ModalSetupMfa
                    show={modalSetupMfa}
                    close={() => setModalSetupMfa(false)}
                    onEnable={() => {
                        updateApp({ user: { ...app.user, mfa: 'completed' } })
                        setSessions(null)
                    }}
                />
            </div>
        </div>}

        {sessions && <>
            <div className="card-table table-responsive">
                <table className="table">
                    <thead className="table-light">
                        <tr>
                            <th scope="col" className="border-bottom-0">Имя</th>
                            <th scope="col" className="border-bottom-0">Активность</th>
                            <th scope="col" className="border-bottom-0">IP</th>
                            <th scope="col" className="border-bottom-0">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map(s => {
                            let current = ''
                            if (s.id == app.tuuid)
                                current = <OverlayTrigger overlay={<Tooltip>Текущая сессия</Tooltip>}>
                                    <i className="bi bi-info-circle ms-2 text-primary"></i>
                                </OverlayTrigger>
                            return <tr key={s.id}>
                                <td className="align-middle">{s.name}{current}</td>
                                <td className="fit">{new Date(Date.parse(s.last_use)).toLocaleString()}</td>
                                <td className="fit">{s.ip}</td>
                                <td className="fit"><button className="btn btn-sm btn-outline-danger" onClick={e => revokeSession(e, s.id)}>Завершить</button></td>
                            </tr>
                        })}

                        {sessions.length == 0 && <tr><td className="text-center" colSpan="4">Сохраненных сессий нет</td></tr>}
                    </tbody>
                </table>
            </div>
        </>}
    </div>
}

const DeleteCard = () => {
    return <div className="card border border-danger">
        <div className="card-header text-danger">
            <h4 className="mb-0">Удаление аккаунта</h4>
            <span>Навсегда удаляет этот аккаунт и все связанные данные</span>
        </div>
        <div className="card-body text-center">
            <button className="btn btn-outline-danger">Удалить аккаунт</button>
        </div>
    </div>
}

export const SecurityPage = () => {
    return <>
        <div className="row mb-4 gy-4">
            <div className="col-lg-6 col-12">
                <PasswordCard />
            </div>
            <div className="col-lg-6 col-12">
                <EmailCard />
                <div className="mt-4">
                    <AuthSessionsCard />
                </div>
            </div>
        </div>
        <div className="row mb-4">
            <div className="col">
                <MfaCard />
            </div>
        </div>
        <div className="row mb-4">
            <div className="col">
                <DeleteCard />
            </div>
        </div>
    </>
}
