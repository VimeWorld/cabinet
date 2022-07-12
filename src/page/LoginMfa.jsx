import { Navigate } from "react-router-dom"
import { useApp } from "../App"

export const LoginMfaPage = () => {
    const { app } = useApp()

    return <h1>Login Mfa</h1>
}
