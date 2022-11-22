import { useState } from "react"
import { Link } from "react-router-dom"
import Notifications from '../lib/notifications';
import { fetchApi } from "../lib/api"
import { Form, Spinner } from "react-bootstrap"
import useInvisibleRecaptcha from "../hook/useInvisibleRecaptcha";
import useApp from "../hook/useApp";
import OuterPage from "../component/OuterPage";
import { useTitle } from "../hook/useTitle";

const LoginPage = () => {
    useTitle('Вход в личный кабинет')
    const { app, updateApp } = useApp()
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
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
            const response = await fetchApi('/login', {
                method: 'POST',
                body: {
                    username: login,
                    password,
                    tuuid: app.tuuid,
                    recaptcha_response: recaptchaValue,
                }
            })
            const body = await response.json()
            if (response.ok) {
                updateApp({
                    token: body.response.token,
                    user: body.response.auth,
                })
            } else {
                switch (body.response.type) {
                    case "invalid_credentials":
                        Notifications.error('Некорректный логин или пароль')
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

    return <OuterPage>
        <Form onSubmit={submit}>
            <h3 className="mb-1 text-center">VimeWorld</h3>
            <h5 className="fw-normal mb-4 text-center">Вход в аккаунт</h5>

            <Form.Group className="mb-3" controlId="login">
                <Form.Label>Логин</Form.Label>
                <Form.Control type="text" minLength="3" maxLength="20" required
                    value={login} onChange={e => setLogin(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
                <Form.Label>Пароль</Form.Label>
                <Link className="float-end" to="/recovery" tabIndex="2">Забыли пароль?</Link>
                <Form.Control type="password" required
                    value={password} onChange={e => setPassword(e.target.value)} />
            </Form.Group>

            {recaptchaComponent}

            <button className="btn btn-lg btn-primary w-100 mt-2 mb-4" type="submit" disabled={loading}>
                {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                {loading ? ' Загрузка...' : 'Вход'}
            </button>

            <p className="text-center">Еще нет аккаунта? <Link to="/register">Регистрация</Link></p>
        </Form>
    </OuterPage>
}

export default LoginPage
