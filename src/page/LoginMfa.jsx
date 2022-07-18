import { useState } from "react"
import { Form, Spinner } from "react-bootstrap"
import { useForm } from "react-hook-form"
import Notifications from '../lib/notifications';
import { fetchApi } from "../lib/api"
import useInvisibleRecaptcha from "../hook/useInvisibleRecaptcha";
import { Link } from "react-router-dom";
import useApp from "../hook/useApp";

export const LoginMfaRecoveryPage = () => {
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
                    user: { ...app.user, mfa_needed: false }
                })
            } else {
                switch (body.response.type) {
                    case "invalid_code":
                        setError('code', { type: 'custom', message: 'Введен неправильный код' }, { shouldFocus: true })
                        break
                    case "throttle":
                        Notifications.warning('Слишком много попыток, попробуйте позже')
                        break
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

    return <section className="container vh-100">
        <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
                <Form className="card w-100 p-4 mt-5" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                    <h3 className="mb-1 text-center">VimeWorld</h3>
                    <h5 className="fw-normal mb-4 text-center">Восстановление аккаунта</h5>

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

                    <div className="mt-2 mb-4">
                        <button className="btn btn-lg btn-primary w-100" type="submit" disabled={loading}>
                            {loading && <Spinner className="align-baseline" animation="border" as="span" size="sm" aria-hidden="true" />}
                            {loading ? ' Загрузка...' : 'Продолжить'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/login/mfa">Назад</Link>
                        <br />
                        <a href="#" onClick={logout}>Выход</a>
                    </div>
                </Form>
            </div>
        </div>
    </section>
}

export const LoginMfaPage = () => {
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
            save: false,
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
            const response = await fetchApi('/login/totp', {
                method: 'POST',
                body: {
                    code: data.code,
                    tuuid: app.tuuid,
                    save_session: data.save,
                    recaptcha_response: recaptchaValue,
                }
            })
            const body = await response.json()
            if (response.ok) {
                updateApp({
                    user: { ...app.user, mfa_needed: false }
                })
            } else {
                switch (body.response.type) {
                    case "invalid_code":
                        setError('code', { type: 'custom', message: 'Введен неправильный код' }, { shouldFocus: true })
                        break
                    case "throttle":
                        Notifications.warning('Слишком много попыток, попробуйте позже')
                        break
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

    return <section className="container vh-100">
        <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
                <Form className="card w-100 p-4 mt-5" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                    <h3 className="mb-1 text-center">VimeWorld</h3>
                    <h5 className="fw-normal mb-4 text-center">Двухэтапная аутентификация</h5>

                    <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Одноразовый код</Form.Label>
                        <Form.Control
                            {...register('code', {
                                valueAsNumber: true,
                                required: true,
                                min: 100000,
                                max: 999999,
                                validate: (val) => {
                                    if (isNaN(val)) return false
                                }
                            })}
                            isInvalid={!!errors.code}
                            autoComplete="off"
                            placeholder="6 цифр"
                        />
                        {errors.code && <Form.Control.Feedback type="invalid">{errors.code.message}</Form.Control.Feedback>}
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="save">
                        <Form.Check {...register('save')} label="Запомнить устройство" />
                    </Form.Group>

                    {recaptchaComponent}

                    <div className="mt-2 mb-4">
                        <button className="btn btn-lg btn-primary w-100" type="submit" disabled={loading}>
                            {loading && <Spinner className="align-baseline" animation="border" as="span" size="sm" aria-hidden="true" />}
                            {loading ? ' Загрузка...' : 'Продолжить'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/login/mfa/recovery">Восстановление доступа</Link>
                        <br />
                        <a href="#" onClick={logout}>Выход</a>
                    </div>
                </Form>
            </div>
        </div>
    </section>
}
