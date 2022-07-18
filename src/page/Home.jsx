import useApp from "../hook/useApp"

export const HomePage = () => {
    const { app } = useApp()
    return <h1>Hello {app.user.username}!</h1>
}
