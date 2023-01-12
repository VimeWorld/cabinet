import { useEffect, useState } from "react"
import { Form, Spinner } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import OuterPage from "../component/OuterPage"
import useInvisibleRecaptcha from "../hook/useInvisibleRecaptcha"
import { useTitle } from "../hook/useTitle"
import { fetchApi } from "../lib/api"
import Notifications from "../lib/notifications"

const RecoveryStep2Form = ({ token, username }) => {
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
            password2: '',
        }
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const onSubmit = data => {
        if (loading) return
        setLoading(true)

        fetchApi('/recovery/confirm', {
            method: 'POST',
            body: {
                token,
                password: data.password,
            }
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Ваш пароль изменен. Теперь вы можете использовать его для входа в аккаунт.')
                    navigate('/login', { replace: true })
                    return
                }

                switch (body.response.type) {
                    case 'invalid_password':
                        setError('password', { message: 'Нельзя установить такой пароль' }, { shouldFocus: true })
                        break
                    case 'invalid_token':
                        Notifications.error('Время действия ссылки истекло')
                        navigate('/login', { replace: true })
                        break
                    default:
                        Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    return <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" name="username" value={username} />

        <Form.Group className="mb-3" controlId="password">
            <Form.Label>Новый пароль</Form.Label>
            <Form.Control type="password" {...register('password', {
                required: 'Пароль не может быть пустым',
                minLength: {
                    value: 6,
                    message: 'Минимальная длина пароля 6 символов'
                },
                maxLength: {
                    value: 50,
                    message: 'Максимальная длина пароля 50 символов'
                },
                deps: ['password2']
            })} isInvalid={!!errors.password} />
            {errors.password && <Form.Control.Feedback type="invalid">{errors.password.message}</Form.Control.Feedback>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="password2">
            <Form.Label>Повтор нового пароля</Form.Label>
            <Form.Control type="password" {...register('password2', {
                validate: (val) => {
                    if (watch('password') !== val)
                        return 'Пароли должны совпадать'
                },
            })} isInvalid={!!errors.password2} />
            {errors.password2 && <Form.Control.Feedback type="invalid">{errors.password2.message}</Form.Control.Feedback>}
        </Form.Group>

        <button className="btn btn-lg btn-primary w-100 mt-3 mb-4" type="submit" disabled={loading}>
            {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
            {loading ? ' Загрузка...' : 'Изменить пароль'}
        </button>
    </form>
}

const RecoveryStep2Page = () => {
    useTitle('Восстановление аккаунта')
    const [username, setUsername] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    useEffect(() => {
        setLoading(true)
        fetchApi('/recovery/check?token=' + token)
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    setUsername(body.response.username)
                } else if (body.response.type === 'invalid_token') {
                    Notifications.error('Некорректный запрос на восстановление аккаунта')
                    navigate('/login', { replace: true })
                } else if (body.response.type === 'expired_token') {
                    Notifications.error('Время действия ссылки истекло')
                    navigate('/login', { replace: true })
                } else {
                    Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }, [token])

    return <OuterPage>
        <h4 className="mb-4 text-center">Восстановление аккаунта</h4>
        {!loading && username && <h5 className="mb-4 mt-n3 text-center">{username}</h5>}

        {loading && <div className="text-center"><Spinner size="lg" variant="secondary" /></div>}
        {!loading && !username && <div className="text-danger text-center">Ошибка</div>}
        {!loading && username && <RecoveryStep2Form token={token} username={username} />}

        <p className="text-center"><Link to="/login">Вернуться на главную</Link></p>
    </OuterPage>
}

const RecoveryPage = () => {
    useTitle('Восстановление аккаунта')
    const [login, setLogin] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const { recaptchaComponent, getRecaptchaValue } = useInvisibleRecaptcha()

    const submit = async (e) => {
        if (loading)
            return

        e.preventDefault()
        e.stopPropagation()
        setLoading(true)

        try {
            const recaptchaValue = await getRecaptchaValue()
            const response = await fetchApi('/recovery/request', {
                method: 'POST',
                body: {
                    username: login,
                    email: email,
                    recaptcha_response: recaptchaValue,
                }
            })
            const body = await response.json()
            if (response.ok) {
                Notifications.success('Письмо с подтверждением было отправлено на вашу почту', { ttl: 30000 })
            } else {
                switch (body.response.type) {
                    case "invalid_credentials":
                        Notifications.error('Такой комбинации логина и почты не существует')
                        break
                    case "captcha":
                        Notifications.error('Ошибка Recaptcha. Обновите страницу и попробуйте еще раз.')
                        break
                    case "throttle":
                        Notifications.error('Восстанавливать аккаунт можно только один раз в сутки')
                        break
                    default:
                        Notifications.error(body.response.title)
                        break
                }
            }
        } catch (e) {
            Notifications.error('Невозможно подключиться к серверу')
        }
        setLoading(false)
    }

    return <OuterPage>
        <Form onSubmit={submit}>
            <h4 className="mb-4 text-center">Восстановление аккаунта</h4>

            <p>Вам будет выслано письмо с подтверждением, которое будет действительно в течение одного часа.</p>

            <Form.Group className="mb-3" controlId="login">
                <Form.Label>Логин</Form.Label>
                <Form.Control type="text" minLength="3" maxLength="20" required
                    value={login} onChange={e => setLogin(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" required
                    value={email} onChange={e => setEmail(e.target.value)} />
            </Form.Group>

            {recaptchaComponent}

            <button className="btn btn-lg btn-primary w-100 mt-2 mb-4" type="submit" disabled={loading}>
                {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                {loading ? ' Загрузка...' : 'Восстановить'}
            </button>

            <p className="text-center">Вспомнили пароль? <Link to="/login">Войти</Link></p>
        </Form>
    </OuterPage>
}

export { RecoveryPage, RecoveryStep2Page }
