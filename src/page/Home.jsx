import useApp from "../hook/useApp"

export const HomePage = () => {
    const { app } = useApp()

    return <div className="card shadow">
        <div className="card-body">
            <h3>Hello {app.user.username}!</h3>
        </div>
    </div>
}
