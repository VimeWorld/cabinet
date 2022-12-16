import { useState } from "react"
import { Form, Spinner } from "react-bootstrap"
import { useForm } from "react-hook-form"
import Notifications from '../lib/notifications'
import { fetchApi } from "../lib/api"
import useInvisibleRecaptcha from "../hook/useInvisibleRecaptcha"
import { Link } from "react-router-dom"
import useApp from "../hook/useApp"
import OuterPage from "../component/OuterPage"
import { useTitle } from "../hook/useTitle"
import { ruPluralize } from "../lib/i18n"

export const LoginMfaRecoveryPage = () => {
    useTitle('Восстановление двухэтапной аутентификации')
    const { app, updateApp, logout } = useApp()
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
    const { recaptchaComponent, getRecaptchaValue } = useInvisibleRecaptcha()

    const onSubmit = async (data) => {
        if (loading)
            return

        setLoading(true)
        try {
            const recaptchaValue = await getRecaptchaValue()
            const response = await fetchApi('/login/totp/recovery', {
                method: 'POST',
                body: {
                    code: data.code,
                    recaptcha_response: recaptchaValue,
                }
            })
            const body = await response.json()
            if (response.ok) {
                updateApp({
                    user: { ...app.user, mfa: "disabled" }
                })
            } else {
                switch (body.response.type) {
                    case "invalid_code":
                        setError('code', { type: 'custom', message: 'Введен неправильный код' }, { shouldFocus: true })
                        break
                    case "throttle": {
                        const retryAfter = response.headers.get('Retry-After')
                        if (retryAfter) {
                            const minutes = Math.ceil(parseInt(retryAfter) / 60)
                            Notifications.warning('Слишком много попыток, повторите снова через ' + ruPluralize(minutes, ['минуту', 'минуты', 'минут']))
                        } else {
                            Notifications.warning('Слишком много попыток, попробуйте позже')
                        }
                        break
                    }
                    case "captcha":
                        Notifications.error('Ошибка Recaptcha. Обновите страницу и попробуйте еще раз.')
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
        <Form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <h4 className="mb-4 text-center">Восстановление аккаунта</h4>

            <Form.Group className="mb-3" controlId="code">
                <Form.Label>Вам необходимо ввести один из кодов восстановления, которые вы получили при включении двухэтапной аутентификации</Form.Label>
                <Form.Control
                    {...register('code', {
                        required: true,
                    })}
                    isInvalid={!!errors.code}
                    autoComplete="off"
                />
                {errors.code && <Form.Control.Feedback type="invalid">{errors.code.message}</Form.Control.Feedback>}
            </Form.Group>

            {recaptchaComponent}

            <button className="btn btn-lg btn-primary w-100 mt-2 mb-4" type="submit" disabled={loading}>
                {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                {loading ? ' Загрузка...' : 'Продолжить'}
            </button>

            <div className="text-center">
                <Link to="/login/mfa">Назад</Link>
                <br />
                <a href="#" onClick={logout}>Выход</a>
            </div>
        </Form>
    </OuterPage>
}

export const LoginMfaPage = () => {
    useTitle('Вход - Двухэтапная аутентификация')
    const { app, updateApp, logout } = useApp()
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            code: null,
        }
    })

    const [loading, setLoading] = useState(false)

    const onSubmit = async (data) => {
        if (loading)
            return

        setLoading(true)
        try {
            const response = await fetchApi('/login/totp', {
                method: 'POST',
                body: {
                    code: data.code,
                }
            })
            const body = await response.json()
            if (response.ok) {
                updateApp({
                    user: { ...app.user, mfa: 'completed' }
                })
            } else {
                switch (body.response.type) {
                    case "invalid_code":
                        setError('code', { type: 'custom', message: 'Введен неправильный код' }, { shouldFocus: true })
                        break
                    case "throttle": {
                        const retryAfter = response.headers.get('Retry-After')
                        if (retryAfter) {
                            const minutes = Math.ceil(parseInt(retryAfter) / 60)
                            Notifications.warning('Слишком много попыток, повторите снова через ' + ruPluralize(minutes, ['минуту', 'минуты', 'минут']))
                        } else {
                            Notifications.warning('Слишком много попыток, попробуйте позже')
                        }
                        break
                    }
                    case "captcha":
                        Notifications.error('Ошибка Recaptcha. Обновите страницу и попробуйте еще раз.')
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
        <Form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <h4 className="mb-4 text-center">Двухэтапная аутентификация</h4>

            <Form.Group className="mb-3" controlId="code">
                <Form.Label>Одноразовый код</Form.Label>
                <Form.Control
                    {...register('code', {
                        required: true,
                        pattern: /^[0-9]{6}$/,
                    })}
                    autoFocus={true}
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    isInvalid={!!errors.code}
                    autoComplete="off"
                    placeholder="XXXXXX"
                />
                {errors.code && <Form.Control.Feedback type="invalid">{errors.code.message}</Form.Control.Feedback>}
            </Form.Group>

            <button className="btn btn-lg btn-primary w-100 mt-2 mb-4" type="submit" disabled={loading}>
                {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                {loading ? ' Загрузка...' : 'Продолжить'}
            </button>

            <div className="text-center">
                <Link to="/login/mfa/recovery">Восстановление доступа</Link>
                <br />
                <a href="#" onClick={logout}>Выход</a>
            </div>
        </Form>
    </OuterPage>
}
