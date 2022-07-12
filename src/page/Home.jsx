import { useApp } from "../App"

export const HomePage = () => {
    const { app } = useApp()
    return <h1>Hello {app.user.username}!</h1>
}
