import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useApp } from "../App"
import { Notifications } from "../component/Notification"
import { fetchApi } from "../lib/api"
import ReCAPTCHA from "react-google-recaptcha"
import { Form } from "react-bootstrap"

export const LoginPage = () => {
    const { app, updateApp } = useApp()
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const recaptchaRef = useRef(null)

    const submit = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        setLoading(true)

        try {
            const recaptchaValue = recaptchaRef.current.getValue();
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
                let message = body.response.title
                switch (body.response.type) {
                    case "invalid_credentials":
                        message = 'Некорректный логин или пароль'
                        break
                }
                Notifications.error(message)
            }
        } catch (e) {
            Notifications.error('Невозможно подключиться к серверу')
        }
        setLoading(false)
    }

    return <section className="container vh-100">
        <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
                <Form className="card w-100 p-4 mt-5" onSubmit={submit}>
                    <h3 className="mb-1 text-center">VimeWorld</h3>
                    <h5 className="fw-normal mb-4 text-center">Вход в аккаунт</h5>

                    <Form.Group className="mb-3" controlId="login">
                        <Form.Label>Логин</Form.Label>
                        <Form.Control type="text" minLength="3" maxLength="20" required
                            value={login} onChange={e => setLogin(e.target.value)} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Пароль</Form.Label>
                        <Link className="float-end" to="/recovery">Забыли пароль?</Link>
                        <Form.Control type="password" required
                            value={password} onChange={e => setPassword(e.target.value)} />
                    </Form.Group>

                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={import.meta.env.VITE_RECAPTCHA_KEY}
                        size="invisible"
                    />

                    <div className="mt-2 mb-4">
                        <button className="btn btn-lg btn-primary w-100" type="submit" disabled={loading}>
                            {loading && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                            {loading ? 'Загрузка...' : 'Вход'}
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    </section>
}
