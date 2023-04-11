import { useState } from "react"
import { Link } from "react-router-dom"
import Notifications from '../lib/notifications'
import { fetchApi, setToken } from "../lib/api"
import { Form, Spinner } from "react-bootstrap"
import useApp from "../hook/useApp"
import OuterPage from "../component/OuterPage"
import { useTitle } from "../hook/useTitle"
import { ruPluralize } from "../lib/i18n"

const LoginPage = () => {
    useTitle('Вход в личный кабинет')
    const { updateApp } = useApp()
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const submit = async (e) => {
        if (loading)
            return

        e.preventDefault()
        e.stopPropagation()
        setLoading(true)

        try {
            const response = await fetchApi('/login', {
                method: 'POST',
                body: {
                    username: login,
                    password,
                }
            })
            const body = await response.json()
            if (response.ok) {
                setToken(body.response.token)
                updateApp({
                    user: body.response.auth,
                })
            } else {
                switch (body.response.type) {
                    case "invalid_credentials":
                        Notifications.error('Некорректный логин или пароль')
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
                        Notifications.error('Ошибка Recaptcha. Обновите страницу и попробуйте ещё раз.')
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
            <h4 className="mb-4 text-center">Вход в аккаунт</h4>

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

            <button className="btn btn-lg btn-primary w-100 mt-2 mb-4" type="submit" disabled={loading}>
                {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                {loading ? ' Загрузка...' : 'Вход'}
            </button>

            <p className="text-center">Ещё нет аккаунта? <Link to="/register">Регистрация</Link></p>
        </Form>
    </OuterPage>
}

export default LoginPage
