import { useState } from "react"
import { useApp } from "../App"
import { fetchApi } from "../lib/api"

export const LoginPage = () => {
    const { app, updateApp } = useApp()
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')

    const submit = async () => {
        try {
            const response = await fetchApi('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: login,
                    password,
                    tuuid: app.tuuid,
                    recaptcha_response: ''
                })
            })
            const body = await response.json()
            if (response.ok) {
                updateApp({
                    token: body.response.token,
                    user: body.response.auth,
                })
            } else {
                console.log(body.response)
            }
        } catch (e) {
            console.log(e)
        }
    }

    return <div>
        <h1>Login</h1>
        <input type="text" value={login} onChange={e => setLogin(e.target.value)} placeholder="Login" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button onClick={submit}>Submit</button>
    </div>
}
