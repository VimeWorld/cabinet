import classNames from "classnames"
import { useEffect, useState } from "react"
import { Button, Form, Modal, Spinner } from "react-bootstrap"
import { useForm } from "react-hook-form"
import useApp from "../hook/useApp"
import { useTitle } from "../hook/useTitle"
import { fetchApi } from "../lib/api"
import Notifications from "../lib/notifications"

const PasswordCard = () => {
    const {
        register,
        handleSubmit,
        watch,
        setError,
        reset,
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

        fetchApi('/settings/password', {
            method: 'POST',
            body: {
                current_password: data.password,
                new_password: data.new_password,
            }
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Пароль успешно изменен')
                    reset()
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
                            if (watch('new_password') !== val)
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
            <span>Изменить Email можно только через <a href="https://vk.me/vimeworld">Поддержку</a></span>
        </div>
        <div className="card-body">
            <Form.Group controlId="email">
                <Form.Label>Текущий Email</Form.Label>
                <Form.Control disabled value={app.user.email} />
            </Form.Group>
        </div>
    </div>
}

const ModalSetupMfa = ({ show, close, onEnable }) => {
    const {
        register,
        handleSubmit,
        setError,
        reset,
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
        fetchApi('/settings/totp/setup', { method: 'POST' })
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    setSecret(body.response.secret)
                    reset()
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
        fetchApi('/settings/totp/setup/confirm', {
            method: 'POST',
            body: {
                code: data.code,
            }
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    close()
                    reset()
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

    const android = <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noreferrer">Android</a>
    const iphone = <a href="https://itunes.apple.com/us/app/google-authenticator/id388497605" target="_blank" rel="noreferrer">iPhone</a>
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
                            <img
                                className="rounded"
                                width="200px"
                                height="200px"
                                src={"https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=" + encodeURIComponent(otpurl)} />
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
                                    autoFocus={true}
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    autoComplete="off"
                                    placeholder="XXXXXX"
                                    isInvalid={!!errors.code}
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
        reset,
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
        fetchApi('/settings/totp/disable', {
            method: 'POST',
            body: {
                code: data.code,
            }
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    reset()
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
                        reset()
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
                        autoFocus={true}
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        autoComplete="off"
                        placeholder="XXXXXX"
                        isInvalid={!!errors.code}
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

    const [modalDisableMfa, setModalDisableMfa] = useState(false)
    const [modalSetupMfa, setModalSetupMfa] = useState(false)

    return <div className={classNames('card', {
        'border border-warning': app.theme === 'dark' && app.user.mfa === 'disabled',
        'border border-success': app.theme === 'dark' && app.user.mfa === 'completed',
    })}>
        <div className={classNames("card-header", {
            'text-white': app.theme === 'light',
            'bg-gradient-red': app.theme === 'light' && app.user.mfa === 'disabled',
            'bg-gradient-green': app.theme === 'light' && app.user.mfa === 'completed',
        })}>
            <h4 className="mb-0">Двухэтапная аутентификация</h4>
            <span>Дополнительная защита вашего аккаунта</span>
        </div>

        <div className="card-body">
            <p className="">Помимо пароля, для входа также будет требоваться одноразовый код из приложения.</p>

            {app.user.mfa === 'disabled' && <>
                <p className="mb-0 d-flex justify-content-between align-items-center">
                    <span className="text-danger"><i className="bi bi-x-lg" /> Отключена</span>
                    <button className="btn btn-primary" onClick={() => setModalSetupMfa(true)}>Включить</button>
                    <ModalSetupMfa
                        show={modalSetupMfa}
                        close={() => setModalSetupMfa(false)}
                        onEnable={() => {
                            updateApp({ user: { ...app.user, mfa: 'completed' } })
                        }}
                    />
                </p>
            </>}

            {app.user.mfa === 'completed' && <div className="d-flex justify-content-between align-items-center">
                <span className="text-success"><i className="bi bi-check-lg" /> Активна</span>
                <button className="btn btn-outline-danger" onClick={() => setModalDisableMfa(true)}>Отключить</button>
                <ModalDisableMfa
                    show={modalDisableMfa}
                    close={() => setModalDisableMfa(false)}
                    onDisable={() => {
                        updateApp({ user: { ...app.user, mfa: 'disabled' } })
                    }}
                />
            </div>}
        </div>
    </div>
}

const ModalAccountDelete = ({ show, close }) => {
    const [loading, setLoading] = useState(false)
    const [username, setUsername] = useState('')
    const { app } = useApp()

    const confirmDelete = () => {
        if (loading) return
        setLoading(true)
        fetchApi('/user/delete/request', {
            method: 'POST'
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    close()
                    Notifications.success('На вашу почту выслано письмо с подтверждением.')
                    return
                }

                switch (body.response.type) {
                    case 'throttle':
                        close()
                        Notifications.error('Запрос на удаление аккаунта можно делать раз в сутки')
                        break
                    case 'already_deleting':
                        close()
                        Notifications.warning('Аккаунт уже удаляется')
                        break
                    default:
                        Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    return <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
            <Modal.Title>Удаление аккаунта</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="mb-3">Введите свой ник <b>{app.user.username}</b> в поле ниже:</div>
            <input
                className="form-control mb-3"
                placeholder="Ваш ник"
                value={username}
                onChange={e => setUsername(e.target.value)}
            />
            <div>На вашу почту придет письмо со ссылкой на страницу удаления аккаунта.</div>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={close}>
                Закрыть
            </Button>
            <Button
                variant="danger"
                disabled={loading || username.trim().toLowerCase() !== app.user.username.toLowerCase()}
                onClick={confirmDelete}
            >
                {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                {loading ? ' Загрузка...' : 'Подтвердить'}
            </Button>
        </Modal.Footer>
    </Modal>
}

const DeleteCard = () => {
    const [modalDisableMfa, setModalDisableMfa] = useState(false)

    return <div className="card border border-danger">
        <div className="card-header text-danger">
            <h4 className="mb-0 text-danger">Удаление аккаунта</h4>
            <span>Навсегда удаляет этот аккаунт и все связанные данные</span>
        </div>
        <div className="card-body text-center">
            <button className="btn btn-outline-danger" onClick={() => setModalDisableMfa(true)}>Удалить аккаунт</button>
            <ModalAccountDelete
                show={modalDisableMfa}
                close={() => setModalDisableMfa(false)}
            />
        </div>
    </div>
}

const SecurityPage = () => {
    useTitle('Безопасность')
    return <>
        <div className="row mb-4 gy-4">
            <div className="col-lg-6 col-12">
                <PasswordCard />
            </div>
            <div className="col-lg-6 col-12">
                <EmailCard />
                <div className="mt-4">
                    <MfaCard />
                </div>
            </div>
        </div>
        <div className="row mb-4">
            <div className="col">
                <DeleteCard />
            </div>
        </div>
    </>
}

export default SecurityPage
