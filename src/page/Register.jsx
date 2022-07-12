import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchApi } from "../lib/api"

export const RegisterPage = () => {
    const navigate = useNavigate()
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    const submit = async () => {
        try {
            const response = await fetchApi('/register', {
                method: 'POST',
                body: {
                    username: login,
                    password,
                    email,
                    recaptcha_response: ''
                }
            })
            const body = await response.json()
            if (response.ok) {
                navigate('/login')
            } else {
                console.log(body.response)
            }
        } catch (e) {
            console.log(e)
        }
    }

    return <div>
        <h1>Register</h1>
        <input type="text" value={login} onChange={e => setLogin(e.target.value)} placeholder="Login" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <button onClick={submit}>Submit</button>
    </div>
}
